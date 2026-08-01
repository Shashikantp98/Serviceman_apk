import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import ApiService from "../services/api";


import cat1 from '../assets/cat1.png';
import cat2 from '../assets/cat2.png';
import cat3 from '../assets/cat3.png';


import { useNavigate } from "react-router-dom";
// import CommonHeader from "../components/CommonHeader";
import SectionLoader from "../components/SectionLoader";
import { useSectionLoader } from "../utils/useSectionLoader";

const CategoriesList = () => {
  const [categories, setCategories] = useState<any>([]);
  const { latitude, longitude } = useAuth();
  const navigate = useNavigate();

  // Loader For Categories
  const categoryLoader = useSectionLoader("category-list");

  const getCategories = () => {
    categoryLoader.setLoading(true);
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
        categoryLoader.setLoading(false);
      })
  };
  useEffect(() => {
    getCategories();
  }, []);
  return (
    <div>
     
      <div className="container padding_btn_main">

          <div className="row pt-5">
            <div className="col-12 pt-3 d-flex align-items-center justify-content-between">
              <button className="back_btn_new">Back</button>
            </div>
          </div>

          <div className="row">
              <div className="col-12 pt-4 pb-0">
              <h3>All Categories</h3>
              </div>
          </div>

        <div className="row pb-5 mb-5">
          <div className="col-12 mt-3">
            <img src={cat1} className="w-100 " />
          </div>
          <div className="col-12 mt-3">
            <img src={cat2} className="w-100 " />
          </div>
          <div className="col-12 mt-3">
            <img src={cat3} className="w-100 " />
          </div>
        </div>

        <div className="row d-none">
          <SectionLoader
            show={categoryLoader.loading}
            size="medium"
            text="Loading categories..."
            overlay={true}
          />

          {!categoryLoader.loading && categories.length === 0 && (
            <div className="col-12">
              <p className="font-14 weight-bold">No Categories</p>
            </div>
          )}

          {categories?.length > 0 ? (
            categories.map((item: any) => (
              <div
                className="col-6"
                key={item?._id}
                onClick={() =>
                  navigate(`/service-by-cat`, {
                    state: { category: item?.category_id },
                  })
                }
              >
                <div className="cat_det_card_box">
                <img
                  style={{ height: "120px" }}
                  src={item?.category_image}
                  className="w-100 rounded-full object-cover"
                />
                <p className="font-14 pt-1">
                  {item?.category_name && item?.category_name.length > 15
                    ? item?.category_name.slice(0, 15) + "..."
                    : item?.category_name}
                </p>
                </div>

              </div>
            ))
          ) : null}
        </div>
      </div>
    </div>

  );
};

export default CategoriesList;
