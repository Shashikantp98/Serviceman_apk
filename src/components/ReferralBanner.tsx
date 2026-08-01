import React, { useEffect, useState } from "react";
import { Gift, X } from "react-feather";
import { getReferralInfo } from "../utils/referralUtils";

interface ReferralBannerProps {
  className?: string;
  onDismiss?: () => void;
}

/**
 * Component to display a banner when user has a pending referral code
 * Show this on the registration flow pages (Mobile, OTP, SetPin, etc.)
 */
const ReferralBanner: React.FC<ReferralBannerProps> = ({ 
  className = "",
  onDismiss 
}) => {
  const [referralInfo, setReferralInfo] = useState<{ code: string; expiresAt: Date } | null>(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const info = getReferralInfo();
    setReferralInfo(info);
  }, []);

  const handleDismiss = () => {
    setVisible(false);
    if (onDismiss) {
      onDismiss();
    }
  };

  if (!referralInfo || !visible) {
    return null;
  }

  return (
    <div className={`referral-banner ${className}`}>
      <div className="alert alert-success d-flex align-items-center justify-content-between mb-3" role="alert">
        <div className="d-flex align-items-center">
          <Gift size={20} className="me-2 text-success" />
          <div>
            <strong className="font-14">You've been invited!</strong>
            <p className="mb-0 font-12">
              Referral code: <code className="bg-white px-2 py-1 rounded">{referralInfo.code}</code>
            </p>
            <small className="font-10 text-muted">
              Complete registration to get special benefits 🎉
            </small>
          </div>
        </div>
        <button 
          type="button" 
          className="btn-close btn-close-sm" 
          aria-label="Close"
          onClick={handleDismiss}
          style={{ fontSize: "12px" }}
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

export default ReferralBanner;
