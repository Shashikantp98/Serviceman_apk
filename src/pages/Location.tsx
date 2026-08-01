// import { ChevronLeft, Map, MapPin, Radio, Smartphone } from "react-feather";
import { Map } from "react-feather";
// import notification from "../assets/location.png";
import { useState, useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { Geolocation } from "@capacitor/geolocation";
import GoogleMapComponent from "../components/GoogleMapComponent";
import Loader from "../components/Loader";
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
  const [locationLoading, setLocationLoading] = useState(false);
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
    setLocationLoading(true);
    const isAndroid = Capacitor.getPlatform() === "android";

    try {
      // Step 1: Check current permission state first
      let permissionStatus: { location: string; coarseLocation?: string };
      try {
        permissionStatus = await Geolocation.checkPermissions();
      } catch {
        // checkPermissions not supported in browser fallback
        permissionStatus = { location: "prompt" };
      }

      // Step 2: Request only if not already granted
      if (permissionStatus.location !== "granted") {
        try {
          permissionStatus = await Geolocation.requestPermissions();
        } catch (err) {
          console.error("Permission request failed:", err);
          toast.error(
            isAndroid
              ? "Location permission is required. Please go to Settings → Apps → Permissions and enable Location."
              : "Location permission is required. Please enable it in Settings."
          );
          setLocationLoading(false);
          return;
        }
      }

      if (permissionStatus.location !== "granted") {
        toast.error(
          isAndroid
            ? "Location access was denied. Please enable it in Settings → Apps → [App Name] → Permissions → Location."
            : "Location access was denied. Please enable it in your device Settings."
        );
        setLocationLoading(false);
        return;
      }

      // Step 3: Get coarse (network-based) fix first — fast, opens map quickly
      try {
        const coarse = await Geolocation.getCurrentPosition({
          enableHighAccuracy: false,
          timeout: isAndroid ? 15000 : 8000, // Android network fix can be slower
          maximumAge: 60000,                 // accept a cached fix up to 60s old
        });
        setLocation({
          lat: coarse.coords.latitude,
          lng: coarse.coords.longitude,
        });
        setShowMap(true);
        setLocationLoading(false);

        // Step 4: Silently refine with GPS in the background
        Geolocation.getCurrentPosition({
          enableHighAccuracy: true,
          timeout: isAndroid ? 30000 : 15000, // Android GPS cold-start needs more time
          maximumAge: 0,
        })
          .then((precise) => {
            setLocation({
              lat: precise.coords.latitude,
              lng: precise.coords.longitude,
            });
          })
          .catch(() => {
            // Coarse position already shown – GPS refinement failure is non-fatal
          });

      } catch (coarseError) {
        // Coarse fix failed (e.g. no network) — fall back to GPS directly
        console.warn("Coarse location failed, trying high-accuracy GPS:", coarseError);
        try {
          const precise = await Geolocation.getCurrentPosition({
            enableHighAccuracy: true,
            timeout: isAndroid ? 30000 : 20000,
            maximumAge: 0,
          });
          setLocation({
            lat: precise.coords.latitude,
            lng: precise.coords.longitude,
          });
          setShowMap(true);
        } catch (gpsError) {
          console.error("GPS location failed:", gpsError);
          toast.error(
            isAndroid
              ? "Unable to get your location. Please ensure GPS is enabled in Settings and try again."
              : "Unable to get your location. Please check that Location Services are enabled."
          );
        }
        setLocationLoading(false);
      }
    } catch (error) {
      console.error("Permission error:", error);
      toast.error("Unable to request location permission. Please check your settings.");
      setLocationLoading(false);
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
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${location.lat},${location.lng}&key=${GOOGLE_API_KEY}`
      );
      const data = await response.json();
      if (!data.results || data.results.length === 0) return;

      const components: any[] = data.results[0].address_components || [];

      // Use type-based lookup — component order varies by country/region
      const getComponent = (types: string[]) =>
        components.find((c) => types.some((t) => c.types.includes(t)))?.long_name || "";

      setAddress({
        street_1: data.results[0].formatted_address ||
          [getComponent(["street_number"]), getComponent(["route"])].filter(Boolean).join(" ") ||
          components[0]?.long_name || "",
        city:
          getComponent(["locality"]) ||
          getComponent(["sublocality", "sublocality_level_1"]) ||
          getComponent(["administrative_area_level_2"]),
        state: getComponent(["administrative_area_level_1"]),
        zip: getComponent(["postal_code"]),
        country: getComponent(["country"]),
      });
    } catch (err) {
      console.error("Error converting location to address:", err);
    }
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

  const syncFormAddress = (nextAddress: {
    street_1: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  }) => {
    setValue("street_1", nextAddress.street_1, { shouldDirty: true });
    setValue("city", nextAddress.city, { shouldDirty: true });
    setValue("state", nextAddress.state, { shouldDirty: true });
    setValue("zip", nextAddress.zip, { shouldDirty: true });
    setValue("country", nextAddress.country, { shouldDirty: true });
  };

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

    setAddress({
      street_1: address.fullAddress || "",
      city: address.city || "",
      state: address.state || "",
      zip: address.postalCode || "",
      country: address.country || "",
    });

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

  useEffect(() => {
    if (address.street_1 || address.city || address.state || address.zip || address.country) {
      syncFormAddress(address);
    }
  }, [address]);

  if (!isLoaded) return <Loader show text="Loading maps..." />;

  return (
    <>
      <Loader show={locationLoading} text="Getting your location..." />

      <div className="loction_wrap location-screen">
        <div className="location-shell">
          <div className="location-header">
            {showMap && (
              <button className="gobackbtn" onClick={handleSetManually}>
                Go Back
              </button>
            )}
          </div>

          <div className="location-intro">
            <Map size={40} className="mb-2 color-green" />
            <h6 className="onboard_head pb-0 mb-2">Set Location</h6>
            <p className="font-14 mb-0">
              Please fill your location to find the best servicemen around you.
            </p>
          </div>

          <div className="location-content location_npt">
            {!showMap ? (
              <div className="location-manual-form">
                <div className="location-field">
                  <GooglePlacesAutocomplete
                    control={control}
                    name="street_1"
                    onSelect={handleAddressSelect}
                    label=""
                    error={errors.street_1?.message?.toString()}
                  />
                </div>
                <div className="location-field">
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
                <div className="location-field">
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
                <div className="location-field">
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
                <div className="location-field">
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
            ) : (
              <div className="location-picker-view">
                <div className="location-map-card">
                  <GoogleMapComponent
                    location={location}
                    setLocation={setLocation}
                    setAddress={setAddress}
                    mapHeight="clamp(300px, calc(100vh - 330px), 500px)"
                  />
                </div>
                <div className="location-address-preview">
                  <p className="mb-1 font-14"><b>Selected Address</b></p>
                  <p className="mb-0 font-13 text-muted">
                    {[address.street_1, address.city, address.state, address.zip, address.country]
                      .filter(Boolean)
                      .join(", ") || "Fetching address details..."}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="location-actions">
            {!showMap ? (
              <div className="location-manual-actions">
                <button
                  className="outline"
                  onClick={handleAllowGoogleMaps}
                  disabled={locationLoading}
                >
                  Use Current Location
                </button>
                <button
                  className="fill"
                  onClick={handleSubmit(onSubmit)}
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Save Address"}
                </button>
              </div>
            ) : (
              <div className="location-map-actions">
                <button
                  onClick={submitLocation}
                  className="fill"
                  disabled={loading}
                >
                  {loading ? "Submitting..." : "Submit"}
                </button>
                <button
                  className="outline"
                  onClick={handleSetManually}
                >
                  Set Manually
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Location;
