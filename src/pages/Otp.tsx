

const Otp = () => {
  return (
    <>
        <div className='px-5 pt-5 pb-3'>
            <h3 className='head2 pt-5'>Enter verification code</h3>
            <p className='text-center color-grey font-12'>We have sent you a 4 digit verification code on <b className=''>+91 6390168836</b></p>
        </div>
        <div className='otp'>
            <input type='text'></input>
            <input type='text'></input>
            <input type='text'></input>
            <input type='text'></input>
        </div>
        <p className='text-center color-grey font-12 pt-3'>Did't Recivied? <b>Resend</b></p>
        <div className='px-4 mt-5'>
            <button className='fill_half'>Verify</button>
        </div>
    </>
  )
}

export default Otp