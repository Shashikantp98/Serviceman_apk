import { ChevronLeft } from "react-feather";
import { useNavigate } from "react-router-dom";
import { DeleteConfirmModal } from "../components/DeleteConfirmModal";

import { useState } from "react";
const PrivacyCenter = () => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const navigate = useNavigate();
  const deleteAccount = () => {
    localStorage.clear();
    setTimeout(() => {
      window.location.href = "/";
    }, 1000);
    // setLoading(true);
    // ApiService.post("/user/deleteUser")
    //   .then((res: any) => {
    //     console.log(res);
    //     setLoading(false);
    //     localStorage.clear();
    //     setTimeout(() => {
    //       setLoading(false);
    //       window.location.href = "/";
    //     }, 1000);
    //   })
    //   .catch((err) => {
    //     console.log(err);
    //     setLoading(false);
    //   });
  };
  const deleteAccountModal = () => {
    setShowDeleteModal(true);
  };
  return (
    <div>
      <div className="fixed_header">
        <div className="row">
          <div className="col-12 px-0">
            <button className="back-btn" onClick={() => navigate(-1)}>
              <ChevronLeft /> Back
            </button>
          </div>
        </div>
      </div>
      <div className="main-content-service">
        <div className="row">
          <div className="col-12 ">
            <div
              style={{
                padding: "10px",
                textAlign: "center",
                fontWeight: "bold",
              }}
            >
              <h2>Privacy Center</h2>
            </div>
            <div style={{ padding: "10px" }}>
              <h4 className="mb-2">Account Deletion Policy</h4>
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
              disabled={false}
              onClick={deleteAccountModal}
              className="fill mt-3"
            >
              Delete Account
            </button>
          </div>
        </div>
        <DeleteConfirmModal
          show={showDeleteModal}
          onCancel={() => setShowDeleteModal(false)}
          onConfirm={deleteAccount}
          loading={false}
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
