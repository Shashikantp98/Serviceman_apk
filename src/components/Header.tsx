import { Bell, MapPin, Search } from "react-feather";
import { useNavigate, useLocation } from "react-router-dom";
import ApiService from "../services/api";
import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";

const Header = ({ isMinimized = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    token,
    setLatLong,
    latitude,
    longitude,
    setCurrentLocationFn,
    currentLocation,
  } = useAuth();

  const [unseenCount, setUnseenCount] = useState(0);
  const [userName, setUserName] = useState("");

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
        const customer = res.data?.customer;
        const address = res.data?.address;

        setUserName(
          customer?.fname
        );

        setCurrentLocationFn(
          [
            address?.street_1,
            address?.city,
            address?.state,
            address?.country,
          ]
            .filter(Boolean)
            .join(", ")
        );

        setLatLong(address?.latitude, address?.longitude);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  // 🔄 Poll unseen count every 5 seconds (but NOT on notifications page)
  useEffect(() => {
    if (token !== "guest") {
      // Fetch count immediately when not on notifications page
      getUnseenNotificationCount();

      // Don't poll if user is on the notifications page
      const isOnNotificationsPage = location.pathname === "/notifications";

      if (!isOnNotificationsPage) {
        const interval = setInterval(() => {
          getUnseenNotificationCount();
        }, 5000);

        return () => clearInterval(interval);
      }
    }
  }, [token, location.pathname]);

  useEffect(() => {
    if (token == "guest") {
      if (
        latitude === undefined ||
        latitude === null ||
        longitude === undefined ||
        longitude === null
      ) {
        navigate("/authlocation");
      }
    } else {
      getProfileDetails();
    }
  }, [token, latitude, longitude]);


  const handleNotificationClick = () => {
    navigate("/notifications");
  };
  return (
    <>
      {isMinimized ? (
        <div
          style={{
            position: "sticky",
            top: 0,
            zIndex: 999,
            background: "#fff",
            paddingTop: "60px",
          }}
        >
          <div
            className="searchwrap px-4 pb-3"
            onClick={() => navigate("/search")}
            style={{ cursor: "pointer" }}
          >
            <label className="position-relative w-100">
              <Search className="sericons" size={21} />
              <input
                type="text"
                className="searchinput"
                placeholder="Search for your services"
                readOnly
              />
            </label>
          </div>
        </div>

      ) : (
        <>
          <div className="headers_new px-4 pt-4 mar-top-35px mb-2">
            <div
              className="d-flex gap-10 align-items-center"
              onClick={() => navigate("/authlocation")}
              style={{ cursor: "pointer" }}
            >
              <span className="maplins">
                <MapPin color="#fff" size={25} />
              </span>

              <span className="curlocations">
                <h5>
                  {currentLocation
                    ? currentLocation.split(",")[1]?.trim() ||
                    currentLocation.split(",")[0]?.trim()
                    : "Location"}
                </h5>

                <p>
                  {currentLocation && currentLocation.length > 50
                    ? currentLocation.slice(0, 50) + "..."
                    : currentLocation}
                </p>
              </span>
            </div>

            <div>
              <span
                className="notiflins"
                onClick={handleNotificationClick}
                style={{ cursor: "pointer", position: "relative" }}
              >
                {unseenCount > 0 && (
                  <span className="cartitemcount">
                    {unseenCount > 99 ? "99+" : unseenCount}
                  </span>
                )}

                <Bell color="#292929ff" size={22} />
              </span>
            </div>
          </div>

          <div className="px-4 mb-2">
            <h4 className=" welcome-username">
              Hello, {userName}
            </h4>

            {/* <h5>
                <i>How can I help you today?</i>
              </h5> */}
          </div>

          {/* Search Bar */}
          <div
            className="searchwrap px-4 pb-3"
            onClick={() => navigate("/search")}
            style={{ cursor: "pointer" }}
          >
            <label className="position-relative w-100">
              <Search className="sericons" size={21} />
              <input
                type="text"
                className="searchinput"
                placeholder="Search for your services"
                readOnly
              />
            </label>
          </div>
        </>
      )}
    </>
  );
};

export default Header;
