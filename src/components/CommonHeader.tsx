import { ChevronLeft } from "react-feather";
import { useNavigate } from "react-router-dom";

interface CommonHeaderProps {
  customBack?: () => void; // optional function type
}

const CommonHeader: React.FC<CommonHeaderProps> = ({ customBack }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (customBack) {
      customBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="new_header fixed_header">
      <div className="row">
        <div className="col-12">
          <button className="backs_butn" onClick={handleBack}>
            <ChevronLeft />
            
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommonHeader;
