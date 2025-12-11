import Input from "../components/inputs/input";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useLocation, useNavigate } from "react-router-dom";
import ApiService from "../services/api";
import { toast } from "react-toastify";
import { useState, useEffect } from "react";
import { GOOGLE_API_KEY } from "../config";
import { useLoadScript } from "@react-google-maps/api";
import GooglePlacesAutocomplete from "../components/GooglePlacesAutocomplete";
// import { ChevronLeft } from "react-feather";
import CommonHeader from "../components/CommonHeader";

interface Address {
  street_1: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

const AuthAddress = () => {
  const locationData = useLocation();
  const address = locationData.state?.address;
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const storeSchema = yup.object({
    street_1: yup.string().required("Street Address One is required"),
    city: yup.string().required("City is required"),
    state: yup.string().required("State is required"),
    zip: yup
      .string()
      .required("Zip is required")
      .min(4, "Zip must be at least 4 characters"),
    country: yup.string().required("Country is required"),
  });

  const {
    handleSubmit,
    formState: { errors },
    control,
    setValue,
  } = useForm<Address>({
    resolver: yupResolver(storeSchema as any),
  });
  const onSubmit = (data: Address) => {
    setLoading(true);
    if (address) {
      ApiService.post("/user/updateCustomerAddress", {
        ...data,
        address_id: address._id,
      })
        .then((res: any) => {
          console.log(res);
          setLoading(false);
          toast.success(res.message);
          navigate("/addressdetails");
        })
        .catch((err: any) => {
          console.log(err);
          toast.error(err.response.data.message);
          setLoading(false);
        });
    } else {
      ApiService.post("/user/addCustomerAddress", data)
        .then((res: any) => {
          console.log(res);
          setLoading(false);
          toast.success(res.message);
          navigate("/addressdetails");
        })
        .catch((err: any) => {
          console.log(err);
          toast.error(err.response.data.message);
          setLoading(false);
        });
    }
  };
  useEffect(() => {
    if (address) {
      setValue("street_1", address.street_1);
      setValue("city", address.city);
      setValue("state", address.state);
      setValue("zip", address.zip);
      setValue("country", address.country);
    }
  }, [address]);
  const handleAddressSelect = (address: any) => {
    console.log("Selected Address:", address);

    // Set main address field
    setValue("street_1", address.fullAddress, {
      shouldValidate: true,
      shouldDirty: true,
    });

    // Set individual fields
    if (address.city) {
      setValue("city", address.city, {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
    if (address.state) {
      setValue("state", address.state, {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
    if (address.postalCode) {
      setValue("zip", address.postalCode, {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
    if (address.country) {
      setValue("country", address.country, {
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
      <div>
        <CommonHeader />
        <div className="main-content-service">
          <div className="row" style={{ padding: "10px" }}>
            <div className="col-12 pt-3">
              <label className="lbl2"> Street Address One</label>

              <GooglePlacesAutocomplete
                control={control}
                name="street_1"
                onSelect={handleAddressSelect}
                label=""
                error={errors.street_1?.message}
              />
            </div>

            <div className="col-6 pt-3">
              <label className="lbl2"> City</label>
              <Input
                control={control}
                name="city"
                label=""
                type="text"
                placeholder="Enter city"
                inputMode="text"
                error={errors.city?.message}
                disabled={loading}
              />
            </div>
            <div className="col-6 pt-3">
              <label className="lbl2"> State</label>
              <Input
                control={control}
                name="state"
                label=""
                type="text"
                placeholder="Enter state"
                inputMode="text"
                error={errors.state?.message}
                disabled={loading}
              />
            </div>

            <div className="col-6 pt-3">
              <label className="lbl2"> Zip</label>
              <Input
                control={control}
                name="zip"
                label=""
                type="text"
                placeholder="Enter zip"
                inputMode="numeric"
                error={errors.zip?.message}
                disabled={loading}
              />
            </div>
            <div className="col-6 pt-3">
              <label className="lbl2"> Country</label>
              <Input
                control={control}
                name="country"
                label=""
                type="text"
                placeholder="Enter country"
                inputMode="text"
                error={errors.country?.message}
                disabled={loading}
              />
            </div>
            <div className="col-12 pt-4">
              <button
                className="fill"
                onClick={handleSubmit(onSubmit)}
                disabled={loading}
              >
                {loading ? "Saving..." : "Save Address"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AuthAddress;
