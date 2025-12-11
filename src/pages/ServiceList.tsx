import { useEffect, useState } from "react";
import ApiService from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";

import { LoginModal } from "../components/LoginModal";
import { toast } from "react-toastify";
import CommonHeader from "../components/CommonHeader";
import SectionLoader from "../components/SectionLoader";
import { useSectionLoader } from "../utils/useSectionLoader";
import { ArrowUpRight } from "react-feather";

const ServiceList = () => {
  const navigate = useNavigate();
  const { token, logout } = useAuth();
  const { isPopular } = useLocation().state;
  const { latitude, longitude } = useAuth();
  const [services, setServices] = useState<any>([]);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Loader for service list
  const serviceLoader = useSectionLoader("service-list");

  const getAllServices = () => {
    serviceLoader.setLoading(true);
    ApiService.post("/user/getServiceList", {
      latitude: Number(latitude),
      longitude: Number(longitude),
      filters: {
        search: "",
        is_popular: isPopular ? "true" : "",
      },

      pagination: {
        page: 1,
        pageSize: 50,
      },
    })
      .then((res: any) => {
        console.log(res);

        setServices(res.data.list);
      })
      .catch((err: any) => {
        console.log(err);
      })
      .finally(() => {
        serviceLoader.setLoading(false);
      })
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
      {/* <Header /> */}
      <CommonHeader />
      <div className="container pb-10 pt-5 mt-5 px-3">
        <div className="row px-1">
          <div className="col-12 pb-3">
            <p className="subcats">
              {isPopular ? "Popular" : "Best"} services
            </p>
          </div>
        </div>
        <div className="row px-1">
          <SectionLoader
            show={serviceLoader.loading}
            size="medium"
            text="Loading services..."
            overlay={true}
          />
          {!serviceLoader.loading && services.length === 0 && (
            <div className="col-12">
              <p className="font-14 weight-bold">No Services</p>
            </div>
          )}
          {services.length > 0 &&
            services.map((item: any) => (
              <div className="col-6  px-2" key={item?.service_id}>
                <div className="serv_cards mb-3">

                  {/* Thumbnail Image */}
                  <img

                    src={item.service_image}
                    className="w-100"
                    onClick={() =>
                      navigate(`/servicedeatils/${item?.service_id}`)
                    }
                  />

                  {/* Service Name */}
                  <div className="d-flex pt-3 align-items-center justify-content-between">
                    <h3
                      className=" ser_nms my-0"
                      onClick={() =>
                        navigate(`/servicedeatils/${item?.service_id}`)
                      }
                    >
                      {item?.service_name
                        ? item?.service_name.length > 12
                          ? item?.service_name.slice(0, 12) + "..."
                          : item?.service_name
                        : ""}
                    </h3>

                    {/* Rating */}
                    <p
                      className="ser_rts my-0"
                      onClick={() =>
                        navigate(`/servicedeatils/${item?.service_id}`)
                      }
                    >
                      <span>⭐</span> {item?.avg_rating || '0'} ({item?.total_reviews || '0'})
                    </p></div>

                  {/* 
                            Service Description (commented by you earlier — kept same)
                            <p
                              onClick={() =>
                                navigate(`/servicedeatils/${item?.service_id}`)
                              }
                              className="s_d"
                              dangerouslySetInnerHTML={{
                                __html: item?.description
                                  ? item?.description.slice(0, 120)
                                  : "",
                              }}
                            ></p> 
                          */}

                  {/* Price & Duration */}

                  <p
                    className="ser_pric"
                    onClick={() =>
                      navigate(`/servicedeatils/${item?.service_id}`)
                    }
                  >
                    Best Price<br></br>
                    <span> ₹{item?.price}</span>
                  </p>

                  <div className="booknow_btn">
                    {/* <div>
                                    <span>
                                      <Clock size={16}></Clock> {item?.duration}
                                    </span>
                                   </div> */}
                    <button
                      onClick={() => handleBookNow(item)}
                      className=""
                    >
                      <ArrowUpRight></ArrowUpRight>
                      Book Now
                    </button>
                  </div>

                  {/* Book Now Button */}


                </div>
              </div>
            ))}
        </div>

        {/* Login modal */}
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

export default ServiceList;
