import { Edit, Edit2, PlusCircle, Trash2 } from "react-feather";
import ApiService from "../services/api";
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import CommonHeader from "../components/CommonHeader";
import SectionLoader from "../components/SectionLoader";
import { useSectionLoader } from "../utils/useSectionLoader";

const Addressdetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isPrimary, setIsPrimary] = useState(false);
  const [addressDetails, setAddressDetails] = useState<any>([]);
  const [store_id, setStore_id] = useState("");

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [deleteId, setDeleteId] = useState("");

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
    setIsPrimary(location?.state?.isSelected || false);
    setStore_id(location?.state?.store_id);
  }, [location?.state?.isSelected]);

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
      });
  };

  const makePrimary = (item: any) => {
    if (item.delivery_status == "Does not deliver to") {
      toast.error("Does not deliver to this address");
      return;
    } else {
      ApiService.post("/user/setPrimaryAddress", {
        address_id: item?._id,
      })
        .then((res: any) => {
          toast.success(res.message);
          localStorage.setItem("address", JSON.stringify(item));
          navigate("/checkout");
        })
        .catch((err) => {
          console.log(err);
          toast.error(err.response.data.message);
        });
    }
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
              <div className="bookingcards">
                  <div className='basic_details_card d-flex justify-content-between align-items-start'>
                    <div>
                      <span className="bkg_id">Primary</span>
                    </div>
                  
                  </div>
                  <div>
                      <h2 className="ser_name pt-4">Dhar Road</h2>
                      <p>315, Zainy Manzil, Noorani Nagar, Dhar Road, Indore</p>

                  </div>
                  <div className="d-flex gap-3 pt-3">
                    <button className="paynow">Set as Primary</button>
                    <button className="edit_req">
                      <Edit2 size={14} /> 
                    </button>
                    <button className="delete_req">
                      <Trash2 size={14} /> 
                    </button>

                  </div>

                  

              </div>
                <div className="bookingcards">
                  <div className='basic_details_card d-flex justify-content-between align-items-start'>
                    <div>
                      <span className="bkg_id">Secondary</span>
                    </div>
                  
                  </div>
                  <div>
                      <h2 className="ser_name pt-4">Vijay Nagar</h2>
                      <p>315, Zainy Manzil, Noorani Nagar, Dhar Road, Indore</p>

                  </div>
                  <div className="d-flex gap-3 pt-3">
                    <button className="paynow">Set as Primary</button>
                    <button className="edit_req">
                      <Edit2 size={14} /> 
                    </button>
                    <button className="delete_req">
                      <Trash2 size={14} /> 
                    </button>

                  </div>

                  

              </div>
          </div>
          <div className="col-12 mt-4">
            <button className="paynow2">
              <PlusCircle />
              &nbsp; Add New Address
            </button>
          </div>
        </div>
      </div>

      <div className="d-none">
        <CommonHeader />
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

        <div className="main-content-service container">
          <SectionLoader
            show={addressLoader.loading}
            size="medium"
            text="Loading address details..."
            overlay={true}
          />

          <div className="row px-2   pt-3">
            {addressDetails?.map((item: any) => (
              <div
                className="col-12 mb-2"
                key={item?._id}
                onClick={() => {
                  if (isPrimary) {
                    makePrimary(item);
                  } else {
                    navigate("/authaddress", { state: { address: item } });
                  }
                }}
              >
                <div className="cards5 d-block p-3">
                  <div className="d-flex align-items-center w-100 justify-content-between">
                    <b className="font-14">
                      {item?.is_primary ? "Primary" : "Secondary"}
                    </b>

                    <div className="d-flex align-items-center">
                      <Edit
                        size={16}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate("/authaddress", {
                            state: { address: item },
                          });
                        }}
                        style={{ cursor: "pointer" }}
                      />

                      {/* DELETE ICON */}
                      <Trash2
                        size={18}
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteId(item._id);
                          setShowModal(true);
                        }}
                        style={{
                          marginLeft: 12,
                          color: "red",
                          cursor: "pointer",
                        }}
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <p className="font-14 mb-1">
                      {item?.fname} {item?.lname}
                    </p>
                    <p className="font-14 color-grey mb-1">
                      {item?.country_code}
                      {item?.phone_number}
                    </p>
                    <p className="font-14 color-grey mb-1">
                      {item?.street_1}, {item?.city}, {item?.state},{" "}
                      {item?.country}, {item?.zip}
                    </p>

                    {item.delivery_status == "Does not deliver to" && (
                      <p className="font-14 color-red">
                        Does not deliver to this address
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}

            <div className="col-12 pt-2 " style={{ marginBottom: "100px" }}>
              <button
                className="fill"
                onClick={() =>
                  navigate("/authaddress", { state: { address: null } })
                }
              >
                <PlusCircle />
                &nbsp; Add New Address
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Addressdetails;
