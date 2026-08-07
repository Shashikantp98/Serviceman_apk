import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { Gift, ArrowLeft } from "react-feather";// Users, TrendingUp, Award,
import ReferralShare from "../components/ReferralShare";
import ApiService from "../services/api";
import { toast } from "react-toastify";

interface ReferralStats {
  totalReferrals: number;
  pendingReferrals: number;
  completedReferrals: number;
  totalEarnings: number;
  pendingEarnings: number;
}

const ReferralPage: React.FC = () => {
  // const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const userType = localStorage.getItem("authmobileRole") || "customer";

  useEffect(() => {
    fetchReferralData();
  }, []);

  const fetchReferralData = async () => {
    try {
      setLoading(true);
      
      // Use getReferralDetails which provides most of the data
      const detailsResponse: any = await ApiService.post("/user/getReferralDetails");

      if (detailsResponse.status === "success" || detailsResponse.status === 200) {
        const data = detailsResponse.data;
        
        // Map the data to stats format
        setStats({
          totalReferrals: data.total_referrals || 0,
          pendingReferrals: data.pending_referrals || 0,
          completedReferrals: data.completed_referrals || 0,
          totalEarnings: data.available_coupons || 0, // Using coupons as earnings indicator
          pendingEarnings: 0 // Can be calculated if needed
        });
      }

    } catch (error) {
      console.error("Error fetching referral data:", error);
      toast.error("Failed to load referral data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="referral-page mbt-200px">
      {/* Header */}

      




      <div className="header-section bg-dark-head text-white p-4 pt-5">
        <div className="d-flex align-items-start mb-2 ">
          {/* <button
            className="btn btn-link text-white p-0 me-3"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={24} />
          </button> */}
          <h5 className="mb-0 font-18 pt-4 ">
           
            Referral Program
            <span className="support-texts">
              Refer Friends & Earn Rewards
            </span>
          </h5>
        </div>
        
      </div>

      

      <div className="container-fluid p-4">
        {/* Loading State */}
        {loading && !stats && (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3 text-muted">Loading referral data...</p>
          </div>
        )}

        {/* Stats Cards
        {stats && (
          <div className="row g-3 mb-4">
            <div className="col-6">
              <div className="card border-0 shadow-sm">
                <div className="card-body p-3">
                  <div className="d-flex align-items-center justify-content-between">
                    <div>
                      <div className="font-12 text-muted mb-1">Total Referrals</div>
                      <div className="font-20 fw-bold text-primary">
                        {stats.totalReferrals}
                      </div>
                    </div>
                    <Users size={32} className="text-primary opacity-25" />
                  </div>
                </div>
              </div>
            </div>

            <div className="col-6">
              <div className="card border-0 shadow-sm">
                <div className="card-body p-3">
                  <div className="d-flex align-items-center justify-content-between">
                    <div>
                      <div className="font-12 text-muted mb-1">Total Earned</div>
                      <div className="font-20 fw-bold text-success">
                        ₹{stats.totalEarnings}
                      </div>
                    </div>
                    <TrendingUp size={32} className="text-success opacity-25" />
                  </div>
                </div>
              </div>
            </div>

            <div className="col-6">
              <div className="card border-0 shadow-sm">
                <div className="card-body p-3">
                  <div className="d-flex align-items-center justify-content-between">
                    <div>
                      <div className="font-12 text-muted mb-1">Pending</div>
                      <div className="font-20 fw-bold text-warning">
                        {stats.pendingReferrals}
                      </div>
                    </div>
                    <Award size={32} className="text-warning opacity-25" />
                  </div>
                </div>
              </div>
            </div>

            <div className="col-6">
              <div className="card border-0 shadow-sm">
                <div className="card-body p-3">
                  <div className="d-flex align-items-center justify-content-between">
                    <div>
                      <div className="font-12 text-muted mb-1">Pending ₹</div>
                      <div className="font-20 fw-bold text-info">
                        ₹{stats.pendingEarnings}
                      </div>
                    </div>
                    <Gift size={32} className="text-info opacity-25" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )} */}

        {/* Referral Share Component */}
        <div className="mb-4">
          <ReferralShare userType={userType as "customer" | "serviceman"} />
        </div>

        {/* How It Works */}
        <div className="card border-0  mb-4">
          <div className="card-body p-3">
            <h6 className="card-title fw-bold mb-3">How It Works</h6>
            <div className="steps">
              <div className="d-flex align-items-start mb-3">
                <div className="badge bg-dark-head rounded-circle me-3" style={{ width: "30px", height: "30px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  1
                </div>
                <div>
                  <div className="font-14 fw-semibold">Share Your Code</div>
                  <div className="font-12 text-muted">
                    Send your referral code or link via WhatsApp
                  </div>
                </div>
              </div>
              <div className="d-flex align-items-start mb-3">
                <div className="badge bg-dark-head rounded-circle me-3" style={{ width: "30px", height: "30px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  2
                </div>
                <div>
                  <div className="font-14 fw-semibold">Friend Signs Up</div>
                  <div className="font-12 text-muted">
                    They use your code during registration
                  </div>
                </div>
              </div>
              <div className="d-flex align-items-start">
                <div className="badge bg-dark-head rounded-circle me-3" style={{ width: "30px", height: "30px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  3
                </div>
                <div>
                  <div className="font-14 fw-semibold">Earn Rewards</div>
                  <div className="font-12 text-muted">
                    Both of you get rewards after their first booking
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Referral History - Uncomment when backend provides getReferralHistory API */}
        {/* <div className="card border-0 shadow-sm">
          <div className="card-body p-3">
            <h6 className="card-title fw-bold mb-3">Referral History</h6>
            
            {loading ? (
              <div className="text-center py-4">
                <div className="spinner-border spinner-border-sm" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <Users size={48} className="text-muted mb-3" />
                <p className="text-muted font-14 mb-0">
                  Referral history will be available soon!
                </p>
              </div>
            )}
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default ReferralPage;
