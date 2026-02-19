import { Controller } from "react-hook-form";
// import { UploadCloud } from "react-feather";
import { type InputHTMLAttributes } from "react";
import { type ReactNode } from "react";
import { File } from "react-feather";
interface FileInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  control: any;
  name: string;
  label: ReactNode;
  error?: string;
  currentFile?: string;
  openCamera?: boolean;
  captureMode?: "user" | "environment";
}

const FileInput = ({
  control,
  name,
  label,
  error,
  currentFile,
  openCamera = false,
  captureMode = "environment",
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
                <p className="font-12 mb-0">{currentFile}</p>
              ) : (
                <p className="font-12 mb-0">
                  <b className="color-red">Click here</b>&nbsp;to upload your
                  file or drag.
                </p>
              )}
              <p className="font-12 color-grey mb-0">
                Supported Format: JPG, PNG, PDF, DOC, DOCX, TXT
              </p>
            </label>

            <input
              type="file"
              id={name}
              className="position-absolute opacity-0"
              {...field}
              {...rest}
              accept={
                rest.accept ||
                "image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
              }
              capture={openCamera ? captureMode : undefined}
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
