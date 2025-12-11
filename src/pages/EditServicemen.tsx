import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import type { SubmitHandler, Resolver } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import Input from "../components/inputs/input";
import { useNavigate } from "react-router-dom";
import ApiService from "../services/api";
import MultiSelect from "../components/inputs/MultiSelect";
import FileInput from "../components/inputs/FileInput";
import { toast } from "react-toastify";
import GooglePlacesAutocomplete from "../components/GooglePlacesAutocomplete";
import { GOOGLE_API_KEY } from "../config";
import { useLoadScript } from "@react-google-maps/api";
import CommonHeader from "../components/CommonHeader";
import { ChevronDown, ChevronUp, Paperclip } from "react-feather";
// import SectionLoader from "../components/SectionLoader";
import { useSectionLoader } from "../utils/useSectionLoader";

// ✅ Define TypeScript interface
interface Address {
  street_1: string;
  city: string;
  state: string;
  country: string;
  zip: string;
}

interface Bank {
  account_name: string;
  bank_name: string;
  account_number: string;
  ifsc_code: string;
  upi_id: string;
}

interface FormValues {
  fname: string;
  lname: string;
  email: string;
  //   country_code: string;
  //   phone_number: string;
  service_ids: string[];
  address: Address;
  home_address: Address;
  bank: Bank;
  profile_image: FileList;
  serviceman_document: FileList;
}

// ✅ Define Yup validation schema
const validationSchema = Yup.object().shape({
  fname: Yup.string().required("First name is required"),
  lname: Yup.string(),
  email: Yup.string()
    .nullable()
    .trim()
    .test(
      "is-valid-email",
      "Invalid email",
      (value) => !value || Yup.string().email().isValidSync(value)
    ),
  // country_code: Yup.string().required("Country code is required"),
  // phone_number: Yup.string()
  //   .matches(/^[0-9]{10}$/, "Phone number must be 10 digits")
  //   .required("Phone number is required"),

  service_ids: Yup.array()
    .of(Yup.string().required("Invalid service ID"))
    .min(1, "At least one service required")
    .required("Service IDs are required"),

  address: Yup.object().shape({
    street_1: Yup.string().required("Street is required"),
    city: Yup.string().required("City is required"),
    state: Yup.string().required("State is required"),
    country: Yup.string().required("Country is required"),
    zip: Yup.string().required("Zip code is required"),
  }),

  home_address: Yup.object().shape({
    street_1: Yup.string().required("Street is required"),
    city: Yup.string().required("City is required"),
    state: Yup.string().required("State is required"),
    country: Yup.string().required("Country is required"),
    zip: Yup.string().required("Zip code is required"),
  }),

  bank: Yup.object({
    upi_id: Yup.string()
      .trim()
      .test("isValidUPI", "Invalid UPI ID format", (value) => {
        if (!value) return true; // allow empty
        // very general UPI regex: allows xxx@bank or number@bank
        return /^[\w.-]{2,}@[\w.-]{2,}$/.test(value);
      })
      .nullable(),

    account_name: Yup.string().when("upi_id", {
      is: (upi_id: string | null | undefined) => !upi_id,
      then: (schema) => schema.required("Account name is required"),
      otherwise: (schema) => schema.notRequired(),
    }),

    bank_name: Yup.string().when("upi_id", {
      is: (upi_id: string | null | undefined) => !upi_id,
      then: (schema) => schema.required("Bank name is required"),
      otherwise: (schema) => schema.notRequired(),
    }),

    account_number: Yup.string().when("upi_id", {
      is: (upi_id: string | null | undefined) => !upi_id,
      then: (schema) =>
        schema
          .required("Account number is required")
          .matches(/^[0-9]{9,18}$/, "Account number must be 9–18 digits"),
      otherwise: (schema) => schema.notRequired(),
    }),

    ifsc_code: Yup.string().when("upi_id", {
      is: (upi_id: string | null | undefined) => !upi_id,
      then: (schema) =>
        schema
          .required("IFSC code is required")
          .matches(/^[A-Za-z]{4}\d{7}$/, "Invalid IFSC format"),
      otherwise: (schema) => schema.notRequired(),
    }),
  }).test("upiOrBank", "Either UPI ID or bank details required", (value) => {
    const { upi_id, account_name, bank_name, account_number, ifsc_code } =
      value || {};
    const hasUPI = !!upi_id;
    const hasBank =
      !!account_name && !!bank_name && !!account_number && !!ifsc_code;

    return hasUPI || hasBank;
  }),

  profile_image: Yup.mixed<FileList | string>()
    .test("fileOrUrl", "Profile image is required", (value) => {
      // ✅ Accept if we already have a file URL string from API
      if (typeof value === "string" && value.trim() !== "") return true;

      // ✅ Accept if user uploaded a valid FileList
      if (value instanceof FileList && value.length > 0) return true;

      // ❌ Otherwise, invalid
      return false;
    })
    .test("fileType", "Invalid profile image type", (value) => {
      // Skip file type validation if it's an existing URL string
      if (typeof value === "string") return true;

      if (!value || value.length === 0) return false;
      const file = value[0];
      const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
      return allowedTypes.includes(file.type);
    }),

  serviceman_document: Yup.mixed<FileList | string>()
    .test("fileOrUrl", "Document is required", (value) => {
      // ✅ Accept if we already have a file URL string from API
      if (typeof value === "string" && value.trim() !== "") return true;

      // ✅ Accept if user uploaded a valid FileList
      if (value instanceof FileList && value.length > 0) return true;

      // ❌ Otherwise, invalid
      return false;
    })
    .test("fileType", "Invalid document type", (value) => {
      // Skip file type validation if it's an existing URL string
      if (typeof value === "string") return true;

      if (!value || value.length === 0) return false;
      const file = value[0];
      const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
      return allowedTypes.includes(file.type);
    }),
});

const EditServicemen = () => {
  const navigate = useNavigate();
  const [openSection, setOpenSection] = useState<
    "general" | "home_address" | "service_address" | "bank" | "docs" | "none"
  >("general");
  const [paymentType, setPaymentType] = useState<"upi" | "bank">("bank");

  // Loader for edit serviceman
  const servicemanEditLoader = useSectionLoader("serviceman-edit");

  const getProfileDetails = () => {
    servicemanEditLoader.setLoading(true);
    ApiService.post("/servicemen/getServicemenDetails")
      .then((res: any) => {
        console.log(res);
        setValue("fname", res.data.fname);
        setValue("lname", res.data.lname);
        setValue("email", res.data.email);
        if (res.data.service_location) {
          setValue("address", res.data.service_location);
        }
        setValue("home_address", res.data.home_address);
        setValue("bank", res.data.bank_details);
        var service_ids: any = [];
        res.data.services.map((service: any) => {
          service_ids.push(service._id);
        });
        setValue("service_ids", service_ids);
        if (res.data.documents && res.data.documents.length > 0) {
          setValue("serviceman_document", res.data.documents[0].file_url);
        }
        if (res.data.profile_image) {
          setValue("profile_image", res.data.profile_image);
        }
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        servicemanEditLoader.setLoading(false);
      })
  };
  useEffect(() => {
    getProfileDetails();
  }, []);
  const [loading, setLoading] = useState(false);
  const {
    // register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
    watch,
  } = useForm<FormValues>({
    resolver: yupResolver(validationSchema) as Resolver<FormValues>,

    defaultValues: {
      service_ids: [],
      address: { street_1: "", city: "", state: "", country: "", zip: "" },
      home_address: { street_1: "", city: "", state: "", country: "", zip: "" },
      bank: {
        account_name: "",
        bank_name: "",
        account_number: "",
        ifsc_code: "",
        upi_id: "",
      },
    },
  });
  console.log(errors);
  // Previews for profile image and document (accepts FileList or existing URL string)
  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const [docPreview, setDocPreview] = useState<string | null>(null);

  const watchedProfile = watch("profile_image") as FileList | string | undefined;
  const watchedDoc = watch("serviceman_document") as FileList | string | undefined;

  useEffect(() => {
    let url: string | null = null;
    if (!watchedProfile) {
      setProfilePreview(null);
      return;
    }

    if (typeof watchedProfile === "string") {
      // existing URL from API
      setProfilePreview(watchedProfile as string);
      return;
    }

    // It's a FileList
    if (watchedProfile instanceof FileList && watchedProfile.length > 0) {
      url = URL.createObjectURL(watchedProfile[0]);
      setProfilePreview(url);
    } else {
      setProfilePreview(null);
    }

    return () => {
      if (url) {
        URL.revokeObjectURL(url);
      }
    };
  }, [watchedProfile]);

  useEffect(() => {
    let url: string | null = null;
    if (!watchedDoc) {
      setDocPreview(null);
      return;
    }

    if (typeof watchedDoc === "string") {
      setDocPreview(watchedDoc as string);
      return;
    }

    if (watchedDoc instanceof FileList && watchedDoc.length > 0) {
      url = URL.createObjectURL(watchedDoc[0]);
      setDocPreview(url);
    } else {
      setDocPreview(null);
    }

    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [watchedDoc]);
  const onSubmit: SubmitHandler<FormValues> = (data) => {
    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
      if (key === "profile_image" || key === "serviceman_document") {
        formData.append(key, (value as FileList)[0]);
      } else if (typeof value === "object") {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, String(value));
      }
    });

    console.log("✅ Final FormData (to send via API):", data);
    setLoading(true);
    ApiService.post("/servicemen/editServicemen", formData)
      .then((res: any) => {
        console.log(res);
        setLoading(false);
        toast.success(res.message);
        navigate(-1);
      })
      .catch((err: any) => {
        console.log(err);
        toast.error(err.response.data.message);
        setLoading(false);
      });
  };
  const [serviceList, setserviceList] = useState<any>([]);
  useEffect(() => {
    ApiService.post(`/servicemen/listServicesForServiceman`, {}).then(
      (res: any) => {
        console.log(res);
        setserviceList(res.data.list);
      }
    );
  }, []);
  const serviceListOptions = serviceList.map((service: any) => ({
    label: service.service_name,
    value: service.service_id,
  }));
  const handleAddressSelect = (address: any) => {
    console.log("Selected Address:", address);

    // Set main address field
    setValue("home_address.street_1", address.fullAddress, {
      shouldValidate: true,
      shouldDirty: true,
    });

    // Set individual fields
    if (address.city) {
      setValue("home_address.city", address.city, {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
    if (address.state) {
      setValue("home_address.state", address.state, {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
    if (address.postalCode) {
      setValue("home_address.zip", address.postalCode, {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
    if (address.country) {
      setValue("home_address.country", address.country, {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  };
  useEffect(() => {
    if (!errors) return;

    if (
      errors.fname ||
      errors.lname ||
      errors.email ||
      errors.service_ids ||
      errors.profile_image
    ) {
      setOpenSection("general");
    } else if (
      errors.home_address?.street_1 ||
      errors.home_address?.city ||
      errors.home_address?.state ||
      errors.home_address?.country ||
      errors.home_address?.zip
    ) {
      setOpenSection("home_address");
    } else if (
      errors.address?.street_1 ||
      errors.address?.city ||
      errors.address?.state ||
      errors.address?.country ||
      errors.address?.zip
    ) {
      setOpenSection("service_address");
    } else if (
      errors.bank?.upi_id ||
      errors.bank?.account_name ||
      errors.bank?.bank_name ||
      errors.bank?.account_number ||
      errors.bank?.ifsc_code ||
      errors.bank?.message
    ) {
      setOpenSection("bank");
    } else if (errors.serviceman_document) {
      setOpenSection("docs");
    }
  }, [errors]);
  const handleAddressSelect2 = (address: any) => {
    console.log("Selected Address:", address);

    // Set main address field
    setValue("address.street_1", address.fullAddress, {
      shouldValidate: true,
      shouldDirty: true,
    });

    // Set individual fields
    if (address.city) {
      setValue("address.city", address.city, {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
    if (address.state) {
      setValue("address.state", address.state, {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
    if (address.postalCode) {
      setValue("address.zip", address.postalCode, {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
    if (address.country) {
      setValue("address.country", address.country, {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  };
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: GOOGLE_API_KEY,
    libraries: ["places"],
  });
  if (!isLoaded) return <p>Loading...</p>;
  return (
    <>
      <CommonHeader />
      <div className="container mb-8 main-content-service">
        {servicemanEditLoader.loading && (
          <div className="full-page-loader">
            <div className="loader-spinner"></div>
            <p>Loading Profile details...</p>
          </div>
        )}
        <div className="row pt-4">
          <div className="col-12">
            <h6 className="font-18 text-center">Edit Profile</h6>
          </div>
        </div>
        {/* Accordion Sections */}
        <div className="accordion">
          {/* General Info */}
          <div className="accordion-item mb-3 border rounded p-3">
            <div
              className="d-flex justify-content-between align-items-center"
              onClick={() =>
                setOpenSection(openSection === "general" ? "none" : "general")
              }
              style={{ cursor: "pointer" }}
            >
              <h6 className="m-0">General Info</h6>
              {openSection === "general" ? <ChevronUp /> : <ChevronDown />}
            </div>
            {openSection === "general" && (
              <div className="row px-3 pt-3">
                <div className="col-12 pt-3">
                  <label className="lbl2">First Name</label>
                  <Input
                    control={control}
                    name="fname"
                    label=""
                    type="text"
                    placeholder="Enter First Name"
                    inputMode="text"
                    error={errors.fname?.message as string}
                    disabled={loading}
                  />
                </div>
                <div className="col-12 pt-3">
                  <label className="lbl2">Last Name</label>
                  <Input
                    control={control}
                    name="lname"
                    label=""
                    type="text"
                    placeholder="Enter Last Name"
                    inputMode="text"
                    error={errors.lname?.message as string}
                    disabled={loading}
                  />
                </div>
                <div className="col-12 pt-3">
                  <label className="lbl2">Email</label>
                  <Input
                    control={control}
                    name="email"
                    label=""
                    type="text"
                    placeholder="Enter Email"
                    inputMode="text"
                    error={errors.email?.message as string}
                    disabled={loading}
                  />
                </div>
                <div className="col-12 pt-3">
                  <label className="lbl2">Service Type</label>
                  <MultiSelect
                    control={control}
                    name="service_ids"
                    label=""
                    options={serviceListOptions}
                    error={errors.service_ids?.message as string}
                    disabled={loading}
                  />
                </div>
                <div className="col-12 pt-1">
                  <FileInput
                    label="Upload Profile Image"
                    name="profile_image"
                    control={control}
                    error={errors.profile_image?.message as string}
                  />
                  <div className="col-12 pt-2" style={{ textAlign: "center" }}>
                    {profilePreview && (
                      <img
                        style={{ height: "120px", width: "120px", borderRadius: 8 }}
                        src={profilePreview}
                        alt="Profile preview"
                        className="img-fluid"
                      />
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* General Info */}
          <div className="accordion-item mb-3 border rounded p-3">
            <div
              className="d-flex justify-content-between align-items-center"
              onClick={() =>
                setOpenSection(
                  openSection === "home_address" ? "none" : "home_address"
                )
              }
              style={{ cursor: "pointer" }}
            >
              <h6 className="m-0">Home Address</h6>
              {openSection === "home_address" ? <ChevronUp /> : <ChevronDown />}
            </div>
            {openSection === "home_address" && (
              <div className="col-12 pt-3">
                <GooglePlacesAutocomplete
                  control={control}
                  name="home_address.street_1"
                  onSelect={handleAddressSelect}
                  label=""
                  error={errors.home_address?.street_1?.message?.toString()}
                />
              </div>
            )}
          </div>
          <div className="accordion-item mb-3 border rounded p-3">
            <div
              className="d-flex justify-content-between align-items-center"
              onClick={() =>
                setOpenSection(
                  openSection === "service_address" ? "none" : "service_address"
                )
              }
              style={{ cursor: "pointer" }}
            >
              <h6 className="m-0">Service Address</h6>
              {openSection === "service_address" ? (
                <ChevronUp />
              ) : (
                <ChevronDown />
              )}
            </div>
            {openSection === "service_address" && (
              <div className="col-12 pt-3">
                <GooglePlacesAutocomplete
                  control={control}
                  name="address.street_1"
                  onSelect={handleAddressSelect2}
                  label=""
                  error={errors.address?.message?.toString()}
                />
              </div>
            )}
          </div>

          {/* <div className="col-12 pt-3">
            {errors.bank?.message && (
              <p className="alert alert-danger">{errors.bank?.message}</p>
            )}
          </div> */}
          <div className="accordion-item mb-3 border rounded p-3">
            <div
              className="d-flex justify-content-between align-items-center"
              onClick={() =>
                setOpenSection(openSection === "bank" ? "none" : "bank")
              }
              style={{ cursor: "pointer" }}
            >
              <h6 className="m-0">Banking Info</h6>
              {openSection === "bank" ? <ChevronUp /> : <ChevronDown />}
            </div>

            {openSection === "bank" && (
              <div className="mt-3">
                <div className="row">
                  {/* --- Select Payment Type --- */}
                  <div className="col-12 pt-3">
                    <label className="lbl2 d-block mb-2">
                      Select Payment Method
                    </label>
                    <div className="d-flex gap-4">
                      <div className="form-check">
                        <input
                          type="radio"
                          className="form-check-input"
                          id="upiOption"
                          name="payment_type"
                          checked={paymentType === "upi"}
                          onChange={() => {
                            setPaymentType("upi");
                          }}
                        />
                        <label
                          htmlFor="upiOption"
                          className="form-check-label font-14"
                        >
                          UPI ID
                        </label>
                      </div>

                      <div className="form-check">
                        <input
                          type="radio"
                          className="form-check-input"
                          id="bankOption"
                          name="payment_type"
                          checked={paymentType === "bank"}
                          onChange={() => {
                            setPaymentType("bank");
                          }}
                        />
                        <label
                          htmlFor="bankOption"
                          className="form-check-label font-14"
                        >
                          Bank Account
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* ✅ Show form-level bank error here */}
                  {errors.bank?.message && (
                    <div className="col-12 pt-3">
                      <div className="alert alert-danger py-2">
                        {errors.bank?.message}
                      </div>
                    </div>
                  )}

                  {/* --- UPI Section --- */}
                  {paymentType === "upi" && (
                    <div className="col-12 pt-3">
                      <div className="">
                        <Input
                          label="UPI ID"
                          control={control}
                          name="bank.upi_id"
                          type="text"
                          placeholder="example@bank"
                          error={errors.bank?.upi_id?.message as string}
                        />
                        <p className="text-muted font-12 mt-2">
                          Enter your valid UPI handle (e.g. name@bank)
                        </p>
                      </div>
                    </div>
                  )}

                  {/* --- Bank Details Section --- */}
                  {paymentType === "bank" && (
                    <div className="col-12 pt-3">
                      <div className="">
                        <Input
                          label="Account Name"
                          control={control}
                          name="bank.account_name"
                          type="text"
                          placeholder="Enter Account Name"
                          error={errors.bank?.account_name?.message as string}
                        />
                        <Input
                          label="Bank Name"
                          control={control}
                          name="bank.bank_name"
                          type="text"
                          placeholder="Enter Bank Name"
                          error={errors.bank?.bank_name?.message as string}
                        />
                        <Input
                          label="Account Number"
                          control={control}
                          name="bank.account_number"
                          type="text"
                          inputMode="numeric"
                          placeholder="Enter Account Number"
                          error={errors.bank?.account_number?.message as string}
                        />
                        <Input
                          label="IFSC Code"
                          control={control}
                          name="bank.ifsc_code"
                          type="text"
                          placeholder="Enter IFSC Code"
                          error={errors.bank?.ifsc_code?.message as string}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="accordion-item mb-3 border rounded p-3">
          <div
            className="d-flex justify-content-between align-items-center"
            onClick={() =>
              setOpenSection(openSection === "docs" ? "none" : "docs")
            }
            style={{ cursor: "pointer" }}
          >
            <h6 className="m-0">Docs Upload</h6>
            {openSection === "docs" ? <ChevronUp /> : <ChevronDown />}
          </div>

          {openSection === "docs" && (
            <div className="mt-3">
              <div className="row">
                <div className="col-12 pt-3">
                  <FileInput
                    label="Upload Aadhar / PAN Card"
                    name="serviceman_document"
                    control={control}
                    error={errors.serviceman_document?.message as string}
                  />
                  <div className="col-12 pt-2" style={{ textAlign: "center" }}>
                    {docPreview && (
                      (/\.(jpe?g|png|gif|webp|bmp)$/i.test(docPreview) ? (
                        <img
                          style={{ height: "120px", width: "240px", objectFit: 'contain' }}
                          src={docPreview}
                          alt="Document preview"
                          className="img-fluid"
                        />
                      ) : (
                        <p className="font-12 text-secondary mb-0 pt-1">
                          <Paperclip size={14} />&nbsp;
                          <a href={docPreview} target="_blank" rel="noreferrer">Open document</a>
                        </p>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="row px-3 pt-3">
          <div className="col-12">
            <button
              onClick={handleSubmit(onSubmit)}
              disabled={loading}
              className="fill"
            >
              {loading ? "Loading..." : "Update Profile"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default EditServicemen;
