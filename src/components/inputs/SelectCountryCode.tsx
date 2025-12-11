import { Controller } from "react-hook-form";
import { type SelectHTMLAttributes } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  control: any;
  name: string;
  label: string;
  error?: string;
  options: { dial_code: string; name: string }[];
  required?: boolean;
}

const SelectCountryCode = ({
  control,
  name,
  label,
  error,
  options,
  required,
  ...rest
}: SelectProps) => {
  return (
    <div className="">
      <label htmlFor={name} className="lbl">
        {label} {required && <span className="text-danger">*</span>}
      </label>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <select
            {...field}
            {...rest}
            className="input"
            style={{ height: "40px" }}
          >
            <option value="">Select {label}</option>
            {options.map((option, index) => (
              <option key={index} value={option.dial_code}>
                {option.name} ({option.dial_code})
              </option>
            ))}
          </select>
        )}
      />
      {error && (
        <p
          className="alert alert-danger"
          style={{
            fontSize: "12px",
            marginTop: "5px",
            padding: "8px",
            marginBottom: "15px",
            backgroundColor: "#ffe6e6",
            color: "#d63384",
            border: "1px solid #f5c6cb",
            borderRadius: "5px",
          }}
        >
          {error}
        </p>
      )}
    </div>
  );
};

export default SelectCountryCode;
