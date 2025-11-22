import React, { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { logout } from "../../store/slices/authSlice";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import {
  LogoutOutlined,
  NotificationsNoneOutlined,
  QuestionAnswerOutlined,
} from "@mui/icons-material";
import { useNotification } from "../../context/notificationContext/NotificationContext";
import { useSocket } from "../../context/SocketContext";
import { NotificationDropdown } from "./NotificationDropdown";
import { useMessage } from "../../context/MessageContext";

interface HeaderProps {
  isApproved?: boolean;
  userType?: "user" | "serviceProvider" | "admin";
}

const Header: React.FC<HeaderProps> = ({
  userType: propUserType,
  isApproved,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isClient, setIsClient] = useState(false);

  const { notificationCount } = useNotification();
  const [showNotificationDropdown, setShowNotificationDropdown] =
    useState(false);
  const { socket, isConnected } = useSocket();
  const { unreadMessageCount, markAllMessagesAsRead } = useMessage();
  const dispatch = useAppDispatch();
  const { isLoggedIn, user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    console.log(
      "Socket connection status:",
      isConnected ? "Connected" : "Disconnected"
    );
    console.log("Socket object:", socket);
  }, [isConnected, socket]);

  useEffect(() => {
    if (!socket || !isConnected || !isLoggedIn) return;

    const handleUnreadCountUpdate = (data: {
      count: number;
      userType: string;
    }) => {
      // This will automatically update the badge via the context
      console.log("Real-time unread count update:", data.count);
    };

    // Check if socket has on method
    if (typeof socket.on === "function") {
      socket.on("unread-message-count-update", handleUnreadCountUpdate);

      return () => {
        socket.off("unread-message-count-update", handleUnreadCountUpdate);
      };
    } else {
      console.warn("Socket object does not have 'on' method:", socket);
    }
  }, [socket, isConnected, isLoggedIn]);

  const getUserType = () => {
    if (propUserType) return propUserType;

    if (user?.roles && user.roles.length > 0) {
      return user.roles[0] as "user" | "serviceProvider" | "admin";
    }

    return "user";
  };

  const userType = getUserType();

  const navigate = useNavigate();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleMessagesClick = async () => {
    // Mark all messages as read before navigating
    if (unreadMessageCount > 0) {
      await markAllMessagesAsRead();
    }

    // Navigate to messages page
    if (userType === "serviceProvider") {
      navigate("/technician/messages");
    } else {
      navigate("/messages");
    }

    closeMobileMenu();
  };

  const handleProfileClick = () => {
    if (userType === "serviceProvider") {
      navigate("/technician/profile");
    } else {
      navigate("/my-profile");
    }
    closeMobileMenu();
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      closeMobileMenu();
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleNotificationClick = () => {
    if (userType === "serviceProvider") {
      navigate("/technician/dashboard?tab=notifications");
    } else {
      navigate("/my-profile#notifications");
    }
    closeMobileMenu();
  };

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You will be logged out.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, logout!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      dispatch(logout());
      if (userType === "serviceProvider") {
        navigate("/technicians", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
      toast.success("You have been logged out!");
    }
  };

  // Close mobile menu when window is resized to desktop size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false);
      }
    };

    // Handle scroll to add shadow
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const signUpButtonStyles =
    "bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-medium";
  const mobileSignUpButtonStyles =
    "bg-blue-600 text-white px-6 py-3.5 rounded-lg hover:bg-blue-700 transition-colors font-medium text-center mx-4 my-2";

  // Get user profile picture or fallback to initials
  const getUserAvatar = () => {
    if (!user) return null;

    // For regular users or fallback
    return user.profilePictureUrl;
  };

  const getUserInitials = () => {
    if (!user) return "U";

    if (user.fullName) {
      return user.fullName.charAt(0).toUpperCase();
    }

    if (user.email) {
      return user.email.charAt(0).toUpperCase();
    }

    return "U";
  };

  const links = () => {
    if (!isClient) {
      return [<div key="placeholder" className="h-6"></div>];
    }

    switch (userType) {
      case "user":
        if (!isLoggedIn) {
          return [
            <a
              key="services"
              href="/services"
              className="px-3 hover:text-blue-600 transition-colors"
              onClick={closeMobileMenu}
            >
              Services
            </a>,
            <button
              key="how"
              className="px-3 hover:text-blue-600 transition-colors cursor-pointer"
              onClick={() => scrollToSection("how-it-works")}
            >
              How it works
            </button>,
            <a
              key="technicians"
              href="/technicians"
              className="px-3 hover:text-blue-600 transition-colors"
              onClick={closeMobileMenu}
            >
              For Technicians
            </a>,
            <a
              key="login"
              href="/login"
              className="px-3 hover:text-blue-600 transition-colors"
              onClick={closeMobileMenu}
            >
              Login
            </a>,
            <a
              key="signup"
              href="/signup"
              className={`ml-2 ${signUpButtonStyles}`}
              onClick={closeMobileMenu}
            >
              Sign up
            </a>,
          ];
        } else {
          return [
            <a
              key="services"
              href="/services"
              className="px-3 hover:text-blue-600 transition-colors"
              onClick={closeMobileMenu}
            >
              Services
            </a>,
            <button
              key="how"
              className="px-3 hover:text-blue-600 transition-colors cursor-pointer"
              onClick={() => scrollToSection("how-it-works")}
            >
              How it works
            </button>,
            <a
              key="orders"
              href="/orders"
              className="px-3 hover:text-blue-600 transition-colors"
              onClick={closeMobileMenu}
            >
              My Orders
            </a>,
            <button
              key="messages"
              onClick={handleMessagesClick}
              className="relative px-3 hover:text-blue-600 transition-colors cursor-pointer flex items-center"
              title="Messages"
            >
              <QuestionAnswerOutlined />
              {unreadMessageCount > 0 && (
                <span className="absolute -top-2 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center min-w-[20px]">
                  {unreadMessageCount > 9 ? "9+" : unreadMessageCount}
                </span>
              )}
            </button>,
            <button
              key="notifications"
              onClick={() =>
                setShowNotificationDropdown(!showNotificationDropdown)
              }
              className="relative px-3 hover:text-blue-600 transition-colors cursor-pointer flex items-center"
              title="Notifications"
            >
              <NotificationsNoneOutlined className="w-5 h-5" />
              {notificationCount > 0 && (
                <span className="absolute -top-2 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center min-w-[20px]">
                  {notificationCount > 9 ? "9+" : notificationCount}
                </span>
              )}
            </button>,
            <button
              key="profile"
              onClick={handleProfileClick}
              className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors cursor-pointer ml-2"
              title="Profile"
            >
              {getUserAvatar() ? (
                <img
                  src={getUserAvatar()!}
                  alt="Profile"
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <span className="text-gray-600 text-sm font-medium">
                  {getUserInitials()}
                </span>
              )}
            </button>,
            <button
              key="logout"
              onClick={handleLogout}
              className="px-3 text-red-500 hover:text-blue-600 transition-colors cursor-pointer"
            >
              <LogoutOutlined />
            </button>,
          ];
        }

      case "serviceProvider":
        if (!isLoggedIn) {
          return [
            <a
              key="sp-services"
              href="/technicians/services"
              className="px-3 hover:text-blue-600 transition-colors"
              onClick={closeMobileMenu}
            >
              Services
            </a>,
            <a
              key="sp-how"
              href="/technicians/how-it-works"
              className="px-3 hover:text-blue-600 transition-colors"
              onClick={closeMobileMenu}
            >
              How it works
            </a>,
            <button
              key="why"
              className="px-3 hover:text-blue-600 transition-colors cursor-pointer"
              onClick={() => scrollToSection("why-join")}
            >
              Why Join
            </button>,
            <a
              key="users"
              href="/"
              className="px-3 hover:text-blue-600 transition-colors"
              onClick={closeMobileMenu}
            >
              Users
            </a>,
            <a
              key="sp-login"
              href="/technicians/login"
              className="px-3 hover:text-blue-600 transition-colors"
              onClick={closeMobileMenu}
            >
              Login
            </a>,
            <a
              key="signup"
              href="/technicians/signup"
              className={`ml-2 ${signUpButtonStyles}`}
              onClick={closeMobileMenu}
            >
              Sign Up
            </a>,
          ];
        } else {
          if (!isApproved) {
            return [
              <button
                key="logout"
                onClick={handleLogout}
                className="px-3 text-red-500 hover:text-blue-600 transition-colors cursor-pointer"
              >
                <LogoutOutlined />
              </button>,
            ];
          } else if (isApproved) {
            return [
              <a
                key="dashboard"
                href="/technician/dashboard"
                className="px-3 hover:text-blue-600 transition-colors"
                onClick={closeMobileMenu}
              >
                Dashboard
              </a>,
              <a
                key="messages"
                href="/technician/messages"
                className="px-3 hover:text-blue-600 transition-colors"
                onClick={closeMobileMenu}
              >
                Messages
              </a>,
              <button
                key="logout"
                onClick={handleLogout}
                className="px-3 text-red-500 hover:text-blue-600 transition-colors cursor-pointer"
              >
                <LogoutOutlined />
              </button>,
            ];
          } else {
            return [
              <a
                key="home"
                href="/technicians"
                className="px-3 hover:text-blue-600 transition-colors"
                onClick={closeMobileMenu}
              >
                Home
              </a>,
              <a
                key="apply"
                href="/technicians/apply"
                className="px-3 hover:text-blue-600 transition-colors"
                onClick={closeMobileMenu}
              >
                Apply Now
              </a>,
              <button
                key="logout"
                onClick={handleLogout}
                className="px-3 text-red-500 hover:text-blue-600 transition-colors cursor-pointer"
              >
                <LogoutOutlined />
              </button>,
            ];
          }
        }
      case "admin":
        if (isLoggedIn) {
          return [
            <button
              key="logout"
              onClick={handleLogout}
              className="px-3 text-red-500 hover:text-blue-600 transition-colors cursor-pointer"
            >
              <LogoutOutlined />
            </button>,
          ];
        } else {
          return [];
        }
    }
  };

  const mobileLinks = () => {
    const desktopLinks = links();

    return React.Children.toArray(desktopLinks).map((child) => {
      if (!React.isValidElement(child)) return child;

      const element = child as React.ReactElement<{
        className?: string;
        onClick?: () => void;
        href?: string;
      }>;

      // Handle signup buttons
      if (element.props.className?.includes(signUpButtonStyles)) {
        return React.cloneElement(element, {
          className: mobileSignUpButtonStyles,
          onClick: closeMobileMenu,
        });
      }

      // Handle logout buttons
      if (element.type === "button" && element.props.onClick) {
        return React.cloneElement(element, {
          className:
            "block w-full px-6 py-4 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 font-medium border-b border-gray-100 text-left",
          onClick: () => {
            element.props.onClick?.();
            closeMobileMenu();
          },
        });
      }

      // Handle regular links
      return React.cloneElement(element, {
        className:
          "block w-full px-6 py-4 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 font-medium border-b border-gray-100",
        onClick: closeMobileMenu,
      });
    });
  };

  return (
    <header
      className={`sticky top-0 z-50 bg-white transition-shadow ${
        isScrolled ? "shadow-md" : "shadow-sm"
      }`}
    >
      {/* Main Header */}
      <div className="flex items-center justify-between mx-auto px-4">
        <h1 className="text-blue-600 text-xl py-5 font-bold">
          {userType === "serviceProvider" ? (
            <a href="/technicians">Localfix</a>
          ) : (
            <a href="/">Localfix</a>
          )}
        </h1>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex gap-1 items-center text-sm">
          {links()}
        </nav>

        {/* Mobile Hamburger Button */}
        <button
          className="lg:hidden p-5 focus:outline-none"
          onClick={toggleMobileMenu}
          aria-label="Toggle mobile menu"
          aria-expanded={isMobileMenuOpen}
        >
          <div className="w-6 h-6 flex flex-col justify-center items-center relative">
            <span
              className={`bg-gray-800 block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm ${
                isMobileMenuOpen
                  ? "rotate-45 translate-y-1"
                  : "-translate-y-0.5"
              }`}
            ></span>
            <span
              className={`bg-gray-800 block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm my-0.5 ${
                isMobileMenuOpen ? "opacity-0" : "opacity-100"
              }`}
            ></span>
            <span
              className={`bg-gray-800 block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm ${
                isMobileMenuOpen
                  ? "-rotate-45 -translate-y-1"
                  : "translate-y-0.5"
              }`}
            ></span>
          </div>
        </button>
      </div>

      {/* Mobile Navigation Overlay */}
      <div
        className={`lg:hidden fixed inset-0 z-40 transition-opacity duration-300 ease-in-out ${
          isMobileMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        <div
          className="absolute inset-0 text-gray-400 bg-opacity-30 backdrop-blur-sm"
          onClick={closeMobileMenu}
        ></div>
        <div
          className={`absolute top-0 right-0 h-full w-4/5 max-w-sm bg-white/95 shadow-xl transform transition-transform duration-300 ease-in-out ${
            isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex flex-col h-full overflow-y-auto">
            <div className="flex justify-between items-center p-5 border-b">
              <h2 className="text-lg font-semibold text-gray-800">Menu</h2>
              <button
                onClick={closeMobileMenu}
                className="p-2 rounded-full hover:bg-gray-100"
                aria-label="Close menu"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <nav className="flex-1 py-2">
              <div className="flex flex-col">{mobileLinks()}</div>
            </nav>
            <div className="p-5 border-t border-gray-100 text-center text-sm text-gray-500">
              © {new Date().getFullYear()} Localfix
            </div>
          </div>
        </div>
      </div>
      {isLoggedIn && user && (
        <div className="relative">
          <NotificationDropdown
            userId={user._id}
            userType={userType}
            isOpen={showNotificationDropdown}
            onClose={() => setShowNotificationDropdown(false)}
          />
        </div>
      )}
    </header>
  );
};

export default Header;
