import { FIELD_TYPES, FIELD_TYPE_LABELS } from '../constants/fieldTypes';

export const createDefaultField = (type = FIELD_TYPES.TEXT, index = 0) => {
  const timestamp = Date.now().toString().slice(-6);
  const cleanType = type ? type.toLowerCase() : 'text';
  const fieldCode = `${cleanType}_${timestamp}`;

  const isChoiceType =
    type === FIELD_TYPES.DROPDOWN ||
    type === FIELD_TYPES.RADIO ||
    type === FIELD_TYPES.CHECKBOX ||
    type === FIELD_TYPES.MULTI_SELECT;

  const isHeadingOrSection = type === FIELD_TYPES.HEADING || type === FIELD_TYPES.SECTION;

  return {
    id: `field_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    fieldCode: fieldCode,
    fieldLabel: isHeadingOrSection ? (type === FIELD_TYPES.HEADING ? 'Section Heading' : 'Form Section Container') : `New ${FIELD_TYPE_LABELS[type] || type}`,
    type: type,
    placeholder: isHeadingOrSection ? '' : `Enter ${FIELD_TYPE_LABELS[type] || 'value'}...`,
    helpText: '',
    defaultValue: type === FIELD_TYPES.TOGGLE ? false : type === FIELD_TYPES.RATING ? 5 : '',
    required: false,
    readOnly: false,
    disabled: false,
    visible: true,
    displayOrder: index + 1,
    options: isChoiceType
      ? [
          { label: 'Option 1', value: 'option_1' },
          { label: 'Option 2', value: 'option_2' },
          { label: 'Option 3', value: 'option_3' }
        ]
      : [],
    min: type === FIELD_TYPES.NUMBER || type === FIELD_TYPES.DECIMAL ? 0 : undefined,
    max: type === FIELD_TYPES.NUMBER || type === FIELD_TYPES.DECIMAL ? 100 : type === FIELD_TYPES.RATING ? 5 : undefined
  };
};

export const duplicateField = (field, index = 0) => {
  const timestamp = Date.now().toString().slice(-4);
  return {
    ...JSON.parse(JSON.stringify(field)),
    id: `field_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    fieldCode: `${field.fieldCode}_copy_${timestamp}`,
    fieldLabel: `${field.fieldLabel} (Copy)`,
    displayOrder: index + 1
  };
};

export const sortFieldsByDisplayOrder = (fields = []) => {
  return [...fields].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
};

export const normalizeDisplayOrders = (fields = []) => {
  return fields.map((field, idx) => ({
    ...field,
    displayOrder: idx + 1
  }));
};
