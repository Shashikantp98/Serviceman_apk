import { useState, useEffect } from "react";
import GoogleMapComponent from "../components/GoogleMapComponent";
import { useNavigate, useLocation } from "react-router-dom";
import { GOOGLE_API_KEY } from "../config";
import { toast } from "react-toastify";
import ApiService from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { ChevronLeft } from "react-feather";
// import { ChevronLeft } from "react-feather";
const AuthLocation = () => {
  const navigate = useNavigate();
  const idd = useLocation();
  const id = idd.state?.id;
  const isGuest = idd.state?.isGuest;
  const guestRole = idd.state?.role;
  const [loading, setLoading] = useState(false);
  const { latitude, longitude, token, setCurrentLocationFn, login } = useAuth();
  const { setLatLong } = useAuth();
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(
    latitude && longitude 
      ? { lat: Number(latitude), lng: Number(longitude) }
      : { lat: 28.6139, lng: 77.2090 } // Default to Delhi
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

  // const handleSetManually = () => {
  //   navigate("/addressdetails");
  // };
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
    if (isGuest) {
      setLatLong(Number(location?.lat), Number(location?.lng));
      setCurrentLocationFn(
        address.street_1 +
        ", " +
        address.city +
        ", " +
        address.state +
        ", " +
        address.country
      );
      login("guest", guestRole);
      navigate("/home");
    } else if (token == "guest") {
      setLatLong(Number(location?.lat), Number(location?.lng));
      setCurrentLocationFn(
        address.street_1 +
        ", " +
        address.city +
        ", " +
        address.state +
        ", " +
        address.country
      );
      navigate("/home");
    } else {
      setLoading(true);
      if (id) {
        const url = "/user/addCustomerAddress";
        ApiService.post(url, address)
          .then((res: any) => {
            console.log(res);
            toast.success(res.message);
            setLoading(false);
            navigate(-1);
          })
          .catch((err: any) => {
            console.log(err);
            toast.error(err.response.data.message);
            setLoading(false);
          });
      } else {
        const formData = new FormData();
        formData.append(
          "address",
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
            country: address.country,
            zip: address.zip,
          })
        );
        const url = "/user/updateCustomerDetails";
        ApiService.post(url, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
          .then((res: any) => {
            console.log(res);
            toast.success(res.message);
            setLoading(false);
            navigate(-1);
          })
          .catch((err: any) => {
            console.log(err);
            toast.error(err.response.data.message);
            setLoading(false);
          });
      }
    }
  };
  return (
    <>
      <div>
        <div className="fixed_header">
          <button 
            className="back-btn mb-2" 
            onClick={() => {
              window.history.back();
            }}
          >
            <ChevronLeft />
            Back
          </button>
        </div>
        <div className="main-content-profile">
          <div className="px-3 pb-3 ">
            <GoogleMapComponent
              location={location}
              setLocation={setLocation}
              setAddress={setAddress}
            />
          </div>
          <div className="px-3 pb-3">
            {/* <p>
              <b>Current Location : </b>
              {address.street_1}, {address.city}, {address.state}, {address.zip}
              , {address.country}
            </p> */}
            <button
              onClick={submitLocation}
              className="fill "
              style={{ marginBottom: "90px" }}
            >
              {loading ? "Submitting..." : "Submit"}
            </button>
          </div>

          {/* {token !== "guest" && (
            <button className="outline" onClick={handleSetManually}>
              Set Manually
            </button>
          )} */}
        </div>
      </div>
    </>
  );
};

export default AuthLocation;
