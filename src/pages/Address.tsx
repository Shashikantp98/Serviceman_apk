import { Plus } from "react-feather";
import ApiService from "../services/api";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useSectionLoader } from "../utils/useSectionLoader";
import SectionLoader from "../components/SectionLoader";

interface AddressProps {
  onSelect: (address: string) => void;
  service_id?: string;
  onExit?: () => void;
}

const Address = ({ onSelect, service_id, onExit }: AddressProps) => {
  const navigate = useNavigate();
  const [addressList, setaddressList] = useState<any[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);

  const addressLoader = useSectionLoader("address-loader");

  const getCustomerAddress = () => {
    addressLoader.setLoading(true);
    ApiService.post("/user/getCustomerAddress", { service_id })
      .then((res: any) => {
        setaddressList(res.data || []);
      })
      .catch((err) => {
        console.log(err);
        toast.error("Failed to fetch addresses");
      })
      .finally(() => {
        addressLoader.setLoading(false);
      });
  };

  useEffect(() => {
    getCustomerAddress();
  }, []);

  const handleProceed = () => {
    if (selectedAddress) {
      onSelect(selectedAddress);
    } else {
      toast.error("Please select an address");
    }
  };

  return (
    <div className="wrappers">
      <div className="popups">
        <div className="d-flex justify-content-between align-items-center">
          <h6>Select Address</h6>
          <button onClick={onExit} className="pclosebtn">
            Close
          </button>
        </div>
        <div className="border-bottom pb-3 pt-2 mb-3">
          <button
            className="addr_btn"
            onClick={() => navigate("/authlocation", { state: { id: "add" } })}
          >
            <Plus />&nbsp;Add new Address
          </button>
        </div>

        {/* Section Loader */}
        <SectionLoader
          show={addressLoader.loading}
          size="medium"
          text="Loading your addresses..."
          overlay={true}
        />

        {/* Address List */}
        {!addressLoader.loading && addressList.length > 0 ? (
          addressList.map((item: any) => (
            <div className="d-flex gap-10" key={item._id}>
              <div className="pt-1">
                <input
                  id={item._id}
                  type="radio"
                  className="add-rad"
                  checked={item._id === selectedAddress}
                  onChange={() => setSelectedAddress(item._id)}
                />
                <label htmlFor={item._id}>
                  <span></span>
                </label>
              </div>
              <div>
                <label htmlFor={item._id}>
                  <p className="font-12 color-grey">
                    {item.street_1}, {item.city}, {item.state}, {item.zip}, {item.country}
                  </p>
                </label>
              </div>
            </div>
          ))
        ) : (
          // Not Found Message
          !addressLoader.loading && (
            <div className="text-center mt-4">
              <h1 className="bigemj">🏠</h1>
              <p>No addresses found</p>
            </div>
          )
        )}

        <div className="pt-4">
          <button className="fill" onClick={handleProceed}>
            Proceed
          </button>
        </div>
      </div>
    </div>
  );
};

export default Address;
