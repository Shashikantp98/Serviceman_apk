import { Controller } from "react-hook-form";
import { useRef, type InputHTMLAttributes } from "react";
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
  // Prevent ref from rest being passed twice to the hidden input
  const { ref: _unusedRef, ...restWithoutRef } = rest as any;

  const isNative = Capacitor.isNativePlatform();

  return (
    <div>
      <Controller
        name={name}
        control={control}
        render={({ field: { onChange, value, ref: _fieldRef, ...field } }) => {
          const handleNativeCamera = async () => {
            if (!openCamera || !isNative) {
              // Fallback: trigger normal file input
              inputRef.current?.click();
              return;
            }
            try {
              const photo = await Camera.getPhoto({
                resultType: CameraResultType.DataUrl,
                source: CameraSource.Camera,
                quality: 90,
                // Front camera for profile image (captureMode "user"), back otherwise
                direction: captureMode === "user" ? CameraDirection.Front : CameraDirection.Rear,
                allowEditing: false,
                correctOrientation: true,
              });

              if (photo.dataUrl) {
                // Convert dataUrl to a File object so the form value is consistent
                const res = await fetch(photo.dataUrl);
                const blob = await res.blob();
                const globalFile = window.File;
                const file = new globalFile(
                  [blob],
                  `photo_${Date.now()}.${photo.format || "jpeg"}`,
                  { type: blob.type || "image/jpeg" }
                );
                const dt = new DataTransfer();
                dt.items.add(file);
                onChange(dt.files);
              }
            } catch (err: any) {
              // User cancelled — silently ignore
              if (err?.message !== "User cancelled photos app") {
                console.warn("Camera error:", err);
              }
            }
          };

          return (
            <>
              <label className="lbl2"> {label}</label>

              {/* Tappable label — triggers native camera on iOS/Android, file picker on web */}
              <label
                className="cuslbl"
                htmlFor={isNative && openCamera ? undefined : name}
                onClick={isNative && openCamera ? handleNativeCamera : undefined}
                style={isNative && openCamera ? { cursor: "pointer" } : undefined}
              >
                <FileIcon size={24} />
                {value && (value as FileList)?.[0] ? (
                  <p className="font-12 mb-0 text-success">
                    ✓ Photo captured
                  </p>
                ) : currentFile ? (
                  <p className="font-12 mb-0">{currentFile}</p>
                ) : (
                  <p className="font-12 mb-0">
                    <b className="color-red">Click here</b>&nbsp;
                    {openCamera ? "to take a photo" : "to upload your file or drag."}
                  </p>
                )}
                <p className="font-12 color-grey mb-0">
                  {openCamera
                    ? "Camera will open to take your photo"
                    : "Supported Format: JPG, PNG, PDF, DOC, DOCX, TXT"}
                </p>
              </label>

              {/* Hidden file input — used on web, or as fallback */}
              <input
                ref={inputRef}
                type="file"
                id={name}
                className="position-absolute opacity-0"
                {...field}
                {...restWithoutRef}
                accept={
                  openCamera
                    ? "image/*"
                    : (restWithoutRef.accept as string) ||
                      "image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                }
                capture={!isNative && openCamera ? captureMode : undefined}
                onChange={(e) => onChange(e.target.files)}
              />
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
