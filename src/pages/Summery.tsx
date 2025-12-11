import { useNavigate } from "react-router-dom";
import { useState } from "react";
import ApiService from "../services/api";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import Date from "./Date";
import Address from "./Address";
import { RazorpayPayment } from "../components/RazorpayPayment";
import { useAuth } from "../contexts/AuthContext";
import CommonHeader from "../components/CommonHeader";
import Loader from "../components/Loader"; // import the Loader

const Summery = () => {
  const { latitude, longitude } = useAuth();
  const navigate = useNavigate();
  const [serviceDetails, setServiceDetails] = useState<any>({});
  const [paymentSummery, setPaymentSummery] = useState<any>({
    itemTotal: serviceDetails?.price,
    discount: 0,
    taxAmount: serviceDetails?.tax_amount,
    totalAmount: serviceDetails?.price + serviceDetails?.tax_amount,
  });
  const { id } = useParams();
  const [coupons, setCoupons] = useState<any>([]);
  const [steps, setSteps] = useState(1);
  const [address, setAddress] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [razorpayOrderId, setRazorpayOrderId] = useState("");
  const [isOrder, setIsOrder] = useState(false);
  const [profileDetails, setProfileDetails] = useState<any>({});
  const [payment_type, setpayment_type] = useState("");
  const [booking_date, setBookingDate] = useState("");
  const [booking_time, setBookingTime] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    if (id) {
      getCoupons();
      getProfileDetails();
      ApiService.post(`/user/serviceDetails`, {
        service_id: id,
        latitude: Number(latitude),
        longitude: Number(longitude),
      })
        .then((res: any) => {
          console.log(res);
          setServiceDetails(res.data);
          setPaymentSummery({
            itemTotal: res.data.offer_price
              ? res.data.offer_price
              : res.data.price,
            discount: res.data.offer_price
              ? res.data.price - res.data.offer_price
              : 0,
            taxAmount: res.data.tax_amount,
            totalAmount: res.data.offer_price
              ? res.data.offer_price + res.data.tax_amount
              : res.data.price + res.data.tax_amount,
          });
        })
        .catch((err: any) => {
          console.log(err);
        });
    }
  }, [id]);

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
  const getCoupons = () => {
    ApiService.post("/user/listCouponsForUser", {})
      .then((res: any) => {
        console.log(res);
        var coupons = [];
        for (let i = 0; i < res.data.list.length; i++) {
          const element = res.data.list[i];
          element.isCouponApplied = false;
          coupons.push(element);
        }
        setCoupons(coupons);
      })
      .catch((err: any) => {
        console.log(err);
      });
  };
  const applyCoupon = (coupon: any, index: number) => {
    ApiService.post("/user/userApplyCouponForBooking", {
      coupon_code: coupon.coupon_code,
      service_charge: serviceDetails?.price,
      tax_and_other_charges: serviceDetails?.tax_amount,
    })
      .then((res: any) => {
        console.log(res);
        setPaymentSummery({
          itemTotal: res.data?.bill_details?.subtotal,
          discount: res.data?.bill_details?.discount,
          taxAmount: res.data?.bill_details?.tax_and_other_charges,
          totalAmount: res.data?.bill_details?.grand_total,
        });
        setCouponCode(coupon.coupon_code);
        setCouponCode(coupon.coupon_code);

        const updatedCoupons = coupons.map((c: any, i: number) => ({
          ...c,
          isCouponApplied: i === index,
        }));

        setCoupons(updatedCoupons);
      })
      .catch((err: any) => {
        console.log(err);
      });
  };
  const handleDateTimeSelect = (date: string, time: string, note: string) => {
    console.log("Selected:", date, time, note);
    // setSteps(1);
    setLoading(true);
    setBookingDate(date);
    setBookingTime(time);
    ApiService.post("/user/userCreateBooking", {
      address_id: address,
      service_id: id,
      booking_date: date,
      booking_time: time,
      job_description: note,
      booking_fee: serviceDetails?.booking_fee,
      service_charge: paymentSummery?.itemTotal,
      tax_and_other_charges: paymentSummery?.taxAmount,
      booking_amount: paymentSummery?.totalAmount,
      payment_method: "online",
      payment_type: payment_type,
      coupon_code: couponCode,
    })
      .then((res: any) => {
        console.log(res);
        setLoading(false);
        setOrderId(res.data?.booking_id);
        setRazorpayOrderId(res.data?.razorpay_order_id);
        setIsOrder(true);
      })
      .catch((err: any) => {
        console.log(err);
        setLoading(false);
      });
  };
  const handleSuccess = (response: any) => {
    console.log("Payment Success:", response);

    // SHOW FULL PAGE LOADER
    setIsVerifying(true);

    ApiService.post("/user/verifyBookingPayment", {
      razorpay_order_id: response.razorpay_order_id,
      razorpay_payment_id: response.razorpay_payment_id,
      razorpay_signature: response.razorpay_signature,
      booking_id: orderId,
    })
      .then((res: any) => {
        console.log("Payment verification success:", res.data);

        setIsOrder(false);
        setRazorpayOrderId("");

        // WAIT 1.2 seconds so loader is visible clearly, then navigate
        setTimeout(() => {
          setIsVerifying(false);
          navigate("/succcess", {
            state: {
              name:
                profileDetails?.customer?.fname +
                " " +
                profileDetails?.customer?.lname,
              service_name: serviceDetails?.service_name,
              booking_date: booking_date,
              booking_time: booking_time,
            },
          });
        }, 1200);
      })
      .catch((err) => {
        console.log("Payment verification error:", err);
        setIsVerifying(false);
        setIsOrder(false);
        setRazorpayOrderId("");
        alert("Payment verification failed: " + (err.response?.data?.message || err.message));
      });
  };

  const handleFailure = (response: any) => {
    console.log("Payment Cancelled or Failed:", response);
    alert("Payment Failed");
    setLoading(false);
    setIsOrder(false);
  };
  const handleAddressSelect = (address: string) => {
    console.log("Selected:", address);
    setAddress(address);
    setSteps(3);
  };
  const handleExit = () => {
    setIsOrder(false);
    setRazorpayOrderId("");
    setSteps(1);
  };
  return (
    <>
      <Loader show={isVerifying} text="Please wait..." />
      <CommonHeader />
      {/* PAYMENT VERIFYING LOADER */}
      <div className="container mb-5 pb-5 main-content-service">
        <div className="row">
          <div className="col-12">
            <h6 className="pt-4 pb-2">Selected Service</h6>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <img
                src={serviceDetails?.service_image_url}
                style={{ width: "100%", maxHeight: "300px", objectFit: "cover", borderRadius: "8px" }}
              />
              <div className="sum_det">
                <h6 className="mb-1">{serviceDetails?.service_name}</h6>
                <p
                  className="font-12 color-grey mb-0"
                  dangerouslySetInnerHTML={{
                    __html: serviceDetails?.description,
                  }}
                ></p>
                <b className="font-12">
                  ₹
                  {serviceDetails?.offer_price
                    ? serviceDetails?.offer_price
                    : serviceDetails?.price}{" "}
                  - Duration : {serviceDetails?.duration}
                </b>
                <p className="font-12 color-grey">
                  ₹{serviceDetails?.booking_fee} will be charged for generate
                  request.
                </p>
              </div>
            </div>
          </div>
          <div className="col-12 mt-3">
            {!serviceDetails?.offer_price && (
              <div className="cou_cards">
                <div className="d-flex align-items-center justify-content-between">
                  <h6 className="head_cp mb-0 font-14">Coupons & offers</h6>
                  <b className="cblu font-14">{coupons.length} offers</b>
                </div>
                {coupons.length > 0 &&
                  coupons.map((coupon: any, index: number) => (
                    <div
                      className="d-flex mt-3 align-items-center justify-content-between"
                      key={coupon._id}
                    >
                      <div>
                        <h6 className="font-14 cblu mb-1">
                          {coupon.discount_name}
                        </h6>
                        <p
                          className="mb-0 font-12 color-grey"
                          dangerouslySetInnerHTML={{
                            __html: coupon.description,
                          }}
                        ></p>
                      </div>
                      <button
                        className="apbtn"
                        onClick={() => applyCoupon(coupon, index)}
                      >
                        {coupon.isCouponApplied ? "Applied" : "Apply"}
                      </button>
                    </div>
                  ))}
              </div>
            )}
            <div className="cou_cards mt-3">
              <h6 className="head_cp mb-0 font-14">Payments summary</h6>
              <div className="d-flex align-items-center justify-content-between">
                <p className="font-12 my-2">Item total</p>
                <p className="font-12 my-2 color-grey text-right">
                  ₹{paymentSummery?.itemTotal}{" "}
                </p>
              </div>
              {/* <div className="d-flex align-items-center justify-content-between">
                <p className="font-12 my-2">Booking Fees</p>
                <p className="font-12 my-2 color-grey text-right">
                  ₹{serviceDetails?.booking_fee}{" "}
                </p>
              </div> */}
              <div className="d-flex align-items-center justify-content-between">
                <p className="font-12 my-2">Discount </p>
                <p className="font-12 my-2 color-grey text-right">
                  ₹{paymentSummery?.discount}{" "}
                </p>
              </div>
              <div className="d-flex align-items-center justify-content-between">
                <p className="font-12 my-2">Tax and fee</p>
                <p className="font-12 my-2 color-grey text-right">
                  ₹{paymentSummery?.taxAmount}{" "}
                </p>
              </div>
              <div className="d-flex align-items-center justify-content-between">
                <p className="font-14 my-2">Amount to pay</p>
                <p className="font-14 my-2 color-grey text-right">
                  ₹{paymentSummery?.totalAmount}{" "}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="row pt-3">
          <div className="col-12">
            <button
              className="outline rfuls"
              onClick={() => {
                setpayment_type("booking_fee");
                setSteps(2);
              }}
            >
              {loading
                ? "Loading..."
                : "Book service @ ₹" +
                (serviceDetails?.booking_fee
                  ? serviceDetails?.booking_fee
                  : "")}
            </button>
          </div>
          <div className="col-12 pt-2">
            <button
              className="fill rfuls"
              onClick={() => {
                setpayment_type("full_payment");
                setSteps(2);
              }}
            >
              {loading ? "Loading..." : "Pay Complete Amount"}
            </button>
          </div>
        </div>
        {steps === 2 && (
          <Address
            onSelect={handleAddressSelect}
            service_id={id}
            onExit={handleExit}
          />
        )}
        {steps === 3 && (
          <Date onSelect={handleDateTimeSelect} onExit={handleExit} />
        )}
        {isOrder && razorpayOrderId && (
          <RazorpayPayment
            orderId={razorpayOrderId} // Replace with your server-created order ID
            amount={paymentSummery?.totalAmount * 100} // ₹500.00 in paise
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

export default Summery;
