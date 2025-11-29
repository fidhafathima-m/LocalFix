import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  HelpOutlineOutlined,
  MessageOutlined,
  ExpandMoreOutlined,
} from "@mui/icons-material";

export const SupportSection: React.FC = () => {
  const [showChatSupport, setShowChatSupport] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const navigate = useNavigate();

  const faqs = [
    {
      question: "How do I reschedule my booking?",
      answer:
        "You can reschedule your booking by going to My Bookings > Upcoming, and clicking on the 'Reschedule' button next to the booking you want to change. Please note that rescheduling must be done at least 4 hours before the scheduled appointment time.",
    },
    {
      question: "What is your cancellation policy?",
      answer:
        "You can cancel a booking up to 4 hours before the scheduled appointment time without any charges. For cancellations made less than 4 hours before the appointment, a cancellation fee of ₹200 or 10% of the service cost (whichever is higher) may apply.",
    },
    {
      question: "How can I get an invoice for my service?",
      answer:
        "Invoices are automatically generated after the service is completed and the payment is processed. You can find and download your invoices by going to Payments & Wallet Payment History and clicking on the 'Invoice' button next to the respective payment.",
    },
    {
      question: "Are your technicians verified?",
      answer:
        "Yes, all our technicians undergo a thorough background verification process. We check their identity, address, professional certifications, and work experience before onboarding them on our platform. You can see the 'Verified' badge on all technician profiles.",
    },
    {
      question: "How can I report an issue with my service?",
      answer:
        "If you're facing any issues with your service, you can either raise a ticket from the Support section or contact our customer support team directly at +91-9876543210. We aim to resolve all service-related issues within 24 hours.",
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <h2 className="text-lg font-semibold mb-4">Support & Help</h2>
      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setShowChatSupport(false)}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
            !showChatSupport
              ? "bg-blue-50 text-blue-600"
              : "text-gray-600 hover:bg-gray-50"
          }`}
        >
          <HelpOutlineOutlined className="w-5 h-5" />
          <span>FAQs</span>
        </button>
        <button
          onClick={() => setShowChatSupport(true)}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
            showChatSupport
              ? "bg-blue-50 text-blue-600"
              : "text-gray-600 hover:bg-gray-50"
          }`}
        >
          <MessageOutlined className="w-5 h-5" />
          <span>Chat Support</span>
        </button>
      </div>
      {!showChatSupport ? (
        <div>
          <h3 className="font-semibold mb-3">Frequently Asked Questions</h3>
          <div className="space-y-2">
            {faqs.map((faq, index) => (
              <div key={index} className="border border-gray-200 rounded-lg">
                <button
                  onClick={() =>
                    setExpandedFaq(expandedFaq === index ? null : index)
                  }
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50"
                >
                  <span className="font-medium text-sm">{faq.question}</span>
                  <ExpandMoreOutlined
                    className={`w-5 h-5 text-gray-400 transition-transform ${
                      expandedFaq === index ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {expandedFaq === index && (
                  <div className="px-4 pb-4">
                    <p className="text-sm text-gray-600">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="border border-gray-200 rounded-lg p-6">
          <div className="text-center mb-4">
            <MessageOutlined className="w-12 h-12 text-blue-600 mx-auto mb-2" />
            <h3 className="font-semibold mb-1">Chat with Support</h3>
            <p className="text-sm text-gray-600">
              Our support team is here to help you
            </p>
          </div>
          <button
            onClick={() => navigate("/chatbot")}
            className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
          >
            Start Chat
          </button>
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm font-medium text-blue-900 mb-2">Messages</p>
            <p className="text-sm text-blue-700">
              Send us a message about anything
            </p>
          </div>
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600 mb-2">Need urgent help?</p>
            <p className="text-sm">Call our customer support team</p>
            <p className="text-lg font-semibold text-blue-600 mt-1">
              +91 9876543210
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
