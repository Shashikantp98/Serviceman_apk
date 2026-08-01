import { useParams } from "react-router-dom";
import ApiService from "../services/api";
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { LoginModal } from "../components/LoginModal";
// import { toast } from "react-toastify";
// import CommonHeader from "../components/CommonHeader";
import SectionLoader from "../components/SectionLoader";
import { useSectionLoader } from "../utils/useSectionLoader";
import dayjs from "dayjs";
// import { Check, Home, Search, Share, Shield, Star, X } from "react-feather";
import { Search } from "react-feather"; //Share

interface ReviewData {
  _id: string;
  rating: number;
  review: string;
  created_on: string;
  customer_id: {
    _id: string;
    fname: string;
    lname: string;
    profile_image: string;
  };
  booking_id: {
    _id: string;
    bkng_id: string;
    booking_date: string;
  };
}

const Servicedetail = () => {
  const navigate = useNavigate();
  const { logout, latitude, longitude } = useAuth();//token
  const [serviceDetails, setServiceDetails] = useState<any>(null);
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const reviewsRef = useRef<HTMLDivElement>(null);

  const serviceLoader = useSectionLoader("service-details");
  const reviewsLoader = useSectionLoader("reviews");

  const { id } = useParams();
  const [showLoginModal, setShowLoginModal] = useState(false);

  const priceBreakup = serviceDetails?.price_breakup || serviceDetails?.breakup || null;
  const hasPriceBreakup =
    !!priceBreakup &&
    [
      "booking_fee",
      "booking_fee_percent",
      "accepting_fee_amount",
      "accepting_fee_percent",
      "platform_share_amount",
      "platform_share_percent",
      "gst_amount",
      "gst_percent",
      "platform_net_amount",
      "base_price_amount",
      "remaining_amount",
    ].some((key) => priceBreakup?.[key] !== undefined && priceBreakup?.[key] !== null);

  const formatAmount2 = (value: any) => {
    const num = Number(value);
    return Number.isFinite(num) ? num.toFixed(2) : "--";
  };

  useEffect(() => {
    if (id) {
      serviceLoader.setLoading(true);
      ApiService.post(`/user/serviceDetails`, {
        service_id: id,
        latitude: Number(latitude),
        longitude: Number(longitude),
      })
        .then((res: any) => {
          setServiceDetails(res.data);
        })
        .catch((err: any) => {
          console.log(err);
        })
        .finally(() => {
          serviceLoader.setLoading(false);
        });
    }
  }, [id]);

  useEffect(() => {
    if (!id) return;
    const fetchReviews = async () => {
      reviewsLoader.setLoading(true);
      try {
        const response: any = await ApiService.post('/user/getServiceReviews', {
          service_id: id,
        });
        if (response?.data && Array.isArray(response.data)) {
          setReviews(response.data);
          if (response.data.length > 0) {
            const avgRating = response.data.reduce((sum: number, review: ReviewData) => sum + review.rating, 0) / response.data.length;
            setAverageRating(Math.round(avgRating * 10) / 10);
          }
        }
      } catch (err: any) {
        console.log('Error fetching reviews:', err);
      } finally {
        reviewsLoader.setLoading(false);
      }
    };
    fetchReviews();
  }, [id]);

  const handleBookNow = () => {
    navigate(`/summery/${serviceDetails?.service_id}`);
  };

  // const getRatingEmoji = (rating: number) => {
  //   const emojiMap: { [key: number]: string } = { 1: '😡', 2: '😒', 3: '🙂', 4: '☺️', 5: '🥳' };
  //   return emojiMap[rating] || '😐';
  // };

  // const getRatingLabel = (rating: number) => {
  //   const labelMap: { [key: number]: string } = { 1: 'Very Bad', 2: 'Bad', 3: 'Good', 4: 'Very Good', 5: 'Excellent' };
  //   return labelMap[rating] || 'No Rating';
  // };

  // const getProfileImageUrl = (imageUrl: string) => {
  //   if (!imageUrl) return 'https://via.placeholder.com/40';
  //   return imageUrl;
  // };

  // Show loader while fetching
  if (serviceLoader.loading) {
    return (
      <div style={{ height: "80vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <SectionLoader show={true} size="large" text="Loading service details..." />
      </div>
    );
  }

  return (
    <>
      <div>
        <div className="container px-3 pt-4 padding_btn_main">
          <div className="row">

            {/* Header row */}
            <div className="col-12 d-flex pt-5 align-items-center justify-content-between">
              <button className="back_btn_new" onClick={() => navigate(-1)}>Back</button>
              <div className="d-flex align-items-center gap-2">
                <button className="back_btn_new2"><Search size={16} /></button>
              </div>
            </div>

            {/* Banner / Service Image */}
            <div className="col-12 pt-4">
              <img
                src={serviceDetails?.service_image_url || ''}
                className="w-100 rounded-full"
                alt={serviceDetails?.service_name}
              />
            </div>

            {/* Title, Rating, Price, Book Now */}
            <div className="col-12 pt-3 d-flex justify-content-between align-items-start">
              <div className="mostbookedtext3">
                <h3>{serviceDetails?.service_name}</h3>
                <p>
                  ✭ {averageRating > 0 ? averageRating : (serviceDetails?.avg_rating || '0')} ({serviceDetails?.total_reviews || '0'} Reviews)
                </p>

                {/* Pricing — show first pricing tier if available */}
                {serviceDetails?.pricing?.length > 0 && (
                  <>
                    <p className="pt-1">
                      <b>₹{serviceDetails.pricing[0].final_price}</b>
                      {serviceDetails.pricing[0].price !== serviceDetails.pricing[0].final_price && (
                        <>&nbsp;<span className="text-decoration-line-through">₹{serviceDetails.pricing[0].price}</span></>
                      )}
                    </p>
                    <p className="heil_text pt-0">{serviceDetails.pricing[0].duration}</p>
                  </>
                )}

                {/* Banner offer price (if exists) */}
                {serviceDetails?.offer_price && (
                  <p className="pt-1">
                    <b>₹{serviceDetails.offer_price}</b>&nbsp;
                    {serviceDetails.service_price && (
                      <span className="text-decoration-line-through">₹{serviceDetails.service_price}</span>
                    )}
                  </p>
                )}
              </div>
              <button className="fill_new3 mt-2" onClick={handleBookNow}>Book Now</button>
            </div>

            <div className="col-12">

              {/* Description */}
              {serviceDetails?.description && (
                <div className="det_card">
                  <h2>Description</h2>
                  <p dangerouslySetInnerHTML={{ __html: serviceDetails.description }} />
                </div>
              )}

              {/* What is Covered */}
              {serviceDetails?.what_is_covered && (
                <div className="det_card">
                  <h2>What is Covered</h2>
                  <ul className="what_coverd">
                    {serviceDetails?.what_is_covered && (
                      <div className="det_card">
                        <div
                          dangerouslySetInnerHTML={{
                            __html: serviceDetails.what_is_covered,
                          }}
                        />
                      </div>
                    )}
                  </ul>
                </div>
              )}

              {/* What is Not Covered */}
              {serviceDetails?.what_is_not_covered && (
                <div className="det_card">
                  <h2>What is not Covered</h2>
                  <ul className="what_coverd">
                    {serviceDetails.what_is_not_covered && (
                      <div className="det_card">
                        <div
                          dangerouslySetInnerHTML={{
                            __html: serviceDetails.what_is_not_covered,
                          }}
                        />
                      </div>
                      )}
                  </ul>
                </div>
              )}

              {/* Our Process */}
              {serviceDetails?.images?.our_process?.length > 0 && (
                <div className="det_card">
                  <h2>Our Process</h2>
                  <div className="newscrll">
                    {serviceDetails.images.our_process.map((img: any) => (
                      <div key={img.id} className="catcards fix_widcard_3 fixhei">
                        <img src={img.image_url} alt={img.label} />
                        <span className="mostbookedtext2">
                          <h3>{img.label}</h3>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Before & After */}
              {serviceDetails?.images?.before_after?.length > 0 && (
                <div className="det_card">
                  <h2>See the difference</h2>
                  <div className="row">
                    {serviceDetails.images.before_after.map((img: any) => (
                      <div key={img.id} className="col-6 mt-3">
                        <img src={img.image_url} alt={img.label} className="w-100 difimgg" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Top Cleaners */}
              {serviceDetails?.top_cleaners && (
                <div className="det_card">
                  <h2>Our Top Cleaners</h2>
                  <ul className="what_coverd">
                    {serviceDetails.top_cleaners && (
                      <div className="det_card">
                        <div
                          dangerouslySetInnerHTML={{
                            __html: serviceDetails.top_cleaners,
                          }}
                        />
                      </div>
                      )}
                  </ul>
                </div>
              )}

              {/* Our Tools / Equipment */}
              {serviceDetails?.images?.our_tools?.length > 0 && (
                <div className="det_card">
                  <h2>Our cleaning equipment</h2>
                  <div className="row">
                    {serviceDetails.images.our_tools.map((img: any) => (
                      <div key={img.id} className="col-4 mt-3">
                        <img src={img.image_url} alt={img.label} className="w-100 difimgg" />
                        <span className="mostbookedtext2">
                          <h3>{img.label}</h3>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pricing Tiers */}
              {serviceDetails?.pricing?.length > 1 && (
                <div className="det_card">
                  <h2>Pricing</h2>
                  {serviceDetails.pricing.map((tier: any, idx: number) => (
                    <div key={idx} className="d-flex justify-content-between align-items-center py-2 border-bottom">
                      <span>{tier.duration}</span>
                      <span>
                        <b>₹{tier.final_price}</b>
                        {tier.discount_percent > 0 && (
                          <>
                            &nbsp;<span className="text-decoration-line-through text-muted">₹{tier.price}</span>
                            &nbsp;<span className="text-success" style={{ fontSize: '12px' }}>{tier.discount_percent}% off</span>
                          </>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {hasPriceBreakup && (
                <details className="det_card">
                  <summary style={{ cursor: "pointer", fontWeight: 600 }}>Price breakup</summary>
                  <div className="pt-2">
                    <div className="d-flex justify-content-between py-1 border-bottom">
                      <span>Booking fee</span>
                      <span>₹{formatAmount2(priceBreakup?.booking_fee)}</span>
                    </div>
                    <div className="d-flex justify-content-between py-1 border-bottom">
                      <span>Booking fee percent</span>
                      <span>{formatAmount2(priceBreakup?.booking_fee_percent)}%</span>
                    </div>
                    <div className="d-flex justify-content-between py-1 border-bottom">
                      <span>Accepting fee amount</span>
                      <span>₹{formatAmount2(priceBreakup?.accepting_fee_amount)}</span>
                    </div>
                    <div className="d-flex justify-content-between py-1 border-bottom">
                      <span>Accepting fee percent</span>
                      <span>{formatAmount2(priceBreakup?.accepting_fee_percent)}%</span>
                    </div>
                    <div className="d-flex justify-content-between py-1 border-bottom">
                      <span>Platform share amount</span>
                      <span>₹{formatAmount2(priceBreakup?.platform_share_amount)}</span>
                    </div>
                    <div className="d-flex justify-content-between py-1 border-bottom">
                      <span>Platform share percent</span>
                      <span>{formatAmount2(priceBreakup?.platform_share_percent)}%</span>
                    </div>
                    <div className="d-flex justify-content-between py-1 border-bottom">
                      <span>GST amount</span>
                      <span>₹{formatAmount2(priceBreakup?.gst_amount)}</span>
                    </div>
                    <div className="d-flex justify-content-between py-1 border-bottom">
                      <span>GST percent</span>
                      <span>{formatAmount2(priceBreakup?.gst_percent)}%</span>
                    </div>
                    <div className="d-flex justify-content-between py-1 border-bottom">
                      <span>Platform net amount</span>
                      <span>₹{formatAmount2(priceBreakup?.platform_net_amount)}</span>
                    </div>
                    <div className="d-flex justify-content-between py-1 border-bottom">
                      <span>Base price amount</span>
                      <span>₹{formatAmount2(priceBreakup?.base_price_amount)}</span>
                    </div>
                    <div className="d-flex justify-content-between py-1">
                      <span>Remaining amount</span>
                      <span>₹{formatAmount2(priceBreakup?.remaining_amount)}</span>
                    </div>
                  </div>
                </details>
              )}

              {/* Reviews */}
              <div className="det_card" ref={reviewsRef}>
                <h2 className="mb-2">All Reviews</h2>

                {reviewsLoader.loading ? (
                  <SectionLoader show={true} size="medium" text="Loading reviews..." />
                ) : reviews.length > 0 ? (
                  <>
                    {reviews.slice(0, 3).map((review) => (
                      <div key={review._id} className="revs_carrdss">
                        <div className="d-flex justify-content-between align-items-start">
                          <h1>{review.customer_id.fname} {review.customer_id.lname}</h1>
                          <span>✭ {review.rating}</span>
                        </div>
                        <p className="revttext2">
                          {dayjs(review.created_on).format('MMM D, YYYY')}
                          {review.booking_id?.bkng_id && ` | #${review.booking_id.bkng_id}`}
                        </p>
                        <p className="revttext">{review.review}</p>
                      </div>
                    ))}
                    {reviews.length > 3 && (
                      <button
                        className="view_all_revi"
                        onClick={() => navigate(`/reviews/${id}`)}
                      >
                        View All Reviews ({reviews.length})
                      </button>
                    )}
                  </>
                ) : (
                  <p className="text-muted">No reviews yet.</p>
                )}
              </div>

            </div>
          </div>
        </div>
      </div>

      <LoginModal
        show={showLoginModal}
        onCancel={() => setShowLoginModal(false)}
        onConfirm={() => {
          logout();
          setShowLoginModal(false);
        }}
      />
    </>
  );
};

export default Servicedetail;