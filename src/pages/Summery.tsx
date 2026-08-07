import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import ApiService from "../services/api";
import Date from "./Date";
import Address from "./Address";
import { RazorpayPayment } from "../components/RazorpayPayment";
import { useAuth } from "../contexts/AuthContext";
import CommonHeader from "../components/CommonHeader";
import Loader from "../components/Loader";
import { useSectionLoader } from "../utils/useSectionLoader";

const toNumber = (value: any) => Number(value) || 0;

const Summery = () => {
  const { latitude, longitude } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();

  const [serviceDetails, setServiceDetails] = useState<any>({});
  const [selectedPricing, setSelectedPricing] = useState<any>(null);
  const [paymentSummery, setPaymentSummery] = useState<any>({
    price: 0,
    itemTotal: 0,
    baseDiscount: 0,
    couponDiscount: 0,
    taxAmount: 0,
    totalAmount: 0,
    bookingFeeAmount: 0,
    remainingAmount: 0,
    customerTotalAmount: 0,
  });

  const [coupons, setCoupons] = useState<any[]>([]);
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

  const pageLoader = useSectionLoader("summery-page");

  const buildBaseSummary = (pricing: any, service: any) => {
    const basePrice = toNumber(pricing?.price || service?.price);
    const finalPrice = toNumber(
      pricing?.final_price || pricing?.price || service?.final_price || service?.price
    );
    const taxAmount = toNumber(pricing?.tax_amount ?? service?.tax_amount);
    const baseDiscount = basePrice > finalPrice ? basePrice - finalPrice : 0;

    return {
      price: basePrice,
      itemTotal: finalPrice,
      baseDiscount,
      couponDiscount: 0,
      taxAmount,
      totalAmount: finalPrice + taxAmount,
    };
  };

  const recalcTotal = (itemTotal: number, couponDiscount: number, taxAmount: number) => {
    return Math.max(itemTotal - couponDiscount + taxAmount, 0);
  };

  const handlePricingSelect = (pricing: any) => {
    setSelectedPricing(pricing);
    setCouponCode("");

    const summary = buildBaseSummary(pricing, serviceDetails);

    setPaymentSummery((prev: any) => ({
      ...prev,
      ...summary,
    }));

    setCoupons((prev) =>
      prev.map((c) => ({
        ...c,
        isCouponApplied: false,
      }))
    );
  };

  useEffect(() => {
    if (!id) return;

    pageLoader.setLoading(true);
    getCoupons();
    getProfileDetails();

    ApiService.post(`/user/serviceDetails`, {
      service_id: id,
      latitude: Number(latitude),
      longitude: Number(longitude),
    })
      .then((res: any) => {
        const service = res.data?.data || res.data || {};
        setServiceDetails(service);

        const defaultPricing = service?.pricing?.[0] || service;
        setSelectedPricing(defaultPricing);

        const summary = buildBaseSummary(defaultPricing, service);

        setPaymentSummery((prev: any) => ({
          ...prev,
          ...summary,
        }));
      })
      .catch((err: any) => {
        console.log(err);
      })
      .finally(() => {
        pageLoader.setLoading(false);
      });
  }, [id]);

  const getProfileDetails = () => {
    ApiService.post("/user/getCustomerDetails")
      .then((res: any) => {
        setProfileDetails(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const getCoupons = () => {
    ApiService.post("/user/listCouponsForUser", {})
      .then((res: any) => {
        const coupons = res.data.list.map((element: any) => ({
          ...element,
          isCouponApplied: false,
        }));
        setCoupons(coupons);
      })
      .catch((err: any) => {
        console.log(err);
      });
  };

  const applyCoupon = (coupon: any, index: number) => {
    const serviceCharge = toNumber(paymentSummery?.itemTotal);
    const taxAmount = toNumber(paymentSummery?.taxAmount);

    ApiService.post("/user/userApplyCouponForBooking", {
      coupon_code: coupon.coupon_code,
      service_charge: serviceCharge,
      tax_and_other_charges: taxAmount,
    })
      .then((res: any) => {
        const bill = res.data?.bill_details || {};
        const couponDiscount = toNumber(bill.discount);
        const subtotal = toNumber(bill.subtotal);
        const tax = toNumber(bill.tax_and_other_charges);
        const total = toNumber(bill.grand_total) || recalcTotal(subtotal, couponDiscount, tax);

        setPaymentSummery((prev: any) => ({
          ...prev,
          itemTotal: subtotal,
          couponDiscount: couponDiscount,
          taxAmount: tax,
          totalAmount: total,
        }));

        setCouponCode(coupon.coupon_code);

        setCoupons((prev: any[]) =>
          prev.map((c, i) => ({
            ...c,
            isCouponApplied: i === index,
          }))
        );
      })
      .catch((err: any) => {
        console.log(err);
        alert(err.response?.data?.message || "Coupon apply failed");
      });
  };

  const removeCoupon = () => {
    setCouponCode("");

    setCoupons((prev: any[]) =>
      prev.map((c) => ({
        ...c,
        isCouponApplied: false,
      }))
    );

    const pricingForSummary = selectedPricing || (serviceDetails?.pricing || [])[0] || serviceDetails;
    const summary = buildBaseSummary(pricingForSummary, serviceDetails);

    setPaymentSummery((prev: any) => ({
      ...prev,
      ...summary,
    }));
  };

  const handleDateTimeSelect = (date: string, time: string, note: string) => {
    setLoading(true);
    setBookingDate(date);
    setBookingTime(time);

    const isCOD = payment_type === "cash_on_delivery";

    ApiService.post("/user/userCreateBooking", {
      address_id: address,
      service_id: id,
      booking_date: date,
      booking_time: time,
      job_description: note,
      booking_fee: serviceDetails?.booking_fee,
      service_charge: paymentSummery?.itemTotal,
      tax_and_other_charges: paymentSummery?.taxAmount,
      payment_method: isCOD ? "cod" : "online",
      payment_type: payment_type,
      coupon_code: couponCode,
    })
      .then((res: any) => {
        setLoading(false);

        setPaymentSummery((prev: any) => ({
          ...prev,
          bookingFeeAmount: toNumber(res.data?.booking_fee_amount),
          remainingAmount: toNumber(res.data?.remaining_amount),
          customerTotalAmount: toNumber(res.data?.customer_total_amount),
        }));

        if (isCOD) {
          navigate("/succcess", {
            state: {
              name:
                profileDetails?.customer?.fname +
                " " +
                profileDetails?.customer?.lname,
              service_name: serviceDetails?.service_name,
              booking_date: date,
              booking_time: time,
            },
          });
        } else {
          setOrderId(res.data?.booking_id);
          setRazorpayOrderId(res.data?.razorpay_order_id);
          setIsOrder(true);
        }
      })
      .catch((err: any) => {
        console.log(err);
        setLoading(false);
      });
  };

  const handleSuccess = (response: any) => {
    setIsVerifying(true);

    ApiService.post("/user/verifyBookingPayment", {
      razorpay_order_id: response.razorpay_order_id,
      razorpay_payment_id: response.razorpay_payment_id,
      razorpay_signature: response.razorpay_signature,
      booking_id: orderId,
    })
      .then(() => {
        setIsOrder(false);
        setRazorpayOrderId("");

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
        alert(
          "Payment verification failed: " +
            (err.response?.data?.message || err.message)
        );
      });
  };

  const handleFailure = (response: any) => {
    console.log("Payment Cancelled or Failed:", response);
    alert("Payment Failed");
    setLoading(false);
    setIsOrder(false);
  };

  const handleAddressSelect = (address: string) => {
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

      {pageLoader.loading && (
        <div className="full-page-loader">
          <div className="loader-spinner"></div>
          <p>Loading service details...</p>
        </div>
      )}

      <div className="container mb-5 pb-5 main-content-service">
        <div className="row px-2">
          <div className="col-12">
            <h6 className="pt-4 pb-2">Selected Service</h6>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <img
                src={serviceDetails?.service_image_url}
                style={{
                  width: "100%",
                  maxHeight: "300px",
                  objectFit: "cover",
                  borderRadius: "8px",
                }}
                alt={serviceDetails?.service_name || "service"}
              />
              <div className="sum_det">
                <h6 className="mb-1">{serviceDetails?.service_name}</h6>
                <p
                  className="font-12 color-grey mb-0"
                  dangerouslySetInnerHTML={{
                    __html: serviceDetails?.description,
                  }}
                ></p>

                <div className="mt-3">
                  <h6>Select Duration</h6>
                  {serviceDetails?.pricing?.length ? (
                    serviceDetails.pricing.map((pricing: any, index: number) => (
                      <div
                        key={index}
                        className="d-flex align-items-center justify-content-between border rounded p-2 mb-2"
                      >
                        <div className="d-flex align-items-center gap-2">
                          <input
                            type="radio"
                            name="pricing"
                            checked={selectedPricing?.duration === pricing?.duration}
                            onChange={() => handlePricingSelect(pricing)}
                          />
                          <div>
                            <p className="mb-0">
                              <strong>{pricing.duration}</strong>
                            </p>
                            <small>₹{pricing.final_price || pricing.price}</small>
                          </div>
                        </div>
                        {pricing.discount_percent > 0 && (
                          <span className="badge bg-success">
                            {pricing.discount_percent}% OFF
                          </span>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="d-flex align-items-center justify-content-between border rounded p-2 mb-2">
                      <div className="d-flex align-items-center gap-2">
                        <input type="radio" name="pricing" checked readOnly />
                        <div>
                          <p className="mb-0">
                            <strong>{serviceDetails?.duration}</strong>
                          </p>
                          <small>₹{serviceDetails?.final_price || serviceDetails?.price}</small>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <p className="font-12 color-grey">
                  ₹{serviceDetails?.booking_fee} will be charged for generate request.
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
                        onClick={() =>
                          coupon.isCouponApplied
                            ? removeCoupon()
                            : applyCoupon(coupon, index)
                        }
                      >
                        {coupon.isCouponApplied ? "Remove" : "Apply"}
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
                  ₹{paymentSummery?.price}
                </p>
              </div>

              <div className="d-flex align-items-center justify-content-between">
                <p className="font-12 my-2">Base discount</p>
                <p className="font-12 my-2 color-grey text-right">
                  ₹{paymentSummery?.baseDiscount}
                </p>
              </div>

              <div className="d-flex align-items-center justify-content-between">
                <p className="font-12 my-2">Coupon discount</p>
                <p className="font-12 my-2 color-grey text-right">
                  ₹{paymentSummery?.couponDiscount}
                </p>
              </div>

              <div className="d-flex align-items-center justify-content-between">
                <p className="font-12 my-2">Tax and fee</p>
                <p className="font-12 my-2 color-grey text-right">
                  ₹{paymentSummery?.taxAmount}
                </p>
              </div>

              <div className="d-flex align-items-center justify-content-between">
                <p className="font-14 my-2">Amount to pay</p>
                <p className="font-14 my-2 color-grey text-right">
                  ₹{paymentSummery?.totalAmount}
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
                : "Book service @ ₹" + (serviceDetails?.booking_fee_amount || "")}
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
          <Address onSelect={handleAddressSelect} service_id={id} onExit={handleExit} />
        )}
        {steps === 3 && <Date onSelect={handleDateTimeSelect} onExit={handleExit} />}

        {isOrder && razorpayOrderId && (
          <RazorpayPayment
            orderId={razorpayOrderId}
            amount={paymentSummery?.totalAmount * 100}
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