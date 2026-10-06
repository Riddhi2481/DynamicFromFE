import React from 'react';
import FieldWrapper from './FieldWrapper';

const RatingField = ({ field, value = 0, onChange, error }) => {
  const maxStars = field.max || 5;
  const currentRating = Number(value) || 0;

  return (
    <FieldWrapper field={field} error={error}>
      <div className="d-flex align-items-center gap-1 fs-4 text-warning">
        {Array.from({ length: maxStars }).map((_, idx) => {
          const starValue = idx + 1;
          return (
            <i
              key={idx}
              className={`bi ${starValue <= currentRating ? 'bi-star-fill' : 'bi-star'} cursor-pointer`}
              onClick={() => !field.disabled && onChange && onChange(field.fieldCode, starValue)}
              title={`${starValue} Stars`}
            ></i>
          );
        })}
        <span className="ms-2 fs-7 text-muted fw-semibold">
          ({currentRating} / {maxStars})
        </span>
      </div>
    </FieldWrapper>
  );
};

export default RatingField;
