import "./Login.css";
import { useState } from "react";
import { resetForm, setForm } from "../../redux/formSlice";
import { useDispatch } from "react-redux";
import axios from "../../axiosConfig";
import { setAvatarUrl, setUser, setUsername } from "../../redux/userSlice";
import { useNavigate } from "react-router-dom";
import SocialLogin from "../SocialLogin/SocialLogin";
import ForgotPassword from "../ForgotPassword/ForgotPassword";
import { ClipLoader } from "react-spinners";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPasswordForm, setShowForgotPasswordForm] = useState(false);
  const [formInputs, setFormInputs] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState({
    emailError: "",
    passwordError: "",
  });

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleEmailInput = (e: any) => {
    setFormInputs({ ...formInputs, email: e.target.value });
    if (e.target.value === "") {
      setError({ ...error, emailError: "This field is required !" });
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.target.value)) {
      setError({ ...error, emailError: "Enter a valid email" });
    } else {
      setError({ ...error, emailError: "" });
    }
  };

  const handlePasswordInput = (e: any) => {
    setFormInputs({ ...formInputs, password: e.target.value });
    if (e.target.value === "") {
      setError({ ...error, passwordError: "Password is required !" });
    } else {
      setError({ ...error, passwordError: "" });
    }
  };

  const handleSubmit = async () => {
    if (formInputs.email.trim() === "" || formInputs.password.trim() === "") {
      const newErrors = {
        emailError: "",
        passwordError: "",
      };

      if (formInputs.email.trim() === "") {
        newErrors.emailError = "This field is required!";
      }
      if (formInputs.password.trim() === "") {
        newErrors.passwordError = "This field is required!";
      }

      setError(newErrors);
      return;
    }

    if (error.emailError === "" && error.passwordError === "") {
      try {
        if (loading) return;

        setLoading(true);

        const res = await axios.post(`/login`, {
          email: formInputs.email.trim(),
          password: formInputs.password,
        });

        if (res.data.success) {
          const token = res.data.token;
          const user = res.data.user;
          localStorage.setItem("token", token);
          dispatch(setUser());
          dispatch(setUsername(user.username));
          dispatch(setAvatarUrl(user.avatar));
          navigate("/");
        }
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleOuterClick = () => {
    dispatch(resetForm());
  };

  return (
    <>
      <div className="dialog-overlay" onClick={handleOuterClick}>
        <div className="login-form" onClick={(e) => e.stopPropagation()}>
          <button
            className="close-button"
            onClick={() => dispatch(resetForm())}
          >
            &times;
          </button>
          <h2>LOGIN</h2>

          <div className="input-group">
            <input type="email" onChange={handleEmailInput} placeholder=" " />
            <label>Email</label>
            {error.emailError !== "" && (
              <span className="error">{error.emailError}</span>
            )}
          </div>

          <div className="input-group">
            <input
              type={showPassword ? "text" : "password"}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSubmit();
              }}
              onChange={handlePasswordInput}
              placeholder=" "
            />
            <label>Password</label>
            <i
              className={`show-password ${
                showPassword ? "bi bi-eye" : "bi bi-eye-slash"
              }`}
              onClick={toggleShowPassword}
            ></i>
            <span
              className="forgot-password"
              onClick={() => setShowForgotPasswordForm(true)}
            >
              forgot password
            </span>
            {error.passwordError !== "" && (
              <span className="error">{error.passwordError}</span>
            )}
          </div>

          <button
            className={
              loading ? "btn-disabled login-button" : "btn-primary login-button"
            }
            onClick={handleSubmit}
          >
            {!loading ? (
              "LOGIN"
            ) : (
              <ClipLoader size={10} color="var(--color-text-secondary)" />
            )}
          </button>

          <p className="login-link">
            Don't have an account?{" "}
            <span onClick={() => dispatch(setForm("signup"))}>Signup</span>
          </p>

          <span>OR</span>
          <br />

          <SocialLogin />
        </div>

        {showForgotPasswordForm && (
          <ForgotPassword
            setShowForgotPasswordForm={setShowForgotPasswordForm}
            isAdmin={false}
          />
        )}
      </div>
    </>
  );
};

export default Login;
