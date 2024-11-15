import "./SocialLogin.css";
import { LoginSocialFacebook } from "reactjs-social-login";
import { GoogleLogin } from "@react-oauth/google";
import axios from "../../axiosConfig";
import { useDispatch } from "react-redux";
import { setAvatarUrl, setUser, setUsername } from "../../redux/userSlice";
import { useState } from "react";

function SocialLogin() {
  const [showSelectRole, setShowSelectRole] = useState(false);
  const dispatch = useDispatch();

  const handleGoogleLogin = async (response: any) => {
    try {
      const { data } = await axios.post("/login/google", {
        token: response.credential,
      });

      if (data.success) {
        const token = data.token;
        const user = data.user;

        localStorage.setItem("token", token);

        if (data.isUserExist) {
          dispatch(setUser());
          dispatch(setUsername(user.username));
          dispatch(setAvatarUrl(user.avatar));
        } else {
          setShowSelectRole(true);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleFacebookLogin = async (response: any) => {
    try {
      const { data } = await axios.post("/login/facebook", {
        accessToken: response.data.accessToken,
      });

      if (data.success) {
        const token = data.token;
        const user = data.user;

        localStorage.setItem("token", token);

        if (data.isUserExist) {
          dispatch(setUser());
          dispatch(setUsername(user.username));
          dispatch(setAvatarUrl(user.avatar));
        } else {
          setShowSelectRole(true);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleSubmitRole = async (e: any) => {
    try {
      const role = e.target.value;

      if (!["regular", "teamlead"].includes(role)) {
        return;
      }

      const { data } = await axios.post("/login/role", {
        roleSelected: role,
      });

      if (data.success) {
        setShowSelectRole(false);
        dispatch(setUser());
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="social-login">
      <GoogleLogin
        onSuccess={handleGoogleLogin}
        onError={() => {
          console.log("Google Login Failed !");
        }}
        theme="filled_black"
      />
      <br />

      <LoginSocialFacebook
        appId={process.env.REACT_APP_FACEBOOK_APP_ID as string}
        onResolve={handleFacebookLogin}
        onReject={() => {
          console.log("Facebook Login failed !");
        }}
      >
        <button className="facebook-login">
          <i className="fa-brands fa-square-facebook fa-3x"></i>
          SignIn Using Facebook
        </button>
      </LoginSocialFacebook>

      {showSelectRole && (
        <div className="dialog-overlay">
          <div className="select-role-form">
            <h1>Select Role</h1>

            <div className="body">
              <div className="input-item">
                <input
                  onClick={handleSubmitRole}
                  type="radio"
                  value="regular"
                  name="role"
                  id="regular"
                />
                <label htmlFor="regular">Regular</label>
              </div>

              <div>
                <input
                  onClick={handleSubmitRole}
                  type="radio"
                  value="teamlead"
                  name="role"
                  id="teamlead"
                />
                <label htmlFor="teamlead">Manager/Team lead</label>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SocialLogin;
