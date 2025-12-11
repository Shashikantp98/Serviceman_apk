import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { lazy, useEffect } from "react";
import "./App.css";
import { AuthProvider } from "./contexts/AuthContext";
import { ToastContainer } from "react-toastify";
import Supportlist from "./pages/Supportlist";
import { initPushNotifications } from "../src/components/pushNotifications";
import { Capacitor } from "@capacitor/core";
import { App as CapApp } from "@capacitor/app";
import { setNavigator } from "./components/PushNavigate";
import { useNavigate } from "react-router-dom";
import ApiService from "./services/api";

// const Splash = lazy(() => import("./pages/Splash"));
const Select = lazy(() => import("./pages/Select"));
const Slider = lazy(() => import("./pages/Slider"));
const Mobile = lazy(() => import("./pages/Mobile"));
const Otp = lazy(() => import("./pages/Otp"));
const Setpin = lazy(() => import("./pages/Setpin"));
const Location = lazy(() => import("./pages/Location"));
const Language = lazy(() => import("./pages/Language"));
const Home = lazy(() => import("./pages/Home"));
const Summery = lazy(() => import("./pages/Summery"));
// const Address = lazy(() => import("./pages/Address"));
const Paymentdone = lazy(() => import("./pages/Paymentdone"));
const Successmsg = lazy(() => import("./pages/Successmsg"));
const Myrequest = lazy(() => import("./pages/Myrequest"));
const Projectinfo = lazy(() => import("./pages/Projectinfo"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Wallet = lazy(() => import("./pages/Wallet"));
const Support = lazy(() => import("./pages/Support"));
const Profile = lazy(() => import("./pages/Profile"));
const Servicedetail = lazy(() => import("./pages/Servicedetail"));
const Bookinghistory = lazy(() => import("./pages/Bookinghistory"));
const Regestration = lazy(() => import("./pages/Regestration"));
const Servicemenprofile = lazy(() => import("./pages/Servicemenprofile"));
const Capture = lazy(() => import("./pages/Capture"));
const Paymentoption = lazy(() => import("./pages/Paymentoption"));
const Slider2 = lazy(() => import("./pages/Slider2"));
const ServicemenLogin = lazy(() => import("./pages/ServicemenLogin"));
const PublicRoute = lazy(() => import("./components/PublicRoute"));
const AuthenticatedLayout = lazy(() => import("./layouts/AuthenticatedLayout"));
const PublicLayout = lazy(() => import("./layouts/PublicLayout"));
const ProtectedRoute = lazy(() => import("./components/ProtectedRoute"));
const ServicemenRegister = lazy(() => import("./pages/ServicemenRegister"));
const ServicemenOtp = lazy(() => import("./pages/ServicemenOtp"));
const ServicemenPin = lazy(() => import("./pages/ServicemenPin"));
const ForgotPhone = lazy(() => import("./pages/ForgotPhone"));
const ForgotOtp = lazy(() => import("./pages/ForgotOtp"));
const UpdatePin = lazy(() => import("./components/UpdatePin"));
const PolicyDetails = lazy(() => import("./pages/PolicyDetails"));
const EditServicemen = lazy(() => import("./pages/EditServicemen"));
const AuthLocation = lazy(() => import("./pages/AuthLocation"));
const NotificationsList = lazy(() => import("./pages/NotificationsList"));
const Searchpage = lazy(() => import("./pages/Searchpage"));
const CustomerProfile = lazy(() => import("./pages/CustomerProfile"));
const MyCustomerProfile = lazy(() => import("./pages/MyCustomerProfile"));
const EditCustomer = lazy(() => import("./pages/EditCustomer"));
const ServiceList = lazy(() => import("./pages/ServiceList"));
const CategoriesList = lazy(() => import("./pages/CategoriesList"));
const ServiceByCat = lazy(() => import("./pages/ServiceByCat"));
const Addressdetails = lazy(() => import("./pages/Addressdetails"));
const AuthAddress = lazy(() => import("./pages/AuthAddress"));
const CustomerProjectinfo = lazy(() => import("./pages/CustomerProjectinfo"));
const PrivacyCenter = lazy(() => import("./pages/PrivacyCenter"));
const AllReviews = lazy(() => import("./pages/Reviews"))

function AppContent() {
  const navigate = useNavigate();

  useEffect(() => {
    setNavigator(navigate); // Enable push navigation
  }, [navigate]);

  useEffect(() => {
    if (Capacitor.getPlatform() !== "web") {
      console.log("Initializing Push Notifications on device...");
      initPushNotifications();

      // Update FCM token when app resumes from background
      const appStateListener = CapApp.addListener('appStateChange', async ({ isActive }) => {
        if (isActive && (window as any).fcmToken) {
          const token = localStorage.getItem('token');
          if (token) {
            console.log('App resumed - updating FCM token');
            await ApiService.post("/user/updateFcmToken", {
              fcm_token: (window as any).fcmToken
            }).catch(err => console.error('FCM token update failed:', err));
          }
        }
      });

      // Cleanup listener on unmount
      return () => {
        appStateListener.then(listener => listener.remove());
      };
    } else {
      console.log("Push notifications skipped: running on web");
    }
  }, []);

  return (
    <Routes>
      {/* AuthLocation - accessible to all users (guest or authenticated) */}
      <Route path="authlocation" element={<AuthLocation />} />


            {/* Public routes - only accessible when NOT authenticated */}
            <Route
              path="/"
              element={
                <PublicRoute>
                  <PublicLayout />
                </PublicRoute>
              }
            >
              <Route path="/" element={<Select />} />
              <Route path="select" element={<Select />} />
              <Route path="slider" element={<Slider />} />
              <Route path="slider2" element={<Slider2 />} />

              {/* Servicemen routes start unauth */}

              <Route path="servicemenlogin" element={<ServicemenLogin />} />
              <Route
                path="servicemenregister"
                element={<ServicemenRegister />}
              />
              <Route path="servicemenotp" element={<ServicemenOtp />} />
              <Route path="servicemenpin" element={<ServicemenPin />} />
              {/* Servicemen routes end unauth */}

              <Route path="mobile" element={<Mobile />} />
              <Route path="otp" element={<Otp />} />
              <Route path="setpin" element={<Setpin />} />
              <Route path="location" element={<Location />} />
              <Route path="language" element={<Language />} />

              <Route path="forgot-phone" element={<ForgotPhone />} />
              <Route path="forgot-otp" element={<ForgotOtp />} />
              <Route path="registration" element={<Regestration />} />

              {/* <Route path="forgot-set-pin" element={<ForgotSetPin />} /> */}
            </Route>
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <AuthenticatedLayout />
                </ProtectedRoute>
              }
            >
              <Route path="home" element={<Home />} />
              <Route path="summery/:id" element={<Summery />} />
              <Route path="service-list" element={<ServiceList />} />
              <Route path="categories-list" element={<CategoriesList />} />
              <Route path="service-by-cat" element={<ServiceByCat />} />
              {/* <Route path="address" element={<Address />} /> */}
              <Route path="payment" element={<Paymentdone />} />
              <Route path="succcess" element={<Successmsg />} />
              <Route path="myrequest" element={<Myrequest />} />
              <Route path="projectinfo/:id" element={<Projectinfo />} />
              <Route
                path="customerprojectinfo/:id"
                element={<CustomerProjectinfo />}
              />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="wallet" element={<Wallet />} />
              <Route path="support" element={<Support />} />
              <Route path="supportlist" element={<Supportlist />} />

              <Route path="profile" element={<Profile />} />

              <Route path="servicedeatils/:id" element={<Servicedetail />} />
              <Route path="bookinghistory" element={<Bookinghistory />} />

              <Route path="servicemenprofile" element={<Servicemenprofile />} />

              <Route path="capture/:id" element={<Capture />} />
              <Route path="paymentoption" element={<Paymentoption />} />
              <Route path="updatePin" element={<UpdatePin />} />
              <Route path="policydetails" element={<PolicyDetails />} />
              <Route path="editServicemen" element={<EditServicemen />} />
              <Route path="notifications" element={<NotificationsList />} />
              <Route path="search" element={<Searchpage />} />
              <Route path="customerprofile" element={<CustomerProfile />} />
              <Route path="mycustomerprofile" element={<MyCustomerProfile />} />
              <Route path="editcustomer" element={<EditCustomer />} />
              <Route path="addressdetails" element={<Addressdetails />} />
              <Route path="authaddress" element={<AuthAddress />} />
              <Route path="privacycenter" element={<PrivacyCenter />} />
              <Route path="reviews/:service_id" element={<AllReviews />} />




            </Route>
          </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar
          theme="colored"
          toastStyle={{ fontSize: "18px" }}
          style={{ fontSize: "12px", fontWeight: "bold" }}
        />
      </Router>
    </AuthProvider>
  );
}

export default App;
