import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import type { Resolver } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import Input from "../components/inputs/input";
import MultiSelect from "../components/inputs/MultiSelect";
import FileInput from "../components/inputs/FileInput";
import { useLocation, useNavigate } from "react-router-dom";
import ApiService from "../services/api";
import { toast } from "react-toastify";
import { SuccessConfirmModal } from "../components/SuccessConfirmModal";
import { ChevronLeft, ChevronDown, ChevronUp } from "react-feather";
import { useAuth } from "../contexts/AuthContext";
import GooglePlacesAutocomplete from "../components/GooglePlacesAutocomplete";
import { useLoadScript } from "@react-google-maps/api";
import { GOOGLE_API_KEY } from "../config";
import Loader from "../components/Loader";

interface Bank {
  account_name: string;
  bank_name: string;
  account_number: string;
  ifsc_code: string;
  upi_id: string;
}

interface Address {
  street_1: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

interface FormValues {
  fname: string;
  lname: string;
  service_ids: string[];
  bank: Bank;
  address: Address;
  profile_image: FileList;
  serviceman_document: FileList;
}

// ✅ Yup validation schema - only `fname` is required; everything else optional
const validationSchema = Yup.object().shape({
  fname: Yup.string().required("First name is required"),
  lname: Yup.string().required("Last name is required"),

  service_ids: Yup.array().of(Yup.string()).required("At least one service is required"),

  bank: Yup.object({
    upi_id: Yup.string()
      .trim()
      .test("isValidUPI", "Invalid UPI ID format", (value) => {
        if (!value) return true;
        return /^[\w.-]{2,}@[\w.-]{2,}$/.test(value);
      })
      .nullable(),

    account_name: Yup.string().notRequired(),
    bank_name: Yup.string().notRequired(),
    account_number: Yup.string()
      .notRequired()
      .nullable()
      .matches(/^[0-9]{9,18}$/, { message: "Account number must be 9–18 digits", excludeEmptyString: true }),
    ifsc_code: Yup.string()
      .notRequired()
      .nullable()
      .matches(/^[A-Za-z]{4}\d{7}$/, { message: "Invalid IFSC format", excludeEmptyString: true }),
  }).notRequired(),

  address: Yup.object({
    street_1: Yup.string().notRequired(),
    city: Yup.string().notRequired(),
    state: Yup.string().notRequired(),
    zip: Yup.string().notRequired(),
    country: Yup.string().notRequired(),
  }).notRequired(),

  profile_image: Yup.mixed<FileList>()
    .required("Profile image is required")
    .test("fileType", "Invalid document type", (value) => {
      if (!value || value.length === 0) return true;
      const file = value[0];
      const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
      return allowedTypes.includes(file.type);
    }),

  serviceman_document: Yup.mixed<FileList>()
    .notRequired()
    .test("fileType", "Invalid document type", (value) => {
      if (!value || value.length === 0) return true;
      const file = value[0];
      const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
      return allowedTypes.includes(file.type);
    }),
});

const Registration = () => {
  const navigate = useNavigate();
  const locationData = useLocation();
  const { login, token: authToken } = useAuth();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const token = locationData.state?.token;
  const phone_number = locationData.state?.phone_number;
  const country_code = locationData.state?.country_code;
  const user_type = locationData.state?.user_type;
  const [loadingGeneral, setLoadingGeneral] = useState(false);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [generalInfoDone, setGeneralInfoDone] = useState(false);
  const [openSection, setOpenSection] = useState<
    "general" | "bank" | "docs" | "none"
  >("general");
  const [paymentType, setPaymentType] = useState<"upi" | "bank">("bank");
  const {
    control,
    trigger,
    getValues,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(validationSchema) as Resolver<FormValues>,
    defaultValues: {
      service_ids: [],
      bank: {
        account_name: "",
        bank_name: "",
        account_number: "",
        ifsc_code: "",
        upi_id: "",
      },
      address: {
        street_1: "",
        city: "",
        state: "",
        zip: "",
        country: "",
      },
    },
  });

  const [serviceList, setServiceList] = useState<any[]>([]);

  useEffect(() => {
    ApiService.post(
      `/servicemen/listServicesForServiceman`,
      {},
      {
        headers: { Authorization: `Bearer ${token || authToken}` },
      }
    ).then((res: any) => {
      setServiceList(res.data.list);
    });
  }, [token]);

  const serviceListOptions = serviceList.map((service: any) => ({
    label: service.service_name,
    value: service.service_id,
  }));

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: GOOGLE_API_KEY,
    libraries: ["places"],
  });

  const handleAddressSelect = (addressData: any) => {
    setValue("address.street_1" as any, addressData.fullAddress, { shouldValidate: true, shouldDirty: true });
    if (addressData.city) setValue("address.city" as any, addressData.city, { shouldValidate: true, shouldDirty: true });
    if (addressData.state) setValue("address.state" as any, addressData.state, { shouldValidate: true, shouldDirty: true });
    if (addressData.postalCode) setValue("address.zip" as any, addressData.postalCode, { shouldValidate: true, shouldDirty: true });
    if (addressData.country) setValue("address.country" as any, addressData.country, { shouldValidate: true, shouldDirty: true });
  };

  const submitGeneralInfo = async () => {
    const valid = await trigger(["fname", "lname", "service_ids", "profile_image"]);
    if (!valid) {
      const { fname, lname, service_ids, profile_image } = errors;
      const firstErr = (fname || lname || (service_ids as any) || profile_image) as any;
      toast.error(firstErr?.message || "Please fix the errors in General Info");
      return;
    }
    const data = getValues();
    const formData = new FormData();
    formData.append("fname", data.fname);
    if (data.lname) formData.append("lname", data.lname);
    if (data.service_ids?.length) formData.append("service_ids", JSON.stringify(data.service_ids));
    if (data.profile_image?.[0]) formData.append("profile_image", data.profile_image[0]);
    setLoadingGeneral(true);
    ApiService.post("/servicemen/editServicemen", formData, {
      headers: { Authorization: `Bearer ${token || authToken}` },
    })
      .then(() => {
        setLoadingGeneral(false);
        setGeneralInfoDone(true);
        setOpenSection("docs");
        toast.success("General info saved!");
      })
      .catch((err: any) => {
        toast.error(err.response?.data?.message || "Error updating general info");
        setLoadingGeneral(false);
      });
  };

  const submitVerificationInfo = async () => {
    const valid = await trigger(["address", "serviceman_document"]);
    if (!valid) {
      toast.error("Please fix the errors in Verification Info");
      return;
    }
    const data = getValues();
    const formData = new FormData();
    if (data.address) formData.append("address", JSON.stringify(data.address));
    if (data.serviceman_document?.[0]) formData.append("serviceman_document", data.serviceman_document[0]);
    setLoadingDocs(true);
    ApiService.post("/servicemen/editServicemen", formData, {
      headers: { Authorization: `Bearer ${token || authToken}` },
    })
      .then(() => {
        setLoadingDocs(false);
        // Only call login when we have a token from navigation (fresh login flow)
        if (token) {
          login(token, user_type);
        }
        navigate("/dashboard");
      })
      .catch((err: any) => {
        toast.error(err.response?.data?.message || "Error updating verification info");
        setLoadingDocs(false);
      });
  };

  const handleClose = () => {
    setShowSuccessModal(false);
    navigate("/dashboard");
  };
  const handleSkip = () => {
    if (token) login(token, user_type);
    navigate("/dashboard");
  };

  return (
    <div className="container py-4">
      <div className="row">
        <div className="col-12">

        
      <Loader show={!isLoaded} text="Loading maps..." />
      <button
        className="back-btn mb-3 px-3 py-3"
        style={{ color: "#000" }}
        onClick={() => navigate(-1)}
      >
        <ChevronLeft /> Back
      </button>

      <h6 className="text-center mb-4">Servicemen Registration</h6>

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
            <div className="mt-3">
              <div className="row">
                <div className="col-12 pt-3">
                  <Input
                    label={<><span>First Name</span><span style={{ color: "red" }}> *</span></>}
                    control={control}
                    name="fname"
                    type="text"
                    placeholder="Enter First Name"
                    error={errors.fname?.message as string}
                  />
                </div>
                <div className="col-12 pt-3">
                  <Input
                    label={<><span>Last Name</span><span style={{ color: "red" }}> *</span></>}
                    control={control}
                    name="lname"
                    type="text"
                    placeholder="Enter Last Name"
                    error={errors.lname?.message as string}
                  />
                </div>
                <div className="col-12 pt-3">
                  <MultiSelect
                    label={<><span>Service Type</span></>}
                    control={control}
                    name="service_ids"
                    options={serviceListOptions}
                    error={errors.service_ids?.message as string}
                    required
                  />
                </div>
                <div className="col-12 pt-1">
                  <FileInput
                    label={<><span>Upload Profile Image</span><span style={{ color: "red" }}> *</span></>}
                    name="profile_image"
                    control={control}
                    error={errors.profile_image?.message as string}
                    openCamera
                    captureMode="user"
                    accept="image/*"
                  />
                </div>
                <div className="col-12 pt-3">
                  <button
                    className="fill w-100"
                    onClick={submitGeneralInfo}
                    disabled={loadingGeneral}
                  >
                    {loadingGeneral ? "Saving..." : "Update General Info"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        {/* <div className="col-12 pt-3">  
          {" "}
          {errors.bank?.message && (
            <p className="alert alert-danger">{errors.bank?.message}</p>
          )}{" "}
        </div> */}

        {/* Banner shown after General Info is saved */}
        {generalInfoDone && (
          <div
            className="alert alert-success d-flex align-items-center gap-2 mb-3"
            role="alert"
          >
            <span>✅</span>
            <span>General info saved! Now fill the verification details below.</span>
          </div>
        )}

        {/* Banking Info */}
        {false && (<div className="accordion-item mb-3 border rounded p-3">
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
                          setValue("bank.account_name", "");
                          setValue("bank.bank_name", "");
                          setValue("bank.account_number", "");
                          setValue("bank.ifsc_code", "");
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
                          setValue("bank.upi_id", "");
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
                    <div className="bnkboxf">
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
        )}

        {/* Docs Upload */}
        <div className="accordion-item mb-3 border rounded p-3">
          <div
            className="d-flex justify-content-between align-items-center"
            onClick={() =>
              setOpenSection(openSection === "docs" ? "none" : "docs")
            }
            style={{ cursor: "pointer" }}
          >
            <h6 className="m-0"> Verification Info</h6>
            {openSection === "docs" ? <ChevronUp /> : <ChevronDown />}
          </div>

          {openSection === "docs" && (
            <div className="mt-3">
              <div className="row">
                {/* Service Location Address */}
                <div className="col-12 pt-2">
                  <p className="font-14 weight-bold mb-1">Service Location</p>
                </div>
                <div className="col-12 pt-2">
                  {isLoaded ? (
                    <GooglePlacesAutocomplete
                      control={control}
                      name="address.street_1"
                      onSelect={handleAddressSelect}
                      label="Street Address"
                      error={(errors as any).address?.street_1?.message}
                    />
                  ) : (
                    <Input
                      label="Street Address"
                      control={control}
                      name="address.street_1"
                      type="text"
                      placeholder="Enter street address"
                      error={(errors as any).address?.street_1?.message}
                    />
                  )}
                </div>
                <div className="col-6 pt-3">
                  <Input
                    label="City"
                    control={control}
                    name="address.city"
                    type="text"
                    placeholder="Enter city"
                    error={(errors as any).address?.city?.message}
                  />
                </div>
                <div className="col-6 pt-3">
                  <Input
                    label="State"
                    control={control}
                    name="address.state"
                    type="text"
                    placeholder="Enter state"
                    error={(errors as any).address?.state?.message}
                  />
                </div>
                <div className="col-6 pt-3">
                  <Input
                    label="Country"
                    control={control}
                    name="address.country"
                    type="text"
                    placeholder="Enter country"
                    error={(errors as any).address?.country?.message}
                  />
                </div>
                <div className="col-6 pt-3">
                  <Input
                    label="Zip Code"
                    control={control}
                    name="address.zip"
                    type="text"
                    inputMode="numeric"
                    placeholder="Enter zip"
                    error={(errors as any).address?.zip?.message}
                  />
                </div>

                {/* Document Upload */}
                <div className="col-12 pt-3">
                  <p className="font-14 weight-bold mb-1">Documents</p>
                </div>
                <div className="col-12">
                  <FileInput
                    label="Upload Aadhar / PAN Card"
                    name="serviceman_document"
                    control={control}
                    error={errors.serviceman_document?.message as string}
                  />
                </div>
                <div className="col-12 pt-3">
                  <button
                    className="fill w-100"
                    onClick={submitVerificationInfo}
                    disabled={loadingDocs}
                  >
                    {loadingDocs ? "Saving..." : "Update Verification Info"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="text-center mt-4">
          <button
            className="fill w-100"
            onClick={handleSkip}>
            Go to Dashboard
          </button>
        </div>
      </div>
      </div>
      </div>

      <SuccessConfirmModal
        show={showSuccessModal}
        onCancel={() => setShowSuccessModal(false)}
        onConfirm={handleClose}
        loading={loadingGeneral}
        itemName={country_code + phone_number}
        title=" 🥳 Thanks for joining Instasevak"
        description="Your account has been registered successfully."
        confirmLabel="Close"
      />
    </div>
  );
};

export default Registration;
