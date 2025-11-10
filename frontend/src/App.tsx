import "./App.css";
import { NotificationProvider } from "./context/notificationContext/NotificationContext";
import { useAppSelector } from "./hooks/redux";
import AppRoutes from "./routes/AppRoutes";

function App() {
  const { user } = useAppSelector((state) => state.auth);
  return (
    <NotificationProvider userId={user?._id}>
      <AppRoutes />
    </NotificationProvider>
);
}

export default App;
