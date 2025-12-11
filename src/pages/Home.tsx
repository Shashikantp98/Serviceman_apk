// import { ArrowUpRight } from "react-feather";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Header from "../components/Header";
import useHeaderMinimize from "../utils/useHeaderMinimize";
import { useEffect, useState } from "react";
import ApiService from "../services/api";
import { LoginModal } from "../components/LoginModal";
import SectionLoader from "../components/SectionLoader";
import { useSectionLoader } from "../utils/useSectionLoader";
// import { toast } from "react-toastify";

// import pro from '../assets/pro.jpeg'

declare global {
  interface Window {
    bootstrap: any;
  }
}
const Home = () => {
  const navigate = useNavigate();
  const { latitude, longitude, logout } = useAuth();//token
  const [popularServices, setPopularServices] = useState<any>([]);
  const [services, setServices] = useState<any>([]);
  const [categories, setCategories] = useState<any>([]);
  const [bannerData, setBannerData] = useState<any>([]);
  const [showLoginModal, setShowLoginModal] = useState(false);
  
  // Section-specific loaders
  const bannerLoader = useSectionLoader("banner");
  const categoriesLoader = useSectionLoader("categories");
  const popularServicesLoader = useSectionLoader("popular-services");
  const servicesLoader = useSectionLoader("services");

  useEffect(() => {
    const el = document.querySelector("#carouselExampleIndicators");
    if (el && window.bootstrap) {
      // Initialize Bootstrap carousel manually
      const carousel = new window.bootstrap.Carousel(el, {
        interval: 3000, // 3 seconds
        ride: "carousel",
        pause: false,
        wrap: true,
      });

      // On iOS WebView, ensure it actually starts cycling
      setTimeout(() => {
        try {
          carousel.cycle();
        } catch (err) {
          console.warn("Carousel cycle error:", err);
        }
      }, 300);
    }
  }, []);
  useEffect(() => {
    if (latitude || longitude) {
      getPopularServices(true);
      getPopularServices(false);
      getCategories();
      getBannerData(Number(latitude), Number(longitude));
    }
  }, [latitude, longitude]);
  const getBannerData = (latitude: number, longitude: number) => {
    bannerLoader.setLoading(true);
    ApiService.post("/user/userBannerImages", { latitude, longitude })
      .then((res: any) => {
        console.log(res);
        setBannerData(res.data.list);
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        bannerLoader.setLoading(false);
      });
  };
  const getCategories = () => {
    categoriesLoader.setLoading(true);
    ApiService.post("/user/getAllCategoryList", {
      latitude: Number(latitude),
      longitude: Number(longitude),
      filters: {
        search: "",
      },

      pagination: {
        page: 1,
        pageSize: 10,
      },
    })
      .then((res: any) => {
        console.log(res);
        setCategories(res.data.list);
      })
      .catch((err: any) => {
        console.log(err);
      })
      .finally(() => {
        categoriesLoader.setLoading(false);
      });
  };
  const getPopularServices = (isPopular: boolean) => {
    const loader = isPopular ? popularServicesLoader : servicesLoader;
    loader.setLoading(true);
    ApiService.post("/user/getServiceList", {
      latitude: Number(latitude),
      longitude: Number(longitude),
      filters: {
        search: "",
        is_popular: isPopular ? "true" : "",
      },

      pagination: {
        page: 1,
        pageSize: 20,
      },
    })
      .then((res: any) => {
        console.log(res);
        if (isPopular) {
          setPopularServices(res.data.list);
        } else {
          setServices(res.data.list);
        }
      })
      .catch((err: any) => {
        console.log(err);
      })
      .finally(() => {
        loader.setLoading(false);
      })
  };
  // const handleBookNow = (item: any) => {
  //   if (token == "guest") {
  //     setShowLoginModal(true);
  //   } else {
  //     console.log(item);
  //     if (item.is_available) {
  //       navigate(`/summery/${item?.service_id}`);
  //     } else {
  //       toast.error(item.availability_message);
  //     }
  //   }
  // };
  const isHeaderMinimized = useHeaderMinimize();
  return (
    <>
      <Header isMinimized={isHeaderMinimized} />
      <div className="container pb-10 main-content px-3">
        <div className="row pt-3">
          <div className="col-12 ">
            <SectionLoader
              show={bannerLoader.loading}
              size="medium"
              text="Loading banners..."
              overlay={true}
            />
            <div
              id="carouselExampleIndicators"
              className="carousel slide carousel-fade"
              data-bs-ride="carousel"
              data-bs-interval="3000"
            >
              <div className="carousel-indicators">
                {bannerData?.map((_: any, index: number) => (
                  <button
                    key={index}
                    type="button"
                    data-bs-target="#carouselExampleIndicators"
                    data-bs-slide-to={index}
                    className={index === 0 ? "active" : ""}
                    aria-current={index === 0 ? "true" : "false"}
                    aria-label={`Slide ${index + 1}`}
                  ></button>
                ))}
              </div>
              <div className="carousel-inner">
                {bannerData?.map((item: any, index: number) => (
                  <div
                    className={
                      index === 0 ? "carousel-item active" : "carousel-item"
                    }
                    key={index}
                  >
                    <img
                      onClick={() =>
                        navigate(`/servicedeatils/${item?.service_id}`)
                      }
                      style={{ height: "240px" }}
                      src={item?.banner_image_url}
                      className="d-block w-100"
                      alt="..."
                    />
                  </div>
                ))}
              </div>
              <button
                className="carousel-control-prev"
                type="button"
                data-bs-target="#carouselExampleIndicators"
                data-bs-slide="prev"
              >
                <span
                  className="carousel-control-prev-icon"
                  aria-hidden="true"
                ></span>
                <span className="visually-hidden">Previous</span>
              </button>
              <button
                className="carousel-control-next"
                type="button"
                data-bs-target="#carouselExampleIndicators"
                data-bs-slide="next"
              >
                <span
                  className="carousel-control-next-icon"
                  aria-hidden="true"
                ></span>
                <span className="visually-hidden">Next</span>
              </button>
            </div>
            {/* <div className="banner">
              <div>
                <h1>Get Best Cleaning Services Here</h1>
                <button>Get Now!</button>
              </div>
            </div> */}
          </div>
        </div>
        <div className="row pt-4 mt-2">
          <div className="col-12 pb-3 d-flex align-items-center justify-content-between">
            <p className="subcats">Popular Services</p>
            <button
              className="view_more"
              onClick={() =>
                navigate("/service-list", { state: { isPopular: true } })
              }
            >
              View all
            </button>
          </div>
        </div>
        <div className="row px-1">
          <SectionLoader
            show={popularServicesLoader.loading}
            size="medium"
            text="Loading services..."
          />

          {!popularServicesLoader.loading && popularServices.length === 0 && (
            <div className="col-12 ">
              <p className="font-14 weight-bold">No Popular Services</p>
            </div>
          )}

          {!popularServicesLoader.loading &&
            popularServices.length > 0 &&
            popularServices.map((item: any) => (
              <div
                className="col-6 px-2 "
                key={item?.service_id}
                onClick={() => navigate(`/servicedeatils/${item?.service_id}`)}
              >
                <div className="s_cards">
                  <img
                    src={item?.service_image}
                    className="w-100 rounded-full"
                  />
                  <div className="px-2 pb-2">
                    <p className="ser_names">{item?.service_name}</p>
                  </div>
                </div>

              </div>
            ))}
        </div>
        <div className="row pt-4 mt-2">
          <div className="col-12 pb-3 d-flex align-items-center justify-content-between">
            <p className="subcats">Browse Categories</p>
            <button
              className="view_more"
              onClick={() => navigate("/categories-list")}
            >
              View More
            </button>
          </div>

        </div>
        <div className="row">
          <SectionLoader
            show={categoriesLoader.loading}
            size="medium"
            text="Loading categories..."
          />

          {!categoriesLoader.loading && categories.length === 0 && (
            <div className="col-12">
              <p className="font-14 weight-bold">No Categories</p>
            </div>
          )}

          {!categoriesLoader.loading && categories.length > 0 && (
            <div className="col-12 d-flex gap-15 overflow-auto">
              {categories.map((item: any) => (
                <span
                  onClick={() =>
                    navigate(`/service-by-cat`, {
                      state: { category: item?.category_id },
                    })
                  }
                  className="d-flex direction-cloumn align-items-center"
                  key={item?.category_id}
                >
                  <img
                    className="small_cat_img"
                    src={item?.category_image}
                  />
                  <p className="font-14 mb-0 pt-1">
                    {item?.category_name?.length > 8
                      ? item?.category_name.slice(0, 8) + "..."
                      : item?.category_name}
                  </p>
                </span>
              ))}
            
            </div>
          )}
        </div>
        <div className="row pt-4 mt-2">
          <div className="col-12 pb-3 d-flex align-items-center justify-content-between">
            <p className="subcats">Best Services</p>
            <button
              className="view_more"
              onClick={() =>
                navigate("/service-list", { state: { isPopular: false } })
              }
            >
              View More
            </button>
          </div>

        </div>
        <div className="row px-1">

          {/* Section Loader - appears on top of the section while loading */}
          <SectionLoader
            show={servicesLoader.loading}
            size="medium"
            text="Loading services..."
          />

          {/* Show "No Services" only when loader is NOT running and data is empty */}
          {!servicesLoader.loading && services.length === 0 && (
            <div className="col-12">
              <p className="font-14 weight-bold">No Services</p>
            </div>
          )}

          {/* Show services list only when loader finished AND data is available */}
          {!servicesLoader.loading &&
            services.length > 0 &&
            services.map((item: any) => (
              <div className="col-6 px-2" key={item?.service_id}>
                <div className="serv_cards mb-3">
                  {!servicesLoader.loading && services.length === 0 && (
                    <div className="col-12">
                      <p className="font-14 weight-bold">No Services</p>
                    </div>
                  )}
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
                      className="ser_rts my-0 d-flex align-items-center gap-1"
                      onClick={() =>
                        navigate(`/servicedeatils/${item?.service_id}`)
                      }
                    >
                      <span>★
</span> {item?.avg_rating || '0'} ({item?.total_reviews || '0'})
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
                    {/* <button
                      onClick={() => handleBookNow(item)}
                      className=""
                    >
                      <ArrowUpRight></ArrowUpRight>
                      Book Now
                    </button> */}
                  </div>

                  {/* Book Now Button */}


                </div>
              </div>
            ))}
        </div>
        <LoginModal
          show={showLoginModal}
          onCancel={() => setShowLoginModal(false)}
          onConfirm={() => {
            logout();
            setShowLoginModal(false);
          }}
        />
      </div >
    </>
  );
};

export default Home;
