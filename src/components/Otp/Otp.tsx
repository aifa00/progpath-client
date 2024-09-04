import { useEffect, useState } from "react";
import "./Otp.css";
import Logo from "../../assets/Logo";
import { useDispatch } from "react-redux";
import { setAlert } from "../../redux/alertSlice";
import axios from "../../axiosConfig";

interface OtpProps {
  setOtpForm: React.Dispatch<React.SetStateAction<boolean>>;
  onSuccess: () => void;
  email: string;
}

const Otp: React.FC<OtpProps> = ({ setOtpForm, onSuccess, email }) => {
  const [otp, setOtp] = useState(new Array(4).fill(""));
  const [timeLeft, setTimeLeft] = useState(300); // 300 seconds for 5 minutes

  const dispatch = useDispatch();

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => (prevTime > 0 ? prevTime - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleChange = (e: any, index: number) => {
    if (isNaN(e.target.value)) return false;
    setOtp([...otp.map((value, i) => (index === i ? e.target.value : value))]);

    if (e.target.value && e.target.nextSibling) {
      e.target.nextSibling.focus();
    }

    if (e.key === "Backspace" && index > 0 && !e.target.value) {
      e.target.previousSibling.focus();
    }
  };

  const handleKeyDown = (e: any, index: number) => {
    if (e.key === "Backspace" && index > 0 && !e.target.value) {
      e.target.previousSibling.focus();
    }

    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    if (otp.join("").length < 4) {
      dispatch(setAlert({ message: "Please enter the OTP !", type: "error" }));
      return;
    }

    try {
      const res = await axios.post(`/otp/verification`, {
        email,
        otp: otp.join(""),
      });

      if (res.data.success) {
        onSuccess();
      }
    } catch (error: any) {
      console.log(error);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
  };

  const handleResendOtp = async () => {
    try {
      const res = await axios.post(`/otp/resend`, { email });

      if (res.data.success) {
        setTimeLeft(300);
        dispatch(setAlert({ message: "OTP resent", type: "success" }));
      }
    } catch (error: any) {
      console.log(error);
    }
  };

  return (
    <div className="dialog-overlay">
      <div className="otp-body">
        <strong onClick={() => setOtpForm(false)}>&times;</strong>
        <div className="logo">
          <Logo />
        </div>

        <div className="otp-form">
          <p>{`We have sent a six digit One Time Password to ${email} Enter the OTP below to continue`}</p>
          <div className="otp-inputs">
            {otp.map((num, i) => {
              return (
                <input
                  key={i}
                  type="text"
                  maxLength={1}
                  value={num}
                  className="otp-input"
                  onChange={(e) => handleChange(e, i)}
                  onKeyDown={(e) => handleKeyDown(e, i)}
                />
              );
            })}
          </div>
          <button className="btn-primary" onClick={handleSubmit}>
            VERIFY
          </button>
          <p>{formatTime(timeLeft)}</p> <br />
          <h5 className="resend-otp" onClick={handleResendOtp}>
            resend OTP
          </h5>
        </div>
      </div>
    </div>
  );
};

export default Otp;
