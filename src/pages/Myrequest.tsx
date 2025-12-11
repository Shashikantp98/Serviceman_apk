import { Calendar, Clock } from "react-feather";
// import Header from "../components/Header";
import ApiService from "../services/api";
import { useEffect } from "react";
import { useState } from "react";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import { DeleteConfirmModal } from "../components/DeleteConfirmModal";
import { toast } from "react-toastify";
import { RazorpayPayment } from "../components/RazorpayPayment";
import SectionLoader from "../components/SectionLoader";
import { useSectionLoader } from "../utils/useSectionLoader";

const Myrequest = () => {
  const navigate = useNavigate();
  const [booking_status, setbooking_status] = useState("in_progress");
  const [bookingList, setbookingList] = useState<any>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [booking_id, setBookingId] = useState("");
  const [loading, setLoading] = useState(false);
  const [cancelLoadingId, setCancelLoadingId] = useState("");
  const [payLoadingId, setPayLoadingId] = useState("");


  const [razorpayOrderId, setRazorpayOrderId] = useState("");
  const [isOrder, setIsOrder] = useState(false);
  const [profileDetails, setProfileDetails] = useState<any>({});
  const [orderId, setOrderId] = useState("");
  const [serviceDetails, setServiceDetails] = useState<any>({});

  // Loader for booking list
  const bookingListLoader = useSectionLoader("booking-list");

  const getAllMyRequest = () => {
    bookingListLoader.setLoading(true);
    ApiService.post("/user/listUserBookings", {
      filters: {
        booking_status: booking_status, //in_progress completed cancelled
      },
      sorters: {
        created_on: -1,
      },
      pagination: {
        page: 1,
        pageSize: 50,
      },
    }).then((res: any) => {
      console.log(res);
      setbookingList(res.data.bookings);
    })
      .catch((err: any) => {
        console.log(err);
      })
      .finally(() => {
        bookingListLoader.setLoading(false);
      })
  };
  useEffect(() => {
    setbookingList([]);
    getAllMyRequest();
  }, [booking_status]);
  useEffect(() => {
    getProfileDetails();
  }, []);

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
  const cancelRequest = () => {
    setLoading(true);
    setCancelLoadingId(booking_id);
    ApiService.post("/user/cancelBookingByCustomer", { booking_id: booking_id })
      .then((res: any) => {
        console.log(res);
        toast.success(res.data.message);
        setLoading(false);
        setShowDeleteModal(false);
        getAllMyRequest();
      })
      .catch((err: any) => {
        console.log(err);
        toast.error(err.response.data.message);
        setLoading(false);
        setShowDeleteModal(false);
      })
      .finally(() => {
        setCancelLoadingId("");
      });
  };
  const handleBookingSummary = (booking_id: string, payment_amount: string) => {
    setPayLoadingId(booking_id);  // show loader only on this Pay button

    ApiService.post("/user/payRemainingAmount", {
      booking_id: booking_id,
      payment_amount: payment_amount,
    })
      .then((res: any) => {
        console.log(res);
        setIsOrder(true);
        setOrderId(res.data?.booking_id);
        setRazorpayOrderId(res.data?.razorpay_order_id);
      })
      .catch((err: any) => {
        console.log(err);
      })
      .finally(() => {
        setPayLoadingId("");
      });
  };
  const handleSuccess = (response: any) => {
    console.log("Payment Success:", response);
    // e.g., verify payment on your server using response.razorpay_payment_id
    ApiService.post("/user/verifyRemainingPayment", {
      razorpay_order_id: response.razorpay_order_id,
      razorpay_payment_id: response.razorpay_payment_id,
      razorpay_signature: response.razorpay_signature,
      booking_id: orderId,
    })
      .then((res: any) => {
        console.log(res.data);
        setLoading(false);
        setIsOrder(false);
        navigate("/succcess", {
          state: {
            name:
              profileDetails?.customer?.fname +
              " " +
              profileDetails?.customer?.lname,
            service_name: serviceDetails?.service_name,
            booking_date: serviceDetails?.date,
            booking_time: serviceDetails?.time,
          },
        });
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  };

  const handleFailure = (response: any) => {
    console.log("Payment Cancelled or Failed:", response);
    alert("Payment Failed");
    setLoading(false);
    setIsOrder(false);
  };
  return (
    <>
      <div className="container main-content pt-2 pb-5">


      

        <div className="fixed_header text-center">
          <h1 className="head4">My Request</h1>
        </div>


        <div className="row px-2 mb-5 mb-5 fixed_header_padding">
          <div className="col-12 pt-2">
            <ul
              className="nav nav-pills mb-3 border-bottom"
              id="pills-tab"
              role="tablist"
            >
              <li className="nav-item" role="presentation">
                <button
                  className="nav-link active"
                  id="pills-home-tab"
                  data-bs-toggle="pill"
                  data-bs-target="#pills-home"
                  type="button"
                  role="tab"
                  aria-controls="pills-home"
                  aria-selected="true"
                  onClick={() => setbooking_status("in_progress")}
                >
                  In Progress
                </button>
              </li>

              <li className="nav-item" role="presentation">
                <button
                  className="nav-link"
                  id="pills-contact-tab"
                  data-bs-toggle="pill"
                  data-bs-target="#pills-contact"
                  type="button"
                  role="tab"
                  aria-controls="pills-contact"
                  aria-selected="false"
                  onClick={() => setbooking_status("completed")}
                >
                  Complete
                </button>
              </li>
              <li className="nav-item" role="presentation">
                <button
                  className="nav-link"
                  id="pills-contact-tab"
                  data-bs-toggle="pill"
                  data-bs-target="#cancel"
                  type="button"
                  role="tab"
                  aria-controls="pills-contact"
                  aria-selected="false"
                  onClick={() => setbooking_status("cancelled")}
                >
                  Cancelled
                </button>
              </li>
            </ul>
            <SectionLoader
              show={bookingListLoader.loading}
              size="medium"
              text="Loading your requests..."
              overlay={true}
            />
            <div className="tab-content" id="pills-tabContent">
              <div
                className="tab-pane fade show active"
                id="pills-home"
                role="tabpanel"
                aria-labelledby="pills-home-tab"
              >
                {!bookingListLoader.loading && bookingList.length === 0 && (
                  <div className="cards5 mb-2">
                    <div className="d-flex align-items-center border-bottom pb-3 justify-content-between">
                      <h2 className="mb-0 font-14">No Booking Found</h2>
                    </div>
                  </div>
                )}

                {bookingList.map((booking: any) => (
                  <div className="cards5 mb-2" key={booking.booking_id}>
                    <div
                      onClick={() =>
                        navigate("/customerprojectinfo/" + booking.booking_id)
                      }
                      className="d-flex align-items-center border-bottom pb-3 justify-content-between"
                    >
                      <h2 className="mb-0 font-14">{booking.service_name}</h2>
                      <p
                        className="status-pending font-12 mb-0"
                        style={{ textTransform: "capitalize" }}
                      >
                        {booking.booking_status}
                      </p>
                    </div>
                    <div
                      className="d-flex justify-content-between pt-3"
                      onClick={() =>
                        navigate("/customerprojectinfo/" + booking.booking_id)
                      }
                    >
                      <div className="d-flex align-items-center gap-10 font-12 color-grey">
                        <Calendar size={14}></Calendar>
                        Scheduled for{" "}
                        {dayjs(booking.booking_date).format("DD MMM")}
                      </div>
                      <div className="d-flex align-items-center gap-10 font-12 color-grey">
                        <Clock size={14}></Clock>
                        {booking.booking_time}
                      </div>
                    </div>
                    {/* <div className="d-flex justify-content-between pt-3">
                      <div className="d-flex align-items-center gap-10 font-12 color-grey">
                        <RotateCw size={14}></RotateCw>
                        One-Time Cleaning Service
                      </div>
                    </div>
                    <div className="d-flex justify-content-between pt-3">
                      <div className="d-flex align-items-center gap-10 font-12 color-grey">
                        <User size={14}></User>
                        Opakjeph Plumbing Service
                      </div>
                    </div> */}
                    <div className="pt-3">
                      <button
                        className="canreq"
                        disabled={cancelLoadingId === booking.booking_id}
                        onClick={() => {
                          setShowDeleteModal(true);
                          setBookingId(booking.booking_id);
                        }}
                      >
                        {cancelLoadingId === booking.booking_id ? "Cancelling..." : "Cancel Request"}
                      </button>
                      {booking.payment_status == "booking_fee_paid" && (
                        <button
                          className="canreq2"
                          disabled={payLoadingId === booking.booking_id}
                          onClick={() => {
                            setServiceDetails({
                              service_name: booking.service_name,
                              date: booking.booking_date,
                              time: booking.booking_time,
                              total_amount: booking.grand_total - booking.booking_fee,
                            });
                            handleBookingSummary(
                              booking.booking_id,
                              (booking.grand_total - booking.booking_fee).toString()
                            );
                          }}
                        >
                          {payLoadingId === booking.booking_id ? "Processing..." : "Pay Full Amount"}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div
                className="tab-pane fade"
                id="pills-contact"
                role="tabpanel"
                aria-labelledby="pills-contact-tab"
              >
                {!bookingListLoader.loading && bookingList.length === 0 && (
                  <div className="cards5 mb-2">
                    <div className="d-flex align-items-center border-bottom pb-3 justify-content-between">
                      <h2 className="mb-0 font-14">No Booking Found</h2>
                    </div>
                  </div>
                )}
                {bookingList.map((booking: any) => (
                  <div
                    className="cards5 mb-2"
                    key={booking.booking_id}
                    onClick={() =>
                      navigate("/customerprojectinfo/" + booking.booking_id)
                    }
                  >
                    <div className="d-flex align-items-center border-bottom pb-3 justify-content-between">
                      <h2 className="mb-0 font-14">{booking.service_name}</h2>
                      <p
                        className="status-completed font-12 mb-0"
                        style={{ textTransform: "capitalize" }}
                      >
                        {booking.booking_status}
                      </p>
                    </div>
                    <div className="d-flex justify-content-between pt-3">
                      <div className="d-flex align-items-center gap-10 font-12 color-grey">
                        <Calendar size={14}></Calendar>
                        Scheduled for{" "}
                        {dayjs(booking.booking_date).format("DD MMM")}
                      </div>
                      <div className="d-flex align-items-center gap-10 font-12 color-grey">
                        <Clock size={14}></Clock>
                        {booking.booking_time}
                      </div>
                    </div>

                    <div className="pt-3"></div>
                  </div>
                ))}
              </div>
              <div
                className="tab-pane fade"
                id="cancel"
                role="tabpanel"
                aria-labelledby="pills-contact-tab"
              >
                {!bookingListLoader.loading && bookingList.length === 0 && (
                  <div className="cards5 mb-2">
                    <div className="d-flex align-items-center border-bottom pb-3 justify-content-between">
                      <h2 className="mb-0 font-14">No Booking Found</h2>
                    </div>
                  </div>
                )}
                {bookingList.map((booking: any) => (
                  <div
                    className="cards5 mb-2"
                    key={booking.booking_id}
                    onClick={() =>
                      navigate("/customerprojectinfo/" + booking.booking_id)
                    }
                  >
                    <div className="d-flex align-items-center border-bottom pb-3 justify-content-between">
                      <h2 className="mb-0 font-14">{booking.service_name}</h2>
                      <p
                        className="status-cancelled font-12 mb-0"
                        style={{ textTransform: "capitalize" }}
                      >
                        {booking.booking_status}
                      </p>
                    </div>
                    <div className="d-flex justify-content-between pt-3">
                      <div className="d-flex align-items-center gap-10 font-12 color-grey">
                        <Calendar size={14}></Calendar>
                        Scheduled for{" "}
                        {dayjs(booking.booking_date).format("DD MMM")}
                      </div>
                      <div className="d-flex align-items-center gap-10 font-12 color-grey">
                        <Clock size={14}></Clock>
                        {booking.booking_time}
                      </div>
                    </div>

                    <div className="pt-3"></div>
                  </div>
                ))}
              </div>
            </div>
            <DeleteConfirmModal
              show={showDeleteModal}
              onCancel={() => setShowDeleteModal(false)}
              onConfirm={cancelRequest}
              loading={loading}
              itemName={""}
              title="Cancel Request"
              description="If you proceed, all associated data will be removed."
              confirmLabel="Cancel Request"
              cancelLabel="Keep"
            />
          </div>
        </div>
        {isOrder && (
          <RazorpayPayment
            orderId={razorpayOrderId} // Replace with your server-created order ID
            amount={serviceDetails?.total_amount * 100} // ₹500.00 in paise
            name={
              profileDetails?.customer?.fname +
              " " +
              profileDetails?.customer?.lname
            }
            email={profileDetails?.customer?.email}
            contact={profileDetails?.customer?.phone_primary}
            onSuccess={handleSuccess}
            onFailure={handleFailure}
          />
        )}
      </div>
    </>
  );
};

export default Myrequest;
