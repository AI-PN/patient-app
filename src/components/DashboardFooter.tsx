import React, { useState } from "react";
import { FaFacebook, FaTwitter, FaLinkedin, FaInstagram } from "react-icons/fa";
import Link from "next/link";
import MedConnectLogo from "./MedConnectLogo";

const appStoreBadge = "https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg";
const playStoreBadge = "https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg";

const DashboardFooter: React.FC = () => {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you would send this to your API
    console.log(`Subscribing email: ${email}`);
    setSubscribed(true);
    setEmail("");
    // Reset after 3 seconds
    setTimeout(() => setSubscribed(false), 3000);
  };

  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: "Patient Tools",
      links: [
        { name: "Dashboard", href: "/" },
        { name: "Appointments", href: "/appointments" },
        { name: "Medical Records", href: "/medical-records" },
        { name: "Prescriptions", href: "/prescriptions" },
        { name: "Chat with Doctor", href: "/chat-history" },
      ]
    },
    {
      title: "Resources",
      links: [
        { name: "Health Articles", href: "#" },
        { name: "Find a Doctor", href: "#" },
        { name: "Insurance Information", href: "#" },
        { name: "Medication Guide", href: "#" },
        { name: "Wellness Tips", href: "#" },
      ]
    },
    {
      title: "Company",
      links: [
        { name: "About Us", href: "#" },
        { name: "Careers", href: "#" },
        { name: "Contact Us", href: "#" },
        { name: "Press", href: "#" },
      ]
    },
    {
      title: "Legal",
      links: [
        { name: "Terms of Service", href: "#" },
        { name: "Privacy Policy", href: "#" },
        { name: "Cookie Policy", href: "#" },
        { name: "HIPAA Compliance", href: "#" },
      ]
    },
  ];

  return (
    <footer className="w-full bg-[#F8FAFC] border-t border-gray-200 pt-16 pb-8 px-4 md:px-8 mt-auto overflow-x-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Top section with logo and newsletter */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12 pb-12 border-b border-gray-200">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <MedConnectLogo size={36} />
              <span className="font-extrabold text-2xl text-blue-700 tracking-tight">MedConnect</span>
            </div>
            <p className="text-gray-600 max-w-md mb-6">
              Your comprehensive health management platform connecting you with healthcare professionals for a better, healthier life.
            </p>
            <div className="flex gap-4 mb-6">
              <a href="#" aria-label="Facebook" className="bg-white p-2 rounded-full shadow-sm hover:shadow transition-shadow">
                <FaFacebook className="w-5 h-5 text-blue-600" />
              </a>
              <a href="#" aria-label="Twitter" className="bg-white p-2 rounded-full shadow-sm hover:shadow transition-shadow">
                <FaTwitter className="w-5 h-5 text-blue-400" />
              </a>
              <a href="#" aria-label="LinkedIn" className="bg-white p-2 rounded-full shadow-sm hover:shadow transition-shadow">
                <FaLinkedin className="w-5 h-5 text-blue-700" />
              </a>
              <a href="#" aria-label="Instagram" className="bg-white p-2 rounded-full shadow-sm hover:shadow transition-shadow">
                <FaInstagram className="w-5 h-5 text-pink-500" />
              </a>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Stay Updated</h3>
            <p className="text-gray-600 mb-4">
              Get the latest health tips, product updates, and news delivered to your inbox.
            </p>
            {subscribed ? (
              <div className="bg-green-50 text-green-700 p-4 rounded-lg border border-green-200 mb-4">
                Thanks for subscribing! Check your email for confirmation.
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  placeholder="Your email address"
                  className="flex-grow px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <button
                  type="submit"
                  className="px-5 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Subscribe
                </button>
              </form>
            )}
            <div className="flex flex-col sm:flex-row gap-4 mt-6">
              <a href="#" aria-label="Download on the App Store">
                <img src={appStoreBadge} alt="App Store" className="h-10 rounded shadow-sm" />
              </a>
              <a href="#" aria-label="Get it on Google Play">
                <img src={playStoreBadge} alt="Google Play" className="h-10 rounded shadow-sm" />
              </a>
            </div>
          </div>
        </div>

        {/* Middle section with links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-gray-900 font-semibold mb-4">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link 
                      href={link.href} 
                      className="text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom copyright section */}
        <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
          <div className="mb-4 md:mb-0">
            © {currentYear} MedConnect. All rights reserved.
          </div>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-blue-600 transition-colors">Terms</Link>
            <Link href="#" className="hover:text-blue-600 transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-blue-600 transition-colors">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default DashboardFooter; 