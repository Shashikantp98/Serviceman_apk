import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import ApiService from "../services/api";

import { useNavigate } from "react-router-dom";
import CommonHeader from "../components/CommonHeader";
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
      <CommonHeader />
      <div className="container pb-10 main-content-service">
        <div className="row pt-3">
          <div className="col-12">
            <p className="font-14 weight-bold">Browse all categories</p>
          </div>
        </div>
        <div className="row">
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
                    state: { category: item?._id },
                  })
                }
              >
                <img
                  style={{ height: "120px" }}
                  src={item?.category_image}
                  className="w-100 rounded-full"
                />
                <p className="font-14 pt-1">
                  {item?.category_name && item?.category_name.length > 15
                    ? item?.category_name.slice(0, 15) + "..."
                    : item?.category_name}
                </p>
              </div>
            ))
          ) : null}
        </div>
      </div>
    </div>

  );
};

export default CategoriesList;
