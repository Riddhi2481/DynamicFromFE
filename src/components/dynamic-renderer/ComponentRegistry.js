import TextField from '../fields/TextField';
import TextAreaField from '../fields/TextAreaField';
import NumberField from '../fields/NumberField';
import DropdownField from '../fields/DropdownField';
import RadioField from '../fields/RadioField';
import CheckboxField from '../fields/CheckboxField';
import MultiSelectField from '../fields/MultiSelectField';
import ToggleField from '../fields/ToggleField';
import DateField from '../fields/DateField';
import DateTimeField from '../fields/DateTimeField';
import FileUploadField from '../fields/FileUploadField';
import RatingField from '../fields/RatingField';
import HeadingField from '../fields/HeadingField';
import SectionField from '../fields/SectionField';
import FallbackField from '../fields/FallbackField';

export const COMPONENT_REGISTRY = {
  TEXT: TextField,
  TEXT_AREA: TextAreaField,
  NUMBER: NumberField,
  DECIMAL: NumberField,
  EMAIL: TextField,
  PHONE: TextField,
  DROPDOWN: DropdownField,
  RADIO: RadioField,
  CHECKBOX: CheckboxField,
  MULTI_SELECT: MultiSelectField,
  TOGGLE: ToggleField,
  DATE: DateField,
  DATE_TIME: DateTimeField,
  FILE_UPLOAD: FileUploadField,
  RATING: RatingField,
  HEADING: HeadingField,
  SECTION: SectionField
};

export const getComponentForType = (type) => {
  if (!type || !COMPONENT_REGISTRY[type]) {
    return FallbackField;
  }
  return COMPONENT_REGISTRY[type];
};
