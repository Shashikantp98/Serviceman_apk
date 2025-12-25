import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ApiService from '../services/api';
import CommonHeader from '../components/CommonHeader';
import { useSectionLoader } from '../utils/useSectionLoader';
import dayjs from 'dayjs';

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

const Reviews = () => {
  const { service_id } = useParams<{ service_id: string }>();
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const reviewsLoader = useSectionLoader('reviews');

  useEffect(() => {
    if (!service_id) return;
    
    const fetchReviews = async () => {
      reviewsLoader.setLoading(true);
      try {
        const response: any = await ApiService.post('/user/getServiceReviews', {
          service_id,
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
  }, [service_id]);

  const getRatingEmoji = (rating: number) => {
    const emojiMap: { [key: number]: string } = {
      1: '😡',
      2: '😒',
      3: '🙂',
      4: '☺️',
      5: '🥳',
    };
    return emojiMap[rating] || '😐';
  };

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
      {reviewsLoader.loading && (
        <div className="full-page-loader">
          <div className="loader-spinner"></div>
          <p>Loading reviews...</p>
        </div>
      )}

      <div className="main-content-service2">


        <div className="container pt-4 pb-5 mb-5 ">
          <div className="row px-1">
            <div className="col-12 pb-2">
              <div className="review_ratcard">
                <h3 className='pt-1'>Reviews and ratings</h3>
                <div className='d-flex gap-3 pt-2'>
                    <h2 className='avrg_ratings mb-0'>{averageRating}.0</h2>
                    <div className='star_sizes'>
                      {[1, 2, 3, 4, 5].map((star) => (
                      <span 
                        key={star}
                        style={{ color: star <= Math.round(averageRating) ? '#ffc107' : '#ddd' }}
                      >
                        ★
                      </span>
                      ))}
                      <p className='based_on_re mb-0'>Based on {reviews.length} Reviews</p>
                    </div>
                </div>
              </div>
            </div>
            <div className='col-12'>
          {reviews.length === 0 ? (
            <div 
              style={{
                backgroundColor: '#f5f5f5',
                padding: '40px 20px',
                borderRadius: '12px',
                textAlign: 'center'
              }}
            >
              <p style={{ margin: 0, color: '#999', fontSize: '14px' }}>
                No reviews yet. Be the first to review!
              </p>
            </div>
          ) : (
            reviews.map((review) => (
              <div
                key={review._id}
              className='review_ratcard mb-2'
              >
                {/* Customer Info */}
                <div className='d-flex justify-content-between'>
                  <div className='d-flex gap-2 pb-2'>
                    {/* Profile Image */}
                    <img
                      src={getProfileImageUrl(review.customer_id.profile_image)}
                      alt={review.customer_id.fname}
                        className='img_cust_prof'
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/44';
                      }}
                    />
                    <div>
                      <p className='font-14 mb-1'>
                        {review.customer_id.fname} {review.customer_id.lname}
                      </p>
                      <p className='font-12 mb-0 color-grey'>
                        {dayjs(review.created_on).format('MMM D, YYYY')} at {dayjs(review.created_on).format('h:mm A')}
                      </p>
                    </div>
                  </div>

                  {/* Rating */}
                  <div style={{ textAlign: 'right' }}>
                    {/* <p style={{ margin: '0 0 4px 0', fontSize: '20px' }}>
                      {getRatingEmoji(review.rating)}
                    </p> */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '2px' }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          style={{
                            fontSize: '14px',
                            color: star <= review.rating ? '#ffc107' : '#ddd'
                          }}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                    <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#666' }}>
                      {getRatingLabel(review.rating)}
                    </p>
                  </div>
                </div>

                {/* Review Text */}
                <div
                 
                >
                  <p className='review_custm'>
                    {review.review}
                  </p>
                </div>

               
              </div>
            ))
          )}
        </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Reviews;