import { Bell, MapPin, Search } from "react-feather";
import { useNavigate } from "react-router-dom";
import ApiService from "../services/api";
import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";

const Header = ({ isMinimized = false }) => {
  const navigate = useNavigate();
  const {
    token,
    setLatLong,
    latitude,
    longitude,
    setCurrentLocationFn,
    currentLocation,
  } = useAuth();

  const [unseenCount, setUnseenCount] = useState(0);

  // 📌 Fetch unseen notifications count
  const getUnseenNotificationCount = () => {
    ApiService.post("/user/getUnseenNotificationCount")
      .then((res: any) => {
        setUnseenCount(res.data?.unseen_count || 0);
      })
      .catch((err) => {
        console.log("Notification Count Error:", err);
      });
  };

  const getProfileDetails = () => {
    ApiService.post("/user/getCustomerDetails", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token == "guest" ? "" : token}`,
      },
    })
      .then((res: any) => {
        setCurrentLocationFn(
          res.data.address?.street_1 +
            ", " +
            res.data.address?.city +
            ", " +
            res.data.address?.state +
            ", " +
            res.data.address?.country
        );

        setLatLong(res.data.address?.latitude, res.data.address?.longitude);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  // 🔄 Poll unseen count every 5 seconds
  useEffect(() => {
    if (token !== "guest") {
      getUnseenNotificationCount();

      const interval = setInterval(() => {
        getUnseenNotificationCount();
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [token]);

  useEffect(() => {
    if (token == "guest") {
      if (!latitude || !longitude) {
        navigate("/authlocation");
      }
    } else {
      getProfileDetails();
    }
  }, [token, latitude, longitude]);

  // 🎯 Just navigate — DO NOT reset count, DO NOT call markNotificationsAsSeen
  const handleNotificationClick = () => {
    navigate("/notifications");
  };

  return (
    <>
      <div className={`fixed_header${isMinimized ? ' minimized-header' : ' p-3'}`}> 
        {isMinimized ? (
          // Only show search bar when minimized, flush to top
          <div className="position-relative sear" onClick={() => navigate("/search")}
            style={{ maxWidth: 400, margin: "0 auto" }}>
            <Search />
            <input
              type="text"
              className="searchs"
              placeholder="Search for your services"
            />
          </div>
        ) : (
          <>
            <div className="d-flex justify-content-between align-items-center">
              {/* 📍 LOCATION */}
              <div
                className="d-flex gap-10 text-white align-items-center"
                onClick={() => navigate("/authlocation")}
              >
                <span className="locpin">
                  <MapPin size={22} />
                </span>
                <div>
                  <p className="adrsh">Location</p>
                  <p className="mb-0 adsr">
                    {currentLocation && currentLocation?.length > 35
                      ? currentLocation?.slice(0, 35) + "..."
                      : currentLocation}
                  </p>
                </div>
              </div>

              {/* 🔔 NOTIFICATION BELL */}
              <div
                style={{ position: "relative", cursor: "pointer" }}
                onClick={handleNotificationClick}
              >
                <Bell color="#292929ff" size={22} />

                {/* 🔴 Badge */}
                {unseenCount > 0 && (
                  <span
                    style={{
                      position: "absolute",
                      top: -5,
                      right: -5,
                      background: "red",
                      color: "white",
                      fontSize: "10px",
                      padding: "2px 6px",
                      borderRadius: "50%",
                    }}
                  >
                    {unseenCount}
                  </span>
                )}
              </div>
            </div>
            {/* SEARCH BOX */}
            <div
              className="position-relative sear mt-3"
              onClick={() => navigate("/search")}
            >
              <Search />
              <input
                type="text"
                className="searchs"
                placeholder="Search for your services"
              />
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default Header;
