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
        {/* Summary Section */}
        <div 
          style={{
            backgroundColor: '#fff',
            padding: '20px',
            margin: '16px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
            textAlign: 'center'
          }}
        >
          <h3 style={{ margin: '0 0 12px 0', color: '#333', fontSize: '20px' }}>
            Customer Reviews
          </h3>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
            <div>
              <p style={{ margin: 0, fontSize: '28px', fontWeight: 'bold', color: '#2196F3' }}>
                {averageRating}
              </p>
              <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#999' }}>
                Average Rating
              </p>
            </div>
            <div style={{ fontSize: '24px' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <span 
                  key={star}
                  style={{ color: star <= Math.round(averageRating) ? '#ffc107' : '#ddd' }}
                >
                  ★
                </span>
              ))}
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#333' }}>
                {reviews.length}
              </p>
              <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#999' }}>
                Total Reviews
              </p>
            </div>
          </div>
        </div>

        {/* Reviews List */}
        <div style={{ padding: '16px' }}>
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
                style={{
                  backgroundColor: '#fff',
                  borderRadius: '12px',
                  padding: '16px',
                  marginBottom: '12px',
                  border: '1px solid #e0e0e0',
                  boxShadow: '0 1px 4px rgba(0, 0, 0, 0.05)'
                }}
              >
                {/* Customer Info */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    {/* Profile Image */}
                    <img
                      src={getProfileImageUrl(review.customer_id.profile_image)}
                      alt={review.customer_id.fname}
                      style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        backgroundColor: '#e0e0e0'
                      }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/44';
                      }}
                    />
                    <div>
                      <p style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: '600', color: '#333' }}>
                        {review.customer_id.fname} {review.customer_id.lname}
                      </p>
                      <p style={{ margin: 0, fontSize: '12px', color: '#999' }}>
                        {dayjs(review.created_on).format('MMM D, YYYY')} at {dayjs(review.created_on).format('h:mm A')}
                      </p>
                    </div>
                  </div>

                  {/* Rating */}
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ margin: '0 0 4px 0', fontSize: '20px' }}>
                      {getRatingEmoji(review.rating)}
                    </p>
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
                  style={{
                    backgroundColor: '#fafafa',
                    padding: '12px',
                    borderRadius: '8px',
                    borderLeft: '3px solid #2196F3',
                    marginTop: '12px'
                  }}
                >
                  <p style={{ margin: 0, fontSize: '14px', color: '#555', lineHeight: '1.6' }}>
                    {review.review}
                  </p>
                </div>

                {/* Booking Info */}
                <p style={{ margin: '12px 0 0 0', fontSize: '11px', color: '#bbb', textAlign: 'right' }}>
                  Booking: {review.booking_id.bkng_id}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default Reviews;