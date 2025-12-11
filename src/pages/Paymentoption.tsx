import { CreditCard, DollarSign, Zap } from "react-feather";

const Paymentoption = () => {
  return (
    <>
      <div className="container">
        <div className="row px-2 pt-3">
          <div className="col-12 pt-2">
            <h1 className="head4">Payment Options</h1>
          </div>
        </div>
        <div className="row px-2">
          <div className="col-12 pt-4">
            <b className="font-18">UPI</b>
          </div>
          <div className="col-12 pt-3 font-18 d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              <input type="radio" className="bigrds"></input>
              &nbsp; Paytm UPI
            </div>
            <Zap></Zap>
          </div>
          <div className="col-12 pt-3 font-18 d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              <input type="radio" className="bigrds"></input>
              &nbsp; PhonePe UPI
            </div>
            <Zap></Zap>
          </div>
          <div className="col-12 pt-3 font-18 d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              <input type="radio" className="bigrds"></input>
              &nbsp; GPay
            </div>
            <Zap></Zap>
          </div>
          <div className="col-12 pt-4">
            <b className="font-18">Cards</b>
          </div>
          <div className="col-12 pt-3 font-18 d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              <input type="radio" className="bigrds"></input>
              &nbsp; Rupay Card
            </div>
            <CreditCard></CreditCard>
          </div>
          <div className="col-12 pt-3 font-18 d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              <input type="radio" className="bigrds"></input>
              &nbsp; Visa Card
            </div>
            <CreditCard></CreditCard>
          </div>
          <div className="col-12 pt-4">
            <b className="font-18">Cash</b>
          </div>
          <div className="col-12 pt-3 font-18 d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              <input type="radio" className="bigrds"></input>
              &nbsp; Cash
            </div>
            <DollarSign></DollarSign>
          </div>
          <div className="col-12 pt-5">
            <button className="fill">Submit</button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Paymentoption;
