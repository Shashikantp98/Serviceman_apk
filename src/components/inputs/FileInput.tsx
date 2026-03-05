import { Controller } from "react-hook-form";
import { useRef, useState, type InputHTMLAttributes } from "react";
import { type ReactNode } from "react";
import { File as FileIcon } from "react-feather";
import { Camera, CameraResultType, CameraSource, CameraDirection } from "@capacitor/camera";
import { Capacitor } from "@capacitor/core";

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
  const inputRef = useRef<HTMLInputElement>(null);
  const { ref: _unusedRef, ...restWithoutRef } = rest as any;
  const [showSheet, setShowSheet] = useState(false);

  const isNative = Capacitor.isNativePlatform();

  // Converts a Camera dataUrl result into a FileList and calls onChange
  const dataUrlToFileList = async (
    onChange: (v: any) => void,
    dataUrl: string,
    format: string
  ) => {
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    const file = new window.File(
      [blob],
      `photo_${Date.now()}.${format || "jpeg"}`,
      { type: blob.type || "image/jpeg" }
    );
    const dt = new DataTransfer();
    dt.items.add(file);
    onChange(dt.files);
  };

  const captureFromSource = async (
    onChange: (v: any) => void,
    source: CameraSource
  ) => {
    try {
      const photo = await Camera.getPhoto({
        resultType: CameraResultType.DataUrl,
        source,
        quality: 90,
        direction:
          source === CameraSource.Camera && captureMode === "user"
            ? CameraDirection.Front
            : CameraDirection.Rear,
        allowEditing: false,
        correctOrientation: true,
      });
      if (photo.dataUrl) {
        await dataUrlToFileList(onChange, photo.dataUrl, photo.format || "jpeg");
      }
    } catch (err: any) {
      if (err?.message !== "User cancelled photos app") {
        console.warn("Camera error:", err);
      }
    }
  };

  return (
    <div>
      <Controller
        name={name}
        control={control}
        render={({ field: { onChange, value, ref: _fieldRef, ...field } }) => {
          const handleTap = () => {
            if (!isNative) {
              inputRef.current?.click();
              return;
            }
            if (openCamera) {
              // Profile image: always open camera directly, no sheet
              captureFromSource(onChange, CameraSource.Camera);
              return;
            }
            // Document uploads: show bottom sheet with Camera / Gallery / File options
            setShowSheet(true);
          };

          const hasFile =
            (value instanceof FileList && value.length > 0) ||
            (typeof value === "string" && value.trim() !== "");

          return (
            <>
              <label className="lbl2"> {label}</label>

              {/* Tappable upload box */}
              <label
                className="cuslbl"
                onClick={handleTap}
                style={{ cursor: "pointer" }}
              >
                <FileIcon size={24} />
                {hasFile ? (
                  <p className="font-12 mb-0 text-success">✓ File selected</p>
                ) : currentFile ? (
                  <p className="font-12 mb-0">{currentFile}</p>
                ) : (
                  <p className="font-12 mb-0">
                    <b className="color-red">Click here</b>&nbsp;
                    {openCamera ? "to take a photo" : "to upload your file."}
                  </p>
                )}
                <p className="font-12 color-grey mb-0">
                  {openCamera
                    ? "Camera will open to take your photo"
                    : "Supported Format: JPG, PNG, PDF"}
                </p>
              </label>

              {/* Hidden file input — web fallback or "Choose File" sheet option */}
              <input
                ref={inputRef}
                type="file"
                id={name}
                className="position-absolute opacity-0"
                style={{ width: 0, height: 0 }}
                {...field}
                {...restWithoutRef}
                accept={
                  openCamera
                    ? "image/*"
                    : (restWithoutRef.accept as string) || "image/*,application/pdf"
                }
                capture={!isNative && openCamera ? captureMode : undefined}
                onChange={(e) => onChange(e.target.files)}
              />

              {/* Bottom sheet — shown on native for all uploads */}
              {showSheet && (
                <div
                  style={{
                    position: "fixed",
                    inset: 0,
                    zIndex: 9999,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-end",
                  }}
                >
                  {/* Backdrop */}
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: "rgba(0,0,0,0.45)",
                    }}
                    onClick={() => setShowSheet(false)}
                  />

                  {/* Sheet panel */}
                  <div
                    style={{
                      position: "relative",
                      background: "#fff",
                      borderRadius: "16px 16px 0 0",
                      padding: "20px 16px 40px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "12px",
                    }}
                  >
                    <p
                      style={{
                        fontWeight: 600,
                        fontSize: "15px",
                        margin: 0,
                        textAlign: "center",
                        color: "#222",
                      }}
                    >
                      Choose Option
                    </p>

                    {/* Camera */}
                    <button
                      type="button"
                      className="btn btn-outline-secondary w-100"
                      style={{ borderRadius: 10, padding: "12px", fontSize: "15px" }}
                      onClick={() => {
                        setShowSheet(false);
                        captureFromSource(onChange, CameraSource.Camera);
                      }}
                    >
                      📷&nbsp;&nbsp;Take Photo
                    </button>

                    {/* Gallery / Photo Library */}
                    <button
                      type="button"
                      className="btn btn-outline-secondary w-100"
                      style={{ borderRadius: 10, padding: "12px", fontSize: "15px" }}
                      onClick={() => {
                        setShowSheet(false);
                        captureFromSource(onChange, CameraSource.Photos);
                      }}
                    >
                      🖼️&nbsp;&nbsp;Photo Library
                    </button>

                    {/* File picker */}
                    <button
                      type="button"
                      className="btn btn-outline-secondary w-100"
                      style={{ borderRadius: 10, padding: "12px", fontSize: "15px" }}
                      onClick={() => {
                        setShowSheet(false);
                        setTimeout(() => inputRef.current?.click(), 100);
                      }}
                    >
                      📁&nbsp;&nbsp;Choose File
                    </button>

                    {/* Cancel */}
                    <button
                      type="button"
                      className="btn btn-light w-100"
                      style={{ borderRadius: 10, padding: "12px", fontSize: "15px", color: "#d00" }}
                      onClick={() => setShowSheet(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </>
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

export default FileInput;
