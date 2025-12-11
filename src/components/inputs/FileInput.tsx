import { Controller } from "react-hook-form";
// import { UploadCloud } from "react-feather";
import { type InputHTMLAttributes } from "react";
import { File } from "react-feather";
interface FileInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  control: any;
  name: string;
  label: string;
  error?: string;
  currentFile?: string;
}

const FileInput = ({
  control,
  name,
  label,
  error,
  currentFile,
  ...rest
}: FileInputProps) => {
  return (
    <div>
      <Controller
        name={name}
        control={control}
        render={({ field: { onChange, value, ...field } }) => (
          <>
            <label className="lbl2"> {label}</label>

            <label className="cuslbl" htmlFor={name}>
              <File size={24}></File>
              {currentFile ? (
                <p className="font-12 mb-0">
                  {currentFile || `${label.toLowerCase()}.pdf`}
                </p>
              ) : (
                <p className="font-12 mb-0">
                  <b className="color-red">Click here</b>&nbsp;to upload your
                  file or drag.
                </p>
              )}
              <p className="font-12 color-grey mb-0">
                Supported Format: SVG, JPG, PNG (10mb each)
              </p>
            </label>

            <input
              type="file"
              id={name}
              className="position-absolute opacity-0"
              {...field}
              {...rest}
              accept="image/*"
              onChange={(e) => onChange(e.target.files)}
            ></input>
          </>
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

export default FileInput;
