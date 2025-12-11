import { useParams } from "react-router-dom";
import ApiService from "../services/api";
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { LoginModal } from "../components/LoginModal";
import { toast } from "react-toastify";
import CommonHeader from "../components/CommonHeader";
import SectionLoader from "../components/SectionLoader";
import { useSectionLoader } from "../utils/useSectionLoader";
import dayjs from "dayjs";
import { ArrowUpRight } from "react-feather";

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
  const { logout, token, latitude, longitude } = useAuth();
  const [serviceDetails, setServiceDetails] = useState<any>({});
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const reviewsRef = useRef<HTMLDivElement>(null);

  // Loader for service details
  const serviceLoader = useSectionLoader("service-details");
  const reviewsLoader = useSectionLoader("reviews");

  const { id } = useParams();
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    if (id) {
      serviceLoader.setLoading(true);
      ApiService.post(`/user/serviceDetails`, {
        service_id: id,
        latitude: Number(latitude),
        longitude: Number(longitude),
      })
        .then((res: any) => {
          console.log(res);
          setServiceDetails(res.data);
        })
        .catch((err: any) => {
          console.log(err);
        })
        .finally(() => {
          serviceLoader.setLoading(false);
        })
    }
  }, [id]);

  // Fetch reviews
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
          
          // Calculate average rating
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
    if (token == "guest") {
      setShowLoginModal(true);
    } else {
      if (serviceDetails.is_available) {
        navigate(`/summery/${serviceDetails?.service_id}`);
      } else {
        toast.error(serviceDetails.availability_message);
      }
    }
  };

  // const getRatingEmoji = (rating: number) => {
  //   const emojiMap: { [key: number]: string } = {
  //     1: '😡',
  //     2: '😒',
  //     3: '🙂',
  //     4: '☺️',
  //     5: '🥳',
  //   };
  //   return emojiMap[rating] || '😐';
  // };

  const getRatingLabel = (rating: number) => {
    const labelMap: { [key: number]: string } = {
      1: 'Very Bad',
      2: 'Bad',
      3: 'Good',
      4: 'Very Good',
      5: 'Excellent',
    };
    return labelMap[rating] || 'No Rating';
  };

  const getProfileImageUrl = (imageUrl: string) => {
    if (!imageUrl) return 'https://via.placeholder.com/40';
    return imageUrl;
  };
  return (
    <>
      <CommonHeader />
      {/* ======= Centered Loader ======= */}
      {serviceLoader.loading ? (
        <div
          style={{
            height: "80vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <SectionLoader show={true} size="large" text="Loading service details..." />
        </div>
      ) : (
        <>
          <div className="container pb-5 mb-5 main-content-service">
            <div className="row">
              <div className="col-12 pt-3">
                <img
                  src={serviceDetails?.service_image_url}
                  className="w-100 rounded-full"
                ></img>
              </div>
              <div className="col-12 sder_detail">

                <div className="d-flex gap-3  justify-content-between pt-4 align-items-center">
                <h4 className="mb-0">{serviceDetails?.service_name}</h4>
                <button className=" book_servi2" onClick={handleBookNow}>
                 
                  Book Now
                </button>
                </div>


                <h6 
                  className="pt-2"
                 
                  onClick={() => {
                    if (serviceDetails?.total_reviews > 0 && reviewsRef.current) {
                      reviewsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  }}
                >
                  ★ {serviceDetails?.avg_rating || '0'} ({serviceDetails?.total_reviews || '0'} reviews)
                </h6>
                <p
                  className="mb-2 pt-2"
                  dangerouslySetInnerHTML={{ __html: serviceDetails?.description }}
                ></p>
                <p>
                  <b>
                    ₹
                    {serviceDetails?.offer_price
                      ? serviceDetails?.offer_price
                      : serviceDetails?.price}{" "}
                    - Duration : {serviceDetails?.duration}
                  </b>
                </p>

                {/* <h5>What is covered</h5>
            <ul>
              <li>Hard water stains</li>
              <li>Toilet seat from outside and inside</li>
              <li>Sink tiles and tanks</li>
              <li>Mirror and Windows</li>
              <li>Exhaust Fans</li>
            </ul> */}

                {/* Reviews Section */}
                {reviewsLoader.loading ? (
                  <div style={{ marginTop: '24px' }}>
                    <SectionLoader show={true} size="medium" text="Loading reviews..." />
                  </div>
                ) : reviews.length > 0 ? (
                  <div className="pt-3" ref={reviewsRef}>
                    <div className="d-flex pb-3 align-items-center justify-content-between">
                      <h5 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>Customer Reviews</h5>
                      <div className="d-flex align-items-center gap-1">
                        <span className="font-12">
                          {averageRating}
                        </span>
                        <div>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span 
                              key={star}
                              style={{ fontSize: '14px', color: star <= Math.round(averageRating) ? '#ffc107' : '#ddd' }}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                        <span className="font-12 text-blue">({reviews.length} reviews )</span>
                      </div>
                    </div>



                    {reviews.slice(0, 3).map((review) => (
                      <div
                        key={review._id}
                        className="revs_carrdss mb-3"
                      >
                        <div className="d-flex justify-content-between">
                          <div className="d-flex align-items-center gap-2">
                            <img
                              className="rev_cs_imgs"
                              src={getProfileImageUrl(review.customer_id.profile_image)}
                              alt={review.customer_id.fname}
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/36';
                              }}
                            />
                            <div>
                              <p className="mb-0 cusnms">
                                {review.customer_id.fname} {review.customer_id.lname}
                              </p>
                              <p className="mb-0 cusdatetime">
                                {dayjs(review.created_on).format('MMM D, YYYY')}
                              </p>
                            </div>
                          </div>

                          <div className="text-right">
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1px', marginBottom: '2px' }}>
                              {[1, 2, 3, 4, 5].map((star) => (
                                <span
                                  key={star}
                                  style={{
                                    fontSize: '12px',
                                    color: star <= review.rating ? '#ffc107' : '#ddd'
                                  }}
                                >
                                  ★
                                </span>
                              ))}
                            </div>
                            <p style={{ margin: 0, fontSize: '10px', color: '#666' }}>
                              {getRatingLabel(review.rating)}
                            </p>
                          </div>
                        </div>

                        <p className="cusrev mb-0 pt-2">
                          {review.review}
                        </p>
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
                  </div>
                ) : null}

                <button className="mb-5 mt-4 book_servi" onClick={handleBookNow}>
                  <ArrowUpRight></ArrowUpRight>
                  Book Now
                </button>
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
          </div>
        </>
      )}
    </>
  );
};

export default Servicedetail;
