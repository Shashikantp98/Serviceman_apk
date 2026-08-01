/**
 * Utility functions for handling referral codes
 */

/**
 * Get referral code from URL query parameters
 * @returns {string | null} Referral code if found, null otherwise
 */
export const getReferralCodeFromURL = (): string | null => {
  // Support codes passed in the path as /r/{code}
  const pathMatch = window.location.pathname.match(/^\/r\/([^\/?#]+)/i);
  if (pathMatch && pathMatch[1]) {
    try {
      return decodeURIComponent(pathMatch[1]);
    } catch {
      return pathMatch[1];
    }
  }

  const params = new URLSearchParams(window.location.search);
  return params.get("ref") || params.get("referral") || params.get("code");
};

/**
 * Store referral code in localStorage for later use during registration
 * @param {string} code - Referral code to store
 */
export const storeReferralCode = (code: string): void => {
  if (code) {
    localStorage.setItem("pendingReferralCode", code);
    // Set expiration (7 days from now)
    const expiresAt = new Date().getTime() + 7 * 24 * 60 * 60 * 1000;
    localStorage.setItem("referralCodeExpiry", expiresAt.toString());
  }
};

/**
 * Get stored referral code from localStorage
 * @returns {string | null} Referral code if found and not expired, null otherwise
 */
export const getStoredReferralCode = (): string | null => {
  const code = localStorage.getItem("pendingReferralCode");
  const expiry = localStorage.getItem("referralCodeExpiry");

  if (!code || !expiry) {
    return null;
  }

  // Check if expired
  const expiresAt = parseInt(expiry, 10);
  if (new Date().getTime() > expiresAt) {
    clearReferralCode();
    return null;
  }

  return code;
};

/**
 * Clear referral code from localStorage
 */
export const clearReferralCode = (): void => {
  localStorage.removeItem("pendingReferralCode");
  localStorage.removeItem("referralCodeExpiry");
};

/**
 * Generate referral link with the given code
 * @param {string} code - Referral code
 * @returns {string} Complete referral link
 */
export const generateReferralLink = (code: string): string => {
  // Use server-side redirect route so the link is device-aware
  return `https://instasevak.com/r/${encodeURIComponent(code)}`;
};

/**
 * Validate referral code format (basic client-side validation)
 * @param {string} code - Referral code to validate
 * @returns {boolean} True if valid format, false otherwise
 */
export const isValidReferralCodeFormat = (code: string): boolean => {
  if (!code) return false;
  // Accepts alphanumeric codes 6-20 characters
  const regex = /^[A-Za-z0-9]{6,20}$/;
  return regex.test(code);
};

/**
 * Track referral code visit (call this on app load)
 */
export const trackReferralCodeVisit = (): void => {
  const code = getReferralCodeFromURL();
  if (code && isValidReferralCodeFormat(code)) {
    storeReferralCode(code);
    console.log("Referral code detected and stored:", code);
  }
};

/**
 * Get referral info for display
 * @returns {object | null} Referral info object or null
 */
export const getReferralInfo = (): { code: string; expiresAt: Date } | null => {
  const code = getStoredReferralCode();
  const expiry = localStorage.getItem("referralCodeExpiry");

  if (!code || !expiry) {
    return null;
  }

  return {
    code,
    expiresAt: new Date(parseInt(expiry, 10)),
  };
};
