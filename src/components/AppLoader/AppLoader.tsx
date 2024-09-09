import Logo from "../../assets/Logo";
import { GridLoader } from "react-spinners";

function InitialLoading() {
  const theme = localStorage.getItem("theme");
  return (
    <div className="initial-loading-screen">
      <div className="logo">
        {theme === "dark" ? (
          <Logo />
        ) : (
          <img className="logo" src="/images/logo-2.png" alt="logo"></img>
        )}
      </div>
      <div className="propagate-loader">
        <GridLoader color="var(--color-blue)" />
      </div>
    </div>
  );
}

export default InitialLoading;
