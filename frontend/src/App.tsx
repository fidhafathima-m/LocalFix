import "./App.css";
import { NotificationProvider } from "./context/notificationContext/NotificationContext";
import { useAppSelector } from "./hooks/redux";
import AppRoutes from "./routes/AppRoutes";
import { useEffect } from "react";

function App() {
  const { user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (user?._id) {
      requestNotificationPermission();
    }
  }, [user?._id]);

  const requestNotificationPermission = () => {
    if ("Notification" in window) {
      if (Notification.permission === "default") {
        Notification.requestPermission().then((permission) => {
          console.log("Notification permission:", permission);
          if (permission === "granted") {
            console.log("Browser notifications enabled!");
          } else if (permission === "denied") {
            console.log("Browser notifications blocked");
          }
        });
      } else {
        console.log(
          "Notification permission already:",
          Notification.permission
        );
      }
    } else {
      console.log("This browser does not support notifications");
    }
  };

  return (
    <NotificationProvider userId={user?._id}>
      <AppRoutes />
    </NotificationProvider>
  );
}

export default App;
