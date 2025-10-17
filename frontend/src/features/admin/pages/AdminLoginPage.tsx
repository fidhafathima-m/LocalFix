import Header from "../../../components/common/Header";
import Footer from "../../../components/common/Footer";
import AdminLogin from "../components/AdminLogin";

const AdminLoginPage = () => {
  return (
    <div>
      <Header userType="admin" />
        <AdminLogin/>
      <Footer />
    </div>
  );
};

export default AdminLoginPage;
