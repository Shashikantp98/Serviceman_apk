import { Calendar, Clock, Trash2 } from "react-feather";
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

  const bookingListLoader = useSectionLoader("booking-list");

  const getAllMyRequest = () => {
    bookingListLoader.setLoading(true);
    ApiService.post("/user/listUserBookings", {
      filters: {
        booking_status: booking_status,
      },
      sorters: {
        created_on: -1,
      },
      pagination: {
        page: 1,
        pageSize: 50,
      },
    })
      .then((res: any) => {
        setbookingList(res.data.bookings);
      })
      .catch((err: any) => {
        console.log(err);
      })
      .finally(() => {
        bookingListLoader.setLoading(false);
      });
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
        toast.success(res.data.message);
        setLoading(false);
        setShowDeleteModal(false);
        getAllMyRequest();
      })
      .catch((err: any) => {
        toast.error(err.response.data.message);
        setLoading(false);
        setShowDeleteModal(false);
      })
      .finally(() => {
        setCancelLoadingId("");
      });
  };

  const handleBookingSummary = (booking_id: string, payment_amount: string) => {
    setPayLoadingId(booking_id);
    ApiService.post("/user/payRemainingAmount", {
      booking_id: booking_id,
      payment_amount: payment_amount,
    })
      .then((res: any) => {
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
    ApiService.post("/user/verifyRemainingPayment", {
      razorpay_order_id: response.razorpay_order_id,
      razorpay_payment_id: response.razorpay_payment_id,
      razorpay_signature: response.razorpay_signature,
      booking_id: orderId,
    })
      .then(() => {
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
      <div className="container pb-5 mb-5">
        <div className="row pt-4">
          <div className="col-12 pt-4 mt-3 pb-3">
            <h3>My Bookings</h3>
          </div>
        </div>

        <div className="row px-2 mb-5">
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
                  id="pills-cancel-tab"
                  data-bs-toggle="pill"
                  data-bs-target="#cancel"
                  type="button"
                  role="tab"
                  aria-controls="cancel"
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

              {/* ── In Progress Tab ── */}
              <div
                className="tab-pane fade show active"
                id="pills-home"
                role="tabpanel"
                aria-labelledby="pills-home-tab"
              >
                {!bookingListLoader.loading && bookingList.length === 0 && (
                  <h2 className="mb-0 font-14 mt-4">No Booking Found</h2>
                )}

                {bookingList.map((booking: any) => (
                  <div className="bookingcards" key={booking.booking_id}>
                    <div className="basic_details_card d-flex justify-content-between align-items-start">
                      <div>
                        <span className="bkg_id">
                          Booking ID : #{booking.bkng_id}
                        </span>
                      </div>
                      <div>
                        <p
                          className={`status_detail ${
                            booking.booking_status === "confirmed"
                              ? "color_success"
                              : booking.booking_status === "cancelled"
                              ? "color_red"
                              : "color_org"
                          }`}
                        >
                          <Clock size={14} />{" "}
                          {booking.booking_status
                            ?.replaceAll("_", " ")
                            .replace(/\b\w/g, (l: string) => l.toUpperCase())}
                        </p>
                      </div>
                    </div>

                    <div
                      onClick={() =>
                        navigate("/customerprojectinfo/" + booking.booking_id)
                      }
                      style={{ cursor: "pointer" }}
                    >
                      <h2 className="ser_name pt-4">{booking.service_name}</h2>

                      {booking.serviceman &&
                      booking.serviceman !== "Unassigned" ? (
                        <p>
                          <strong>{booking.serviceman}</strong> will be visiting
                          your location to provide the service.
                        </p>
                      ) : (
                        <p>
                          Your booking has been confirmed. A serviceman will be
                          assigned shortly.
                        </p>
                      )}

                      <p className="shed_det">
                        <Calendar size={14} />{" "}
                        {dayjs(booking.booking_date).format("DD MMM YYYY")}
                      </p>
                      <p className="shed_det">
                        <Clock size={14} /> {booking.booking_time}
                      </p>
                      <p className="shed_det">Amount : ₹{booking.grand_total}</p>
                      <p className="shed_det">
                        Payment Status :{" "}
                        <strong>
                          {booking.payment_status
                            ?.replaceAll("_", " ")
                            .replace(/\b\w/g, (l: string) => l.toUpperCase())}
                        </strong>
                      </p>
                    </div>

                    <div className="d-flex gap-3 pt-3">
                      {(booking.payment_status === "booking_fee_paid" || booking.payment_status === "pending") && (
                        <button
                          className="paynow"
                          disabled={payLoadingId === booking.booking_id}
                          onClick={() => {
                            setServiceDetails({
                              service_name: booking.service_name,
                              date: booking.booking_date,
                              time: booking.booking_time,
                              total_amount:
                                booking.grand_total - booking.booking_fee,
                            });
                            handleBookingSummary(
                              booking.booking_id,
                              (
                                booking.grand_total - booking.booking_fee
                              ).toString()
                            );
                          }}
                        >
                          {payLoadingId === booking.booking_id
                            ? "Processing..."
                            : "Pay Full Amount"}
                        </button>
                      )}

                      {booking.booking_status !== "cancelled" &&
                        booking.booking_status !== "completed" && (
                          <button
                            className="delete_req"
                            disabled={cancelLoadingId === booking.booking_id}
                            onClick={() => {
                              setShowDeleteModal(true);
                              setBookingId(booking.booking_id);
                            }}
                          >
                            {cancelLoadingId === booking.booking_id ? (
                              "Cancelling..."
                            ) : (
                              <Trash2 size={14} />
                            )}
                          </button>
                        )}
                    </div>
                  </div>
                ))}
              </div>

              {/* ── Completed Tab ── */}
              <div
                className="tab-pane fade"
                id="pills-contact"
                role="tabpanel"
                aria-labelledby="pills-contact-tab"
              >
                {!bookingListLoader.loading && bookingList.length === 0 && (
                  <h2 className="mb-0 font-14 mt-4">No Booking Found</h2>
                )}

                {bookingList.map((booking: any) => (
                  <div
                    className="bookingcards"
                    key={booking.booking_id}
                    onClick={() =>
                      navigate("/customerprojectinfo/" + booking.booking_id)
                    }
                    style={{ cursor: "pointer" }}
                  >
                    <div className="basic_details_card d-flex justify-content-between align-items-start">
                      <div>
                        <span className="bkg_id">
                          Booking ID : #{booking.bkng_id}
                        </span>
                      </div>
                      <div>
                        <p className="status_detail color_success">
                          <Clock size={14} />{" "}
                          {booking.booking_status
                            ?.replaceAll("_", " ")
                            .replace(/\b\w/g, (l: string) => l.toUpperCase())}
                        </p>
                      </div>
                    </div>

                    <h2 className="ser_name pt-4">{booking.service_name}</h2>
                    <p className="shed_det">
                      <Calendar size={14} />{" "}
                      {dayjs(booking.booking_date).format("DD MMM YYYY")}
                    </p>
                    <p className="shed_det">
                      <Clock size={14} /> {booking.booking_time}
                    </p>
                    <p className="shed_det">Amount : ₹{booking.grand_total}</p>
                    <p className="shed_det">
                      Payment Status :{" "}
                      <strong>
                        {booking.payment_status
                          ?.replaceAll("_", " ")
                          .replace(/\b\w/g, (l: string) => l.toUpperCase())}
                      </strong>
                    </p>
                  </div>
                ))}
              </div>

              {/* ── Cancelled Tab ── */}
              <div
                className="tab-pane fade"
                id="cancel"
                role="tabpanel"
                aria-labelledby="pills-cancel-tab"
              >
                {!bookingListLoader.loading && bookingList.length === 0 && (
                  <h2 className="mb-0 font-14 mt-4">No Booking Found</h2>
                )}

                {bookingList.map((booking: any) => (
                  <div
                    className="bookingcards"
                    key={booking.booking_id}
                    onClick={() =>
                      navigate("/customerprojectinfo/" + booking.booking_id)
                    }
                    style={{ cursor: "pointer" }}
                  >
                    <div className="basic_details_card d-flex justify-content-between align-items-start">
                      <div>
                        <span className="bkg_id">
                          Booking ID : #{booking.bkng_id}
                        </span>
                      </div>
                      <div>
                        <p className="status_detail color_red">
                          <Clock size={14} />{" "}
                          {booking.booking_status
                            ?.replaceAll("_", " ")
                            .replace(/\b\w/g, (l: string) => l.toUpperCase())}
                        </p>
                      </div>
                    </div>

                    <h2 className="ser_name pt-4">{booking.service_name}</h2>
                    <p className="shed_det">
                      <Calendar size={14} />{" "}
                      {dayjs(booking.booking_date).format("DD MMM YYYY")}
                    </p>
                    <p className="shed_det">
                      <Clock size={14} /> {booking.booking_time}
                    </p>
                    <p className="shed_det">Amount : ₹{booking.grand_total}</p>
                    <p className="shed_det">
                      Payment Status :{" "}
                      <strong>
                        {booking.payment_status
                          ?.replaceAll("_", " ")
                          .replace(/\b\w/g, (l: string) => l.toUpperCase())}
                      </strong>
                    </p>
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
            orderId={razorpayOrderId}
            amount={serviceDetails?.total_amount * 100}
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