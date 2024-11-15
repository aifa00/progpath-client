import "./HeroSection.css";
import Logo from "../../assets/Logo";
import { setForm } from "../../redux/formSlice";
import { useDispatch } from "react-redux";

const HeroSection = () => {
  const dispatch = useDispatch();

  return (
    <>
      <div className="welcome-screen">
        <nav className="navbar">
          <Logo />
          <div className="nav-links">
            <button
              id="signin-button"
              onClick={() => dispatch(setForm("login"))}
            >
              SIGNIN
            </button>
          </div>
        </nav>
        <div className="hero-content">
          <div>
            <h2 className="welcome-heading">Welcome To</h2> <br />
            <h1 className="hero-title">ProgPath Project Tracker</h1>
          </div>
          <div>
            <h3 className="login-heading">Login to Get Started</h3>
            <p className="hero-description">
              Manage your tasks, collaborate with your team, and explore our
              marketplace to explore projects and ideas. Enter your credentials
              to access your personalized workspaces.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default HeroSection;
