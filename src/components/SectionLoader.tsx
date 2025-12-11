import React from "react";
import "./SectionLoader.css";

interface SectionLoaderProps {
  show: boolean;
  size?: "small" | "medium" | "large";
  text?: string;
  overlay?: boolean;
}

/**
 * Section-specific loader component
 * Shows a loading indicator within a specific section/container
 *
 * @param show - Whether to display the loader
 * @param size - Size of the spinner: 'small' (30px), 'medium' (40px), 'large' (50px)
 * @param text - Loading text to display
 * @param overlay - If true, adds a translucent overlay behind the loader
 *
 * Example Usage:
 * <SectionLoader show={loading} size="medium" text="Loading..." />
 */
const SectionLoader: React.FC<SectionLoaderProps> = ({
  show,
  size = "medium",
  text = "Loading...",
  overlay = false,
}) => {
  if (!show) return null;

  return (
    <div className={`section-loader-container ${overlay ? "with-overlay" : ""}`}>
      {overlay && <div className="section-loader-overlay"></div>}
      <div className={`section-loader-content section-loader-${size}`}>
        <div className="section-loader-spinner"></div>
        {text && <p className="section-loader-text">{text}</p>}
      </div>
    </div>
  );
};

export default SectionLoader;
