"use client";
import { useState, useEffect } from "react";
import { useSession } from "@/lib/auth";

const CookieConsent: React.FC = () => {
  const { data: session, status } = useSession();
  const [isVisible, setIsVisible] = useState(false);
  const [hasConsent, setHasConsent] = useState(false);

  useEffect(() => {
    if (status === "loading") return;

    // If user is logged in, auto-accept and never show the banner
    if (session) {
      localStorage.setItem('cookie-consent', 'accepted');
      setHasConsent(true);
      return;
    }

    // Check if user has already consented
    const consent = localStorage.getItem('cookie-consent');
    if (consent === 'accepted' || consent === 'declined') {
      setHasConsent(true);
    } else {
      // Show banner after a short delay
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [session, status]);

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setHasConsent(true);
    setIsVisible(false);
    
    // Load Google Analytics and other tracking scripts here if needed
    // For now, we're just storing the consent
  };

  const handleDecline = () => {
    localStorage.setItem('cookie-consent', 'declined');
    setIsVisible(false);
  };

  if (hasConsent || !isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#0B1120] border-t border-white/10 backdrop-blur-xl shadow-2xl animate-[slide-up_0.3s_ease-out]">
      <div className="max-w-7xl mx-auto px-4 py-4 md:py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span className="text-sm font-semibold text-white">Cookie Notice</span>
            </div>
            <p className="text-xs md:text-sm text-gray-400 leading-relaxed max-w-3xl">
              We use cookies to enhance your experience, analyze site traffic, and personalize content. 
              By continuing to use our site, you agree to our use of cookies in accordance with our{" "}
              <a href="/privacy-policy" className="text-blue-400 hover:text-blue-300 underline transition">
                Privacy Policy
              </a>.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handleDecline}
              className="px-4 py-2 text-xs md:text-sm text-gray-400 hover:text-gray-300 border border-gray-600 hover:border-gray-500 rounded-lg transition font-mono"
            >
              Decline
            </button>
            <button
              onClick={handleAccept}
              className="px-4 py-2 text-xs md:text-sm bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition font-semibold shadow-[0_0_10px_rgba(37,99,235,0.3)] hover:shadow-[0_0_15px_rgba(37,99,235,0.5)]"
            >
              Accept All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
