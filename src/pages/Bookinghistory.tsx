import { Calendar, Clock, MapPin } from "react-feather";
import ApiService from "../services/api";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { toast } from "react-toastify";
import ServiceManHeader from "../components/ServiceManHeader";
import SectionLoader from "../components/SectionLoader";
import { useSectionLoader } from "../utils/useSectionLoader";

const Bookinghistory = () => {
  const navigate = useNavigate();
  const [bookingList, setbookingList] = useState<any>([]);
  const [booking_status, setbooking_status] = useState("in_progress");

  const bookingListLoad = useSectionLoader("booking-list");

  const [activeBookingId, setActiveBookingId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeAction, setActiveAction] =
    useState<"cancel" | "complete" | null>(null);

  // Fetch bookings
  const getAllMyRequest = () => {
    bookingListLoad.setLoading(true);

    ApiService.post("/servicemen/listBookingsOfServiceman", {
      filters: { booking_status },
      sorters: { created_on: -1 },
      pagination: { page: 1, pageSize: 50 },
    })
      .then((res: any) => {
        setbookingList(res.data.list);
      })
      .catch((err) => {
        console.log("Error fetching bookings of serviceman", err);
      })
      .finally(() => {
        bookingListLoad.setLoading(false);
      });
  };

  useEffect(() => {
    setbookingList([]);
    getAllMyRequest();
  }, [booking_status]);

  interface ApiResponse<T = any> {
    status: number;
    message: string;
    data: T;
  }

  // Cancel API
  const AcceptCancelRequest = (booking_id: string) => {
    setActiveBookingId(booking_id);
    setActiveAction("cancel");
    setActionLoading(true);

    ApiService.post("/servicemen/cancelBookingByServiceman", { booking_id })
      .then((res) => {
        const response = res as ApiResponse;
        toast.success(response.message);
        getAllMyRequest();
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || "Error");
      })
      .finally(() => {
        setActionLoading(false);
        setActiveBookingId(null);
      });
  };

  // STATUS CLASS FUNCTION
  const getStatusClass = (status: string) => {
    if (booking_status === "cancelled") return "status-cancelled"; // Always red in Cancelled tab

    switch (status) {
      case "completed":
        return "status-completed";
      case "cancelled":
        return "status-cancelled";
      default:
        return "status-pending";
    }
  };

  return (
    <>
      <ServiceManHeader title="Booking History" />

      <div className="container mb-5 pb-5 main-content-service">
        <div className="row px-2 pt-3 mt-1"></div>

        {/* Tabs */}
        <div className="row px-2">
          <div className="col-12 pt-2">
            <ul className="nav nav-pills mb-3 border-bottom">
              <li className="nav-item">
                <button
                  onClick={() => setbooking_status("in_progress")}
                  className={`nav-link ${
                    booking_status === "in_progress" ? "active" : ""
                  }`}
                  type="button"
                >
                  In Progress
                </button>
              </li>

              <li className="nav-item">
                <button
                  onClick={() => setbooking_status("completed")}
                  className={`nav-link ${
                    booking_status === "completed" ? "active" : ""
                  }`}
                  type="button"
                >
                  Completed
                </button>
              </li>

              <li className="nav-item">
                <button
                  onClick={() => setbooking_status("cancelled")}
                  className={`nav-link ${
                    booking_status === "cancelled" ? "active" : ""
                  }`}
                  type="button"
                >
                  Cancelled
                </button>
              </li>
            </ul>

            <SectionLoader
              show={bookingListLoad.loading}
              size="medium"
              text="Loading your requests..."
              overlay={true}
            />

            {/* ================= TAB CONTENT ================= */}
            <div className="tab-content">

              {/* EMPTY LIST */}
              {!bookingListLoad.loading && bookingList.length === 0 && (
                <div className="cards5 mb-2">
                  <div className="d-flex align-items-center border-bottom pb-3 justify-content-between">
                    <h2 className="mb-0 font-14">No Booking Found</h2>
                  </div>
                </div>
              )}

              {/* LISTING */}
              {bookingList.map((booking: any) => (
                <div className="cards5 mb-2" key={booking.booking_id}>
                  <div
                    onClick={() =>
                      navigate("/projectinfo/" + booking.booking_id)
                    }
                    className="d-flex align-items-center border-bottom pb-3 justify-content-between"
                  >
                    <h2 className="mb-0 font-14">{booking.service_name}</h2>

                    {/* STATUS BADGE */}
                    <p
                      className={`${getStatusClass(
                        booking.booking_status
                      )} font-12 mb-0`}
                      style={{ textTransform: "capitalize" }}
                    >
                      {booking_status === "cancelled"
                        ? "cancelled"
                        : booking.booking_status}
                    </p>
                  </div>

                  {/* DATE */}
                  <div
                    className="d-flex justify-content-between pt-3"
                    onClick={() =>
                      navigate("/projectinfo/" + booking.booking_id)
                    }
                  >
                    <div className="d-flex align-items-center gap-10 font-12 color-grey">
                      <Calendar size={14} />
                      Scheduled for {dayjs(booking.booking_date).format("DD MMM")}
                    </div>
                    <div className="d-flex align-items-center gap-10 font-12 color-grey">
                      <Clock size={14} />
                      {booking.booking_time}
                    </div>
                  </div>

                  {/* DISTANCE */}
                  <div
                    className="d-flex justify-content-between pt-3"
                    onClick={() =>
                      navigate("/projectinfo/" + booking.booking_id)
                    }
                  >
                    <div className="d-flex align-items-center gap-10 font-12 color-grey">
                      <MapPin size={14} />
                      Distance {booking.distance}
                    </div>
                    <div className="d-flex align-items-center gap-10 font-12 color-grey">
                      <Clock size={14} />
                      {booking.duration}
                    </div>
                  </div>

                  {/* ACTION BUTTONS — ONLY FOR IN_PROGRESS */}
                  {booking_status === "in_progress" && (
                    <div className="pt-3">
                      {/* Cancel */}
                      <button
                        className="canreq"
                        disabled={
                          actionLoading &&
                          activeBookingId === booking.booking_id
                        }
                        onClick={() =>
                          AcceptCancelRequest(booking.booking_id)
                        }
                      >
                        {actionLoading &&
                        activeBookingId === booking.booking_id &&
                        activeAction === "cancel"
                          ? "Cancelling..."
                          : "Cancel Request"}
                      </button>

                      {/* Complete */}
                      <button
                        className="accreq"
                        disabled={
                          actionLoading &&
                          activeBookingId === booking.booking_id
                        }
                        onClick={() => {
                          setActiveBookingId(booking.booking_id);
                          setActiveAction("complete");
                          navigate("/capture/" + booking.booking_id);
                        }}
                      >
                        {actionLoading &&
                        activeBookingId === booking.booking_id &&
                        activeAction === "complete"
                          ? "Completing..."
                          : "Complete"}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Bookinghistory;
