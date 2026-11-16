"use client";

import { forwardRef, type InputHTMLAttributes } from "react";

type FormFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  label: string;
  error?: string;
};

const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  function FormField({ id, label, error, className = "", ...props }, ref) {
    const errorId = `${id}-error`;

    return (
      <div className="form-field">
        <label htmlFor={id} className="form-label meta">
          {label}
        </label>
        <input
          {...props}
          ref={ref}
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={`field-input ${className}`.trim()}
        />
        {error ? (
          <p id={errorId} className="error-text" role="alert" aria-live="polite">
            {error}
          </p>
        ) : null}
      </div>
    );
  }
);

export default FormField;
