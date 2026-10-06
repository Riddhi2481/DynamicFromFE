import { OPERATORS } from '../constants/operators';
import { CONDITIONAL_ACTIONS } from '../constants/actions';

/**
 * 1. Single Rule Evaluator
 * Evaluates a single condition rule against live formValues safely.
 */
export const evaluateCondition = (rule, formValues = {}) => {
  if (!rule || !rule.sourceFieldCode) return false;

  const actualValue = formValues[rule.sourceFieldCode];
  const targetValue = rule.targetValue;

  // Safe Empty Checks
  const isEmpty = (val) =>
    val === null ||
    val === undefined ||
    val === '' ||
    (typeof val === 'string' && val.trim() === '') ||
    (Array.isArray(val) && val.length === 0);

  switch (rule.operator) {
    case OPERATORS.EQUALS:
      if (typeof actualValue === 'boolean') {
        return actualValue === (targetValue === 'true' || targetValue === true);
      }
      return String(actualValue ?? '').toLowerCase() === String(targetValue ?? '').toLowerCase();

    case OPERATORS.NOT_EQUALS:
      if (typeof actualValue === 'boolean') {
        return actualValue !== (targetValue === 'true' || targetValue === true);
      }
      return String(actualValue ?? '').toLowerCase() !== String(targetValue ?? '').toLowerCase();

    case OPERATORS.CONTAINS:
      if (Array.isArray(actualValue)) {
        return actualValue.some((v) => String(v).toLowerCase() === String(targetValue).toLowerCase());
      }
      return String(actualValue ?? '')
        .toLowerCase()
        .includes(String(targetValue ?? '').toLowerCase());

    case OPERATORS.GREATER_THAN:
      if (isEmpty(actualValue) || isNaN(Number(actualValue))) return false;
      return Number(actualValue) > Number(targetValue);

    case OPERATORS.LESS_THAN:
      if (isEmpty(actualValue) || isNaN(Number(actualValue))) return false;
      return Number(actualValue) < Number(targetValue);

    case OPERATORS.GREATER_THAN_OR_EQUAL:
      if (isEmpty(actualValue) || isNaN(Number(actualValue))) return false;
      return Number(actualValue) >= Number(targetValue);

    case OPERATORS.LESS_THAN_OR_EQUAL:
      if (isEmpty(actualValue) || isNaN(Number(actualValue))) return false;
      return Number(actualValue) <= Number(targetValue);

    case OPERATORS.IS_EMPTY:
      return isEmpty(actualValue);

    case OPERATORS.IS_NOT_EMPTY:
      return !isEmpty(actualValue);

    default:
      return false;
  }
};

/**
 * 2. Group / Multiple Conditions Evaluator with AND / OR Logic
 */
export const evaluateConditions = (conditionGroup, formValues = {}) => {
  if (!conditionGroup) return false;

  // Handle flat rules array or rule group object
  const rules = Array.isArray(conditionGroup)
    ? conditionGroup
    : conditionGroup.rules || [];

  if (rules.length === 0) return false;

  const logic = (conditionGroup.logicOperator || conditionGroup.logic || 'AND').toUpperCase();

  if (logic === 'AND') {
    return rules.every((rule) => evaluateCondition(rule, formValues));
  } else if (logic === 'OR') {
    return rules.some((rule) => evaluateCondition(rule, formValues));
  }

  return false;
};

// Alias helper for backwards compatibility
export const evaluateConditionGroup = evaluateConditions;

/**
 * 3. Reactive Action Applicator
 * Computes reactive field states (visible, disabled, required) for all target fields.
 * Prevents infinite loops by computing state as a pure function of (fields, conditions, formValues).
 */
export const applyConditionAction = (fields = [], conditions = [], formValues = {}) => {
  const updatedFieldStates = {};

  // Initialize defaults from form schema configuration
  fields.forEach((field) => {
    if (field && field.fieldCode) {
      updatedFieldStates[field.fieldCode] = {
        visible: field.visible !== undefined ? field.visible : true,
        disabled: field.disabled !== undefined ? field.disabled : false,
        required: field.required !== undefined ? field.required : false
      };
    }
  });

  if (!Array.isArray(conditions)) return updatedFieldStates;

  // Process all configured condition rules
  conditions.forEach((cond) => {
    if (!cond || !cond.targetFieldCode) return;

    const isTriggered = evaluateConditions(cond, formValues);
    const targetCode = cond.targetFieldCode;

    if (updatedFieldStates[targetCode]) {
      if (isTriggered) {
        switch (cond.action) {
          case CONDITIONAL_ACTIONS.SHOW:
            updatedFieldStates[targetCode].visible = true;
            break;
          case CONDITIONAL_ACTIONS.HIDE:
            updatedFieldStates[targetCode].visible = false;
            break;
          case CONDITIONAL_ACTIONS.ENABLE:
            updatedFieldStates[targetCode].disabled = false;
            break;
          case CONDITIONAL_ACTIONS.DISABLE:
            updatedFieldStates[targetCode].disabled = true;
            break;
          case CONDITIONAL_ACTIONS.MAKE_REQUIRED:
            updatedFieldStates[targetCode].required = true;
            break;
          case CONDITIONAL_ACTIONS.MAKE_OPTIONAL:
            updatedFieldStates[targetCode].required = false;
            break;
          default:
            break;
        }
      }
    }
  });

  return updatedFieldStates;
};

// Alias helper for backwards compatibility
export const applyConditionActions = applyConditionAction;
