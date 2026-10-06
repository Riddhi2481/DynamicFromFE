import { FIELD_TYPES } from '../constants/fieldTypes';
import { OPERATORS } from '../constants/operators';
import { CONDITIONAL_ACTIONS } from '../constants/actions';
import { FORM_STATUSES } from '../constants/formStatuses';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
export const APP_NAME = import.meta.env.VITE_APP_NAME || 'Dynamic Form Builder';

export { FIELD_TYPES, OPERATORS, CONDITIONAL_ACTIONS, FORM_STATUSES };
