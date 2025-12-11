import { useState, useEffect } from "react";
import ApiService from "../services/api";

interface ReviewProps {
  booking_id: string;
  service_id: string;
  onSubmitSuccess?: () => void;
}

interface ExistingReview {
  _id: string;
  rating: number;
  review: string;
  created_on: string;
}

const Review = ({ booking_id, service_id, onSubmitSuccess }: ReviewProps) => {
  const [rating, setRating] = useState<number | null>(null);
  const [review, setReview] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [existingReview, setExistingReview] = useState<ExistingReview | null>(null);
  const [fetchingReview, setFetchingReview] = useState(true);

  // Fetch existing review
  useEffect(() => {
    const fetchExistingReview = async () => {
      setFetchingReview(true);
      try {
        const response: any = await ApiService.post("/user/getCustomerServiceReview", {
          booking_id,
        });
        
        if (response?.data) {
          setExistingReview(response.data);
        }
      } catch (err: any) {
        // No review found or error fetching - continue with empty state
        console.log("No existing review found");
      } finally {
        setFetchingReview(false);
      }
    };

    if (booking_id) {
      fetchExistingReview();
    }
  }, [booking_id]);

  const handleSubmit = async () => {
    if (!rating) {
      setError("Please select a rating and provide your feedback.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = {
        booking_id,
        service_id,
        rating,
        review: review.trim(),
      };

      const response = await ApiService.post("/user/addServiceReview", payload);
      
      if (response) {
        setSuccess(true);
        setRating(null);
        setReview("");
        
        // Show success message for 3 seconds, then re-fetch the review
        setTimeout(async () => {
          try {
            const reviewResponse: any = await ApiService.post("/user/getCustomerServiceReview", {
              booking_id,
            });
            
            if (reviewResponse?.data) {
              setExistingReview(reviewResponse.data);
            }
          } catch (err: any) {
            console.log("Error re-fetching review after submission");
          }
          
          setSuccess(false);
          if (onSubmitSuccess) {
            onSubmitSuccess();
          }
        }, 3000);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to submit review. Please try again.");
      console.error("Error submitting review:", err);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="pt-4 px-2">
        <div className="px-4 pt-3">
          <div className="alert alert-success" role="alert">
            <p className="mb-0">Thank you for your feedback!</p>
          </div>
        </div>
      </div>
    );
  }

  // Display existing review if found
  if (existingReview && !fetchingReview) {
    const ratingEmojis: { [key: number]: string } = {
      1: "😡",
      2: "😒",
      3: "🙂",
      4: "☺️",
      5: "🥳",
    };

    const ratingLabels: { [key: number]: string } = {
      1: "Very Bad",
      2: "Bad",
      3: "Good",
      4: "Very Good",
      5: "Excellent",
    };

    return (
      <div className="  pb-5 mb-5">
        <div className="">
          <div 
            style={{
              backgroundColor: "#fff",
              borderRadius: "12px",
              border: "1px solid #e0e0e0",
              padding: "20px",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)"
            }}
          >
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
              <h5 style={{ margin: 0, fontSize: "16px", fontWeight: "600", color: "#333" }}>Your Review</h5>
              <span style={{ fontSize: "12px", color: "#999" }}>
                {new Date(existingReview.created_on).toLocaleDateString()}
              </span>
            </div>

            {/* Rating Section */}
            <div 
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "12px",
                backgroundColor: "#f8f9fa",
                borderRadius: "8px",
                marginBottom: "16px"
              }}
            >
              <span style={{ fontSize: "40px" }}>
                {ratingEmojis[existingReview.rating]}
              </span>
              <div>
                <p style={{ margin: "0 0 4px 0", fontSize: "14px", fontWeight: "600", color: "#333" }}>
                  {ratingLabels[existingReview.rating]}
                </p>
                <div style={{ display: "flex", gap: "4px" }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span 
                      key={star}
                      style={{
                        fontSize: "16px",
                        color: star <= existingReview.rating ? "#ffc107" : "#ddd"
                      }}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Review Text */}
            <div style={{ marginTop: "16px" }}>
              <p 
                style={{
                  margin: 0,
                  fontSize: "14px",
                  color: "#555",
                  lineHeight: "1.6",
                  padding: "12px",
                  backgroundColor: "#fafafa",
                  borderRadius: "6px",
                  borderLeft: "3px solid #2196F3"
                }}
              >
                {existingReview.review}
              </p>
            </div>

            {/* Thank You Message */}
            <div 
              style={{
                marginTop: "16px",
                padding: "10px 12px",
                backgroundColor: "#e3f2fd",
                borderRadius: "6px",
                textAlign: "center"
              }}
            >
              <p style={{ margin: 0, fontSize: "12px", color: "#1976d2", fontWeight: "500" }}>
                ✓ Thank you for your valuable feedback!
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="">
        <div className="card_rev_ind">
          <h6 className="reves_head">We appreciate your feedback.</h6>
          <p className="font-14 color-grey mb-2 pt-2">
            We always looking for ways to improve your experience. Please take a moment to evaluate and tell us what you think.
          </p>

          {error && (
            <div className="alert alert-danger" role="alert">
              <p className="mb-0 font-12">{error}</p>
            </div>
          )}

          <div className="reviewratings pt-4 pb-3">
            <input
              type="radio"
              id="verybad"
              name="rating"
              checked={rating === 1}
              onChange={() => setRating(1)}
              style={{ display: "none" }}
            />
            <label 
              className="emj_lbl" 
              htmlFor="verybad"
              onClick={(e) => {
                e.preventDefault();
                setRating(1);
              }}
              style={{ cursor: "pointer" }}
            >
              <span>😡</span>
              <p>Very Bad</p>
            </label>

            <input
              type="radio"
              id="bad"
              name="rating"
              checked={rating === 2}
              onChange={() => setRating(2)}
              style={{ display: "none" }}
            />
            <label 
              className="emj_lbl" 
              htmlFor="bad"
              onClick={(e) => {
                e.preventDefault();
                setRating(2);
              }}
              style={{ cursor: "pointer" }}
            >
              <span>😒</span>
              <p>Bad</p>
            </label>

            <input
              type="radio"
              id="good"
              name="rating"
              checked={rating === 3}
              onChange={() => setRating(3)}
              style={{ display: "none" }}
            />
            <label 
              className="emj_lbl" 
              htmlFor="good"
              onClick={(e) => {
                e.preventDefault();
                setRating(3);
              }}
              style={{ cursor: "pointer" }}
            >
              <span>🙂</span>
              <p>Good</p>
            </label>

            <input
              type="radio"
              id="verygood"
              name="rating"
              checked={rating === 4}
              onChange={() => setRating(4)}
              style={{ display: "none" }}
            />
            <label 
              className="emj_lbl" 
              htmlFor="verygood"
              onClick={(e) => {
                e.preventDefault();
                setRating(4);
              }}
              style={{ cursor: "pointer" }}
            >
              <span>☺️</span>
              <p>Very Good</p>
            </label>

            <input
              type="radio"
              id="excellent"
              name="rating"
              checked={rating === 5}
              onChange={() => setRating(5)}
              style={{ display: "none" }}
            />
            <label 
              className="emj_lbl" 
              htmlFor="excellent"
              onClick={(e) => {
                e.preventDefault();
                setRating(5);
              }}
              style={{ cursor: "pointer" }}
            >
              <span>🥳</span>
              <p>Excellent</p>
            </label>
          </div>

          <div className="pt-3">
            <textarea
              className="textar"
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Share your feedback..."
              disabled={loading}
            />
          </div>

          <div className="pt-4">
            <button
              className="fill"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Review;
