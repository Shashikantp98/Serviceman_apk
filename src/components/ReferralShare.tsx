import React, { useState, useEffect } from "react";
import { Share2, Copy, Check, MessageCircle } from "react-feather";
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


      <div className="">
        <div className="ref-cards">
          <div className="bg-wallet-img">
            <h6 className="ref-h6">
              Refer & <br></br>Get Rewards
            </h6>
            <div className="mb-0 pt-3">
            <label className="form-label font-14  mb-2">
              Your Referral Code
            </label>
            <div className="ref-copy-input">
              <input
                type="text"
                className="ref-code-input"
                value={referralData.referral_code}
                readOnly
              />
              <button
                className="copy-btn-red"
                onClick={() => copyToClipboard(referralData.referral_code, "code")}
              >
                {copied ? <Check size={20} /> : <Copy size={20}  />}
                
              </button>
            </div>
          </div>
            
          </div>
        </div>
        <div className="share-ref-btn">
            <button
              className=""
              onClick={shareViaGenericShare}
            >
             <Share2 size={18} className="" />
              Share
            </button>
            <button
                  className="wa"
                  onClick={shareOnWhatsApp}
                >
                  <MessageCircle size={18} className="" />
                  WhatsApp
            </button>
        </div>
      </div>

        {/* <div className="card border-0 shadow-sm">
        <div className="card-body p-3">
          

          
          <div className="">
            

            <div className="row g-2">
              <div className="col-12">
                
              </div>
              </div>
            </div>
          </div>

          <div className="mt-3 text-center">
            <small className="text-muted font-10">
              Share your referral code and earn rewards when friends sign up!
            </small>
          </div>
        </div> */}
      </div>
  );
};

export default ReferralShare;
