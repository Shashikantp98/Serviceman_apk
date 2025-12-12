import { ChevronLeft, Mail, MapPin, Phone } from "react-feather";

import { useState } from "react";
import ApiService from "../services/api";
import { useEffect } from "react";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";

// import CommonHeader from "../components/CommonHeader";
// import SectionLoader from "../components/SectionLoader";
import { useSectionLoader } from "../utils/useSectionLoader";

const MyCustomerProfile = () => {
  const navigate = useNavigate();
  const [profileDetails, setProfileDetails] = useState<any>({});

  // Loader for profile details
  const profileLoader = useSectionLoader("profile-details");

  const getProfileDetails = () => {
    profileLoader.setLoading(true);
    ApiService.post("/user/getCustomerDetails")
      .then((res: any) => {
        console.log(res);
        setProfileDetails(res.data);
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        profileLoader.setLoading(false);
      })
  };
  useEffect(() => {
    getProfileDetails();
  }, []);
  return (
    <>
      {/* <CommonHeader /> */}
      {profileLoader.loading && (
        <div className="full-page-loader">
          <div className="loader-spinner"></div>
          <p>Loading Profile details...</p>
        </div>
      )}

 <div className="fixed_header">
        <div className="container">
        <div className="row">
          <div className="col-12 ">
            <button className="backs_butn" onClick={() => navigate(-1)}>
              <ChevronLeft />
            </button>
          </div>
        </div>
        </div>
</div>



      <div className="container mb-5 pb-5 main-content-service">
        <div className="row px-3">
          <div className="col-12 p text-center pt-4">
            <h1 className="head4">My Profile</h1>
          </div>
          <div className="col-12 pt-3">
            <img
              src={profileDetails?.customer?.profile_image}
              className="prof_img"
            ></img>

            <h3 className="font-18 pt-3 text-center mb-1">
              {profileDetails?.customer?.fname}{" "}
              {profileDetails?.customer?.lname}
            </h3>
            <p className="text-center text-center font-12 mb-2">
              Created on{" "}
              {profileDetails?.customer?.created_on
                ? dayjs(profileDetails?.customer?.created_on).format(
                  "DD MMM YYYY"
                )
                : ""}
            </p>
          </div>
          <div className="col-12 pt-4">
            <div className="d-flex align-items-center gap-10">
              <Phone size={20}></Phone>
              <div className="px-2">
                <h6 className="font-12 mb-1">Phone Number</h6>
                <p className="font-14 mb-0">
                  {profileDetails?.customer?.country_code}
                  {profileDetails?.customer?.phone_number}
                </p>
              </div>
            </div>
          </div>
          <div className="col-12 pt-4">
            <div className="d-flex align-items-center gap-10">
              <Mail size={20}></Mail>
              <div className="px-2">
                <h6 className="font-12 mb-1">Email Address</h6>
                <p className="font-14 mb-0">
                  {profileDetails?.customer?.email
                    ? profileDetails?.customer?.email
                    : "N/A"}
                </p>
              </div>
            </div>
          </div>
          {/* <div className="col-12 pt-4">
            <div className="d-flex align-items-center gap-10">
              <Lock size={20}></Lock>
              <div className="px-2">
                <h6 className="font-12 mb-1">Referral code</h6>
                <p className="font-14 mb-0">ID-011221</p>
              </div>
            </div>
          </div> */}
          <div className="col-12 pt-4">
            <div className="d-flex align-items-center gap-10">
              <MapPin size={20}></MapPin>
              <div className="px-2">
                <h6 className="font-12 mb-1">Home</h6>
                <p className="font-14 mb-0">
                  {profileDetails?.address
                    ? profileDetails?.address?.street_1 +
                    ", " +
                    profileDetails?.address?.city +
                    ", " +
                    profileDetails?.address?.state +
                    ", " +
                    profileDetails?.address?.zip_code
                    : "N/A"}
                </p>
              </div>
            </div>
          </div>

          <div className="col-12 mt-4">
            <button onClick={() => navigate("/editCustomer")} className="fill">
              Edit Profile
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default MyCustomerProfile;
