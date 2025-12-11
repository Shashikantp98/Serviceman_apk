import { useEffect, useState } from "react";
import ApiService from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";

import { LoginModal } from "../components/LoginModal";
import { toast } from "react-toastify";
import CommonHeader from "../components/CommonHeader";
import SectionLoader from "../components/SectionLoader";
import { useSectionLoader } from "../utils/useSectionLoader";

const ServiceByCat = () => {
  const navigate = useNavigate();
  const { category } = useLocation().state;
  const { latitude, longitude, token, logout } = useAuth();
  const [services, setServices] = useState<any>([]);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Loader for service by category
  const catServiceLoader = useSectionLoader("catServ-loader");

  const getAllServices = () => {
    catServiceLoader.setLoading(true);

    ApiService.post("/user/getServiceList", {
      latitude: Number(latitude),
      longitude: Number(longitude),
      filters: {
        search: "",
        category_id: category,
      },
      pagination: {
        page: 1,
        pageSize: 50,
      },
    })
      .then((res: any) => {
        setServices(res.data.list);
      })
      .catch((err: any) => {
        console.log(err);
      })
      .finally(() => {
        catServiceLoader.setLoading(false);
      });
  };

  useEffect(() => {
    getAllServices();
  }, []);

  const handleBookNow = (item: any) => {
    if (token == "guest") {
      setShowLoginModal(true);
    } else {
      if (item.is_available) {
        navigate(`/summery/${item?.service_id}`);
      } else {
        toast.error(item.availability_message);
      }
    }
  };

  return (
    <>
      <CommonHeader />

      <div className="container pb-10 main-content-service">
        <div className="row pt-4">
          <div className="col-12">
            <p className="font-14 weight-bold mb-0">Services by Category</p>
          </div>
        </div>

        <div className="row">
          {/* Loader */}
          <SectionLoader
            size="medium"
            show={catServiceLoader.loading}
            text="Loading Services by category..."
            overlay={true}
          />

          {/* Show Service Cards only after loader finishes */}
          {!catServiceLoader.loading &&
            services?.length > 0 &&
            services.map((item: any) => (
              <div className="col-6 pt-3" key={item?.service_id}>
                <div className="serv_cards">
                  <img
                    src={item.service_image}
                    className="w-100"
                    style={{ height: "140px" }}
                    onClick={() =>
                      navigate(`/servicedeatils/${item?.service_id}`)
                    }
                  />

                  <h3
                    className="s_h"
                    onClick={() =>
                      navigate(`/servicedeatils/${item?.service_id}`)
                    }
                  >
                    {item?.service_name}
                  </h3>

                  <p
                    className="s_r"
                    onClick={() =>
                      navigate(`/servicedeatils/${item?.service_id}`)
                    }
                  >
                    ⭐ {item?.avg_rating || '0'} ({item?.total_reviews || '0'})
                  </p>
                  {/* <p
                    onClick={() =>
                      navigate(`/servicedeatils/${item?.service_id}`)
                    }
                    className="s_d"
                    dangerouslySetInnerHTML={{
                      __html: item?.description?.slice(0, 120),
                    }}
                  ></p> */}
                  <p
                    className="s_p"
                    onClick={() =>
                      navigate(`/servicedeatils/${item?.service_id}`)
                    }
                  >
                    ₹{item?.price}
                    <br />
                    Duration : {item?.duration}
                  </p>

                  <button onClick={() => handleBookNow(item)} className="a_cart">
                    Book Now
                  </button>
                </div>
              </div>
            ))}

          {/* No Services Message (Only after loader finishes) */}
          {!catServiceLoader.loading && services?.length === 0 && (
            <div className="col-12">
              <p className="font-14 weight-bold">No Services</p>
            </div>
          )}
        </div>

        {/* Login Modal */}
        <LoginModal
          show={showLoginModal}
          onCancel={() => setShowLoginModal(false)}
          onConfirm={() => {
            logout();
            setShowLoginModal(false);
          }}
        />
      </div>
    </>
  );
};

export default ServiceByCat;
