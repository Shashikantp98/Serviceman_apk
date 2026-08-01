import React, { useState, useEffect } from "react";
import { Share2, Copy, Check } from "react-feather";
import { toast } from "react-toastify";
import ApiService from "../services/api";
import { generateReferralLink } from "../utils/referralUtils";

interface ReferralShareProps {
  userType?: "customer" | "serviceman";
  className?: string;
}

interface ReferralData {
  referral_code: string;
  total_referrals: number;
  pending_referrals: number;
  completed_referrals: number;
  rewarded_referrals: number;
  available_coupons: number;
  coupons: any[];
  share_message: string;
  whatsapp_share_link: string;
  app_link: string;
}

const ReferralShare: React.FC<ReferralShareProps> = ({ 
  userType = "customer",
  className = "" 
}) => {
  const [referralData, setReferralData] = useState<ReferralData | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchReferralCode();
  }, []);

  const fetchReferralCode = async () => {
    try {
      setLoading(true);
      // Use the getReferralDetails API
      const response: any = await ApiService.post("/user/getReferralDetails");
      
      if (response.status === "success" || response.status === 200) {
        setReferralData(response.data);
      }
    } catch (error) {
      console.error("Error fetching referral code:", error);
      toast.error("Failed to load referral code");
    } finally {
      setLoading(false);
    }
  };

  const shareOnWhatsApp = () => {
    if (!referralData) {
      toast.error("Referral code not available");
      return;
    }

    // Use the whatsapp_share_link from backend
    window.open(referralData.whatsapp_share_link, "_blank");

    // Track share event
    trackReferralShare("whatsapp");
  };

  
  const copyToClipboard = async (text: string, type: "code" | "link" | "message") => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success(`Referral ${type} copied to clipboard!`);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy to clipboard");
    }
  };

  const trackReferralShare = async (method: string) => {
    try {
      await ApiService.post("/user/trackReferralShare", {
        method,
        userType
      });
    } catch (error) {
      console.error("Error tracking referral share:", error);
    }
  };

  const shareViaGenericShare = async () => {
    if (!referralData) {
      toast.error("Referral code not available");
      return;
    }

    const shareData = {
      title: "Join via my referral!",
      text: referralData.share_message,
      url: generateReferralLink(referralData.referral_code),
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        trackReferralShare("native_share");
      } else {
        // Fallback to WhatsApp if Web Share API is not available
        shareOnWhatsApp();
      }
    } catch (error: any) {
      if (error.name !== "AbortError") {
        console.error("Error sharing:", error);
      }
    }
  };

  if (loading) {
    return (
      <div className={`referral-share-container ${className}`}>
        <div className="text-center p-3">
          <div className="spinner-border spinner-border-sm" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!referralData) {
    return null;
  }

  return (
    <div className={`referral-share-container ${className}`}>
      <div className="card border-0 shadow-sm">
        <div className="card-body p-3">
          <h6 className="card-title mb-3 fw-bold">
            <Share2 size={18} className="me-2" />
            Refer & Earn
          </h6>

          {/* Referral Code */}
          <div className="mb-3">
            <label className="form-label font-12 text-muted mb-1">
              Your Referral Code
            </label>
            <div className="input-group">
              <input
                type="text"
                className="form-control"
                value={referralData.referral_code}
                readOnly
              />
              <button
                className="btn btn-outline-secondary"
                onClick={() => copyToClipboard(referralData.referral_code, "code")}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
              </button>
            </div>
          </div>

          {/* Share Buttons */}
          <div className="d-grid gap-2">
            <button
              className="btn btn-primary btn-sm d-flex align-items-center justify-content-center"
              onClick={shareViaGenericShare}
            >
              <Share2 size={18} className="me-2" />
              Share Referral Code
            </button>

            <div className="row g-2">
              <div className="col-12">
                <button
                  className="btn btn-success btn-sm w-100"
                  onClick={shareOnWhatsApp}
                >
                  <Share2 size={16} className="me-1" />
                  WhatsApp
                </button>
              </div>
              </div>
            </div>
          </div>

          <div className="mt-3 text-center">
            <small className="text-muted font-10">
              Share your referral code and earn rewards when friends sign up!
            </small>
          </div>
        </div>
      </div>
  );
};

export default ReferralShare;
