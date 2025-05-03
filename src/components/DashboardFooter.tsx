import React from "react";
import { FaFacebook, FaTwitter, FaLinkedin, FaInstagram } from "react-icons/fa";

const appStoreBadge = "https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg";
const playStoreBadge = "https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg";

const DashboardFooter: React.FC = () => {
  return (
    <footer className="w-full bg-[#F6F8FA] border-t border-gray-200 pt-12 pb-6 px-4 md:px-8 mt-12 overflow-x-hidden">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-x-8 gap-y-8 text-sm text-gray-600">
        {/* Logo & Description */}
        <div className="flex flex-col gap-3 min-w-0 lg:pr-8">
          <span className="font-extrabold text-2xl text-blue-700 tracking-tight mb-1">MedConnect</span>
          <span className="text-xs text-gray-500 leading-relaxed max-w-[220px]">Your comprehensive health management platform connecting you with healthcare professionals.</span>
        </div>
        {/* Quick Links */}
        <div className="flex flex-col gap-2 min-w-0 pt-6 lg:pt-0 lg:px-8">
          <span className="font-semibold text-base text-gray-900 mb-2">Quick Links</span>
          <a href="/" className="hover:underline transition-colors">Dashboard</a>
          <a href="/appointments" className="hover:underline transition-colors">Appointments</a>
          <a href="/medical-records" className="hover:underline transition-colors">Medical Records</a>
          <a href="#" className="hover:underline transition-colors">Find a Doctor</a>
        </div>
        {/* Support */}
        <div className="flex flex-col gap-2 min-w-0 pt-6 lg:pt-0 lg:px-8">
          <span className="font-semibold text-base text-gray-900 mb-2">Support</span>
          <a href="#" className="hover:underline transition-colors">Help Center</a>
          <a href="#" className="hover:underline transition-colors">Contact Us</a>
          <a href="#" className="hover:underline transition-colors">FAQs</a>
          <a href="#" className="hover:underline transition-colors">Privacy Policy</a>
        </div>
        {/* Stay Connected */}
        <div className="flex flex-col gap-2 min-w-0 pt-6 lg:pt-0 lg:px-8">
          <span className="font-semibold text-base text-gray-900 mb-2">Stay Connected</span>
          <div className="flex gap-4 mb-3">
            <a href="#" aria-label="Facebook"><FaFacebook className="w-6 h-6 text-blue-600 hover:text-blue-800 transition-colors" /></a>
            <a href="#" aria-label="Twitter"><FaTwitter className="w-6 h-6 text-blue-400 hover:text-blue-600 transition-colors" /></a>
            <a href="#" aria-label="LinkedIn"><FaLinkedin className="w-6 h-6 text-blue-700 hover:text-blue-900 transition-colors" /></a>
            <a href="#" aria-label="Instagram"><FaInstagram className="w-6 h-6 text-pink-500 hover:text-pink-700 transition-colors" /></a>
          </div>
          <div className="flex gap-3 items-center">
            <a href="#" aria-label="Download on the App Store">
              <img src={appStoreBadge} alt="App Store" className="block h-10 max-w-full w-auto rounded shadow-sm bg-white p-0.5" />
            </a>
            <a href="#" aria-label="Get it on Google Play">
              <img src={playStoreBadge} alt="Google Play" className="block h-10 max-w-full w-auto rounded shadow-sm bg-white p-0.5" />
            </a>
          </div>
        </div>
        {/* Spacer for balance on large screens */}
        <div className="hidden lg:block min-w-0" />
      </div>
      <div className="max-w-7xl mx-auto mt-10 border-t border-gray-200 pt-5 flex flex-col md:flex-row items-center justify-between text-xs text-gray-400 px-2">
        <span className="text-center">© {new Date().getFullYear()} MedConnect. All rights reserved.</span>
        <span className="mt-2 md:mt-0 text-center">Powered by MedConnect</span>
      </div>
    </footer>
  );
};

export default DashboardFooter; 