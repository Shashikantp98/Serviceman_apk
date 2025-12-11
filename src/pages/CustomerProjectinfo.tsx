import { Check, MapPin, User } from "react-feather";

import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import ApiService from "../services/api";
import dayjs from "dayjs";
import CommonHeader from "../components/CommonHeader";
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
  return (
    <>
      <CommonHeader customBack={customBack} />
      {bookingDetailsLoader.loading && (
        <div className="full-page-loader">
          <div className="loader-spinner"></div>
          <p>Loading request details...</p>
        </div>
      )}
      <div className=" main-content-service2">
        <div className="pt-4 pb-0 ">

          <div className="px-3">
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
                    <p className="mb-1 font-12 color-grey">Servicemen</p>
                    <p className="mb-0 mb-0 font-14">
                      {bookingDetails?.servicemen_name}
                    </p>
                    <p className="mb-0 mb-0 font-14">
                      {bookingDetails?.servicemen_phone}
                    </p>
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
                  <p className="font-14">Booking Cost</p>
                </div>
                <div className="col-6">
                  <p className="font-14 text-right">
                    ₹{bookingDetails?.booking_amount}
                  </p>
                </div>
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
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default CustomerProjectinfo;
