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
  
  // Store initial is_seen state to prevent backend from removing badges prematurely
  const initialSeenState = useRef<Map<string, boolean>>(new Map());
  
  // Prevent double fetch in StrictMode
  const hasFetchedOnce = useRef(false);

  const fetchNotifications = async (preserveSeenState = false) => {
    console.log('🔍 fetchNotifications called, preserveSeenState:', preserveSeenState);
    notificationLoader.setLoading(true);
    try {
      const res: any = await ApiService.post("/user/listNotificationForCustomer", {});
      const fetchedNotifications = res.data || [];
      
      console.log('📦 Fetched notifications:', fetchedNotifications.map((n: any) => ({ 
        id: n._id, 
        is_seen: n.is_seen, 
        is_read: n.is_read 
      })));
      
      if (preserveSeenState) {
        // Preserve the original is_seen state for notifications that were unseen on first load
        const preservedNotifications = fetchedNotifications.map((notif: any) => {
          if (initialSeenState.current.has(notif._id)) {
            return {
              ...notif,
              is_seen: initialSeenState.current.get(notif._id)
            };
          }
          return notif;
        });
        console.log('✅ Preserved state applied');
        setNotifications(preservedNotifications);
      } else {
        // First load - store the initial seen state
        fetchedNotifications.forEach((notif: any) => {
          if (!initialSeenState.current.has(notif._id)) {
            initialSeenState.current.set(notif._id, notif.is_seen);
          }
        });
        console.log('💾 Initial state stored');
        setNotifications(fetchedNotifications);
      }
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
    // Prevent double fetch in React StrictMode
    if (hasFetchedOnce.current) {
      console.log('⚠️ Skipping duplicate fetch (StrictMode double mount)');
      return;
    }
    hasFetchedOnce.current = true;
    
    hasMounted.current = true;
    fetchNotifications();

    let pushListenerHandle: PluginListenerHandle | undefined;
    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      // DON'T refetch - just show alert
      // Refetching causes backend to mark as seen
      console.log('📬 Push notification received, NOT refetching to preserve "New" badges');
      if (notification) {
        alert((notification.title || 'Notification') + ': ' + (notification.body || ''));
      }
    }).then((handle: any) => {
      pushListenerHandle = handle;
    });

    return () => {
      // Remove listeners
      if (pushListenerHandle) pushListenerHandle.remove();

      // Mark all unseen as seen when component unmounts (user leaves the page)
      if (hasMounted.current) {
        console.log("Component unmounting - marking all as seen");
        ApiService.post("/user/markNotificationsAsSeen").catch(() => {});
      }
    };
  }, []);

  // 

  const handleNotificationClick = async (notification: any, index: number) => {
    const scrollPos = window.scrollY;

    const { notify_type, booking_id, support_id, _id } = notification;

    // Mark this specific notification as read (removes bold effect)
    if (_id && !notification.is_read) {
      ApiService.post("/user/markNotificationAsRead", { notification_id: _id })
        .then(() => {
          console.log(`Notification ${_id} marked as read`);
          // Update local state to reflect the change
          setNotifications(prev => 
            prev.map(n => n._id === _id ? { ...n, is_read: true } : n)
          );
        })
        .catch(err => console.error("Error marking notification as read:", err));
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

                  <p className={`notfication_messages ${!item.is_read ? "new_message" : ""}`}>
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