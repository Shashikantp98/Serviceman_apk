import { Edit2, PlusCircle, Trash2 } from "react-feather";
import ApiService from "../services/api";
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import SectionLoader from "../components/SectionLoader";
import { useSectionLoader } from "../utils/useSectionLoader";

const Addressdetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [addressDetails, setAddressDetails] = useState<any>([]);
  const [store_id, setStore_id] = useState("");

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [deleteId, setDeleteId] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState("");

  // Loader for address list
  const addressLoader = useSectionLoader("address-list");

  const getProfileDetails = () => {
    addressLoader.setLoading(true);
    ApiService.post("/user/getCustomerAddress", {
      store_id: store_id,
    })
      .then((res: any) => {
        console.log(res.data);
        setAddressDetails(res.data);
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        addressLoader.setLoading(false);
      });
  };

  useEffect(() => {
    getProfileDetails();
  }, [store_id]);

  useEffect(() => {
    setStore_id(location?.state?.store_id);
  }, [location?.state?.store_id]);

  const confirmDelete = () => {
    if (!deleteId) return;

    ApiService.post("/user/deleteCustomerAddress", {
      address_id: deleteId,
    })
      .then((res: any) => {
        toast.success(res.message);
        setShowModal(false);
        getProfileDetails();
      })
      .catch((err) => {
        console.log(err);
        toast.error(err.response?.data?.message || "Failed to delete address");
        })
        .finally(() => {
          setDeleteId("");
      });
  };

  const handleSetPrimary = (item: any) => {
    if (item.delivery_status == "Does not deliver to") {
      toast.error("Does not deliver to this address");
      return;
    }

    setActionLoadingId(item?._id);
    ApiService.post("/user/setPrimaryCustomerAddress", {
      address_id: item?._id,
    })
      .then((res: any) => {
        toast.success(res.message || "Primary address updated successfully");
        getProfileDetails();
      })
      .catch((err) => {
        console.log(err);
        toast.error(err.response?.data?.message || "Failed to set primary address");
      })
      .finally(() => {
        setActionLoadingId("");
      });
  };

  const handleEditAddress = (item: any) => {
    setActionLoadingId(item?._id);
    ApiService.post("/user/getCustomerAddressDetails", {
      address_id: item?._id,
    })
      .then((res: any) => {
        navigate("/authaddress", { state: { address: res.data } });
      })
      .catch((err) => {
        console.log(err);
        toast.error(err.response?.data?.message || "Failed to load address details");
      })
      .finally(() => {
        setActionLoadingId("");
      });
  };

  return (
    <>

      <div className="container mbt-200px">
        <div className="row pt-5">
          <div className="col-12 pt-4 pb-0">
            <h3>My Addresses</h3>
          </div>
        </div>
        <div className="row">
          <div className="col-12">
            <SectionLoader
              show={addressLoader.loading}
              size="medium"
              text="Loading address details..."
              overlay={true}
            />

            {!addressLoader.loading && addressDetails?.length === 0 && (
              <div className="bookingcards text-center">
                <p className="font-14 weight-bold mb-0">No addresses found</p>
              </div>
            )}

            {!addressLoader.loading && addressDetails?.map((item: any) => (
              <div className="bookingcards mb-3" key={item?._id}>
                <div className='basic_details_card d-flex justify-content-between align-items-start'>
                  <div>
                    <span className="bkg_id">{item?.is_primary ? "Primary" : "Secondary"}</span>
                  </div>
                </div>

                <div>
                  <h2 className="ser_name pt-4">
                    {item?.street_1 || item?.city || item?.state || "Address"}
                  </h2>
                  <p>
                    {item?.street_1}
                    {item?.street_2 ? `, ${item.street_2}` : ""}
                    {item?.city ? `, ${item.city}` : ""}
                    {item?.state ? `, ${item.state}` : ""}
                    {item?.country ? `, ${item.country}` : ""}
                    {item?.zip ? `, ${item.zip}` : ""}
                  </p>
                </div>

                <div className="d-flex gap-3 pt-3 flex-wrap">
                  {!item?.is_primary && (
                    <button
                      className="paynow"
                      onClick={() => handleSetPrimary(item)}
                      disabled={actionLoadingId === item?._id}
                    >
                      {actionLoadingId === item?._id ? "Updating..." : "Set as Primary"}
                    </button>
                  )}
                  <button
                    className="edit_req"
                    onClick={() => handleEditAddress(item)}
                    disabled={actionLoadingId === item?._id}
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    className="delete_req"
                    onClick={() => {
                      setDeleteId(item._id);
                      setShowModal(true);
                    }}
                    disabled={actionLoadingId === item?._id}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                {item.delivery_status == "Does not deliver to" && (
                  <p className="font-14 color-red mb-0 mt-2">
                    Does not deliver to this address
                  </p>
                )}
              </div>
            ))}
          </div>
          <div className="col-12 mt-4">
            <button
              className="paynow2"
              onClick={() => navigate("/authaddress", { state: { address: null } })}
            >
              <PlusCircle />
              &nbsp; Add New Address
            </button>
          </div>
        </div>
      </div>

      {showModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowModal(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 999,
          }}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff",
              padding: "25px",
              borderRadius: "10px",
              width: "80%",
              maxWidth: "350px",
              textAlign: "center",
              position: "relative",
            }}
          >
            <span
              onClick={() => setShowModal(false)}
              style={{
                position: "absolute",
                right: "12px",
                top: "10px",
                fontSize: "20px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              ✖
            </span>

            <h4>Delete Address</h4>
            <p className="mt-2">Are you sure you want to delete this address?</p>

            <div
              className="d-flex justify-content-between mt-4"
              style={{ gap: "10px" }}
            >
              <button
                className="btn btn-light w-50"
                onClick={() => setShowModal(false)}
                style={{
                  padding: "10px",
                  borderRadius: "6px",
                  border: "1px solid #ccc",
                }}
              >
                Cancel
              </button>

              <button
                className="btn btn-danger w-50"
                onClick={confirmDelete}
                style={{
                  padding: "10px",
                  background: "red",
                  color: "#fff",
                  borderRadius: "6px",
                  border: "none",
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Addressdetails;
