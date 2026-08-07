import { Check, MapPin, User } from "react-feather";

import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import ApiService from "../services/api";
import dayjs from "dayjs";
// import CommonHeader from "../components/CommonHeader";
import { useSectionLoader } from "../utils/useSectionLoader";
import Review from "./Review";
import { useLocation, useNavigate } from "react-router-dom";

const CustomerProjectinfo = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  //   const navigate = useNavigate();
  const [bookingDetails, setBookingDetails] = useState<any>({});

  // Loader for booking details
  const bookingDetailsLoader = useSectionLoader("booking-details");

  const customBack = () => {
    if (location?.state?.fromNotifications) {
      navigate("/notifications", {
        state: {
          scrollPosition: location.state.scrollPosition,
          itemIndex: location.state.itemIndex
        }
      });
    } else {
      navigate(-1);
    }
  };

  const handleShare = async () => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    const appLink = isIOS
      ? "https://apps.apple.com/in/app/instasevak/id6754757689"
      : "https://play.google.com/store/apps/details?id=com.instasevak.sevak";
    const message = `🎉 I just got my ${bookingDetails?.service_name} service done through InstaSevak! Book trusted home services easily.`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "InstaSevak - Home Services App",
          text: message,
          url: appLink,
        });
      } catch (err) {
        // User cancelled or error — do nothing
      }
    } else {
      // Fallback: open WhatsApp web
      window.open(`https://wa.me/?text=${encodeURIComponent(message + " " + appLink)}`, "_blank");
    }
  };

  const getRequestDetails = () => {
    bookingDetailsLoader.setLoading(true);
    ApiService.post("/user/userBookingDetails", { booking_id: id })
      .then((res: any) => {
        console.log(res);
        setBookingDetails(res.data);
      })
      .catch((err: any) => {
        console.log(err);
      })
      .finally(() => {
        bookingDetailsLoader.setLoading(false);
      })
  };
  useEffect(() => {
    getRequestDetails();
  }, [id]);

  const handleViewInvoices = () => {
    const bookingId = bookingDetails?.booking_id || id;
    if (!bookingId) return;
    navigate(`/invoices/${bookingId}`, { state: { booking_id: bookingId } });
  };

  return (
    <>
      {/* <CommonHeader customBack={customBack} /> */}
      <div className="px-3 pt-5 mt-4">
        <button className="back_btn_new" onClick={customBack}>Back</button>
      </div>
      {bookingDetailsLoader.loading && (
        <div className="full-page-loader">
          <div className="loader-spinner"></div>
          <p>Loading request details...</p>
        </div>
      )}
      <div className=" ">
        <div className="pt-0 pb-0 ">

          <div className="px-3 mt-5">
            <div className="cards5 ">
              <p className="font-14 mb-2 ">Project Details</p>

              <div className="pt-2 pb-2">
                <h5 className="head5">
                  <b>{bookingDetails?.service_name}</b>
                </h5>
                <p className="mb-0 font-14 color-blue">
                  Booking ID: {bookingDetails?.bkng_id}
                </p>
              </div>
              <div className="">
                <div className="d-flex  align-items-center  gap-1 pb-2 pt-1">
                  <MapPin size={14}></MapPin>
                  <p className="m-0 font-14 ">Location</p>
                </div>

                <p className="mb-0 font-14">
                  {bookingDetails?.address?.street_1},{" "}
                  {bookingDetails?.address?.city},{bookingDetails?.address?.state},{" "}
                  {bookingDetails?.address?.zip}
                </p>
              </div>





            </div>
          </div>
          <div className="px-3 pt-3">
            <div className="cards5">
              <p className="font-14 mb-0">
                The request will start -{" "}
                {dayjs(bookingDetails?.date).format("dddd, MMMM D YYYY")} @{" "}
                {bookingDetails?.booking_time}
              </p>

            </div>
          </div>



        </div>





        <div className="container pb-10">
          <div className="row px-1 pt-3">
            <div className="col-12">
              <div className="cards5">

                <b className="mb-1 font-14 color-grey">Job Description</b>
                <p className="mb-0 font-14">
                  {bookingDetails?.job_description || "No description provided"}
                </p>



                <h5 className="font-14 pt-2">Your request has been booked!</h5>
                {bookingDetails?.booking_status === "cancelled" ? (
                  <p className="font-14 text-danger ">
                    Your request has been cancelled!
                  </p>
                ) : (
                  <div className="   ">
                    {bookingDetails?.booking_status_timeline &&
                      bookingDetails?.booking_status_timeline.map((item: any, index: number) => (
                        <div
                          key={index}
                          className={"chk " + (item?.timestamp ? "active" : "")}
                        >
                          <span>
                            <Check />
                          </span>
                          <div>
                            {item.status}
                            {/* Optional time display */}
                            {item.timestamp && (
                              <p className="font-12 text-muted mb-0 mt-1">
                                {dayjs(item.timestamp).format("MMM D, h:mm A")}
                              </p>
                            )}</div>
                        </div>
                      ))}
                  </div>
                )}
                <p className="font-12">
                  You booked this request on{" "}
                  {dayjs(bookingDetails?.date).format("dddd, MMMM D YYYY")} for{" "}
                  {bookingDetails?.booking_time}
                </p>
              </div>
            </div>
            <div className="col-12 pt-3">
              <h4 className="font-16">Service Details</h4>
            </div>
            <div className="col-12 pt-1">
              <div className="cards5">
                <div className="d-flex gap-10 align-items-center">
                  <User size={20}></User>
                  {bookingDetails?.service_name}
                </div>
                <div className="row">
                  <div className="col-6 pt-3">
                    <p className="mb-1 font-12 color-grey">Date</p>
                    <p className="mb-0 mb-0 font-14">
                      {dayjs(bookingDetails?.date).format("dddd, MMMM D YYYY")}
                    </p>
                  </div>
                  <div className="col-6 pt-3">
                    <p className="mb-1 font-12 color-grey">Start time</p>
                    <p className="mb-0 mb-0 font-14">
                      {bookingDetails?.booking_time}
                    </p>
                  </div>
                  <div className="col-12 pt-3">
                    <b><p className="mb-1 font-14 color-grey">Servicemen</p>
                      <p className="mb-0 mb-0 font-15">
                        {bookingDetails?.servicemen_name}
                      </p>
                      <p className="mb-0 mb-0 font-15">
                        {bookingDetails?.servicemen_phone}
                      </p></b>
                  </div>
                  <div className="col-12 pt-3">
                    <p className="mb-1 font-12 color-grey">Address</p>
                    <p className="mb-0 mb-0 font-14">
                      {bookingDetails?.address?.street_1},{" "}
                      {bookingDetails?.address?.city},{" "}
                      {bookingDetails?.address?.state},{" "}
                      {bookingDetails?.address?.zip}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-12 pt-3 pb-3">
              <div className="row px-1">
                <div className="col-6">
                  <b><p className="font-14">Booking Cost</p></b>
                </div>
                <div className="col-6">
                  <b><p className="font-14 text-right">
                    ₹{bookingDetails?.booking_amount}
                  </p></b>
                </div>
              </div>
              <div className="pt-2">
                <button className="fill w-100" onClick={handleViewInvoices}>
                  View Invoices
                </button>
              </div>
            </div>

            {/* Review Section - Show only when booking status is completed */}
            {bookingDetails?.booking_status === "completed" && (
              <div className="col-12 pt-2">
                <Review
                  booking_id={bookingDetails?.booking_id}
                  service_id={bookingDetails?.service_id}
                  onSubmitSuccess={() => {
                    // Optional: Refresh booking details after successful review submission
                    getRequestDetails();
                  }}
                />
                <button
                  onClick={handleShare}
                  style={{
                    width: "100%",
                    backgroundColor: "#283891",
                    color: "#fff",
                    border: "none",
                    borderRadius: "10px",
                    padding: "12px 16px",
                    fontSize: "14px",
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    cursor: "pointer",
                    marginTop: "16px",
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="18" cy="5" r="3" />
                    <circle cx="6" cy="12" r="3" />
                    <circle cx="18" cy="19" r="3" />
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                  </svg>
                  Share App
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default CustomerProjectinfo;
