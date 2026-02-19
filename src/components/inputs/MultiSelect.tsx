import React, { useState } from "react";
import { Controller, type Control } from "react-hook-form";
import { ChevronDown, ChevronUp } from "react-feather";

export interface Option {
  label: string;
  value: string;
}

interface MultiSelectProps {
  control: Control<any>;
  name: string;
  label?: React.ReactNode;
  options: Option[];
  error?: string;
  disabled?: boolean;
  required?: boolean;
}

const MultiSelect: React.FC<MultiSelectProps> = ({
  control,
  name,
  label,
  options,
  error,
  disabled = false,
  required,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={{ marginBottom: "1rem" }}>
      {label && (
        <label className="lbl">
          {label} {required && <span className="text-danger">*</span>}
        </label>
      )}
      <Controller
        name={name}
        control={control}
        render={({ field }) => {
          const { value = [], onChange } = field;

          const allValues = options.map((opt) => opt.value);
          const isAllSelected = value.length === allValues.length;

          const handleSelect = (val: string) => {
            if (value.includes(val)) {
              onChange(value.filter((v: string) => v !== val));
            } else {
              onChange([...value, val]);
            }
          };

          const handleSelectAll = () => {
            if (isAllSelected) {
              onChange([]);
            } else {
              onChange(allValues);
            }
          };

          return (
            <div style={{ position: "relative" }}>
              {/* Selected Values Display */}
              <div
                className="npt"
                onClick={() => !disabled && setIsOpen(!isOpen)}
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: disabled ? "not-allowed" : "pointer" }}
              >
                <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {value.length > 0
                    ? options
                        .filter((opt) => value.includes(opt.value))
                        .map((opt) => opt.label)
                        .join(", ")
                    : "Select options"}
                </span>
                <span style={{ marginLeft: "8px", flexShrink: 0, color: "#666" }}>
                  {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </span>
              </div>

              {/* Dropdown */}
              {isOpen && !disabled && (
                <div
                  style={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    width: "100%",
                    border: "1px solid #ccc",
                    borderRadius: "5px",
                    background: "#fff",
                    zIndex: 10,
                    maxHeight: "200px",
                    overflowY: "auto",
                  }}
                >
                  {/* Select All Option */}
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      padding: "6px 8px",
                      cursor: "pointer",
                      fontSize: "10px",
                      // fontWeight: "bold",
                      borderBottom: "1px solid #eee",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      onChange={handleSelectAll}
                      style={{ marginRight: "8px" }}
                    />
                    Select All
                  </label>

                  {options.map((opt) => (
                    <label
                      key={opt.value}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        padding: "6px 8px",
                        cursor: "pointer",
                        fontSize: "10px",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={value.includes(opt.value)}
                        onChange={() => handleSelect(opt.value)}
                        style={{ marginRight: "8px" }}
                      />
                      {opt.label}
                    </label>
                  ))}
                </div>
              )}
            </div>
          );
        }}
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

export default MultiSelect;
