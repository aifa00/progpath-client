import { useEffect, useState } from "react";
import Logo from "../../assets/Logo";
import "./Header.css";
import axios from "../../axiosConfig";
import { useDispatch, useSelector } from "react-redux";
import { removeUser } from "../../redux/userSlice";
import { setForm } from "../../redux/formSlice";
import { useNavigate } from "react-router-dom";
import { RootState } from "../../redux/store";

function Header() {
  const profileUrl: any = useSelector<RootState>((state) => state.user.avatar);
  const username: any = useSelector<RootState>((state) => state.user.username);

  const [dropdown, setDropDown] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      setDropDown(false);
      const res = await axios.post("/logout");

      if (res.data.success) {
        localStorage.removeItem("token");
        dispatch(removeUser());
        navigate("/");
        dispatch(setForm("login"));
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleNavigateToProfile = async () => {
    navigate("/profile");
  };

  return (
    <>
      <div className="header-main">
        <div className="header-left" onClick={() => navigate("/")}>
          <Logo />
        </div>
        <div className="header-right">
          <img
            onClick={() => setDropDown(!dropdown)}
            src={profileUrl ? profileUrl.trim() : "/images/avatar.jpg"}
            alt="profile"
          />
          {dropdown && (
            <div className="dropdown-menu" style={{ top: "50px" }}>
              <div
                onClick={handleNavigateToProfile}
                className="dropdown-option"
              >
                <img
                  src={
                    profileUrl ? profileUrl.trim() : "/images/icons/profile.png"
                  }
                  alt="profile"
                />
                <p>{username}</p>
              </div>
              <div
                style={{
                  borderTop: "1px solid var(--color-violet)",
                  borderRadius: "0",
                }}
                onClick={handleLogout}
                className="dropdown-option"
              >
                <i
                  style={{ color: "var(--color-violet)", marginTop: "5px" }}
                  className="fa-solid fa-power-off"
                ></i>
                <p>Logout</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Header;
