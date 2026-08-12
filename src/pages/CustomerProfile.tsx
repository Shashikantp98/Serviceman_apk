import {
  Check,
  ChevronRight,
  Edit2,
  File,
  List,
  Lock,
  LogOut,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  User,
} from "react-feather";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import ApiService from "../services/api";
import { useAuth } from "../contexts/AuthContext";

const CustomerProfile = () => {
  const navigate = useNavigate();
  const { token, logout } = useAuth();
  const [loading] = useState(false);
  const [profileDetails, setProfileDetails] = useState<any>({});

  const getProfileDetails = () => {
    ApiService.post("/user/getCustomerDetails")
      .then((res: any) => {
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

  const handleLogout = async () => {
    localStorage.clear();
    logout();
    navigate("/");
  };

  const customer = profileDetails?.customer;
  const fullName = customer?.fname
    ? `${customer.fname} ${customer.lname || ''}`.trim()
    : 'N/A';

  return (
    <>
      <div className="container main-content pt-2 px-4 pt-4 padding_btn_main">

        {/* Profile Card */}
        <div className="row bgprofcard">
          <div className="col-12">
            <div className="d-flex gap-10 align-items-center justify-content-between">
              <span className="badgecomp">
                <Check size={18} /> Profile Completed
              </span>
              <button className="editprof" onClick={() => navigate("/mycustomerprofile")}>
                <Edit2 size={16} />
              </button>
            </div>

            {/* Profile Image */}
            {customer?.profile_image && (
              <div className="pt-3">
                <img
                  src={customer.profile_image}
                  alt="Profile"
                  style={{ width: 60, height: 60, borderRadius: '50%', objectFit: 'cover' }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/60';
                  }}
                />
              </div>
            )}

            <h4 className="mb-2 mt-3">{fullName}</h4>

            {customer?.phone_number && (
              <p className="mb-2 d-flex gap-2 align-items-center">
                <Phone size={16} />
                {customer.phone_number}
              </p>
            )}

            {customer?.email && (
              <p className="d-flex gap-2 align-items-center">
                <Mail size={16} />
                {customer.email}
              </p>
            )}
          </div>
        </div>

        {/* Menu Items */}
        <div className="row px-2 mt-3 bgprofcard">
          <div
            onClick={() => navigate("/mycustomerprofile")}
            className="col-12 d-flex align-items-center justify-content-between border-bottom pb-3 pt-3"
          >
            <div className="d-flex gap-10 font-16 align-items-center">
              <User size={18} /> My Profile
            </div>
            <ChevronRight size={20} />
          </div>

          <div
            onClick={() => navigate("/myrequest")}
            className="col-12 d-flex align-items-center justify-content-between border-bottom pb-3 pt-3"
          >
            <div className="d-flex gap-10 font-16 align-items-center">
              <List size={18} /> My Request
            </div>
            <ChevronRight size={20} />
          </div>

          <div
            onClick={() => navigate("/addressdetails")}
            className="col-12 d-flex align-items-center justify-content-between border-bottom pb-3 pt-3"
          >
            <div className="d-flex gap-10 font-16 align-items-center">
              <MapPin size={18} /> Address
            </div>
            <ChevronRight size={20} />
          </div>

          <div
            onClick={() => navigate("/support")}
            className="col-12 d-flex align-items-center justify-content-between border-bottom pb-3 pt-3"
          >
            <div className="d-flex gap-10 font-16 align-items-center">
              <MessageSquare size={18} /> Support
            </div>
            <ChevronRight size={20} />
          </div>

          <div className="col-12 px-0">
            <div className="crd2 px-12pxs">
              <div
                onClick={() => navigate("/policydetails", { state: { type: "Privacy Policy" } })}
                className="d-flex gap-10 font-16 border-bottom align-items-center justify-content-between border-bottom pb-3 pt-3"
              >
                <div className="d-flex gap-10 align-items-center">
                  <Lock size={16} /> Privacy Policy
                </div>
                <ChevronRight size={20} />
              </div>

              <div
                onClick={() => navigate("/privacycenter")}
                className="d-flex gap-10 font-16 align-items-center justify-content-between border-bottom pb-3 pt-3"
              >
                <div className="d-flex gap-10 align-items-center">
                  <Lock size={16} /> Privacy Center
                </div>
                <ChevronRight size={20} />
              </div>

              <div
                onClick={() => navigate("/policydetails", { state: { type: "Terms & Conditions" } })}
                className="d-flex gap-10 font-16 border-bottom align-items-center justify-content-between pb-3 pt-3"
              >
                <div className="d-flex gap-10 align-items-center">
                  <File size={16} /> Term & Conditions
                </div>
                <ChevronRight size={20} />
              </div>

              <div
                onClick={() => navigate("/policydetails", { state: { type: "Shipping Policy" } })}
                className="d-flex gap-10 font-16 border-bottom align-items-center justify-content-between pb-3 pt-3"
              >
                <div className="d-flex gap-10 align-items-center">
                  <File size={16} /> Shipping Policy
                </div>
                <ChevronRight size={20} />
              </div>

              <div
                onClick={() => navigate("/policydetails", { state: { type: "Refund Policy" } })}
                className="d-flex gap-10 font-16 align-items-center justify-content-between pb-3 pt-3"
              >
                <div className="d-flex gap-10 align-items-center">
                  <File size={16} /> Refund Policy
                </div>
                <ChevronRight size={20} />
              </div>
            </div>
          </div>
        </div>

        {/* Logout */}
        <div className="row pb-5">
          <div className="col-12 px-0">
            <button disabled={loading} onClick={handleLogout} className="loggoutbtn">
              <LogOut size={16} />
              {loading ? "Logging out..." : "Logout"}
            </button>
          </div>
        </div>

      </div>
    </>
  );
};

export default CustomerProfile;