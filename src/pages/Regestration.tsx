import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import type { SubmitHandler, Resolver } from "react-hook-form";
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
  service_ids: string[];
  bank: Bank;
  profile_image: FileList;
  serviceman_document: FileList;
}

// ✅ Yup validation schema
const validationSchema = Yup.object().shape({
  fname: Yup.string().required("First name is required"),
  lname: Yup.string(),
  service_ids: Yup.array()
    .of(Yup.string().required("Invalid service ID"))
    .min(1, "At least one service required")
    .required("Service IDs are required"),

  bank: Yup.object({
    upi_id: Yup.string()
      .trim()
      .test("isValidUPI", "Invalid UPI ID format", (value) => {
        if (!value) return true;
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

  profile_image: Yup.mixed<FileList>()
    .test("fileRequired", "Profile image is required", (value) => {
      return value instanceof FileList && value.length > 0;
    })
    .test("fileType", "Invalid document type", (value) => {
      if (!value || value.length === 0) return false; // required already ensures non-empty
      const file = value[0];
      const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
      return allowedTypes.includes(file.type);
    }),
  serviceman_document: Yup.mixed<FileList>()
    .test("fileRequired", "Serviceman document is required", (value) => {
      return value instanceof FileList && value.length > 0;
    })
    .test("fileType", "Invalid document type", (value) => {
      if (!value || value.length === 0) return false; // required already ensures non-empty
      const file = value[0];
      const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
      return allowedTypes.includes(file.type);
    }),
});

const Registration = () => {
  const navigate = useNavigate();
  const locationData = useLocation();
  const { login } = useAuth();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const token = locationData.state?.token;
  const phone_number = locationData.state?.phone_number;
  const country_code = locationData.state?.country_code;
  const user_type = locationData.state?.user_type;
  const [loading, setLoading] = useState(false);
  const [openSection, setOpenSection] = useState<
    "general" | "bank" | "docs" | "none"
  >("general");
  const [paymentType, setPaymentType] = useState<"upi" | "bank">("bank");
  const {
    handleSubmit,
    control,

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
    },
  });

  const [serviceList, setServiceList] = useState<any[]>([]);

  useEffect(() => {
    ApiService.post(
      `/servicemen/listServicesForServiceman`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    ).then((res: any) => {
      setServiceList(res.data.list);
    });
  }, [token]);

  const serviceListOptions = serviceList.map((service: any) => ({
    label: service.service_name,
    value: service.service_id,
  }));

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

    setLoading(true);
    ApiService.post("/servicemen/editServicemen", formData, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(() => {
        setLoading(false);
        // setShowSuccessModal(true);
        login(token, user_type);

        navigate("/dashboard");
      })
      .catch((err: any) => {
        toast.error(err.response?.data?.message || "Error submitting form");
        setLoading(false);
      });
  };

  const handleClose = () => {
    setShowSuccessModal(false);
    navigate("/");
  };
  const handleSkip = () => {
    login(token, user_type);

    navigate("/dashboard");
  };

  return (
    <div className="container py-4">
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
                    label="First Name"
                    control={control}
                    name="fname"
                    type="text"
                    placeholder="Enter First Name"
                    error={errors.fname?.message as string}
                  />
                </div>
                <div className="col-12 pt-3">
                  <Input
                    label="Last Name"
                    control={control}
                    name="lname"
                    type="text"
                    placeholder="Enter Last Name"
                    error={errors.lname?.message as string}
                  />
                </div>
                <div className="col-12 pt-3">
                  <MultiSelect
                    label="Service Type"
                    control={control}
                    name="service_ids"
                    options={serviceListOptions}
                    error={errors.service_ids?.message as string}
                  />
                </div>
                <div className="col-12 pt-1">
                  <FileInput
                    label="Upload Profile Image"
                    name="profile_image"
                    control={control}
                    error={errors.profile_image?.message as string}
                  />
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

        {/* Banking Info */}
        {/* Banking Info */}
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

        {/* Docs Upload */}
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
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="text-center mt-4">
          <button onClick={handleSubmit(onSubmit)} className="fill">
            Register Profile
          </button>
          <button onClick={handleSkip} className="fill mt-2">
            Skip
          </button>
        </div>
      </div>

      <SuccessConfirmModal
        show={showSuccessModal}
        onCancel={() => setShowSuccessModal(false)}
        onConfirm={handleClose}
        loading={loading}
        itemName={country_code + phone_number}
        title=" 🥳 Thanks for joining Instasevak"
        description="Your account has been registered successfully."
        confirmLabel="Close"
      />
    </div>
  );
};

export default Registration;
