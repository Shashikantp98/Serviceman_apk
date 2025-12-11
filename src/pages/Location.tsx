import { ChevronLeft, MapPin, Radio } from "react-feather";
// import notification from "../assets/location.png";
import { useState, useEffect } from "react";
import { Geolocation } from "@capacitor/geolocation";
import GoogleMapComponent from "../components/GoogleMapComponent";
import { useLocation, useNavigate } from "react-router-dom";
import { GOOGLE_API_KEY } from "../config";
import { toast } from "react-toastify";
import ApiService from "../services/api";
import Input from "../components/inputs/input";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useLoadScript } from "@react-google-maps/api";
import GooglePlacesAutocomplete from "../components/GooglePlacesAutocomplete";
import * as yup from "yup";
import { useAuth } from "./../contexts/AuthContext";
const Location = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const locationData = useLocation();
  const [loading, setLoading] = useState(false);
  const token = locationData.state?.token;
  const phone_number = locationData.state?.phone_number;
  const country_code = locationData.state?.country_code;
  const user_type = locationData.state?.user_type;
  const [showMap, setShowMap] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [address, setAddress] = useState<{
    street_1: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  }>({
    street_1: "",
    city: "",
    state: "",
    zip: "",
    country: "",
  });

  const handleAllowGoogleMaps = async () => {
    const permission = await Geolocation.requestPermissions();
    if (permission.location === "granted") {
      const coordinates = await Geolocation.getCurrentPosition();
      setLocation({
        lat: coordinates.coords.latitude,
        lng: coordinates.coords.longitude,
      });
      setShowMap(true);
    } else {
      alert("Location permission not granted");
    }
  };

  const handleSetManually = () => {
    setShowMap(false);
    // navigate("/address", {
    //   state: {
    //     phone_number,
    //     country_code,
    //     user_type,
    //     token,
    //   },
    // });
  };
  const convertLatLongToAddress = async () => {
    if (!location?.lat || !location?.lng) return;
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${location?.lat},${location?.lng}&key=${GOOGLE_API_KEY}`
    );
    const data = await response.json();
    // setAddress(data.results[0].formatted_address);
    setAddress({
      street_1: data.results[0].address_components[0].long_name,
      city: data.results[0].address_components[1].long_name,
      state: data.results[0].address_components[2].long_name,
      zip: data.results[0].address_components[3].long_name,
      country: data.results[0].address_components[4].long_name,
    });
  };
  useEffect(() => {
    if (location?.lat && location?.lng) {
      convertLatLongToAddress();
    }
  }, [location]);
  const submitLocation = () => {
    setLoading(true);
    if (user_type === "customer") {
      ApiService.post(
        "/user/addCustomerAddress",
        {
          street_1:
            address.street_1 +
            ", " +
            address.city +
            ", " +
            address.state +
            ", " +
            address.country,
          city: address.city,
          state: address.state,
          zip: address.zip,
          country: address.country,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
        .then(async (res: any) => {
          console.log(res);
          toast.success(res.message);
          
          // Update FCM token after customer login
          const fcmToken = (window as any).fcmToken || "";
          if (fcmToken) {
            await ApiService.post("/user/updateFcmToken", {
              fcm_token: fcmToken,
              user_type: 'customer'
            }, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }).catch(err => console.error('FCM token update failed:', err));
          }
          
          setLoading(false);
          login(token, user_type);
          navigate("/home", {
            state: {
              phone_number,
              country_code,
              user_type,
              token,
            },
          });
        })
        .catch((err: any) => {
          console.log(err);
          toast.error(err.response.data.message);
          setLoading(false);
        });
    }
    if (user_type === "servicemen") {
      const formData = new FormData();
      formData.append(
        "home_address",
        JSON.stringify({
          street_1:
            address.street_1 +
            ", " +
            address.city +
            ", " +
            address.state +
            ", " +
            address.country,
          city: address.city,
          state: address.state,
          zip: address.zip,
          country: address.country,
        })
      );

      ApiService.post("/servicemen/editServicemen", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res: any) => {
          console.log(res);
          toast.success(res.message);
          setLoading(false);

          navigate("/registration", {
            state: {
              phone_number,
              country_code,
              user_type,
              token,
            },
          });
        })
        .catch((err: any) => {
          console.log(err);
          toast.error(err.response.data.message);
          setLoading(false);
        });
    }
  };

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
  } = useForm<any>({
    resolver: yupResolver(storeSchema as any),
  });
  const onSubmit = (data: any) => {
    setLoading(true);
    if (user_type === "customer") {
      ApiService.post(
        "/user/addCustomerAddress",
        {
          street_1:
            data.street_1 +
            ", " +
            data.city +
            ", " +
            data.state +
            ", " +
            data.country,
          city: data.city,
          state: data.state,
          zip: data.zip,
          country: data.country,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
        .then((res: any) => {
          console.log(res);
          toast.success(res.message);
          setLoading(false);
          login(token, user_type);
          navigate("/home", {
            state: {
              phone_number,
              country_code,
              user_type,
              token,
            },
          });
        })
        .catch((err: any) => {
          console.log(err);
          toast.error(err.response.data.message);
          setLoading(false);
        });
    }
    if (user_type === "servicemen") {
      const formData = new FormData();
      formData.append(
        "home_address",
        JSON.stringify({
          street_1:
            data.street_1 +
            ", " +
            data.city +
            ", " +
            data.state +
            ", " +
            data.country,
          city: data.city,
          state: data.state,
          zip: data.zip,
          country: data.country,
        })
      );

      ApiService.post("/servicemen/editServicemen", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res: any) => {
          console.log(res);
          toast.success(res.message);
          setLoading(false);

          navigate("/registration", {
            state: {
              phone_number,
              country_code,
              user_type,
              token,
            },
          });
        })
        .catch((err: any) => {
          console.log(err);
          toast.error(err.response.data.message);
          setLoading(false);
        });
    }
  };
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
      <div style={{ position: "absolute" }}>
        <button
          className="back-btn mb-3 mt-5 px-3 py-3"
          style={{ color: "#000" }}
          onClick={() => {
            navigate(-1);
          }}
        >
          <ChevronLeft /> Back
        </button>
      </div>
      <div className="px-5 pt-5 pb-3">
        <div className="pin">
          <MapPin></MapPin>
        </div>
        <h3 className="head2 pt-3">What’s your location?</h3>
        <p className="text-center color-grey font-12">
          Find an artist or studio near your location
        </p>
      </div>

      {!showMap ? (
        <div>
          <div className="px-4">
            <button
              className="outline d-flex align-items-center"
              onClick={handleAllowGoogleMaps}
            >
              <Radio></Radio>&nbsp; Use Current Location
            </button>
          </div>
          <div className="px-4">
            <p className="font-12 mb-0 mt-3">Set manually</p>
          </div>
          <div className="row px-4">
            <div className="col-12 pt-3">
              <GooglePlacesAutocomplete
                control={control}
                name="street_1"
                onSelect={handleAddressSelect}
                label=""
                error={errors.street_1?.message?.toString()}
              />
            </div>
            <div className="col-6 pt-3">
              <Input
                control={control}
                name="city"
                label=""
                type="text"
                placeholder="Enter city"
                inputMode="text"
                error={errors.city?.message?.toString()}
                disabled={loading}
              />
            </div>
            <div className="col-6 pt-3">
              <Input
                control={control}
                name="state"
                label=""
                type="text"
                placeholder="Enter state"
                inputMode="text"
                error={errors.state?.message?.toString()}
                disabled={loading}
              />
            </div>
            <div className="col-6 pt-3">
              <Input
                control={control}
                name="country"
                label=""
                type="text"
                placeholder="Enter country"
                inputMode="text"
                error={errors.country?.message?.toString()}
                disabled={loading}
              />
            </div>
            <div className="col-6 pt-3">
              <Input
                control={control}
                name="zip"
                label=""
                type="text"
                placeholder="Enter zip"
                inputMode="numeric"
                error={errors.zip?.message?.toString()}
                disabled={loading}
              />
            </div>
          </div>

          <div className="px-4 mt-5">
            <button
              className="fill"
              onClick={handleSubmit(onSubmit)}
              disabled={loading}
            >
              {" "}
              {loading ? "Saving..." : "Save Address"}
            </button>
          </div>
        </div>
      ) : (
        <div className="">
          <div className="px-3 pb-3 ">
            <GoogleMapComponent
              location={location}
              setLocation={setLocation}
              setAddress={setAddress}
            />
          </div>

          <button
            onClick={submitLocation}
            style={{
              position: "fixed",
              bottom: "85px",
              width: "90%",
              left: "5%",
            }}
            className="fill"
          >
            {loading ? "Submitting..." : "Submit"}
          </button>
          <button
            style={{
              position: "fixed",
              bottom: "25px",
              width: "90%",
              left: "5%",
            }}
            className="outline"
            onClick={handleSetManually}
          >
            Set Manually
          </button>
        </div>
      )}
    </>
  );
};

export default Location;
