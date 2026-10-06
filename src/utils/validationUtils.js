/**
 * Dynamic Form Client-Side Validation Engine
 * Pure, reusable validation functions for form configuration schemas.
 * Supports default validation rules for all 17 core component types.
 */

/**
 * 1. Required Validator
 */
export const validateRequired = (value, customMessage = null, label = 'This field', isBooleanType = false) => {
  let isEmpty = false;

  if (value === null || value === undefined || value === '') {
    isEmpty = true;
  } else if (typeof value === 'string' && value.trim() === '') {
    isEmpty = true;
  } else if (Array.isArray(value) && value.length === 0) {
    isEmpty = true;
  } else if (isBooleanType && value === false) {
    isEmpty = true;
  }

  if (isEmpty) {
    return customMessage || `${label} is required.`;
  }
  return null;
};

/**
 * 2. Email Validator
 */
export const validateEmail = (value, customMessage = null) => {
  if (!value) return null;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(String(value).trim())) {
    return customMessage || 'Please enter a valid email address.';
  }
  return null;
};

/**
 * 3. Phone Validator
 */
export const validatePhone = (value, customMessage = null) => {
  if (!value) return null;
  const str = String(value).trim();
  const hasAlpha = /[a-zA-Z]/.test(str);
  const phoneRegex = /^\+?[0-9\s\-()]{7,20}$/;
  if (hasAlpha || !phoneRegex.test(str)) {
    return customMessage || 'Please enter a valid phone number.';
  }
  return null;
};

/**
 * 4. Number, Min & Max Validator
 */
export const validateNumber = (value, min = undefined, max = undefined, customMessage = null) => {
  if (value === null || value === undefined || value === '') return null;
  const num = Number(value);
  if (isNaN(num)) {
    return customMessage || 'Must be a valid number.';
  }
  if (min !== undefined && min !== null && num < Number(min)) {
    return customMessage || `Value must be greater than or equal to ${min}.`;
  }
  if (max !== undefined && max !== null && num > Number(max)) {
    return customMessage || `Value must be less than or equal to ${max}.`;
  }
  return null;
};

/**
 * 5. Length (Min / Max Length) Validator
 */
export const validateLength = (value, minLength = undefined, maxLength = undefined, customMessage = null) => {
  if (value === null || value === undefined || value === '') return null;
  const str = String(value);
  if (minLength !== undefined && minLength !== null && str.length < Number(minLength)) {
    return customMessage || `Must be at least ${minLength} characters long.`;
  }
  if (maxLength !== undefined && maxLength !== null && str.length > Number(maxLength)) {
    return customMessage || `Must not exceed ${maxLength} characters.`;
  }
  return null;
};

/**
 * 6. Regex Pattern Validator
 */
export const validateRegex = (value, pattern, customMessage = null) => {
  if (!value || !pattern) return null;
  try {
    const reg = new RegExp(pattern);
    if (!reg.test(String(value))) {
      return customMessage || 'Invalid format.';
    }
  } catch {
    // Graceful handling of invalid regex patterns
  }
  return null;
};

/**
 * 7. Date Range Validator
 */
export const validateDate = (value, minDate = undefined, maxDate = undefined, customMessage = null) => {
  if (!value) return null;
  const targetDate = new Date(value);
  if (isNaN(targetDate.getTime())) {
    return customMessage || 'Please enter a valid date.';
  }
  if (minDate) {
    const min = new Date(minDate);
    if (!isNaN(min.getTime()) && targetDate < min) {
      return customMessage || `Date cannot be earlier than ${minDate}.`;
    }
  }
  if (maxDate) {
    const max = new Date(maxDate);
    if (!isNaN(max.getTime()) && targetDate > max) {
      return customMessage || `Date cannot be later than ${maxDate}.`;
    }
  }
  return null;
};

/**
 * 8. File Upload (Size & Type) Validator
 */
export const validateFile = (file, maxMb = undefined, allowedTypes = [], customMessage = null) => {
  if (!file) return null;

  if (maxMb !== undefined && maxMb !== null) {
    const maxBytes = Number(maxMb) * 1024 * 1024;
    if (file.size > maxBytes) {
      return customMessage || `File size exceeds maximum allowed limit of ${maxMb}MB.`;
    }
  }

  if (allowedTypes && allowedTypes.length > 0) {
    const fileName = file.name || '';
    const ext = fileName.split('.').pop().toLowerCase();
    const mimeType = file.type || '';

    const isMatch = allowedTypes.some(
      (type) => ext === type.toLowerCase() || mimeType.includes(type.toLowerCase())
    );

    if (!isMatch) {
      return customMessage || `File type not supported. Allowed formats: ${allowedTypes.join(', ')}.`;
    }
  }

  return null;
};

/**
 * Field Level Aggregator
 * Evaluates all default & configured validation rules for any of the 17 component types.
 */
export const validateField = (field, value) => {
  if (!field) return [];

  const errors = [];
  const label = field.fieldLabel || field.fieldCode || 'Field';
  const type = (field.type || '').toUpperCase();

  // HEADING (17) & SECTION (16) have no direct value validation
  if (type === 'HEADING' || type === 'SECTION') {
    return errors;
  }

  const isBooleanType = type === 'TOGGLE' || (type === 'CHECKBOX' && typeof value === 'boolean');

  // 1. Required Check
  if (field.required) {
    const reqErr = validateRequired(value, field.requiredMessage, label, isBooleanType);
    if (reqErr) {
      errors.push(reqErr);
      return errors; // Required failure halts subsequent checks
    }
  }

  // If value is empty and field is not required, skip format checks
  if (value === null || value === undefined || value === '') {
    return errors;
  }

  // 1. TEXT & 2. TEXT_AREA
  if (type === 'TEXT' || type === 'TEXT_AREA') {
    if (field.minLength !== undefined || field.maxLength !== undefined) {
      const lenErr = validateLength(value, field.minLength, field.maxLength, field.lengthMessage);
      if (lenErr) errors.push(lenErr);
    }
    const pattern = field.regexPattern || field.regex;
    if (pattern) {
      const regErr = validateRegex(value, pattern, field.regexMessage);
      if (regErr) errors.push(regErr);
    }
  }

  // 3. NUMBER
  if (type === 'NUMBER') {
    const strVal = String(value).trim();
    const isInteger = /^-?\d+$/.test(strVal);
    if (!isInteger) {
      errors.push(field.numberMessage || 'Must be a valid integer number (no decimals or letters allowed).');
    } else {
      const min = field.min !== undefined ? field.min : field.minimum;
      const max = field.max !== undefined ? field.max : field.maximum;
      const numErr = validateNumber(strVal, min, max, field.numberMessage);
      if (numErr) errors.push(numErr);
    }
  }

  // 4. DECIMAL
  if (type === 'DECIMAL') {
    const strVal = String(value).trim();
    const isDecimal = /^-?\d+(\.\d+)?$/.test(strVal);
    if (!isDecimal) {
      errors.push(field.numberMessage || 'Must be a valid decimal number.');
    } else {
      const min = field.min !== undefined ? field.min : field.minimum;
      const max = field.max !== undefined ? field.max : field.maximum;
      const decErr = validateNumber(strVal, min, max, field.numberMessage);
      if (decErr) errors.push(decErr);
    }
  }

  // 5. EMAIL
  if (type === 'EMAIL') {
    const emailErr = validateEmail(value, field.emailMessage);
    if (emailErr) errors.push(emailErr);
  }

  // 6. PHONE
  if (type === 'PHONE') {
    const phoneErr = validatePhone(value, field.phoneMessage);
    if (phoneErr) errors.push(phoneErr);
  }

  // 12. DATE & 13. DATE_TIME
  if (type === 'DATE' || type === 'DATE_TIME') {
    const minD = field.minDate || field.minimumDate || field.min;
    const maxD = field.maxDate || field.maximumDate || field.max;
    const dateErr = validateDate(value, minD, maxD, field.dateMessage);
    if (dateErr) errors.push(dateErr);
  }

  // 14. FILE_UPLOAD
  if (type === 'FILE_UPLOAD') {
    const fileList = Array.isArray(value) ? value : (value instanceof FileList ? Array.from(value) : [value]);
    fileList.forEach((f) => {
      if (f && typeof f === 'object') {
        const fileErr = validateFile(f, field.maxFileSizeMb || field.maxMb, field.allowedTypes, field.fileMessage);
        if (fileErr) errors.push(fileErr);
      }
    });
  }

  // 15. RATING
  if (type === 'RATING') {
    const minR = field.min !== undefined ? field.min : 1;
    const maxR = field.max !== undefined ? field.max : 5;
    const ratingErr = validateNumber(value, minR, maxR, field.ratingMessage || `Rating must be between ${minR} and ${maxR}.`);
    if (ratingErr) errors.push(ratingErr);
  }

  // Additional custom validations array (if configured on field)
  if (Array.isArray(field.validations)) {
    field.validations.forEach((rule) => {
      switch (rule.type) {
        case 'REQUIRED': {
          const e = validateRequired(value, rule.message, label, isBooleanType);
          if (e) errors.push(e);
          break;
        }
        case 'EMAIL': {
          const e = validateEmail(value, rule.message);
          if (e) errors.push(e);
          break;
        }
        case 'MIN_MAX': {
          const e = validateNumber(value, rule.min, rule.max, rule.message);
          if (e) errors.push(e);
          break;
        }
        case 'LENGTH': {
          const e = validateLength(value, rule.minLength, rule.maxLength, rule.message);
          if (e) errors.push(e);
          break;
        }
        case 'REGEX': {
          const e = validateRegex(value, rule.pattern, rule.message);
          if (e) errors.push(e);
          break;
        }
        case 'DATE': {
          const e = validateDate(value, rule.minDate, rule.maxDate, rule.message);
          if (e) errors.push(e);
          break;
        }
        case 'FILE': {
          const e = validateFile(value, rule.maxMb, rule.allowedTypes, rule.message);
          if (e) errors.push(e);
          break;
        }
        default:
          break;
      }
    });
  }

  return errors;
};

/**
 * Form Level Aggregator
 * Validates all visible fields in a form configuration schema.
 */
export const validateForm = (fields = [], values = {}) => {
  const formErrors = {};
  let isValid = true;

  fields.forEach((field) => {
    if (field.visible !== false) {
      const fieldErrors = validateField(field, values[field.fieldCode]);
      if (fieldErrors.length > 0) {
        formErrors[field.fieldCode] = fieldErrors[0]; // Bind first error message to fieldCode
        isValid = false;
      }
    }
  });

  return { isValid, errors: formErrors };
};

export const validateFormSchema = validateForm;

/**
 * Configuration-Time Inspector Component Validator
 * Validates admin component definitions configured inside the Inspector / PropertyPanel.
 */
export const validateComponentConfig = (field, allFields = []) => {
  if (!field) return {};

  const errors = {};
  const type = (field.type || field.componentType || '').toUpperCase();

  // 1. Field Code Validation
  const code = (field.fieldCode || '').trim();
  if (!code) {
    errors.fieldCode = 'Field code is required.';
  } else if (!/^[a-zA-Z0-9_]+$/.test(code)) {
    errors.fieldCode = 'Field code must contain only letters, numbers, and underscores.';
  } else if (
    Array.isArray(allFields) &&
    allFields.some((f) => f.id !== field.id && (f.fieldCode || '').trim().toLowerCase() === code.toLowerCase())
  ) {
    errors.fieldCode = `Field code "${code}" is already used by another component in this form.`;
  }

  // 2. Field Label Validation
  const label = (field.fieldLabel || field.label || '').trim();
  if (!label) {
    errors.fieldLabel = 'Field label is required and cannot be blank.';
  }

  // 3. Display Order Validation
  const orderRaw = field.displayOrder;
  if (orderRaw === undefined || orderRaw === null || String(orderRaw).trim() === '') {
    errors.displayOrder = 'Display order is required.';
  } else {
    const orderStr = String(orderRaw).trim();
    if (!/^\d+$/.test(orderStr) || Number(orderStr) < 1) {
      errors.displayOrder = 'Display order must be a positive integer (no letters or decimals allowed).';
    }
  }

  // HEADING and SECTION have no value or option validation
  if (type === 'HEADING' || type === 'SECTION') {
    return errors;
  }

  // 4. Component Options Validation (DROPDOWN, RADIO, CHECKBOX, MULTI_SELECT)
  const isChoiceType =
    type === 'DROPDOWN' || type === 'RADIO' || type === 'CHECKBOX' || type === 'MULTI_SELECT';

  if (isChoiceType) {
    const options = field.options || [];
    if (options.length === 0) {
      errors.options = 'At least one option must be configured.';
    } else {
      const seenValues = new Set();
      let hasEmptyValue = false;
      let hasDuplicate = false;

      options.forEach((opt) => {
        const val = (opt.value !== undefined && opt.value !== null ? String(opt.value) : opt.optionValue !== undefined && opt.optionValue !== null ? String(opt.optionValue) : '').trim();
        if (!val) {
          hasEmptyValue = true;
        } else if (seenValues.has(val.toLowerCase())) {
          hasDuplicate = true;
        } else {
          seenValues.add(val.toLowerCase());
        }
      });

      if (hasEmptyValue) {
        errors.options = 'Option values cannot be empty.';
      } else if (hasDuplicate) {
        errors.options = 'Option values cannot contain duplicate keys.';
      }
    }
  }

  // 5. Default Value & Component-Specific Validation
  const defVal = field.defaultValue;
  const hasDefVal = defVal !== undefined && defVal !== null && String(defVal).trim() !== '';
  const defValStr = hasDefVal ? String(defVal).trim() : '';

  // TEXT & TEXT_AREA
  if (type === 'TEXT' || type === 'TEXT_AREA') {
    const hasMinLen = field.minLength !== undefined && field.minLength !== null && String(field.minLength).trim() !== '';
    const hasMaxLen = field.maxLength !== undefined && field.maxLength !== null && String(field.maxLength).trim() !== '';

    if (hasMinLen && !/^\d+$/.test(String(field.minLength).trim())) {
      errors.minLength = 'Minimum length must be a non-negative integer.';
    }
    if (hasMaxLen && !/^\d+$/.test(String(field.maxLength).trim())) {
      errors.maxLength = 'Maximum length must be a non-negative integer.';
    }

    if (hasMinLen && hasMaxLen && !errors.minLength && !errors.maxLength) {
      if (Number(field.minLength) > Number(field.maxLength)) {
        errors.minLength = 'Minimum length cannot be greater than Maximum length.';
      }
    }

    if (hasDefVal) {
      if (hasMinLen && !errors.minLength && defValStr.length < Number(field.minLength)) {
        errors.defaultValue = `Default value length must be at least ${field.minLength} characters.`;
      }
      if (hasMaxLen && !errors.maxLength && defValStr.length > Number(field.maxLength)) {
        errors.defaultValue = `Default value length must not exceed ${field.maxLength} characters.`;
      }
      const pattern = field.regexPattern || field.regex;
      if (pattern) {
        try {
          const reg = new RegExp(pattern);
          if (!reg.test(defValStr)) {
            errors.defaultValue = 'Default value does not match configured Regex pattern.';
          }
        } catch {
          errors.regexPattern = 'Invalid regular expression pattern.';
        }
      }
    }
  }

  // NUMBER
  if (type === 'NUMBER') {
    const hasMin = field.min !== undefined && field.min !== null && String(field.min).trim() !== '';
    const hasMax = field.max !== undefined && field.max !== null && String(field.max).trim() !== '';

    if (hasMin && !/^-?\d+$/.test(String(field.min).trim())) {
      errors.min = 'Min value must be an integer.';
    }
    if (hasMax && !/^-?\d+$/.test(String(field.max).trim())) {
      errors.max = 'Max value must be an integer.';
    }
    if (hasMin && hasMax && !errors.min && !errors.max && Number(field.min) > Number(field.max)) {
      errors.min = 'Min value cannot be greater than Max value.';
    }

    if (hasDefVal) {
      if (!/^-?\d+$/.test(defValStr)) {
        errors.defaultValue = 'Default value must be an integer (no decimals or letters allowed).';
      } else {
        const num = Number(defValStr);
        if (hasMin && !errors.min && num < Number(field.min)) {
          errors.defaultValue = `Default value cannot be less than Min (${field.min}).`;
        }
        if (hasMax && !errors.max && num > Number(field.max)) {
          errors.defaultValue = `Default value cannot be greater than Max (${field.max}).`;
        }
      }
    }
  }

  // DECIMAL
  if (type === 'DECIMAL') {
    const hasMin = field.min !== undefined && field.min !== null && String(field.min).trim() !== '';
    const hasMax = field.max !== undefined && field.max !== null && String(field.max).trim() !== '';

    if (hasMin && !/^-?\d+(\.\d+)?$/.test(String(field.min).trim())) {
      errors.min = 'Min value must be a valid decimal number.';
    }
    if (hasMax && !/^-?\d+(\.\d+)?$/.test(String(field.max).trim())) {
      errors.max = 'Max value must be a valid decimal number.';
    }
    if (hasMin && hasMax && !errors.min && !errors.max && Number(field.min) > Number(field.max)) {
      errors.min = 'Min value cannot be greater than Max value.';
    }

    if (hasDefVal) {
      if (!/^-?\d+(\.\d+)?$/.test(defValStr)) {
        errors.defaultValue = 'Default value must be a valid decimal number (no letters allowed).';
      } else {
        const num = Number(defValStr);
        if (hasMin && !errors.min && num < Number(field.min)) {
          errors.defaultValue = `Default value cannot be less than Min (${field.min}).`;
        }
        if (hasMax && !errors.max && num > Number(field.max)) {
          errors.defaultValue = `Default value cannot be greater than Max (${field.max}).`;
        }
      }
    }
  }

  // EMAIL
  if (type === 'EMAIL') {
    if (hasDefVal) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(defValStr)) {
        errors.defaultValue = 'Default value must be a valid email address (e.g. user@example.com).';
      }
    }
  }

  // PHONE
  if (type === 'PHONE') {
    if (hasDefVal) {
      const hasAlpha = /[a-zA-Z]/.test(defValStr);
      const phoneRegex = /^\+?[0-9\s\-()]{7,20}$/;
      if (hasAlpha || !phoneRegex.test(defValStr)) {
        errors.defaultValue = 'Default value must be a valid phone number (no letters allowed).';
      }
    }
  }

  // DROPDOWN & RADIO
  if (type === 'DROPDOWN' || type === 'RADIO') {
    if (hasDefVal) {
      const options = field.options || [];
      const match = options.some((opt) => {
        const val = opt.value !== undefined && opt.value !== null ? String(opt.value) : opt.optionValue !== undefined && opt.optionValue !== null ? String(opt.optionValue) : '';
        return val.trim() === defValStr;
      });
      if (!match) {
        errors.defaultValue = `Default value "${defValStr}" does not match any of the configured options.`;
      }
    }
  }

  // CHECKBOX & MULTI_SELECT
  if (type === 'CHECKBOX' || type === 'MULTI_SELECT') {
    if (hasDefVal) {
      const options = field.options || [];
      const selected = Array.isArray(defVal)
        ? defVal.map((v) => String(v).trim())
        : defValStr.split(',').map((v) => v.trim()).filter(Boolean);

      const invalidSelected = selected.filter(
        (val) => !options.some((opt) => {
          const optVal = opt.value !== undefined && opt.value !== null ? String(opt.value) : opt.optionValue !== undefined && opt.optionValue !== null ? String(opt.optionValue) : '';
          return optVal.trim() === val;
        })
      );

      if (invalidSelected.length > 0) {
        errors.defaultValue = `Default selected value(s) "${invalidSelected.join(
          ', '
        )}" do not exist in configured options.`;
      }
    }
  }

  // TOGGLE
  if (type === 'TOGGLE') {
    if (hasDefVal) {
      const lower = defValStr.toLowerCase();
      if (
        lower !== 'true' &&
        lower !== 'false' &&
        typeof defVal !== 'boolean'
      ) {
        errors.defaultValue = 'Default value must be a valid boolean ("true" or "false").';
      }
    }
  }

  // DATE & DATE_TIME
  if (type === 'DATE' || type === 'DATE_TIME') {
    const minD = field.minDate || field.minimumDate;
    const maxD = field.maxDate || field.maximumDate;

    if (minD && maxD) {
      if (new Date(minD) > new Date(maxD)) {
        errors.minDate = 'Minimum date cannot be greater than maximum date.';
      }
    }

    if (hasDefVal) {
      const targetDate = new Date(defValStr);
      if (isNaN(targetDate.getTime())) {
        errors.defaultValue = 'Default value must be a valid date.';
      } else {
        if (minD && targetDate < new Date(minD)) {
          errors.defaultValue = `Default date cannot be earlier than Minimum Date (${minD}).`;
        }
        if (maxD && targetDate > new Date(maxD)) {
          errors.defaultValue = `Default date cannot be later than Maximum Date (${maxD}).`;
        }
      }
    }
  }

  // FILE_UPLOAD
  if (type === 'FILE_UPLOAD') {
    if (field.maxFileSizeMb !== undefined && field.maxFileSizeMb !== null && String(field.maxFileSizeMb).trim() !== '') {
      const str = String(field.maxFileSizeMb).trim();
      const num = Number(str);
      if (isNaN(num) || num <= 0) {
        errors.maxFileSizeMb = 'Maximum file size must be a positive number.';
      }
    }
    if (field.minFileSizeMb !== undefined && field.minFileSizeMb !== null && String(field.minFileSizeMb).trim() !== '') {
      const str = String(field.minFileSizeMb).trim();
      const num = Number(str);
      if (isNaN(num) || num < 0) {
        errors.minFileSizeMb = 'Minimum file size must be a positive number.';
      } else if (field.maxFileSizeMb && num > Number(field.maxFileSizeMb)) {
        errors.minFileSizeMb = 'Minimum file size cannot exceed Maximum file size.';
      }
    }
    if (field.maxFileCount !== undefined && field.maxFileCount !== null && String(field.maxFileCount).trim() !== '') {
      const str = String(field.maxFileCount).trim();
      if (!/^\d+$/.test(str) || Number(str) < 1) {
        errors.maxFileCount = 'Maximum file count must be a positive integer.';
      }
    }
  }

  // RATING
  if (type === 'RATING') {
    const hasMin = field.min !== undefined && field.min !== null && String(field.min).trim() !== '';
    const hasMax = field.max !== undefined && field.max !== null && String(field.max).trim() !== '';

    if (hasMin && !/^-?\d+$/.test(String(field.min).trim())) {
      errors.min = 'Minimum rating must be an integer.';
    }
    if (hasMax && !/^-?\d+$/.test(String(field.max).trim())) {
      errors.max = 'Maximum rating must be an integer.';
    }

    const minR = hasMin && !errors.min ? Number(field.min) : 1;
    const maxR = hasMax && !errors.max ? Number(field.max) : 5;

    if (!errors.min && !errors.max && minR > maxR) {
      errors.min = 'Minimum rating cannot exceed Maximum rating.';
    }

    if (hasDefVal) {
      if (!/^-?\d+$/.test(defValStr)) {
        errors.defaultValue = 'Default rating must be a valid integer.';
      } else {
        const defNum = Number(defValStr);
        if (!errors.min && !errors.max && (defNum < minR || defNum > maxR)) {
          errors.defaultValue = `Default rating (${defNum}) must be between ${minR} and ${maxR}.`;
        }
      }
    }
  }

  return errors;
};

/**
 * Validate all components in form builder configuration
 */
export const validateAllFormComponents = (fields = []) => {
  const formErrors = {};
  let firstInvalidFieldId = null;

  (fields || []).forEach((field) => {
    const fieldErrors = validateComponentConfig(field, fields);
    if (Object.keys(fieldErrors).length > 0) {
      formErrors[field.id] = fieldErrors;
      if (!firstInvalidFieldId) {
        firstInvalidFieldId = field.id;
      }
    }
  });

  return {
    isValid: Object.keys(formErrors).length === 0,
    errors: formErrors,
    firstInvalidFieldId
  };
};


