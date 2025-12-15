import {
  ArrowUpRight,
  Calendar,
  Clock,
  CreditCard,
  MapPin,
} from "react-feather";
import ApiService from "../services/api";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { toast } from "react-toastify";
import { RazorpayPayment } from "../components/RazorpayPayment";
import { SuccessConfirmModal } from "../components/SuccessConfirmModal";
import SectionLoader from "../components/SectionLoader";
import { useSectionLoader } from "../utils/useSectionLoader";

interface WalletResponse {
  data: {
    wallet_balance: number;
    total_completed_bookings: number;
  };
}
const Dashboard = () => {
  const navigate = useNavigate();
  const [serviceMenDetails, setServiceMenDetails] = useState<any>([]);
  const [bookingList, setbookingList] = useState<any>([]);

  const [loading, setLoading] = useState(false);
  const [buttonLoading, setButtonLoading] = useState({
    id: "",
    action: ""
  });

  const [totalAmount, settotalAmount] = useState(0);
  const [orderId, setOrderId] = useState("");
  const [razorpayOrderId, setRazorpayOrderId] = useState("");
  const [isOrder, setIsOrder] = useState(false);
  const [totalWalletBalance, setTotalWalletBalance] = useState<number>(0);
  const [totalBookings, setTotalBookings] = useState<number>(0);

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [profile_complete, setProfile_complete] = useState(false);
  const [message, setMessage] = useState("");

  // Loader for serviceman dashboard
  const bookingListLoader = useSectionLoader("booking-list");
  const summaryLoader = useSectionLoader("dashboard-summary");

  const getAllMyRequest = () => {
    bookingListLoader.setLoading(true);
    ApiService.post("/servicemen/listBookingRequestsForServiceman", {
      filters: {
        //in_progress completed cancelled
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
      setbookingList(res.data.list);
    })
      .catch((err) => {
        console.error("Error fetching booking request:", err);
      })
      .finally(() => {
        bookingListLoader.setLoading(false);
      })
  };
  const getTotalWalletBalance = () => {
    summaryLoader.setLoading(true);
    ApiService.get<WalletResponse>("/servicemen/getServicemanSummary")
      .then((res) => {
        setTotalWalletBalance(res.data.wallet_balance);
        setTotalBookings(res.data.total_completed_bookings);
      })
      .catch((err) => {
        console.error("Error fetching wallet balance:", err);
      })
      .finally(() => {
        summaryLoader.setLoading(false);
      })
  };
  useEffect(() => {
    checkServicemanStatus();
    getTotalWalletBalance();
    setbookingList([]);
    getAllMyRequest();

    // Listen for new booking push notifications
    const handleNewBooking = (event: any) => {
      console.log('📬 New booking notification received on Dashboard:', event.detail);
      // Refresh the booking list
      getAllMyRequest();
      // Optionally show a toast
      // toast.info('New booking request received!');
    };

    window.addEventListener('newBookingReceived', handleNewBooking);

    return () => {
      window.removeEventListener('newBookingReceived', handleNewBooking);
    };
  }, []);
  const checkServicemanStatus = () => {
    ApiService.get("/servicemen/checkServicemanStatus").then((res: any) => {
      console.log(res);
      if (res.data.under_review == true) {
        setShowSuccessModal(true);
        setMessage(res.message);
      }
      if (res.data.profile_complete == true) {
        setProfile_complete(true);
      }
    });
  };
  const getServiceMenDetails = () => {
    ApiService.post("/servicemen/getServicemenDetails", {}).then((res: any) => {
      console.log(res);
      setServiceMenDetails(res.data);
    });
  };
  useEffect(() => {
    getServiceMenDetails();
  }, []);
  const AcceptCancelRequest = (
    booking_id: string,
    accepting_amount: string,
    action: string
  ) => {
    setButtonLoading({ id: booking_id, action });

    ApiService.post("/servicemen/respondToBooking", {
      booking_id,
      action,
      accepting_amount,
    })
      .then((res: any) => {
        toast.success(res.message);

        if (action === "accept") {
          setIsOrder(true);
          setOrderId(res.data?.booking_id);
          setRazorpayOrderId(res.data?.razorpay_order_id);
        } else {
          setbookingList([]);
          getAllMyRequest();
        }
      })
      .catch((err) => {
        toast.error(err.response.data.message);
      })
      .finally(() => {
        setButtonLoading({ id: "", action: "" });
      });
  };
  const handleSuccess = (response: any) => {
    console.log("Payment Success:", response);
    // e.g., verify payment on your server using response.razorpay_payment_id
    ApiService.post("/servicemen/verifyServicemanPayment", {
      razorpay_order_id: response.razorpay_order_id,
      razorpay_payment_id: response.razorpay_payment_id,
      razorpay_signature: response.razorpay_signature,
      booking_id: orderId,
    })
      .then((res: any) => {
        console.log(res.data);
        setLoading(false);
        setIsOrder(false);

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
    toast.error("Payment Failed");
    setLoading(false);
    setIsOrder(false);
  };
  const handleConfirm = () => {
    setShowSuccessModal(true);
    if (profile_complete) {
      localStorage.clear();
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
    } else {
      navigate("/editServicemen");
    }
  };
  return (
    <>
      <div className="container mb-5 pb-5">
        <div className="row px-2 pt-3 fixed_header">
          <div className="col-12 pt-2 " style={{ paddingLeft: "30px" }}>
            <h1 className="head4">
              Hello 👋{" "}
              {serviceMenDetails?.fname
                ? serviceMenDetails?.fname
                : serviceMenDetails?.phone_number}
            </h1>
            <p className="">Welcome to instasevak</p>
          </div>
        </div>

        <div className="row px-2 main-content">

          {/* Wallet Balance */}
          <div className="col-6 pt-2">
            <div className="cards5">
              <span className="ics bg_green">
                <CreditCard />
              </span>
              <p className="mb-1 font-12 mb-0 color-grey">Wallet Balance</p>

              <h3 className="font-18 mb-0" style={{ minHeight: "24px" }}>
                {/* Loader Only When API Is Loading */}
                {summaryLoader.loading ? (
                  <SectionLoader
                    show={true}
                    size="medium"
                    text=""
                    overlay={false}
                  />
                ) : (
                  <b>₹{totalWalletBalance}</b>
                )}
              </h3>
            </div>
          </div>

          {/* Total Bookings */}
          <div className="col-6 pt-2">
            <div className="cards5">
              <span className="ics bg_green">
                <ArrowUpRight />
              </span>
              <p className="mb-1 font-12 mb-0 color-grey">Total Bookings</p>

              <h3 className="font-18 mb-0" style={{ minHeight: "24px" }}>
                {summaryLoader.loading ? (
                  <SectionLoader
                    show={true}
                    size="medium"
                    text=""
                    overlay={false}
                  />
                ) : (
                  <b>{totalBookings}</b>
                )}
              </h3>
            </div>
          </div>
        </div>

        <div className="row px-2 pt-3 mt-1">
          <div className="col-12 pt-2">
            <h1 className="head4">Services Request</h1>
          </div>
        </div>

        <div className="row px-2">
          {/* Center loader for entire section */}
          <SectionLoader
            show={bookingListLoader.loading}
            size="large"
            text="Loading services..."
            overlay={true}
          />

          <div className="col-12 pt-2">
            <div className="tab-content" id="pills-tabContent">
              <div
                className="tab-pane fade show active"
                id="pills-home"
                role="tabpanel"
                aria-labelledby="pills-home-tab"
              >

                {/* Show No Booking only when loading is false */}
                {!bookingListLoader.loading && bookingList.length === 0 && (
                  <div className="cards5 mb-2 text-center" style={{ marginTop: "20px" }}>
                    <h2 className="mb-0 font-14">No Booking Found</h2>
                  </div>
                )}

                {/* Show booking list only after loader stops */}
                {!bookingListLoader.loading &&
                  bookingList.map((booking: any) => (
                    <div className="cards5 mb-2" key={booking.booking_id}>
                      <div
                        onClick={() =>
                          navigate("/customerprojectinfo/" + booking.booking_id)
                        }
                        className="d-flex align-items-center border-bottom pb-3 justify-content-between"
                      >
                        <h2 className="mb-0 font-14">{booking.service_name}</h2>
                        <p
                          className="color-yellow font-12 mb-0"
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
                          Scheduled for {dayjs(booking.booking_date).format("DD MMM")}
                        </div>
                        <div className="d-flex align-items-center gap-10 font-12 color-grey">
                          <Clock size={14}></Clock>
                          {booking.booking_time}
                        </div>
                      </div>

                      <div
                        className="d-flex justify-content-between pt-3"
                        onClick={() =>
                          navigate("/customerprojectinfo/" + booking.booking_id)
                        }
                      >
                        <div className="d-flex align-items-center gap-10 font-12 color-grey">
                          <MapPin size={14}></MapPin>
                          Distance {booking.distance}
                        </div>
                        <div className="d-flex align-items-center gap-10 font-12 color-grey">
                          <Clock size={14}></Clock>
                          {booking.duration}
                        </div>
                      </div>

                      <div
                        className="d-flex justify-content-between pt-3"
                        onClick={() => navigate("/customerprojectinfo/" + booking.booking_id)}
                      >
                        <div className="d-flex align-items-center gap-10 font-12 color-grey">
                          <Calendar size={14} />
                          Booked on {dayjs(booking.booked_on).format("DD MMM YYYY")}
                        </div>

                        <div className="d-flex align-items-center gap-10 font-12 color-grey">
                          <Clock size={14} />
                          {dayjs(booking.booked_on).format("hh:mm A")}
                        </div>
                      </div>

                      <div className="pt-3">
                        <button
                          className="canreq"
                          disabled={
                            buttonLoading.id === booking.booking_id &&
                            buttonLoading.action === "reject"
                          }
                          onClick={() => {
                            settotalAmount(booking.accepting_fee);
                            AcceptCancelRequest(
                              booking.booking_id,
                              booking.accepting_fee,
                              "reject"
                            );
                          }}
                        >
                          {buttonLoading.id === booking.booking_id &&
                            buttonLoading.action === "reject"
                            ? "Cancelling..."
                            : "Cancel Request"}
                        </button>

                        <button
                          className="accreq"
                          disabled={
                            buttonLoading.id === booking.booking_id &&
                            buttonLoading.action === "accept"
                          }
                          onClick={() => {
                            settotalAmount(booking.accepting_fee);
                            AcceptCancelRequest(
                              booking.booking_id,
                              booking.accepting_fee,
                              "accept"
                            );
                          }}
                        >
                          {buttonLoading.id === booking.booking_id &&
                            buttonLoading.action === "accept"
                            ? "Accepting..."
                            : "Accept Request"}
                        </button>
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
                ...
              </div>

              <div
                className="tab-pane fade"
                id="cancel"
                role="tabpanel"
                aria-labelledby="pills-contact-tab"
              >
                ...
              </div>
            </div>
          </div>
        </div>

        <div className="row px-2 pt-3">
          <div className="col-12">
            <button className="fill" onClick={() => navigate("/bookinghistory")}>
              View Booking History
            </button>
          </div>
        </div>

        {isOrder && (
          <RazorpayPayment
            orderId={razorpayOrderId}
            amount={totalAmount * 100}
            name={serviceMenDetails?.fname + " " + serviceMenDetails?.lname}
            email={serviceMenDetails?.email}
            contact={serviceMenDetails?.phone_number}
            onSuccess={handleSuccess}
            onFailure={handleFailure}
          />
        )}
      </div>

      <SuccessConfirmModal
        show={showSuccessModal}
        onCancel={() => setShowSuccessModal(true)}
        onConfirm={handleConfirm}
        loading={loading}
        itemName={
          serviceMenDetails?.fname
            ? serviceMenDetails?.fname + " " + serviceMenDetails?.lname
            : serviceMenDetails.country_code + "" + serviceMenDetails?.phone_number
        }
        title=" 🥳 Thanks for joining Instasevak"
        description={message}
        confirmLabel={profile_complete ? "Logout" : "Edit Profile"}
      />
    </>
  );
};

export default Dashboard;
