import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Header from "../components/Header";

import { useEffect, useState } from "react";
import ApiService from "../services/api";
import { LoginModal } from "../components/LoginModal";
import SectionLoader from "../components/SectionLoader";
import { useSectionLoader } from "../utils/useSectionLoader";
// import ser3 from '../assets/ser3.png'
// import ser4 from '../assets/ser4.png'
import gift from '../assets/gift.png'
// import { Search } from "react-feather";

declare global {
  interface Window {
    bootstrap: any;
  }
}

const Home = () => {
  const navigate = useNavigate();
  const { latitude, longitude, logout } = useAuth();
  const [pageLoading, setPageLoading] = useState(true);
  const [popularServices, setPopularServices] = useState<any>(null);
  const [bestServices, setBestServices] = useState<any>(null);
  const [categories, setCategories] = useState<any>(null);
  const [bannerData, setBannerData] = useState<any>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'our-services' | 'popular' | 'best'>('our-services');

  const bannerLoader = useSectionLoader("banner");
  const categoriesLoader = useSectionLoader("categories");
  const popularServicesLoader = useSectionLoader("popular-services");
  const bestServicesLoader = useSectionLoader("best-services");

  useEffect(() => {
    const el = document.querySelector("#carouselExampleIndicators");
    if (el && window.bootstrap) {
      const carousel = new window.bootstrap.Carousel(el, {
        interval: 3000,
        ride: "carousel",
        pause: false,
        wrap: true,
      });
      setTimeout(() => {
        try { carousel.cycle(); } catch (err) { console.warn("Carousel cycle error:", err); }
      }, 300);
    }
  }, []);

  const getBannerData = (latitude: number, longitude: number) => {
    bannerLoader.setLoading(true);

    ApiService.post("/user/userBannerImages", {
      latitude,
      longitude,
    })
      .then((res: any) => {
        setBannerData(res.data.list);
      })
      .catch((err: any) => {
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
        pageSize: 50,
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

  useEffect(() => {
    if (!latitude || !longitude) return;

    setPageLoading(true);

    getBannerData(Number(latitude), Number(longitude));
    getCategories();
    getPopularServices();
    getBestServices();
  }, [latitude, longitude]);

  const getPopularServices = () => {
    popularServicesLoader.setLoading(true);
    ApiService.post("/user/getServiceList", {
      latitude: Number(latitude),
      longitude: Number(longitude),
      filters: { search: "", is_popular: true },
      pagination: { page: 1, pageSize: 10 },
    })
      .then((res: any) => setPopularServices(res.data.list))
      .catch((err: any) => console.log(err))
      .finally(() => popularServicesLoader.setLoading(false));
  };

  const getBestServices = () => {
    bestServicesLoader.setLoading(true);
    ApiService.post("/user/getServiceList", {
      latitude: Number(latitude),
      longitude: Number(longitude),
      filters: { search: "", best_service: true },
      pagination: { page: 1, pageSize: 10 },
    })
      .then((res: any) => setBestServices(res.data.list))
      .catch((err: any) => console.log(err))
      .finally(() => bestServicesLoader.setLoading(false));
  };

  useEffect(() => {
    if (
      categories !== null &&
      popularServices !== null &&
      bestServices !== null
    ) {
      setPageLoading(false);
    }
  }, [categories, popularServices, bestServices]);

  const handleBannerClick = (item: any) => {
    const type = item?.banner_type;
    if (type === 'all_services_offer') {
      setActiveTab('popular');
      setTimeout(() => {
        document.querySelector('.servicies_tab_butons')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else if (type === 'explore_services') {
      navigate('/categories-list');
    } else if (type === 'category_offer') {
      navigate('/service-by-cat', { state: { category: item?.link_id } });
    } else if (type === 'service_offer') {
      navigate(`/servicedeatils/${item?.link_id}`);
    }
  };

  const renderPrice = (item: any) => {
    if (item?.offer_price) {
      return (
        <>
          ₹{item.offer_price}&nbsp;
          <span className="text-decoration-line-through" style={{ color: '#999', fontSize: '12px' }}>
            ₹{item.price}
          </span>
        </>
      );
    }
    return <>₹{item?.final_price || item?.price}</>;
  };

  return (
    <>
      <Header />

      {/* Category pills — unchanged */}
      <div className="px-4 categories_scroll pt-2">

        <button className="active">All</button>

        {categories?.slice(0, 10).map((item: any) => (
          <button
            key={item?.category_id}
            onClick={() =>
              navigate("/service-by-cat", {
                state: {
                  category: item?.category_id,
                },
              })
            }
          >
            {item?.category_name}
          </button>
        ))}

      </div>

      <div className="padding_btn_main">

        {/* Banner — unchanged */}
        <div className="container px-4 pb-3">
          <div className="row pt-3">
            <div className="col-12">

              <SectionLoader
                show={bannerLoader.loading}
                size="medium"
                text="Loading banners..."
              />

              {bannerData?.length > 0 && (
                <div
                  id="carouselExampleIndicators"
                  className="carousel slide carousel-fade"
                  data-bs-ride="carousel"
                  data-bs-interval="3000"
                >
                  <div className="carousel-indicators">
                    {bannerData.map((_: any, index: number) => (
                      <button
                        key={index}
                        type="button"
                        data-bs-target="#carouselExampleIndicators"
                        data-bs-slide-to={index}
                        className={index === 0 ? "active" : ""}
                        aria-current={index === 0 ? "true" : "false"}
                      />
                    ))}
                  </div>

                  <div className="carousel-inner">
                    {bannerData.map((item: any, index: number) => (
                      <div
                        key={index}
                        className={`carousel-item ${index === 0 ? "active" : ""}`}
                      >
                        <img
                          src={item?.banner_image_url}
                          className="d-block w-100"
                          alt={item?.title || "banner"}
                          onClick={() => handleBannerClick(item)}
                          style={{
                            cursor:
                              item?.banner_type !== "advertisement"
                                ? "pointer"
                                : "default",
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>

        {/* Browse Categories — unchanged */}
        <div className="col-12 newscrll px-3">

          <SectionLoader
            show={categoriesLoader.loading}
            size="medium"
            text="Loading categories..."
          />

          {!categoriesLoader.loading && categories?.length === 0 && (
            <p className="font-14 weight-bold">No Categories</p>
          )}

          {!categoriesLoader.loading &&
            categories?.map((item: any) => (
              <div
                key={item?.category_id}
                className="catcards fix_widcard_3 new-ser-imgs"
                style={{ cursor: "pointer" }}
                onClick={() =>
                  navigate("/service-by-cat", {
                    state: {
                      category: item?.category_id,
                    },
                  })
                }
              >
                <img
                  src={item?.category_image}
                  alt={item?.category_name}
                />

                <span className="mostbookedtext2">
                  <h3>
                    {item?.category_name?.length > 12
                      ? item.category_name.slice(0, 12) + "..."
                      : item?.category_name}
                  </h3>

                  <p
                    className="mb-0"
                    style={{
                      color: item?.is_available
                        ? "#28a745"
                        : "#dc3545",
                      fontSize: "12px",
                    }}
                  >
                    {/* {item?.is_available
                      ? "Available"
                      : "Unavailable"} */}
                  </p>
                </span>
              </div>
            ))}
        </div>

        {/* Most Booked Services — unchanged
        <div className="container py-2 pb-4 px-4 mt-3 bg-lig2">
          <div className="row mt-2">
            <div className="col-12 pb-3 d-flex align-items-center justify-content-between">
              <p className="subcats">Most Booked Services</p>
              <button className="view_more" onClick={() => navigate("/categories-list")}>See All</button>
            </div>
          </div>
          <div className="row">
            <div className="col-12 newscrll">
              <div className="catcards fix_wid2 d-flex align-items-start gap-3" style={{ cursor: 'pointer' }} onClick={() => navigate('/servicedeatils/1')}>
                <img src={ser3} alt="Service 1" className="img_serv" />
                <span className="mostbookedtext">
                  <h3>Intence Bathroom Cleaning</h3>
                  <p className="mb-0">✭ 4.6 (26)</p>
                  <p className="pt-0">₹350</p>
                  <button className="fill_new2 mt-2 mb-2">Book Now!</button>
                </span>
              </div>
              <div className="catcards fix_wid2 align-items-start d-flex gap-3" style={{ cursor: 'pointer' }} onClick={() => navigate('/servicedeatils/2')}>
                <img src={ser4} alt="Service 1" className="img_serv" />
                <span className="mostbookedtext">
                  <h3>Intence Bathroom Cleaning</h3>
                  <p className="mb-0">✭ 4.6 (26)</p>
                  <p className="pt-0">₹350</p>
                  <button className="fill_new2 mt-2 mb-2">Book Now!</button>
                </span>
              </div>
            </div>
          </div>
        </div> */}

        {/* ✅ Our Popular Services — API integrated */}
        <div className="container py-2 pb-4 mt-3 px-4 bg-lig2">
          <div className="row mt-2">
            <div className="col-12 pb-3 d-flex align-items-center justify-content-between">
              <p className="subcats">Our Popular Services</p>
              <button
                className="view_more"
                onClick={() => navigate("/service-list", { state: { isPopular: true } })}
              >
                See All
              </button>
            </div>
          </div>
          <div className="row">
            <div className="col-12 newscrll">
              <SectionLoader show={popularServicesLoader.loading} size="medium" text="Loading..." />
              {!popularServicesLoader.loading && popularServices?.length === 0 && (
                <p className="font-14 weight-bold">No Popular Services</p>
              )}
              {!popularServicesLoader.loading && popularServices?.map((item: any) => (
                <div
                  key={item?.service_id}
                  className="catcards fix_widcard"
                  style={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/servicedeatils/${item?.service_id}`)}
                >
                  <img src={item?.service_image} alt={item?.service_name} />
                  <span className="mostbookedtext2">
                    <h3>
                      {item?.service_name?.length > 15
                        ? item.service_name.slice(0, 15) + '...'
                        : item?.service_name}
                    </h3>
                    <p className="mb-0">✭ {item?.avg_rating || '0'} ({item?.total_reviews || '0'})</p>
                    <p className="pt-0">{renderPrice(item)}</p>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Refer Card — unchanged */}
        <div className="container bg-lig2 mt-3 py-3">
          <div className="row">
            <div className="col-12">
              <div className="refercard">
                <span>
                  <h6>Refer and Get Free Services</h6>
                  <p>Get Upto 100% Cashback</p>
                  <button className="fill_new2 mt-3" onClick={() => navigate('/referral')}>Refer Now!</button>
                </span>
                <img src={gift} className="w-100" />
              </div>
            </div>
          </div>
        </div>

        {/* ✅ Best Services — API integrated */}
        <div className="container py-2 pb-4 mt-3 px-4 bg-lig2">
          <div className="row mt-2">
            <div className="col-12 pb-3 d-flex align-items-center justify-content-between">
              <p className="subcats">Best Services</p>
              <button
                className="view_more"
                onClick={() => navigate("/service-list", { state: { isPopular: false } })}
              >
                See All
              </button>
            </div>
          </div>
          <div className="row">
            <div className="col-12 newscrll">
              <SectionLoader show={bestServicesLoader.loading} size="medium" text="Loading..." />
              {!bestServicesLoader.loading && bestServices?.length === 0 && (
                <p className="font-14 weight-bold">No Best Services</p>
              )}
              {!bestServicesLoader.loading && bestServices?.map((item: any) => (
                <div
                  key={item?.service_id}
                  className="catcards fix_widcard"
                  style={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/servicedeatils/${item?.service_id}`)}
                >
                  <img src={item?.service_image} alt={item?.service_name} />
                  <span className="mostbookedtext2">
                    <h3>
                      {item?.service_name?.length > 15
                        ? item.service_name.slice(0, 15) + '...'
                        : item?.service_name}
                    </h3>
                    <p className="mb-0">✭ {item?.avg_rating || '0'} ({item?.total_reviews || '0'})</p>
                    <p className="pt-0">{renderPrice(item)}</p>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      <div className="container px-4">
        {/* all the d-none sections kept as-is */}
        <div className="row d-none">
          <SectionLoader show={categoriesLoader.loading} size="medium" text="Loading categories..." />
          {!pageLoading && !categoriesLoader.loading && categories?.length === 0 && (
            <div className="col-12"><p className="font-14 weight-bold">No Categories</p></div>
          )}
          {!categoriesLoader.loading && categories?.length > 0 && (
            <div className="col-12 d-flex gap-15 overflow-auto">
              {categories.map((item: any) => (
                <span
                  onClick={() => navigate(`/service-by-cat`, { state: { category: item?.category_id } })}
                  className="d-flex direction-cloumn align-items-center"
                  key={item?.category_id}
                >
                  <img className="small_cat_img" src={item?.category_image} />
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

        <div className="row pt-4 mt-4 d-none">
          <div className="col-12 pb-4 d-flex align-items-center justify-content-between">
            <div className="servicies_tab_butons">
              <button className={activeTab === 'our-services' ? 'active' : ''} onClick={() => setActiveTab('our-services')}>Our Services</button>
              <button className={activeTab === 'popular' ? 'active' : ''} onClick={() => setActiveTab('popular')}>Popular Services</button>
              <button className={activeTab === 'best' ? 'active' : ''} onClick={() => setActiveTab('best')}>Best Services</button>
            </div>
          </div>
        </div>

        <LoginModal
          show={showLoginModal}
          onCancel={() => setShowLoginModal(false)}
          onConfirm={() => { logout(); setShowLoginModal(false); }}
        />
      </div>
    </>
  );
};

export default Home;