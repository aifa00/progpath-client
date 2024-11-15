import "./Signup.css";
import { useState } from "react";
import { resetForm, setForm } from "../../redux/formSlice";
import { useDispatch } from "react-redux";
import axios from "../../axiosConfig";
import { setAlert } from "../../redux/alertSlice";
import Otp from "../Otp/Otp";
import SocialLogin from "../SocialLogin/SocialLogin";
import { ClipLoader } from "react-spinners";

const Signup = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [otpForm, setOtpForm] = useState(false);
  const [email, setEmail] = useState("");
  const [formInputs, setFormInputs] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
  });

  const [error, setError] = useState({
    usernameError: "",
    emailError: "",
    passwordError: "",
    confirmPasswordError: "",
  });

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleNameInput = (e: any) => {
    setFormInputs({ ...formInputs, username: e.target.value });
    if (e.target.value === "") {
      setError({ ...error, usernameError: "This field is required !" });
    } else {
      setError({ ...error, usernameError: "" });
    }
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

  const handleConfirmPassword = (e: any) => {
    setFormInputs({ ...formInputs, confirmPassword: e.target.value });
    if (e.target.value === "") {
      setError({ ...error, confirmPasswordError: "This field is required !" });
    } else {
      setError({ ...error, confirmPasswordError: "" });
    }
  };

  const handleRoleInput = (e: any) => {
    setFormInputs({ ...formInputs, role: e.target.value });
  };

  const handleSubmit = async () => {
    if (
      formInputs.username.trim() === "" ||
      formInputs.email.trim() === "" ||
      formInputs.password.trim() === "" ||
      formInputs.confirmPassword.trim() === ""
    ) {
      const newErrors = {
        usernameError: "",
        emailError: "",
        passwordError: "",
        confirmPasswordError: "",
      };

      if (formInputs.username.trim() === "") {
        newErrors.usernameError = "This field is required!";
      }
      if (formInputs.email.trim() === "") {
        newErrors.emailError = "This field is required!";
      }
      if (formInputs.password.trim() === "") {
        newErrors.passwordError = "This field is required!";
      }
      if (formInputs.confirmPassword.trim() === "") {
        newErrors.confirmPasswordError = "This field is required!";
      }

      setError(newErrors);
      return;
    }

    if (
      error.emailError === "" &&
      error.passwordError === "" &&
      error.emailError === ""
    ) {
      if (formInputs.password.trim() !== formInputs.confirmPassword.trim()) {
        setError({
          ...error,
          confirmPasswordError: "Confirm password didn't match !",
        });
        return;
      }

      if (formInputs.role === "") {
        dispatch(
          setAlert({
            message: "Please select role to continue !",
            type: "error",
          })
        );
        return;
      }

      try {
        if (loading) return;

        setLoading(true);

        const res = await axios.post(`/register`, formInputs);

        if (res.data.success) {
          setOtpForm(true);
          setEmail(res.data.email);
        }
      } catch (error: any) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    }
  };

  const onSuccess = () => {
    setOtpForm(false);
    dispatch(
      setAlert({ message: "OTP verified successfully !", type: "success" })
    );
    dispatch(setForm("login"));
  };

  const handleOuterClick = () => {
    dispatch(resetForm());
  };

  return (
    <>
      <div className="dialog-overlay" onClick={handleOuterClick}>
        <div className="signup-form" onClick={(e) => e.stopPropagation()}>
          <button
            className="close-button"
            onClick={() => dispatch(resetForm())}
          >
            &times;
          </button>

          <h2>SIGNUP</h2>

          <div className="input-group">
            <input type="text" onChange={handleNameInput} placeholder=" " />
            <label>Name</label>
            {error.usernameError !== "" && (
              <span className="error">{error.usernameError}</span>
            )}
          </div>

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
            {error.passwordError !== "" && (
              <span className="error">{error.passwordError}</span>
            )}
          </div>

          <div className="input-group">
            <input
              type={showPassword ? "text" : "password"}
              onChange={handleConfirmPassword}
              placeholder=" "
            />
            <label>Confirm Password</label>
            {error.confirmPasswordError !== "" && (
              <span className="error">{error.confirmPasswordError}</span>
            )}
          </div>

          <div className="radio-group">
            <label>
              <input
                type="radio"
                name="userType"
                value="teamlead"
                onChange={handleRoleInput}
              />
              Manager/Team Lead
            </label>{" "}
            &nbsp; &nbsp;
            <label>
              <input
                type="radio"
                name="userType"
                value="regular"
                onChange={handleRoleInput}
              />
              Regular User
            </label>
          </div>

          <button
            className={
              !loading
                ? "btn-primary signup-button"
                : "btn-disabled signup-button"
            }
            onClick={handleSubmit}
          >
            {!loading ? (
              "SIGNUP"
            ) : (
              <ClipLoader size={10} color="var(--color-text-secondary)" />
            )}
          </button>

          <p className="signup-link">
            Already have an account?{" "}
            <span onClick={() => dispatch(setForm("login"))}>Login</span>
          </p>

          <span>OR</span>
          <br />

          <SocialLogin />
        </div>
        {otpForm && (
          <Otp setOtpForm={setOtpForm} onSuccess={onSuccess} email={email} />
        )}
      </div>
    </>
  );
};

export default Signup;
