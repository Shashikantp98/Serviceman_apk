import { useEffect, useState } from "react";
import ApiService from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";

import { LoginModal } from "../components/LoginModal";
import { toast } from "react-toastify";
// import CommonHeader from "../components/CommonHeader";
import SectionLoader from "../components/SectionLoader";
import { useSectionLoader } from "../utils/useSectionLoader";

const ServiceByCat = () => {
  const navigate = useNavigate();
  const locationState = useLocation().state;
  const { latitude, longitude, token, logout } = useAuth();
  const [services, setServices] = useState<any>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(
    locationState?.category || ""
  );

  // Loader for service by category
  const catServiceLoader = useSectionLoader("catServ-loader");
  const categoriesLoader = useSectionLoader("categories");

  const getAllServices = (categoryId: string) => {
    catServiceLoader.setLoading(true);

    ApiService.post("/user/getServiceList", {
      latitude: Number(latitude),
      longitude: Number(longitude),
      filters: {
        search: "",
        category_id: categoryId,
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

  // Reload services whenever the selected category changes
  useEffect(() => {
    getAllServices(selectedCategoryId);
  }, [selectedCategoryId]);

  // Fetch categories once on mount
  useEffect(() => {
    categoriesLoader.setLoading(true);
    ApiService.post("/user/getAllCategoryList", {
      latitude: Number(latitude),
      longitude: Number(longitude),
      filters: { search: "" },
      pagination: { page: 1, pageSize: 50 },
    })
      .then((res: any) => setCategories(res.data.list))
      .catch((err: any) => console.log(err))
      .finally(() => categoriesLoader.setLoading(false));
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

      <div className="container">
        <div className="row pt-2">
          <div className="col-12">
            <button
              className="back_btn_new"
              onClick={() => navigate(-1)}>
              Back
            </button>
          </div>
        </div>
        <div className="row pt-2">
          <div className="col-12 pt-2">
            <div className="px-0 categories_scroll pt-2">
              <button
                className={selectedCategoryId === "" ? "active" : ""}
                onClick={() => setSelectedCategoryId("")}
              >
                All
              </button>

              {categories?.map((cat: any) => (
                <button
                  key={cat?.category_id}
                  className={
                    selectedCategoryId === cat?.category_id ? "active" : ""
                  }
                  onClick={() => setSelectedCategoryId(cat?.category_id)}
                >
                  {cat?.category_name}
                </button>
              ))}

            </div>
          </div>
        </div>
      </div>
      <div className="container py-2 pb-4 mt-3 px-4 bg-lig2 padding_btn_main pb-5 mb-5">
        <div className="row  mt-4">
          <div className="col-12 pb-4 d-flex align-items-center justify-content-between">
            <p className="subcats">
              {selectedCategoryId
                ? categories?.find(
                  (cat: any) =>
                    cat?.category_id === selectedCategoryId
                )?.category_name + " Services"
                : "All Services"}
            </p>            <button
              className="view_more"
              onClick={() => navigate("/categories-list")}
            >
              See All
            </button>
          </div>
        </div>
        <div className="row">
          <SectionLoader
            size="medium"
            show={catServiceLoader.loading}
            text="Loading Services..."
            overlay={true}
          />

          {!catServiceLoader.loading &&
            services?.map((item: any) => (
              <div
                className="col-6 mb-4"
                key={item?.service_id}
                onClick={() =>
                  navigate(`/servicedeatils/${item?.service_id}`)
                }
                style={{ cursor: "pointer" }}
              >
                <div className="catcards">
                  <img
                    src={item?.service_image}
                    alt={item?.service_name}
                  />

                  <span className="mostbookedtext2">
                    <h3>
                      {item?.service_name?.length > 25
                        ? item?.service_name.slice(0, 25) + "..."
                        : item?.service_name}
                    </h3>

                    <p className="mb-0">
                      ✭ {item?.avg_rating || 0}
                      {" "}
                      ({item?.total_reviews || 0})
                    </p>

                    <p className="pt-0">
                      ₹
                      {item?.offer_price ||
                        item?.final_price ||
                        item?.price}
                    </p>
                  </span>
                </div>
              </div>
            ))}

          {!catServiceLoader.loading &&
            services?.length === 0 && (
              <div className="col-12">
                <p>No Services Found</p>
              </div>
            )}
        </div>
      </div>

      <div className="container pb-10 main-content-service d-none">
        {/* ===== Categories Strip ===== */}
        <div className="row pt-3">
          <SectionLoader show={categoriesLoader.loading} size="medium" text="" />
          {!categoriesLoader.loading && categories.length > 0 && (
            <div className="col-12 d-flex gap-15 overflow-auto pb-2">
              {categories.map((cat: any) => {
                const isActive = cat?.category_id === selectedCategoryId;
                return (
                  <span
                    key={cat?.category_id}
                    onClick={() => setSelectedCategoryId(cat?.category_id)}
                    className="d-flex direction-cloumn align-items-center"
                    style={{ cursor: "pointer", flexShrink: 0 }}
                  >
                    <img
                      className="small_cat_img"
                      src={cat?.category_image}
                      style={{
                        border: isActive ? "2px solid var(--primary-color, #040407)" : "2px solid transparent",
                        borderRadius: "50%",
                      }}
                    />
                    <p
                      className="font-14 mb-0 pt-1"
                      style={{
                        fontWeight: isActive ? 700 : 400,
                        color: isActive ? "var(--primary-color, #040407)" : undefined,
                      }}
                    >
                      {cat?.category_name?.length > 8
                        ? cat?.category_name.slice(0, 8) + "..."
                        : cat?.category_name}
                    </p>
                  </span>
                );
              })}
            </div>
          )}
        </div>

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
              <div
                className="col-6 pt-3"
                key={item?.service_id}
                style={{
                  cursor: 'pointer',
                  display: 'flex',
                  position: 'relative',
                }}
              >
                <div className="serv_cards" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <img
                    src={item.service_image}
                    className="w-100"
                    style={{ height: "140px", objectFit: "cover", flexShrink: 0 }}
                    onClick={() => navigate(`/servicedeatils/${item?.service_id}`)}
                  />

                  <h3
                    className="s_h"
                    onClick={() => navigate(`/servicedeatils/${item?.service_id}`)}
                    style={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      minHeight: '2.4em',
                    }}
                  >
                    {item?.service_name}
                  </h3>

                  <p
                    className="s_r"
                    onClick={() => navigate(`/servicedeatils/${item?.service_id}`)}
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
                  <div
                    className="s_p"
                    onClick={() => navigate(`/servicedeatils/${item?.service_id}`)}
                    style={{ marginTop: 'auto' }}
                  >
                    <div className="d-flex align-items-center gap-1 flex-wrap">
                      {(item?.offer_price || item?.final_price) ? (
                        <>
                          {/* <span style={{ textDecoration: 'line-through', color: '#999', fontSize: '12px' }}>
                            ₹{item?.price}
                          </span> */}
                          <span style={{ color: 'var(--primary-color, #040407)', fontWeight: 700 }}>
                            ₹{item?.offer_price || item?.final_price}
                          </span>
                          {/* {item?.discount_percent && (
                            <span style={{ background: '#e8f5e9', color: '#2e7d32', fontSize: '10px', fontWeight: 600, borderRadius: '4px', padding: '1px 5px' }}>
                              {item?.discount_percent}% off
                            </span>
                          )} */}
                        </>
                      ) : (
                        <span style={{ color: 'var(--primary-color, #040407)', fontWeight: 700 }}>₹{item?.price}</span>
                      )}
                    </div>
                    <span style={{ fontSize: '12px', color: '#555' }}>Duration : {item?.duration}</span>
                  </div>

                  <button
                    onClick={() => handleBookNow(item)}
                    className="a_cart"
                    disabled={!item?.is_available}
                    style={{ pointerEvents: item?.is_available ? 'auto' : 'none' }}
                  >
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
