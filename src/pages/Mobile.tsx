import logo from "../assets/dlogo.png";

const Mobile = () => {
  return (
    <>
      <div className="h-100vh gred2 pt-5">
        <div className="cir">
          <img src={logo}></img>
        </div>
        <div className="px-4 pt-5">
          <h6>Enter Mobile Number</h6>
          <input type="text" className="npt"></input>
          <p className="color-grey font-12 mt-2">
            An OTP will be sent on given phone number for verification.Standard
            message and data rates apply.
          </p>
          <button className="fill mt-3">Login</button>
        </div>
      </div>
    </>
  );
};

export default Mobile;
