import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import type { SubmitHandler, Resolver } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import Input from "../components/inputs/input";
import { useNavigate } from "react-router-dom";
import ApiService from "../services/api";
import FileInput from "../components/inputs/FileInput";
import { toast } from "react-toastify";
import GooglePlacesAutocomplete from "../components/GooglePlacesAutocomplete";
import { GOOGLE_API_KEY } from "../config";
import { useLoadScript } from "@react-google-maps/api";

import CommonHeader from "../components/CommonHeader";
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

interface FormValues {
  fname: string;
  lname: string;
  email: string;
  //   country_code: string;
  //   phone_number: string;
  address: Address;
  file: FileList;
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

  address: Yup.object().shape({
    street_1: Yup.string().required("Street is required"),
    city: Yup.string().required("City is required"),
    state: Yup.string().required("State is required"),
    country: Yup.string().required("Country is required"),
    zip: Yup.string().required("Zip code is required"),
  }),

  file: Yup.mixed<FileList>().test("fileType", "Invalid file type", (value) => {
    if (!value || value.length === 0) return true; // ✅ optional
    const file = value[0];
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
    return allowedTypes.includes(file.type);
  }),
});

const EditCustomer = () => {
  const navigate = useNavigate();

  // Loader for Profile details
  const profileDetailsLoader = useSectionLoader("profile-details");

  const getProfileDetails = () => {
    profileDetailsLoader.setLoading(true);
    ApiService.post("/user/getCustomerDetails")
      .then((res: any) => {
        console.log(res);
        setValue("fname", res.data.customer.fname);
        setValue("lname", res.data.customer.lname);
        setValue("email", res.data.customer.email);

        setValue("address", res.data.address);
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        profileDetailsLoader.setLoading(false);
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
  });

  // Preview for uploaded profile image
  const [preview, setPreview] = useState<string | null>(null);
  const watchedFile = watch("file") as FileList | undefined;

  useEffect(() => {
    if (watchedFile && watchedFile.length > 0) {
      const file = watchedFile[0];
      const url = URL.createObjectURL(file);
      setPreview(url);
      return () => {
        URL.revokeObjectURL(url);
        setPreview(null);
      };
    } else {
      setPreview(null);
    }
  }, [watchedFile]);
  const onSubmit: SubmitHandler<FormValues> = (data) => {
    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
      if (key === "file") {
        formData.append(key, (value as FileList)[0]);
      } else if (typeof value === "object") {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, String(value));
      }
    });

    console.log("✅ Final FormData (to send via API):", data);
    setLoading(true);
    ApiService.post("/user/updateCustomerDetails", formData)
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

  const handleAddressSelect = (address: any) => {
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
         {profileDetailsLoader.loading && (
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
        <div className="row px-3 pt-3">
          <div className="col-6 pt-3">
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
          <div className="col-6 pt-3">
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
            <label className="lbl2">Address</label>
            <GooglePlacesAutocomplete
              control={control}
              name="address.street_1"
              onSelect={handleAddressSelect}
              label=""
              error={errors.address?.street_1?.message?.toString()}
            />
          </div>
        </div>

        <div className="row px-3 pt-3">
          <div className="col-12 pt-3">
            <label className="lbl2">Upload Profile Image</label>
            <FileInput
              name="file"
              label=""
              control={control}
              error={errors.file?.message as string}
            />
            <div className="col-12 pt-2" style={{ textAlign: "center" }}>
              {preview && (
                <img
                  style={{ height: "120px", width: "120px", borderRadius: 8 }}
                  src={preview}
                  alt="Profile preview"
                  className="img-fluid"
                />
              )}
            </div>
          </div>
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

export default EditCustomer;
