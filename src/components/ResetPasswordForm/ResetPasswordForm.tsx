import { useDispatch } from "react-redux";
import Logo from "../../assets/Logo";
import axios from "../../axiosConfig";
import "./ResetPasswordForm.css";
import React, { useState } from "react";
import { setAlert } from "../../redux/alertSlice";
import { BarLoader } from "react-spinners";

interface ResetPasswordProps {
  setShowResetForm: React.Dispatch<React.SetStateAction<boolean>>;
  setShowForgotPasswordForm: React.Dispatch<React.SetStateAction<boolean>>;
  email: string;
  isAdmin: boolean;
}

const ResetPasswordFor: React.FC<ResetPasswordProps> = ({
  setShowResetForm,
  setShowForgotPasswordForm,
  email,
  isAdmin,
}) => {
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const dispatch = useDispatch();

  const handleSubmit = async () => {
    try {
      if (!password && !confirmPassword) {
        return setError(
          "Please provide password and confirm password to continue"
        );
      } else if (!password) {
        return setError("Password field is required");
      } else if (!confirmPassword) {
        return setError("Confirm password field is required");
      } else if (password !== confirmPassword) {
        return setError("Password and confirm password didn't match");
      } else {
        setError("");
      }

      if (loading) return;

      setLoading(true);

      const res = await axios.post(`/login/reset-password`, {
        email: email.trim(),
        password,
        confirmPassword,
        isAdmin,
      });

      if (res.data.success) {
        dispatch(
          setAlert({ message: "Password reset successfully", type: "success" })
        );
        setShowResetForm(false);
        setShowForgotPasswordForm(false);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dialog-overlay">
      <i
        onClick={() => setShowResetForm(false)}
        className="bi bi-x-lg close-button"
      ></i>
      <div className="reset-password-form">
        <div className="logo">
          <Logo />
        </div>

        <div>
          <h1>Reset-Password</h1>
        </div>

        <div className="input-item">
          <label htmlFor="password">Password *</label>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            id="password"
            placeholder="password"
          />
        </div>

        <div className="input-item">
          <label htmlFor="confirm-password">Confirm Password *</label>
          <input
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            type="password"
            id="confirm-password"
            placeholder="confirm password"
          />
          {error && <p className="error">{error}</p>}
        </div>

        <div className="submit-button">
          <button
            onClick={handleSubmit}
            className={loading ? "btn-disabled" : "btn-secondary"}
          >
            RESET PASSWORD
          </button>
          {loading && <BarLoader color="var(--color-blue)" width={"100%"} />}
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordFor;
