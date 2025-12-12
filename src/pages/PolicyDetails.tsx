import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import ApiService from "../services/api";
import { ChevronLeft } from "react-feather";
import { useNavigate } from "react-router-dom";
// import SectionLoader from "../components/SectionLoader";
import { useSectionLoader } from "../utils/useSectionLoader";

const PolicyDetails = () => {
  const location = useLocation();
  const type = location.state?.type;
  const [policyDetails, setPolicyDetails] = useState<any>({});
  const navigate = useNavigate();

  // Loader for Policy Details
  const policyDetailsLoader = useSectionLoader("policy-details");

  useEffect(() => {
    policyDetailsLoader.setLoading(true);
    ApiService.post("/user/getPageDetails", { page_type: type })
      .then((res: any) => {
        console.log(res);
        setPolicyDetails(res.data);
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        policyDetailsLoader.setLoading(false);
      })
  }, []);
  return (
    <div>
      <div className="fixed_header">
        {policyDetailsLoader.loading && (
          <div className="full-page-loader">
            <div className="loader-spinner"></div>
            <p>Loading Profile details...</p>
          </div>
        )}
        <div className="row">
          <div className="col-12 px-3">
            <button className="backs_butn" onClick={() => navigate(-1)}>
              <ChevronLeft />
            </button>
          </div>
        </div>
      </div>
      <div className="container pb-5 pt-5 mt-5 mb-5">
        <div className="row pt-5">
          <div className="col-12">
              <h2 className="head4 text-center">Privacy Policy</h2>
          </div>
          <div className="col-12 ">
            <div
              style={{ padding: "10px" }}
              dangerouslySetInnerHTML={{ __html: policyDetails?.content }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PolicyDetails;
