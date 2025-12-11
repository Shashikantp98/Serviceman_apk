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
          <div className="col-12 px-0">
            <button className="back-btn" onClick={() => navigate(-1)}>
              <ChevronLeft /> Back
            </button>
          </div>
        </div>
      </div>
      <div className="main-content-profile">
        <div className="row">
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
