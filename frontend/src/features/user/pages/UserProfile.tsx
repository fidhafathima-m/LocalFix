import { useState } from "react";
import {
  FmdGoodOutlined,
  EditOutlined,
  DeleteOutlineOutlined,
  CreditCardOutlined,
  AccountBalanceWalletOutlined,
  NotificationsNoneOutlined,
  HelpOutlineOutlined,
  ShieldOutlined,
  CheckCircleOutlineOutlined,
  StarBorderOutlined,
  ExpandMoreOutlined,
  MessageOutlined,
  AddOutlined,
} from "@mui/icons-material";
import Header from "../../../components/common/Header";
import Footer from "../../../components/common/Footer";
const UserProfile: React.FC = () => {
  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState<number | null>(null);
  const [showChatSupport, setShowChatSupport] = useState(false);
  const [activeTab, setActiveTab] = useState<"history" | "wallet">("history");
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [personalInfo, setPersonalInfo] = useState({
    fullName: "John Doe",
    phoneNumber: "+91 9876543210",
    email: "john.doe@example.com",
    dateOfBirth: "15/03/1990",
    gender: "Male",
  });
  const [addresses, setAddresses] = useState([
    {
      id: 1,
      type: "Home",
      address: "123 Main Street, Apartment 4B",
      landmark: "Near City Park",
      pincode: "400001",
    },
    {
      id: 2,
      type: "Work",
      address: "456 Business Avenue, Floor 3",
      landmark: "Opposite Grand Hotel",
      pincode: "400002",
    },
  ]);
  const [tempPersonalInfo, setTempPersonalInfo] = useState(personalInfo);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [tempAddress, setTempAddress] = useState<any>(null);
  const transactions = [
    {
      id: "#8090",
      service: "Refrigerator Repair",
      amount: "₹1200",
      date: "15/12/2023",
      status: "Paid",
    },
    {
      id: "#7899",
      service: "TV Repair - Cancelled",
      amount: "₹800",
      date: "10/12/2023",
      status: "Refund",
    },
    {
      id: "#6789",
      service: "AC Service",
      amount: "₹1500",
      date: "05/12/2023",
      status: "Paid",
    },
  ];
  const reviews = [
    {
      service: "AC Repair",
      technician: "Rajesh Kumar",
      date: "8/15/2023",
      rating: 5,
      comment:
        "Very professional service. The technician arrived on time and fixed my AC in less than an hour. Highly recommended!",
    },
    {
      service: "Refrigerator Service",
      technician: "Amit Sharma",
      date: "6/22/2023",
      rating: 4,
      comment:
        "Good service, but took a bit longer than expected. The technician was knowledgeable though.",
    },
  ];
  const notifications = [
    {
      type: "booking",
      icon: <CheckCircleOutlineOutlined className="w-5 h-5 text-green-600" />,
      message:
        "Technician Jai has confirmed your AC repair booking for tomorrow at 10:00 AM",
      time: "2h ago",
    },
    {
      type: "payment",
      icon: <CreditCardOutlined className="w-5 h-5 text-green-600" />,
      message: "₹1200 paid successfully for Refrigerator Repair service",
      time: "1d ago",
    },
    {
      type: "offer",
      icon: <NotificationsNoneOutlined className="w-5 h-5 text-yellow-600" />,
      message:
        "Get 15% off on your next AC service booking. Use code ACC15APR3",
      time: "2d ago",
    },
    {
      type: "parts",
      icon: <AccountBalanceWalletOutlined className="w-5 h-5 text-blue-600" />,
      message:
        "Your technician has requested spare parts for your AC repair booking",
      time: "3d ago",
    },
  ];
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
  const handleSavePersonal = () => {
    setPersonalInfo(tempPersonalInfo);
    setIsEditingPersonal(false);
  };
  const handleCancelPersonal = () => {
    setTempPersonalInfo(personalInfo);
    setIsEditingPersonal(false);
  };
  const handleSaveAddress = (id: number) => {
    setAddresses(
      addresses.map((addr) => (addr.id === id ? tempAddress : addr))
    );
    setIsEditingAddress(null);
    setTempAddress(null);
  };
  const handleCancelAddress = () => {
    setIsEditingAddress(null);
    setTempAddress(null);
  };
  const handleDeleteAddress = (id: number) => {
    setAddresses(addresses.filter((addr) => addr.id !== id));
  };
  return (
    <>
      <Header />
      <div className="w-full min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">My Profile</h1>
            <button className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700">
              Book a Service
            </button>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <img
                  src="https://uploadthingy.s3.us-west-1.amazonaws.com/2KgHrawW7BA8Vug5xgz31c/User_Profile.png"
                  alt="Profile"
                  className="w-20 h-20 rounded-full object-cover"
                />
                <div>
                  <h2 className="text-xl font-bold">{personalInfo.fullName}</h2>
                  <p className="text-sm text-gray-600">
                    {personalInfo.phoneNumber}
                  </p>
                  <p className="text-sm text-green-600 flex items-center mt-1">
                    <CheckCircleOutlineOutlined className="w-4 h-4 mr-1" />
                    Verified
                  </p>
                  <p className="text-sm text-gray-600">{personalInfo.email}</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditingPersonal(true)}
                className="text-blue-600 hover:text-blue-700 flex items-center space-x-1"
              >
                <EditOutlined className="w-4 h-4" />
                <span className="text-sm font-medium">Edit Profile</span>
              </button>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Personal Information</h2>
              {!isEditingPersonal && (
                <button
                  onClick={() => setIsEditingPersonal(true)}
                  className="text-blue-600 hover:text-blue-700 flex items-center space-x-1"
                >
                  <EditOutlined className="w-4 h-4" />
                  <span className="text-sm">Edit</span>
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Full Name
                </label>
                {isEditingPersonal ? (
                  <input
                    type="text"
                    value={tempPersonalInfo.fullName}
                    onChange={(e) =>
                      setTempPersonalInfo({
                        ...tempPersonalInfo,
                        fullName: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="font-medium">{personalInfo.fullName}</p>
                )}
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Phone Number
                </label>
                {isEditingPersonal ? (
                  <input
                    type="tel"
                    value={tempPersonalInfo.phoneNumber}
                    onChange={(e) =>
                      setTempPersonalInfo({
                        ...tempPersonalInfo,
                        phoneNumber: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="font-medium">{personalInfo.phoneNumber}</p>
                )}
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Email
                </label>
                {isEditingPersonal ? (
                  <input
                    type="email"
                    value={tempPersonalInfo.email}
                    onChange={(e) =>
                      setTempPersonalInfo({
                        ...tempPersonalInfo,
                        email: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="font-medium">{personalInfo.email}</p>
                )}
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Date of Birth
                </label>
                {isEditingPersonal ? (
                  <input
                    type="text"
                    value={tempPersonalInfo.dateOfBirth}
                    onChange={(e) =>
                      setTempPersonalInfo({
                        ...tempPersonalInfo,
                        dateOfBirth: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="font-medium">{personalInfo.dateOfBirth}</p>
                )}
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Gender
                </label>
                {isEditingPersonal ? (
                  <select
                    value={tempPersonalInfo.gender}
                    onChange={(e) =>
                      setTempPersonalInfo({
                        ...tempPersonalInfo,
                        gender: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                ) : (
                  <p className="font-medium">{personalInfo.gender}</p>
                )}
              </div>
            </div>
            {isEditingPersonal && (
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={handleCancelPersonal}
                  className="px-6 py-2 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSavePersonal}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            )}
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Saved Addresses</h2>
              <button className="text-blue-600 hover:text-blue-700 flex items-center space-x-1">
                <AddOutlined className="w-4 h-4" />
                <span className="text-sm">Add New Address</span>
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {addresses.map((address) => (
                <div
                  key={address.id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center space-x-2">
                      <FmdGoodOutlined className="w-5 h-5 text-blue-600" />
                      <span className="font-semibold">{address.type}</span>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setIsEditingAddress(address.id);
                          setTempAddress(address);
                        }}
                        className="text-gray-600 hover:text-blue-600"
                      >
                        <EditOutlined className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteAddress(address.id)}
                        className="text-gray-600 hover:text-red-600"
                      >
                        <DeleteOutlineOutlined className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  {isEditingAddress === address.id ? (
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={tempAddress.address}
                        onChange={(e) =>
                          setTempAddress({
                            ...tempAddress,
                            address: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Address"
                      />
                      <input
                        type="text"
                        value={tempAddress.landmark}
                        onChange={(e) =>
                          setTempAddress({
                            ...tempAddress,
                            landmark: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Landmark"
                      />
                      <input
                        type="text"
                        value={tempAddress.pincode}
                        onChange={(e) =>
                          setTempAddress({
                            ...tempAddress,
                            pincode: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Pincode"
                      />
                      <div className="flex space-x-2">
                        <button
                          onClick={handleCancelAddress}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleSaveAddress(address.id)}
                          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm text-gray-600 mb-1">
                        {address.address}
                      </p>
                      <p className="text-sm text-gray-500">
                        Landmark: {address.landmark}
                      </p>
                      <p className="text-sm text-gray-500">
                        Pincode: {address.pincode}
                      </p>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Payments & Wallet</h2>
            <div className="flex space-x-4 mb-6 border-b border-gray-200">
              <button
                onClick={() => setActiveTab("history")}
                className={`pb-3 px-2 font-medium ${
                  activeTab === "history"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600"
                }`}
              >
                Payment History
              </button>
              <button
                onClick={() => setActiveTab("wallet")}
                className={`pb-3 px-2 font-medium ${
                  activeTab === "wallet"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600"
                }`}
              >
                Wallet
              </button>
            </div>
            {activeTab === "wallet" && (
              <div className="bg-blue-600 rounded-lg p-6 mb-6">
                <div className="flex items-center justify-between text-white mb-4">
                  <div>
                    <p className="text-sm opacity-90 mb-1">Available Balance</p>
                    <p className="text-3xl font-bold">₹750</p>
                  </div>
                  <AccountBalanceWalletOutlined className="w-12 h-12 opacity-80" />
                </div>
                <div className="flex space-x-3">
                  <button className="flex-1 bg-white text-blue-600 py-2 rounded-lg font-semibold hover:bg-blue-50 flex items-center justify-center space-x-2">
                    <AddOutlined className="w-4 h-4" />
                    <span>Add Money</span>
                  </button>
                  <button className="flex-1 bg-blue-700 text-white py-2 rounded-lg font-semibold hover:bg-blue-800 flex items-center justify-center space-x-2">
                    <CreditCardOutlined className="w-4 h-4" />
                    <span>Withdraw</span>
                  </button>
                </div>
              </div>
            )}
            <div>
              <h3 className="font-semibold mb-3">Transaction History</h3>
              <div className="space-y-3">
                {transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-sm">
                        {transaction.service}
                      </p>
                      <p className="text-xs text-gray-500">
                        {transaction.date}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{transaction.amount}</p>
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          transaction.status === "Paid"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {transaction.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Reviews & Ratings</h2>
            <div className="space-y-4">
              {reviews.map((review, index) => (
                <div
                  key={index}
                  className="border-b border-gray-200 pb-4 last:border-b-0"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold">{review.service}</p>
                      <p className="text-sm text-gray-600">
                        Technician: {review.technician}
                      </p>
                    </div>
                    <span className="text-sm text-gray-500">{review.date}</span>
                  </div>
                  <div className="flex items-center space-x-1 mb-2">
                    {[...Array(review.rating)].map((_, i) => (
                      <StarBorderOutlined
                        key={i}
                        className="w-4 h-4 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                  </div>
                  <p className="text-sm text-gray-600">{review.comment}</p>
                  <div className="flex space-x-4 mt-2">
                    <button className="text-sm text-blue-600 hover:underline flex items-center space-x-1">
                      <EditOutlined className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                    <button className="text-sm text-red-600 hover:underline flex items-center space-x-1">
                      <DeleteOutlineOutlined className="w-3 h-3" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Notifications</h2>
              <button className="text-sm text-blue-600 hover:underline">
                Mark all as read
              </button>
            </div>
            <div className="space-y-3">
              {notifications.map((notification, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg"
                >
                  {notification.icon}
                  <div className="flex-1">
                    <p className="text-sm text-gray-800">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {notification.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 py-2 text-sm text-blue-600 hover:underline">
              View All Notifications
            </button>
          </div>
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
                <h3 className="font-semibold mb-3">
                  Frequently Asked Questions
                </h3>
                <div className="space-y-2">
                  {faqs.map((faq, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg"
                    >
                      <button
                        onClick={() =>
                          setExpandedFaq(expandedFaq === index ? null : index)
                        }
                        className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50"
                      >
                        <span className="font-medium text-sm">
                          {faq.question}
                        </span>
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
                <button className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700">
                  Start Chat
                </button>
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium text-blue-900 mb-2">
                    Messages
                  </p>
                  <p className="text-sm text-blue-700">
                    Send us a message about anything
                  </p>
                </div>
                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-600 mb-2">
                    Need urgent help?
                  </p>
                  <p className="text-sm">Call our customer support team</p>
                  <p className="text-lg font-semibold text-blue-600 mt-1">
                    +91 9876543210
                  </p>
                </div>
              </div>
            )}
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Security & Settings</h2>
            <div className="space-y-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <ShieldOutlined className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="font-semibold">Password</p>
                      <p className="text-sm text-gray-600">
                        Your password was last changed 3 months ago
                      </p>
                    </div>
                  </div>
                </div>
                <button className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700">
                  Change Password
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default UserProfile;
