// import React from 'react'
import { Percent } from 'react-feather';

const Referaalcode = () => {
  return (
    <>
    <div className="h-100vh  pt-5">
       
      <div className="px-4 d-flex align-items-center justify-content-between">
         <button className="gobackbtn " >
        Go Back
       </button>
       <button className="gobackbtn" >
        Skip
       </button>
      </div>

        <div className="px-4 pt-5 mt-5">

          <Percent size={40} className="mb-2 color-green " />
          <h6 className="onboard_head">Enter Referral Code</h6>

            <input type="text"
            className="form-control mt-1 npt_cmn2"
            placeholder="Enter referral code"
            />

         

          <p className="color-grey font-12 mt-3">
            Please enter referral code if you have any. Otherwise, you can skip this step and enter referral code later from profile section.
          </p>

          <button
            className="fill mt-3"
            
          >
            Go Next
          </button>
        </div>
      </div>
    </>
  )
}

export default Referaalcode