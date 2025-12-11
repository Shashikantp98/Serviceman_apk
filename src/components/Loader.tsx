import React from "react";
import ReactDOM from "react-dom";
import "./SectionLoader.css"; // using the same CSS as section loader

interface LoaderProps {
  show: boolean;
  text?: string;
}

const Loader: React.FC<LoaderProps> = ({ show, text = "Please wait..." }) => {
  if (!show) return null;

  return ReactDOM.createPortal(
    <div className="full-page-loader">
      <div className="loader-spinner"></div>
      <p>{text}</p>
    </div>,
    document.getElementById("loader-root")!
  );
};

export default Loader;
