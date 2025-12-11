import * as Yup from "yup";
import { countryCodeValidation } from "./useCountryCodeField";

export const formSchema = Yup.object().shape({
  countryCode: countryCodeValidation,
});
