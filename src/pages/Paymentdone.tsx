import { Check } from "react-feather";

const Paymentdone = () => {
  return (
    <>
      <div className="wraps2 px-4">
        <div className="cards4">
          <div>
            <div className="sucright">
              <Check></Check>
            </div>
          </div>
          <p className="color-blue text-center mb-2 pt-3">Great</p>
          <h3 className="head text-center pb-2">Payment Successfull</h3>
          <div className="row border-bottom">
            <div className="col-6">
              <p className="color-grey font-14">Payment Mode</p>
            </div>
            <div className="col-6">
              <p className="font-14">UPI</p>
            </div>
          </div>
          <div className="row border-bottom pt-3">
            <div className="col-6">
              <p className="color-grey font-14">Total Amounte</p>
            </div>
            <div className="col-6">
              <p className="font-14">₹49 </p>
            </div>
          </div>
          <div className="row border-bottom pt-3">
            <div className="col-6">
              <p className="color-grey font-14">Pay Date</p>
            </div>
            <div className="col-6">
              <p className="font-14">Apr 10, 2022 </p>
            </div>
          </div>
          <div className="row border-bottom pt-3">
            <div className="col-6">
              <p className="color-grey font-14">Pay Time</p>
            </div>
            <div className="col-6">
              <p className="font-14">10:45 am </p>
            </div>
          </div>
          <div className="row pt-4">
            <div className="col-12 text-center">
              <p className="color-grey font-12 mb-2">Total Pay</p>
              <b className="color-blue">₹49 </b>
            </div>
          </div>
          <div className="row">
            <div className="col-12 pt-4">
              <button className="fill">Done</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Paymentdone;
