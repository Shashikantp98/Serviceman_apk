import React, { useState, useRef, useEffect } from "react";

interface OtpInputProps {
  length: number;
  onChange: (value: string) => void;
  className?: string;
  inputClassName?: string;
  value?: string;
}

const OtpInput: React.FC<OtpInputProps> = ({
  length = 6,
  onChange,
  className = "",
  inputClassName = "",
}) => {
  const [values, setValues] = useState<string[]>(Array(length).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>(
    Array(length).fill(null)
  );

  useEffect(() => {
    const otp = values.join("");
    onChange(otp);
  }, [values, onChange]);

  const handleChange = (index: number, value: string) => {
    const newValues = [...values];
    newValues[index] = value;
    setValues(newValues);

    if (value && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !values[index]) {
      e.preventDefault();
      if (index > 0) {
        inputRefs.current[index - 1]?.focus();
        const newValues = [...values];
        newValues[index - 1] = "";
        setValues(newValues);
      }
    }
  };

  return (
    <div className={`otp-input-container ${className}`}>
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => {
            const refs = inputRefs.current;
            refs[i] = el;
          }}
          id={`otp-input-${i}`}
          type="text"
          maxLength={1}
          value={values[i]}
          inputMode="numeric"
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          className={`otp-input ${inputClassName}`}
          autoFocus={i === 0}
        />
      ))}
    </div>
  );
};

export default OtpInput;
