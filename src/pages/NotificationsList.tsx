import { useNavigate } from "react-router-dom";
import ApiService from "../services/api";
import { useEffect, useState, useRef } from "react";
import Header from "../components/Header";
import CommonHeader from "../components/CommonHeader";
import { useAuth } from "../contexts/AuthContext";
import SectionLoader from "../components/SectionLoader";
import { useSectionLoader } from "../utils/useSectionLoader";
import { Clock } from "react-feather";
import { PushNotifications } from '@capacitor/push-notifications';
import type { PluginListenerHandle } from '@capacitor/core';
import { useLocation } from "react-router-dom";


const NotificationsList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { role } = useAuth();

  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<any[]>([]);

  const notificationLoader = useSectionLoader("notify-loader");

  // Track if component has mounted at least once
  const hasMounted = useRef(false);

  const fetchNotifications = async () => {
    notificationLoader.setLoading(true);
    try {
      const res: any = await ApiService.post("/user/listNotificationForCustomer", {});
      setNotifications(res.data || []);
    } catch (err) {
      console.error("Error:", err);
    } finally {
      notificationLoader.setLoading(false);
      setLoading(false);
      if (location.state?.scrollPosition) {
        setTimeout(() => {
          window.scrollTo({
            top: location.state.scrollPosition,
            behavior: "instant"
          });
        }, 50);
      }
    }
  };

  useEffect(() => {
    hasMounted.current = true;
    fetchNotifications();

    let pushListenerHandle: PluginListenerHandle | undefined;
    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      fetchNotifications();
      if (notification) {
        alert((notification.title || 'Notification') + ': ' + (notification.body || ''));
      }
    }).then((handle: any) => {
      pushListenerHandle = handle;
    });

    // Mark as seen when page becomes hidden (user navigates away or switches tabs)
    const handleVisibilityChange = () => {
      if (document.hidden && hasMounted.current) {
        console.log("Page hidden - marking notifications as seen");
        ApiService.post("/user/markNotificationsAsSeen").catch(() => {});
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      // Remove listeners
      if (pushListenerHandle) pushListenerHandle.remove();
      document.removeEventListener('visibilitychange', handleVisibilityChange);

      // Mark all unseen as seen when component unmounts
      if (hasMounted.current) {
        console.log("Component unmounting - marking all as seen immediately");
        ApiService.post("/user/markNotificationsAsSeen").catch(() => {});
      }
    };
  }, []);

  // 

  const handleNotificationClick = async (notification: any, index: number) => {
    const scrollPos = window.scrollY;

    const { notify_type, booking_id, support_id, _id } = notification;

    // Mark this specific notification as seen
    if (_id && !notification.is_seen) {
      ApiService.post("/user/markNotificationsAsSeen", { notification_id: _id })
        .then(() => {
          console.log(`Notification ${_id} marked as seen`);
          // Update local state to reflect the change
          setNotifications(prev => 
            prev.map(n => n._id === _id ? { ...n, is_seen: true } : n)
          );
        })
        .catch(err => console.error("Error marking notification as seen:", err));
    }

    // CASE 1: Booking Notification → Navigate with scroll state
    if (notify_type === "booking" && booking_id) {
      navigate(`/CustomerProjectinfo/${booking_id}`, {
        state: {
          fromNotifications: true,
          scrollPosition: scrollPos,
          itemIndex: index
        }
      });
      return;
    }

    // CASE 2: Support Notification → Simple navigation (no scroll restore needed)
    if (notify_type === "support" && support_id) {
      navigate(`/supportlist`);
      return;
    }

    // Optional: If a different type appears
    console.warn("Unknown notification type:", notification);
  };

  return (
    <>
      <div className="customer_header_none"></div>
      {role === "customer" ? <Header /> : <CommonHeader />}

      <div className={role === "customer" ? "container main-content pt-2" : "container main-content-service"}>

        <div className='fixed_header text-center'>
          <h1 className="head4">Notifications</h1>
        </div>

        <div className="row px-2 mb-5 pb-5 fixed_header_padding">
          <SectionLoader
          show={notificationLoader.loading}
          size="medium"
          text="Loading notifications..."
          overlay={true}
        />

        {loading && (
          <div className="col-12 text-center pt-5 fixed_header_padding">
            <div className="loader"></div>
          </div>
        )}

        {!loading && notifications.length === 0 && (
          <div className="col-12 text-center mt-5 fixed_header_padding">
            <h1 className="bigemj">👨🏼‍🦯</h1>
            <p>No notifications found</p>
          </div>
        )}

          {!loading &&
            notifications.map((item: any, index: number) => (
              <div className="col-12 mt-2" key={index}>
                <div
                  className="nofi_cards"
                  onClick={() => handleNotificationClick(item, index)}
                  style={{
                    cursor:
                      (item.notify_type === "booking" && item.booking_id) ||
                        (item.notify_type === "support" && item.support_id)
                        ? "pointer"
                        : "default",
                  }}
                >
                  <p className="notification_main_title">
                    {item.title || "Notification"}

                    {!item.is_seen && (
                      <span className="new_notifications">New</span>
                    )}
                  </p>

                  <p className={`notfication_messages ${!item.is_seen ? "new_message" : ""}`}>
                    {item.message}
                  </p>

                  <p className="notification_date_time">
                    <Clock size={14} />
                    {new Date(item.created_on).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
        </div>
      </div>
    </>
  );
};

export default NotificationsList;
