import React, {FormEvent, useState} from 'react';
import './AdminLogin.css';
import Logo from '../../assets/Logo';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setUser } from '../../redux/userSlice';
import axios from '../../axiosConfig';
import ForgotPassword from '../ForgotPassword/ForgotPassword';

function AdminLogin() {

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [showPassword, setShowPassword] = useState(false);
    const [showForgotPasswordForm, setShowForgotPasswordForm] = useState(false);

    const [formInputs, setFormInputs] = useState ({   
        email: '',
        password: '',   
    })
    const [error, setError] = useState ({   
        emailError: '',
        passwordError: '',
    })


    const toggleShowPassword = () => {
        setShowPassword(!showPassword);
    }


    const handleEmailInput = (e:any) => {
        setFormInputs({...formInputs, email: e.target.value});
        if (e.target.value === '') {
          setError({...error, emailError: 'This field is required !'})
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.target.value)) {
          setError({...error, emailError: 'Enter a valid email'})
        } else {
          setError({...error, emailError: ''})
        }     
      }
      
      const handlePasswordInput = (e:any) => {
        setFormInputs({...formInputs, password: e.target.value});
        if (e.target.value === '') {
          setError({...error, passwordError: 'Password is required !'})
        } else {
          setError({...error, passwordError: ''})
        }     
      }
    
      const handleSubmit = async (e:any)=> {

        e.preventDefault();
    
        if (formInputs.email.trim() === '' || formInputs.password.trim() === '')  {
              
          const newErrors = {        
            emailError: '',
            passwordError: '',        
          }; 
         
          if (formInputs.email.trim() === '') {
            newErrors.emailError = 'This field is required!';
          }
          if (formInputs.password.trim() === '') {
            newErrors.passwordError = 'This field is required!';
          }
      
          setError(newErrors); 
          
          return
        }
    
    
        if (error.emailError === '' && error.passwordError === '')  {
        
          try {
          
            const res = await axios.post(`/admin/login`, {
              email: formInputs.email.trim(),
              password: formInputs.password,
            });
            
            if (res.data.success) {
              const token = res.data.token;
              localStorage.setItem('token', token);
              dispatch(setUser());
              navigate('/admin/dashboard');
            }
    
          } catch (error) {
            console.log(error);
          }
        }
      }

      const handleOpenForgotPassword = () => {
        setShowForgotPasswordForm(true);
      }


  return (
    <>
    <div className='admin-login'>
        <div className="logodiv">
            <Logo/>
        </div>
        <form>
            <div className='adminlogin-form'>
                <h2>ADMIN LOGIN</h2>
                <div className="input-group">
                <input type="email" onChange={handleEmailInput} placeholder=' '/>
                <label>Email</label>
                {error.emailError !== '' && <span className='error'>{error.emailError}</span>}
                </div>
                <div className="input-group">
                <input type={showPassword ? "text" : "password"} onChange={handlePasswordInput} placeholder=' '/>
                <label>Password</label>
                <i className={`show-password ${showPassword ? 'bi bi-eye' : 'bi bi-eye-slash'}`} onClick={toggleShowPassword}></i>
                <span onClick={handleOpenForgotPassword} className='forgot-password'>forgot password</span>
                {error.passwordError !== '' && <span className='error'>{error.passwordError}</span>}
                </div>        
                <button className="btn-primary login-button" onClick={handleSubmit}>LOGIN</button>
            </div>
        </form>
        {showForgotPasswordForm &&<ForgotPassword setShowForgotPasswordForm={setShowForgotPasswordForm} isAdmin={true}/>}
    </div>
    </>
  )
}

export default AdminLogin