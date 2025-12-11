import {
  ChevronRight,
  Edit2,
  File,
  List,
  Lock,
  LogOut,
  MapPin,
  MessageSquare,
  User,
} from "react-feather";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import ApiService from "../services/api";
import { useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
// import Header from "../components/Header";
const CustomerProfile = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [profileDetails, setProfileDetails] = useState<any>({});
  const getProfileDetails = () => {
    ApiService.post("/user/getCustomerDetails")
      .then((res: any) => {
        console.log(res);
        setProfileDetails(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  };
  useEffect(() => {
    if (token !== "guest") {
      getProfileDetails();
    }
  }, []);
  const logout = () => {
    setLoading(true);
    localStorage.clear();
    setTimeout(() => {
      setLoading(false);
      window.location.href = "/";
    }, 1000);
  };

  return (
    <>
      {/* <Header></Header> */}
      <div className="container main-content pt-2">
        {/* <div className="row px-2 pt-3">
          <div className="col-12 pt-2 d-flex align-items-center justify-content-center">
            <h1 className="head4">Profile</h1>
          </div>
        </div> */}
        <div className="row px-4 pt-5 pb-3 fixed_header">
          <div className="col-12 d-flex align-items-center justify-content-between">
            <div className="d-flex gap-10 align-items-center">
              <img
                src={profileDetails?.customer?.profile_image}
                className="proimg"
              ></img>
              <div>
                <h1 className="font-16 mb-1">
                  {profileDetails?.customer?.fname
                    ? profileDetails?.customer?.fname +
                      " " +
                      profileDetails?.customer?.lname
                    : "N/A"}{" "}
                </h1>
                <p className="color-grey font-14 mb-0">
                  {profileDetails?.customer?.country_code}{" "}
                  {profileDetails?.customer?.phone_number}
                </p>
              </div>
            </div>
            <Edit2
              size={18}
              onClick={() => navigate("/mycustomerprofile")}
            ></Edit2>
          </div>
        </div>
        <div className="row px-2 fixed_header_padding mt-3">
          <div
            onClick={() => navigate("/mycustomerprofile")}
            className="col-12 d-flex align-items-center justify-content-between border-bottom pb-3 pt-3"
          >
            <div className="d-flex gap-10 font-16 align-items-center">
              <User size={18}></User>
              My Profile
            </div>
            <ChevronRight size={20}></ChevronRight>
          </div>
          <div
            onClick={() => navigate("/updatePin")}
            className="col-12 d-flex align-items-center justify-content-between border-bottom pb-3 pt-3"
          >
            <div className="d-flex gap-10 font-16 align-items-center">
              <Lock size={18}></Lock>
              Change Pin
            </div>
            <ChevronRight size={20}></ChevronRight>
          </div>
          <div
            onClick={() => navigate("/myrequest")}
            className="col-12 d-flex align-items-center justify-content-between border-bottom pb-3 pt-3"
          >
            <div className="d-flex gap-10 font-16 align-items-center">
              <List size={18}></List>
              My Request
            </div>
            <ChevronRight size={20}></ChevronRight>
          </div>
          <div
            onClick={() => navigate("/addressdetails")}
            className="col-12 d-flex align-items-center justify-content-between border-bottom pb-3 pt-3"
          >
            <div className="d-flex gap-10 font-16 align-items-center">
              <MapPin size={18}></MapPin>
              Address
            </div>
            <ChevronRight size={20}></ChevronRight>
          </div>
          <div
            onClick={() => navigate("/support")}
            className="col-12 d-flex align-items-center justify-content-between border-bottom pb-3 pt-3"
          >
            <div className="d-flex gap-10 font-16 align-items-center">
              <MessageSquare size={18}></MessageSquare>
              Support
            </div>
            <ChevronRight size={20}></ChevronRight>
          </div>

          <div className="col-12 px-0">
            <div className="crd2 px-12pxs">
              <div
                onClick={() =>
                  navigate("/policydetails", {
                    state: { type: "Privacy Policy" },
                  })
                }
                className="d-flex gap-10 font-16 border-bottom align-items-center justify-content-between border-bottom pb-3 pt-3"
              >
                <div className="d-flex gap-10 align-items-center">
                  <Lock size={16}></Lock> Privacy Policy
                </div>
                <ChevronRight size={20}></ChevronRight>
              </div>
              <div
                onClick={() => navigate("/privacycenter")}
                className="d-flex gap-10 font-16 align-items-center justify-content-between border-bottom pb-3 pt-3"
              >
                <div className="d-flex gap-10 align-items-center">
                  <Lock size={16}></Lock> Privacy Center
                </div>
                <ChevronRight size={20}></ChevronRight>
              </div>
              <div
                onClick={() =>
                  navigate("/policydetails", {
                    state: { type: "Terms & Conditions" },
                  })
                }
                className="d-flex gap-10 font-16 border-bottom align-items-center justify-content-between  pb-3 pt-3"
              >
                <div className="d-flex gap-10 align-items-center">
                  <File size={16}></File> Term & Conditions
                </div>
                <ChevronRight size={20}></ChevronRight>
              </div>
              <div
                onClick={() =>
                  navigate("/policydetails", {
                    state: { type: "Shipping Policy" },
                  })
                }
                className="d-flex gap-10 font-16 border-bottom align-items-center justify-content-between  pb-3 pt-3"
              >
                <div className="d-flex gap-10 align-items-center">
                  <File size={16}></File> Shipping Policy
                </div>
                <ChevronRight size={20}></ChevronRight>
              </div>
              <div
                onClick={() =>
                  navigate("/policydetails", {
                    state: { type: "Refund Policy" },
                  })
                }
                className="d-flex gap-10 font-16 align-items-center justify-content-between  pb-3 pt-3"
              >
                <div className="d-flex gap-10 align-items-center">
                  <File size={16}></File> Refund Policy
                </div>
                <ChevronRight size={20}></ChevronRight>
              </div>
            </div>
          </div>
          <div className="col-12 pt-2 pb-5 mb-5">
            <button disabled={loading} onClick={logout} className="loggoutbtn">
              <LogOut size={16}></LogOut>
              {loading ? "Logging out..." : "Logout"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default CustomerProfile;
