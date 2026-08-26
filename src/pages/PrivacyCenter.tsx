
import { useNavigate } from "react-router-dom";
import { DeleteConfirmModal } from "../components/DeleteConfirmModal";

import { useState } from "react";
import ApiService from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "react-toastify";

type DeleteUserResponse = {
  status?: string | number;
  message?: string;
  data?: {
    user_id?: string;
    user_type?: string;
  };
};

const PrivacyCenter = () => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { logout } = useAuth();

  const deleteAccount = async () => {
    if (loading) return;

    setLoading(true);

    try {
      const userType = (localStorage.getItem("authmobileRole") || "").toLowerCase();
      const payload = userType ? { user_type: userType } : {};

      const res = await ApiService.post<DeleteUserResponse>("/user/deleteUser", payload);

      if (res?.status === "success" || res?.status === 200) {
        toast.success(res?.message || "Account deleted successfully");
        setShowDeleteModal(false);
        localStorage.clear();
        logout();

        setTimeout(() => {
          window.location.href = "/";
        }, 800);

        return;
      }

      toast.error(res?.message || "Failed to delete account");
      setLoading(false);
    } catch (error: unknown) {
      const errorMessage =
        (
          error as {
            response?: { data?: { message?: string } };
          }
        )?.response?.data?.message ||
        (error instanceof Error ? error.message : "Failed to delete account");

      toast.error(errorMessage);
      setLoading(false);
    }
  };

  const deleteAccountModal = () => {
    setShowDeleteModal(true);
  };
  return (
    <div>
      <div className="fixed_header">
        <div className="row">
          <div className="col-12 px-3 back_btn_pro  ">
            <button className="back_btn_new" onClick={() => navigate(-1)}>
              Back
            </button>
          </div>
        </div>
      </div>
      <div className="container mb-5 pb-5 mt-5 pt-5">
        <div className="row pt-5">
          <div className="col-12 ">
            <div
              style={{
                padding: "10px",
                textAlign: "center",
                fontWeight: "bold",
              }}
            >
              <h2 className="head4">Privacy Center</h2>
            </div>
            <div style={{ padding: "10px" }}>
              <h4 className="font-12 px-3 mx-1 mt-1 mb-3">Account Deletion Policy</h4>
              <ul>
                <li>
                  You'll no longer be able to access your saved professionals
                </li>
                <li>Your customer rating will be reset</li>
                <li>All your memberships will be cancelled</li>
                <li>
                  You'll not be able to claim under any active warranty or
                  insurance
                </li>
                <li>The changes are irreversible</li>
              </ul>
            </div>
          </div>
          <div className="col-12" style={{ width: "90%", margin: "auto" }}>
            <button
              disabled={loading}
              onClick={deleteAccountModal}
              className="fill mt-3"
            >
              Delete Account
            </button>
          </div>
        </div>
        <DeleteConfirmModal
          show={showDeleteModal}
          onCancel={() => {
            if (!loading) {
              setShowDeleteModal(false);
            }
          }}
          onConfirm={deleteAccount}
          loading={loading}
          itemName={""}
          title="Delete Account"
          description="If you proceed, all associated data will be removed."
          confirmLabel="Delete"
          cancelLabel="Keep"
        />
      </div>
    </div>
  );
};

export default PrivacyCenter;
