import Header from "../../../components/common/Header";
import Footer from "../../../components/common/Footer";
import { useAppSelector } from "../../../hooks/redux";
import LoggedInBanner from "../components/techHome/LoggedInBanner";
import PublicBanner from "../components/techHome/PublicBanner";
import WhyJoinSection from "../components/techHome/WhyJoinSection";
import CallToActionSection from "../components/techHome/CallToActionSection";

const TechHome = () => {
  const { isLoggedIn, user } = useAppSelector((state) => state.auth);

  const isServiceProvider = user?.roles?.includes("serviceProvider") || false;

  return (
    <div>
      <Header userType="serviceProvider" />

      {isLoggedIn && isServiceProvider ? (
        <LoggedInBanner user={user} />
      ) : (
        <PublicBanner />
      )}

      <WhyJoinSection />
      <CallToActionSection isLoggedIn={isLoggedIn} />

      <Footer />
    </div>
  );
};

export default TechHome;