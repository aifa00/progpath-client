import React, { useState } from 'react'
import Logo from '../../assets/Logo'
import './ForgotPassword.css';
import axios from '../../axiosConfig';
import Otp from '../Otp/Otp';
import ResetPasswordForm from '../ResetPasswordForm/ResetPasswordForm';
import { BarLoader } from 'react-spinners';


interface ForgotPasswordProps {
    setShowForgotPasswordForm: React.Dispatch<React.SetStateAction<boolean>>
    isAdmin: boolean  
}

const ForgotPassword:React.FC<ForgotPasswordProps> = ({setShowForgotPasswordForm, isAdmin}) => {

    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [showOtpForm, setShowOtpForm] = useState(false);
    const [showResetForm, setShowResetForm] = useState(false);
    const [error, setError] = useState('');


    const handleSubmit = async ()=> {
        try {      
            if (!email) {
                return setError('Please enter an email');
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                return setError('Please enter a valid email');
            } else {
                setError('');
            }

            setLoading(true);

            const res = await axios.post(`/login/forgot-password`, {
              email: email.trim(),
              isAdmin
            });
            
            if (res.data.success) {
              setShowOtpForm(true);
            }
    
        } catch (error) {
            console.log(error); 
        } finally {
            setLoading(false);
        }    
    }

    const openResetPasswordForm = () => {        
        setShowOtpForm(false);
        setShowResetForm(true);
    }
    
  return (
    <div className='dialog-overlay'>
        <i onClick={() => setShowForgotPasswordForm(false)} className='bi bi-x-lg close-button'></i>
        <div className="forgot-password-container">

            <div className='logo'>
                <Logo/>
            </div>

            <div>
                <h1>Forgot Password</h1> <br />
                <p>Enter your email, We will send you OTP</p>
            </div>

            <div className="input-item">
                <label htmlFor='email'>Email&nbsp;<i className="bi bi-envelope-at-fill"></i></label>                  
                <input 
                value={email}
                onChange={(e)=>setEmail(e.target.value)}
                type="email" 
                id='email' 
                placeholder='john@gmail.com'/>
                {error && <p className='error'>{error}</p>}
            </div>            

            <div className='submit-button'>
                <button onClick={handleSubmit} className={loading ? 'btn-disabled' : 'btn-secondary'}>SUBMIT</button>                
            </div>
            {loading && <BarLoader color='var(--color-blue)' width={'100%'}/>}
        </div>
        {
            showOtpForm && (
                <Otp onSuccess={openResetPasswordForm} setOtpForm={setShowOtpForm} email={email.trim()}/>
            )
        }
        {
        showResetForm && (
          <ResetPasswordForm setShowResetForm={setShowResetForm} setShowForgotPasswordForm={setShowForgotPasswordForm} email={email} isAdmin={isAdmin}/>
        )
      }
    </div>
  )
}

export default ForgotPassword