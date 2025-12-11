import {
  ChevronRight,
  Edit2,
  File,
  Lock,
  LogOut,
  MessageSquare,
  User,
} from "react-feather";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import ApiService from "../services/api";
import { useEffect } from "react";

import ServiceManHeader from "../components/ServiceManHeader";

const Profile = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [profileDetails, setProfileDetails] = useState<any>({});
  const getProfileDetails = () => {
    ApiService.post("/servicemen/getServicemenDetails")
      .then((res: any) => {
        console.log(res);
        setProfileDetails(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  };
  useEffect(() => {
    getProfileDetails();
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
      <ServiceManHeader title="Settings" />
      <div className="container main-content-service">
        <div className="row px-2 pt-3 pb-3">
          <div className="col-12 d-flex align-items-center justify-content-between">
            <div className="d-flex gap-10 align-items-center">
              <img src={profileDetails?.profile_image} className="proimg"></img>
              <div>
                <h1 className="font-16 mb-1">
                  {profileDetails?.fname} {profileDetails?.lname}
                </h1>
                <p className="color-grey font-14 mb-0">
                  {profileDetails?.country_code} {profileDetails?.phone_number}
                </p>
              </div>
            </div>
            <Edit2
              size={18}
              onClick={() => navigate("/servicemenprofile")}
            ></Edit2>
          </div>
        </div>
        <div className="row px-2">
          <div
            onClick={() => navigate("/servicemenprofile")}
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
            onClick={() => navigate("/supportlist")}
            className="col-12 d-flex align-items-center justify-content-between border-bottom pb-3 pt-3"
          >
            <div className="d-flex gap-10 font-16 align-items-center">
              <MessageSquare size={18}></MessageSquare>
              Support
            </div>
            <ChevronRight size={20}></ChevronRight>
          </div>

          <div className="col-12">
            <div className="crd2">
              <div
                onClick={() =>
                  navigate("/policydetails", {
                    state: { type: "Privacy Policy" },
                  })
                }
                className="d-flex gap-10 font-16 align-items-center justify-content-between border-bottom pb-3 pt-3"
              >
                <div className="d-flex gap-10 align-items-center">
                  <Lock size={18}></Lock> Privacy Policy
                </div>
                <ChevronRight size={20}></ChevronRight>
              </div>
              <div
                onClick={() => navigate("/privacycenter")}
                className="d-flex gap-10 font-16 align-items-center justify-content-between border-bottom pb-3 pt-3"
              >
                <div className="d-flex gap-10 align-items-center">
                  <Lock size={18}></Lock> Privacy Center
                </div>
                <ChevronRight size={20}></ChevronRight>
              </div>
              <div
                onClick={() =>
                  navigate("/policydetails", {
                    state: { type: "Terms & Conditions" },
                  })
                }
                className="d-flex gap-10 font-16 align-items-center justify-content-between border-bottom pb-3 pt-3"
              >
                <div className="d-flex gap-10 align-items-center">
                  <File size={18}></File> Term & Conditions
                </div>
                <ChevronRight size={20}></ChevronRight>
              </div>
              <div
                onClick={() =>
                  navigate("/policydetails", {
                    state: { type: "Shipping Policy" },
                  })
                }
                className="d-flex gap-10 font-16 align-items-center justify-content-between border-bottom pb-3 pt-3"
              >
                <div className="d-flex gap-10 align-items-center">
                  <File size={18}></File> Shipping Policy
                </div>
                <ChevronRight size={20}></ChevronRight>
              </div>
              <div
                onClick={() =>
                  navigate("/policydetails", {
                    state: { type: "Refund Policy" },
                  })
                }
                className="d-flex gap-10 font-16 align-items-center justify-content-between border-bottom pb-3 pt-3"
              >
                <div className="d-flex gap-10 align-items-center">
                  <File size={18}></File> Refund Policy
                </div>
                <ChevronRight size={20}></ChevronRight>
              </div>
            </div>
          </div>
          <div className="col-12 pt-4" style={{ marginBottom: "120px" }}>
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

export default Profile;
