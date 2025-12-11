import { Controller } from "react-hook-form";
import { type InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  control: any;
  name: string;
  label: string;
  error?: string;
  inputMode?:
    | "search"
    | "text"
    | "none"
    | "tel"
    | "url"
    | "email"
    | "numeric"
    | "decimal";
  maxLength?: number;
}

const Input = ({
  control,
  name,
  label,
  error,
  inputMode,
  maxLength,
  ...rest
}: InputProps) => {
  return (
    <div className="">
      <label htmlFor={name} className="lbl ">
        {label}
      </label>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <input
            inputMode={inputMode}
            {...field}
            {...rest}
            className="npt"
            maxLength={maxLength}
          />
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

export default Input;
