import { useEffect, useRef, useState } from "react";
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
import { ChevronLeft } from "react-feather";
import { useAuth } from "../contexts/AuthContext";
import { useSectionLoader } from "../utils/useSectionLoader";
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
  category_ids: string[];
  service_ids: string[];
  bank: Bank;
  address: Address;
  profile_image: FileList | string;
  serviceman_document: FileList | string;
  serviceman_document_2: FileList | string;
  serviceman_document_3: FileList | string;
}

// ✅ Yup validation schema - only `fname` is required; everything else optional
const validationSchema = Yup.object().shape({
  fname: Yup.string().required("First name is required"),
  lname: Yup.string().required("Last name is required"),

  category_ids: Yup.array().of(Yup.string()).notRequired(),

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

  profile_image: Yup.mixed<FileList | string>()
    .test("fileOrUrl", "Profile image is required", (value) => {
      if (typeof value === "string" && value.trim() !== "") return true;
      if (value instanceof FileList && value.length > 0) return true;
      return false;
    })
    .test("fileType", "Invalid document type", (value) => {
      if (typeof value === "string") return true;
      if (!value || value.length === 0) return false;
      const file = value[0];
      const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
      return allowedTypes.includes(file.type);
    }),

  serviceman_document: Yup.mixed<FileList | string>()
    .notRequired()
    .test("fileOrUrl", "Invalid document", (value) => {
      if (!value) return true;
      if (typeof value === "string" && value.trim() !== "") return true;
      if (value instanceof FileList && value.length > 0) return true;
      return false;
    })
    .test("fileType", "Invalid document type", (value) => {
      if (typeof value === "string") return true;
      if (!value || value.length === 0) return true;
      const file = value[0];
      const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
      return allowedTypes.includes(file.type);
    }),

  serviceman_document_2: Yup.mixed<FileList | string>()
    .notRequired()
    .test("fileOrUrl2", "Invalid document", (value) => {
      if (!value) return true;
      if (typeof value === "string" && value.trim() !== "") return true;
      if (value instanceof FileList && value.length > 0) return true;
      return false;
    })
    .test("fileType2", "Invalid document type", (value) => {
      if (typeof value === "string") return true;
      if (!value || value.length === 0) return true;
      const file = value[0];
      const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
      return allowedTypes.includes(file.type);
    }),

  serviceman_document_3: Yup.mixed<FileList | string>()
    .notRequired()
    .test("fileOrUrl3", "Invalid document", (value) => {
      if (!value) return true;
      if (typeof value === "string" && value.trim() !== "") return true;
      if (value instanceof FileList && value.length > 0) return true;
      return false;
    })
    .test("fileType3", "Invalid document type", (value) => {
      if (typeof value === "string") return true;
      if (!value || value.length === 0) return true;
      const file = value[0];
      const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
      return allowedTypes.includes(file.type);
    }),
});

const Registration = () => {
  const navigate = useNavigate();
  const locationData = useLocation();
  const { login, token: authToken, latitude, longitude } = useAuth();
  const token = locationData.state?.token;
  const user_type = locationData.state?.user_type;
  const [loadingGeneral, setLoadingGeneral] = useState(false);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [referralCode, setReferralCode] = useState("");
  const {
    control,
    trigger,
    getValues,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(validationSchema) as Resolver<FormValues>,
    defaultValues: {
      category_ids: [],
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
  const [categoryList, setCategoryList] = useState<any[]>([]);
  const [documentIds, setDocumentIds] = useState<string[]>([]);
  const selectedCategoryIds = watch("category_ids") ?? [];
  const selectedCategoriesKey = JSON.stringify(selectedCategoryIds);
  // Holds pre-existing service_ids to restore after services list loads (avoids reset wipe)
  const pendingServiceIds = useRef<string[] | null>(null);
  // Loader while fetching serviceman details
  const servicemanDetailsLoader = useSectionLoader("serviceman-edit");

  const getServicemenDetails = () => {
    if (!token && !authToken) return;
    servicemanDetailsLoader.setLoading(true);
    ApiService.post(
      "/servicemen/getServicemenDetails",
      {},
      {
        headers: { Authorization: `Bearer ${token || authToken}` },
      }
    )
      .then((res: any) => {
        const data = res?.data || {};
        if (data.fname) setValue("fname", data.fname);
        if (data.lname) setValue("lname", data.lname);
        if (data.service_location) setValue("address", data.service_location);
        if (data.bank_details) setValue("bank", data.bank_details);
        // Store service_ids in ref — will be restored after the services list loads
        if (Array.isArray(data.services)) {
          pendingServiceIds.current = data.services.map((service: any) => service._id || service.service_id || service);
        }
        // Pre-select categories from API response
        if (Array.isArray(data.categories) && data.categories.length > 0) {
          const category_ids = data.categories.map((c: any) => c._id || c.category_id || c);
          setValue("category_ids", category_ids);
          // setting category_ids triggers the services useEffect which will restore service_ids
        } else if (pendingServiceIds.current?.length) {
          // No categories in response — set service_ids directly
          setValue("service_ids", pendingServiceIds.current);
          pendingServiceIds.current = null;
        }
        if (data.documents && data.documents.length > 0) {
          const docs = data.documents;
          // Track all existing document _ids (handles both `_id` and `id` field names)
          setDocumentIds(
            docs.map((d: any) => d._id || d.id || "").filter(Boolean)
          );
          // Load each doc into its field by index
          if (docs[0]?.file_url) setValue("serviceman_document", docs[0].file_url);
          if (docs[1]?.file_url) setValue("serviceman_document_2", docs[1].file_url);
          if (docs[2]?.file_url) setValue("serviceman_document_3", docs[2].file_url);
        }
        if (data.profile_image) {
          setValue("profile_image", data.profile_image);
        }
        // If API returns general info already filled, open verification section directly
        const hasGeneralInfo = Boolean(
          data.fname ||
          data.lname ||
          (Array.isArray(data.services) && data.services.length > 0) ||
          data.profile_image
        );
        if (hasGeneralInfo) {
          setCurrentStep(3);
        }
      })
      .catch(() => {
        // ignore if details not available
      })
      .finally(() => {
        servicemanDetailsLoader.setLoading(false);
      });
  };

  // Fetch all categories on mount
  useEffect(() => {
    ApiService.post(
      `/user/getAllCategoryList`,
      {
        latitude: Number(latitude),
        longitude: Number(longitude),
        filters: { search: "" },
        pagination: { page: 1, pageSize: 50 },
      },
      {
        headers: { Authorization: `Bearer ${token || authToken}` },
      }
    )
      .then((res: any) => {
        setCategoryList(res.data?.list || []);
      })
      .catch(() => {});
  }, [token, authToken, latitude, longitude]);

  // Fetch services filtered by selected categories
  useEffect(() => {
    if (!selectedCategoryIds.length) {
      setServiceList([]);
      return;
    }
    ApiService.post(
      `/servicemen/listServicesForServiceman`,
      { filters: { category_id: selectedCategoryIds } },
      {
        headers: { Authorization: `Bearer ${token || authToken}` },
      }
    )
      .then((res: any) => {
        const list = res.data?.list || [];
        setServiceList(list);
        if (pendingServiceIds.current !== null) {
          // Restore pre-existing selections on initial load
          setValue("service_ids", pendingServiceIds.current);
          pendingServiceIds.current = null;
        } else {
          // User changed categories — keep selections still valid in the new list
          const newIds = new Set(list.map((s: any) => s.service_id));
          const current = getValues("service_ids") || [];
          setValue("service_ids", current.filter((id: string) => newIds.has(id)));
        }
      })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategoriesKey, token, authToken]);

  useEffect(() => {
    getServicemenDetails();
  }, [token, authToken]);

  const serviceListOptions = serviceList.map((service: any) => ({
    label: service.service_name,
    value: service.service_id,
  }));

  const categoryListOptions = categoryList.map((cat: any) => ({
    label: cat.category_name,
    value: cat.category_id || cat._id,
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

  const stepTitles = [
    "Basic Info",
    "Service Details",
    "Service Location",
    "Documents",
  ];

  const goToNextStep = async () => {
    if (currentStep === 1) {
      const valid = await trigger(["fname", "lname", "profile_image"]);
      if (!valid) {
        const { fname, lname, profile_image } = errors;
        const firstErr = (fname || lname || profile_image) as any;
        toast.error(firstErr?.message || "Please fix the errors before continuing");
        return;
      }
      setCurrentStep(2);
      return;
    }

    if (currentStep === 2) {
      const valid = await trigger(["category_ids", "service_ids"]);
      if (!valid) {
        const { category_ids, service_ids } = errors;
        const firstErr = (category_ids || (service_ids as any)) as any;
        toast.error(firstErr?.message || "Please select category and service");
        return;
      }
      await submitGeneralInfo();
      return;
    }

    if (currentStep === 3) {
      const valid = await trigger(["address.street_1", "address.city", "address.state", "address.country", "address.zip"] as any);
      if (!valid) {
        const addressErrors = (errors as any).address;
        const firstErr =
          addressErrors?.street_1 ||
          addressErrors?.city ||
          addressErrors?.state ||
          addressErrors?.country ||
          addressErrors?.zip;
        toast.error(firstErr?.message || "Please fix the service location details");
        return;
      }
      setCurrentStep(4);
    }
  };

  const goToPreviousStep = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const submitGeneralInfo = async () => {
    const valid = await trigger(["fname", "lname", "category_ids", "service_ids", "profile_image"]);
    if (!valid) {
      const { fname, lname, category_ids, service_ids, profile_image } = errors;
      const firstErr = (fname || lname || category_ids || (service_ids as any) || profile_image) as any;
      toast.error(firstErr?.message || "Please fix the errors in General Info");
      return false;
    }
    const data = getValues();
    const formData = new FormData();
    formData.append("fname", data.fname);
    if (data.lname) formData.append("lname", data.lname);
    if (data.category_ids?.length) formData.append("category_ids", JSON.stringify(data.category_ids));
    if (data.service_ids?.length) formData.append("service_ids", JSON.stringify(data.service_ids));
    if (data.profile_image instanceof FileList && data.profile_image?.[0]) {
      formData.append("profile_image", data.profile_image[0]);
    }
    if (referralCode.trim()) {
      // TODO: confirm field name with backend for serviceman-registration referral code
      // formData.append("<backend_referral_field>", referralCode.trim());
    }
    setLoadingGeneral(true);
    try {
      await ApiService.post("/servicemen/editServicemen", formData, {
        headers: { Authorization: `Bearer ${token || authToken}` },
        timeout: 120000,
      });
      setLoadingGeneral(false);
      setCurrentStep(3);
      toast.success("General info saved!");
      return true;
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Error updating general info");
      setLoadingGeneral(false);
      return false;
    }
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
    // Read document slots directly from form store to bypass any Yup mixed() cast
    // that could silently drop FileList values for notRequired() fields.
    const rawDocs = getValues(["serviceman_document", "serviceman_document_2", "serviceman_document_3"]);
    const docSlots: { field: FileList | string | undefined; idIndex: number }[] = [
      { field: rawDocs[0] as FileList | string | undefined, idIndex: 0 },
      { field: rawDocs[1] as FileList | string | undefined, idIndex: 1 },
      { field: rawDocs[2] as FileList | string | undefined, idIndex: 2 },
    ];
    console.log("📄 Doc slots at submit:", docSlots.map(s => ({
      idIndex: s.idIndex,
      isFileList: s.field instanceof FileList,
      fileCount: s.field instanceof FileList ? s.field.length : "n/a",
      isString: typeof s.field === "string",
    })));
    const uploadedIds: string[] = [];
    docSlots.forEach(({ field, idIndex }) => {
      if (field instanceof FileList && field[0]) {
        formData.append("serviceman_document", field[0]);
        if (documentIds[idIndex]) uploadedIds.push(documentIds[idIndex]);
      }
    });
    if (uploadedIds.length > 0) {
      formData.append("document_ids", JSON.stringify(uploadedIds));
    }
    setLoadingDocs(true);
    ApiService.post("/servicemen/editServicemen", formData, {
      headers: { Authorization: `Bearer ${token || authToken}` },
      timeout: 120000, // 2 minutes — needed for file uploads on mobile
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

  const handleSkip = () => {
    if (token) login(token, user_type);
    navigate("/dashboard");
  };

  return (
    <div className="container py-4 ">
      <div className="row">
        <div className="col-12">
          <Loader show={!isLoaded} text="Loading maps..." />
          {servicemanDetailsLoader.loading && (
            <div className="full-page-loader">
              <div className="loader-spinner"></div>
              <p>Loading profile details...</p>
            </div>
          )}

          <button
            className="back-btn mb-3 px-3 py-3"
            style={{ color: "#000" }}
            onClick={() => (currentStep > 1 ? goToPreviousStep() : navigate(-1))}
          >
            <ChevronLeft /> {currentStep > 1 ? "Previous" : "Back"}
          </button>

          <h6 className="text-center mb-4">Servicemen Registration</h6>

          <div className="mb-4">
            <div className="d-flex justify-content-between align-items-start gap-2 mb-2">
              {stepTitles.map((title, index) => {
                const stepNumber = index + 1;
                const isActive = stepNumber === currentStep;
                const isCompleted = stepNumber < currentStep;

                return (
                  <div
                    key={title}
                    className="flex-fill text-center"
                    style={{ minWidth: 0 }}
                  >
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        margin: "0 auto 8px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: isActive || isCompleted ? "#007bff" : "#dee2e6",
                        color: "#fff",
                        fontWeight: 600,
                      }}
                    >
                      {stepNumber}
                    </div>
                    <p
                      className="mb-0 font-12"
                      style={{
                        color: isActive ? "#007bff" : "#6c757d",
                        fontWeight: isActive ? 600 : 400,
                      }}
                    >
                      {title}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="border rounded p-3">
            <div className="mb-3">
              <h6 className="mb-1">Step {currentStep} of 4</h6>
              <p className="text-muted mb-0">{stepTitles[currentStep - 1]}</p>
            </div>

            <div className="row">
              {currentStep === 1 && (
                <>
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
                    <label className="lbl">Referral Code (optional)</label>
                    <input
                      type="text"
                      className="input"
                      placeholder="Enter Referral Code"
                      value={referralCode}
                      onChange={(e) => setReferralCode(e.target.value)}
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
                </>
              )}

              {currentStep === 2 && (
                <>
                  <div className="col-12 pt-3">
                    <MultiSelect
                      label={<><span>Select Category</span><span style={{ color: "red" }}></span></>}
                      control={control}
                      name="category_ids"
                      options={categoryListOptions}
                      error={errors.category_ids?.message as string}
                      required
                    />
                  </div>
                  <div className="col-12 pt-3">
                    <div
                      onClick={() => {
                        if (!selectedCategoryIds.length) {
                          toast.info("Please select a category first");
                        }
                      }}
                    >
                      <MultiSelect
                        label={<><span>Service Type</span><span style={{ color: "red" }}></span></>}
                        control={control}
                        name="service_ids"
                        options={serviceListOptions}
                        error={errors.service_ids?.message as string}
                        disabled={!selectedCategoryIds.length}
                        required
                      />
                      {!selectedCategoryIds.length && (
                        <p className="text-muted font-12 mt-1">
                          ⚠️ Select a category above to load available services.
                        </p>
                      )}
                    </div>
                  </div>
                </>
              )}

              {currentStep === 3 && (
                <>
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
                </>
              )}

              {currentStep === 4 && (
                <>
                  <div className="col-12 pt-3">
                    <p className="font-14 weight-bold mb-1">Documents</p>
                  </div>
                  <div className="col-12">
                    <FileInput
                      label="Upload Aadhar Card (Front)"
                      name="serviceman_document"
                      control={control}
                      error={errors.serviceman_document?.message as string}
                    />
                  </div>
                  <div className="col-12 pt-3">
                    <FileInput
                      label="Upload Aadhar Card (Back)"
                      name="serviceman_document_2"
                      control={control}
                      error={(errors as any).serviceman_document_2?.message as string}
                    />
                  </div>
                  <div className="col-12 pt-3">
                    <FileInput
                      label="Upload Driving License"
                      name="serviceman_document_3"
                      control={control}
                      error={(errors as any).serviceman_document_3?.message as string}
                    />
                  </div>
                </>
              )}

              <div className="col-12 pt-4">
                {currentStep < 4 ? (
                  <button
                    className="fill w-100"
                    onClick={goToNextStep}
                    disabled={loadingGeneral}
                  >
                    {currentStep === 2
                      ? loadingGeneral
                        ? "Saving..."
                        : "Save and Continue"
                      : "Continue"}
                  </button>
                ) : (
                  <button
                    className="fill w-100"
                    onClick={submitVerificationInfo}
                    disabled={loadingDocs}
                  >
                    {loadingDocs ? "Saving..." : "Update Verification Info"}
                  </button>
                )}
              </div>
            </div>

            <div className="text-center mt-4">
              <button
                className="fill w-100"
                onClick={handleSkip}
              >
                Go to Dashboard
              </button>
            </div>
          </div>
      </div>
      </div>
    </div>
  );
};

export default Registration;
