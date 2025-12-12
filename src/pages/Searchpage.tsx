import { ChevronLeft, Clock, Search } from "react-feather";
import ApiService from "../services/api";
import { useEffect, useState } from "react";
import { debounce } from "lodash";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
const Searchpage = () => {
  const { latitude, longitude, token } = useAuth();
  const [recentSearchList, setRecentSearchList] = useState<any>([]);
  const [categories, setCategories] = useState<any>([]);
  const [_, setSearch] = useState("");
  const [searchList, setSearchList] = useState<any>([]);
  const navigate = useNavigate();
  const recentSearch = () => {
    ApiService.post("/user/listRecentSearches", {})
      .then((res: any) => {
        console.log(res.data);
        setRecentSearchList(res.data.list);
      })
      .catch((err: any) => {
        console.log(err);
      });
  };
  const getAllCategories = () => {
    ApiService.post("/user/getAllCategoryList", {
      latitude: Number(latitude),
      longitude: Number(longitude),
    })
      .then((res: any) => {
        // console.log(res);
        setCategories(res.data.list);
      })
      .catch((err) => {
        console.log(err);
      });
  };
  useEffect(() => {
    if (token !== "guest") {
      recentSearch();
    }

    getAllCategories();
  }, []);

  const handleSearchWithDebounce = debounce((e: any) => {
    setSearch(e.target.value);
    ApiService.post("/user/searchServicesAndCategories", {
      search: e.target.value,
      latitude: Number(latitude),
      longitude: Number(longitude),
    })
      .then((res: any) => {
        console.log(res.data);
        setSearchList(res.data);
      })
      .catch((err: any) => {
        console.log(err);
        setSearchList([]);
      });
  }, 500);

  const addRecentSearch = (search: any) => {
    ApiService.post("/user/addRecentSearch", {
      entity_id: search._id,
      type: search.type,
      keyword: search.name,
      latitude: Number(latitude),
      longitude: Number(longitude),
    })
      .then((res: any) => {
        console.log(res.data);
      })
      .catch((err: any) => {
        console.log(err);
      });
  };
  return (
    <>
      <div>
        <div className="fixed_header">
          <button className="backs_butn" onClick={() => navigate(-1)}>
            <ChevronLeft></ChevronLeft>
           
          </button>
          <div className="container">
          <div className="row pt-3">
            <div className="col-12 p-0">
              <label className="search_lbl">
                <Search></Search>
                <input
                  type="search"
                  className="search bg-grey"
                  placeholder="Search anything"
                  onChange={handleSearchWithDebounce}
                ></input>
              </label>
            </div>
          </div></div>
        </div>
        
        <div className="main-content">
          <div className="container pt-3 ">
          {searchList?.length > 0 && (
            <div className="row px-2">
              <div className="col-12 pt-3">
                <ul className="trendtopics">
                  {searchList?.map((item: any) => (
                    <li
                      key={item?._id}
                      onClick={() => {
                        if (item?.type === "category") {
                          addRecentSearch(item);
                          setSearch("");
                          navigate(`/service-by-cat`, {
                            state: { category: item?._id },
                          });
                        }
                        if (item?.type === "service") {
                          addRecentSearch(item);
                          setSearch("");
                          navigate(`/servicedeatils/${item?._id}`);
                        }
                      }}
                    >
                      <Search></Search> {item?.name} ({item?.type})
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
          <div className="row px-2">
            <div className="col-12 ">
              <ul className="tbss2">
                {categories?.map((item: any) => (
                  <li
                    key={item?._id}
                    onClick={() =>
                      navigate(`/service-by-cat`, {
                        state: { category: item?._id },
                      })
                    }
                  >
                    {item?.category_name}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          {recentSearchList?.length > 0 && (
            <div className="row px-2 pt-3">
              <div className="col-12 pt-0">
                <h3 className="font-14 pb-1">Recent Search</h3>
                <ul className="trendtopics">
                  {recentSearchList?.map((item: any) => (
                    <li
                      key={item?.entity_id}
                      onClick={() => {
                        if (item?.type === "category") {
                          setSearch("");
                          navigate("/service-by-cat", {
                            state: { category: item?.entity_id },
                          });
                        }
                        if (item?.type === "service") {
                          setSearch("");
                          navigate(`/servicedeatils/${item?.entity_id}`);
                        }
                      }}
                    >
                      <Clock></Clock>
                      {item?.keyword}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
        </div>
      </div>
    </>
  );
};

export default Searchpage;
