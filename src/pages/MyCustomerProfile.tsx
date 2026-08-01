import { ChevronLeft, Mail, MapPin, Phone } from "react-feather";
import { useState, useEffect } from "react";
import ApiService from "../services/api";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import { useSectionLoader } from "../utils/useSectionLoader";

const MyCustomerProfile = () => {
  const navigate = useNavigate();
  const [profileDetails, setProfileDetails] = useState<any>({});
  const profileLoader = useSectionLoader("profile-details");

  const getProfileDetails = () => {
    profileLoader.setLoading(true);
    ApiService.post("/user/getCustomerDetails")
      .then((res: any) => {
        setProfileDetails(res.data);
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        profileLoader.setLoading(false);
      });
  };

  useEffect(() => {
    getProfileDetails();
  }, []);

  const customer = profileDetails?.customer;
  const address = profileDetails?.address;

  const formatAddress = () => {
    if (!address) return 'N/A';
    const parts = [
      address.street_1,
      address.street_2,
      address.city,
      address.state,
      address.zip,      // API returns `zip` not `zip_code`
      address.country,
    ].filter(Boolean);
    return parts.join(', ') || 'N/A';
  };

  return (
    <>
      {profileLoader.loading && (
        <div className="full-page-loader">
          <div className="loader-spinner"></div>
          <p>Loading Profile details...</p>
        </div>
      )}

      <div className="fixed_header">
        <div className="container">
          <div className="row">
            <div className="col-12 back_btn_pro">
              <button className="backs_butn" onClick={() => navigate(-1)}>
                <ChevronLeft />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mb-5 pb-5 main-content-service">
        <div className="row px-3">

          {/* Title */}
          <div className="col-12 text-center pt-4">
            <h1 className="head4">My Profile</h1>
          </div>

          {/* Profile Image & Name */}
          <div className="col-12 pt-3">
            <img
              src={customer?.profile_image}
              className="prof_img"
              alt="Profile"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/80';
              }}
            />
            <h3 className="font-18 pt-3 text-center mb-1">
              {customer?.fname} {customer?.lname}
            </h3>
            <p className="text-center font-12 mb-2">
              Created on{" "}
              {customer?.created_on
                ? dayjs(customer.created_on).format("DD MMM YYYY")
                : ""}
            </p>
          </div>

          {/* Phone */}
          <div className="col-12 pt-4">
            <div className="d-flex align-items-center gap-10">
              <Phone size={20} />
              <div className="px-2">
                <h6 className="font-12 mb-1">Phone Number</h6>
                <p className="font-14 mb-0">
                  {customer?.country_code} {customer?.phone_number}
                </p>
              </div>
            </div>
          </div>

          {/* Email */}
          <div className="col-12 pt-4">
            <div className="d-flex align-items-center gap-10">
              <Mail size={20} />
              <div className="px-2">
                <h6 className="font-12 mb-1">Email Address</h6>
                <p className="font-14 mb-0">
                  {customer?.email || 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="col-12 pt-4">
            <div className="d-flex align-items-center gap-10">
              <MapPin size={20} />
              <div className="px-2">
                <h6 className="font-12 mb-1">Home</h6>
                <p className="font-14 mb-0">{formatAddress()}</p>
              </div>
            </div>
          </div>

          {/* Edit Profile */}
          <div className="col-12 mt-4">
            <button onClick={() => navigate("/editCustomer")} className="fill">
              Edit Profile
            </button>
          </div>

          {/* Logout */}
          <div className="col-12 mt-3">
            <button
              className="fill"
              style={{ background: "#e74c3c", borderColor: "#e74c3c" }}
              onClick={() => {
                localStorage.clear();
                navigate("/");
              }}
            >
              Logout
            </button>
          </div>

        </div>
      </div>
    </>
  );
};

export default MyCustomerProfile;