import { useState } from "react";

const Language = () => {
  const [lang, setLang] = useState("eng");
  return (
    <>
      <div className="pt-5 px-4">
        <h3 className="text-center head2">Select Language</h3>
      </div>
      <div className="px-4 d-flex gap-20">
        <input
          type="radio"
          id="eng"
          className="radi"
          checked={lang === "eng"}
          onChange={() => setLang("eng")}
        ></input>
        <label htmlFor="eng" className="lblrad">
          English
        </label>
        <input
          type="radio"
          id="hin"
          className="radi"
          checked={lang === "hin"}
          onChange={() => setLang("hin")}
        ></input>
        <label htmlFor="hin" className="lblrad">
          Hindi
        </label>
      </div>

      <div className="px-4 pt-4">
        <button className="fill">Save</button>
      </div>
    </>
  );
};

export default Language;
