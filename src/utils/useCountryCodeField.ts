import * as Yup from "yup";

export const countryCodeValidation = Yup.string()
  .required("Country code is required")
  .matches(/^\+\d{1,4}$/, 'Must start with "+" and have 1 to 4 digits'); // Example: +91, +1, +1234

export const useCountryCodeField = () => {
  return {
    name: "countryCode",
    label: "Country Code",
    placeholder: "+91",
    validation: countryCodeValidation,
  };
};
