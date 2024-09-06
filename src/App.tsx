import { useEffect, useState } from "react";
import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/user/LandingPage";
import HomePage from "./pages/user/HomePage";
import WorkspacePage from "./pages/user/WorkspacePage";
import DashboardPage from "./pages/admin/DashboardPage";
import UsersPage from "./pages/admin/UsersPage";
import AdminWorkspacePage from "./pages/admin/AdminWorkspacePage";
import AdminLoginPage from "./pages/admin/AdminLoginPage";
import { useSelector, TypedUseSelectorHook, useDispatch } from "react-redux";
import { RootState } from "./redux/store";
import Alert from "./assets/Alert";
import { setAvatarUrl, setUser, setUsername } from "./redux/userSlice";
import axios from "./axiosConfig";
import SingleWorkspacePage from "./pages/user/SingleWorkspacePage";
import NotFound from "./pages/error/NotFound";
import ServerError from "./pages/error/ServerError";
import NetworkError from "./pages/error/NetworkError";
import SingleProjectPage from "./pages/user/SingleProjectPage";
import ProfilePage from "./pages/user/ProfilePage";
import SubscriptionPage from "./pages/user/SubscriptionPage";
import AdminSubscriptionsPage from "./pages/admin/AdminSubscriptionsPage";
import Notify from "./assets/Notify";
import Subscription from "./components/Subscription/Subscription";
import SingleProgramPage from "./pages/user/SingleProgramPage";
import MarketplacePage from "./pages/user/MarketplacePage";
import AdminProgramPage from "./pages/admin/AdminProgramPage";
import Logo from "./assets/Logo";
import { GridLoader } from "react-spinners";
import { setTheme } from "./utils/appUtils";

const useTypedSelector: TypedUseSelectorHook<RootState> = useSelector;

function App() {
  const [loading, setLoading] = useState(false);
  const user = useTypedSelector((state) => state.user.value);
  const alert = useTypedSelector((state) => state.alert);
  const premiumComponent = useTypedSelector(
    (state) => state.premiumComponent.value
  );
  const notify = useTypedSelector((state) => state.notify);
  const error = useTypedSelector((state) => state.error);
  const dispatch = useDispatch();

  useEffect(() => {
    const theme = localStorage.getItem("theme");
    if (theme && ["light", "dark"].includes(theme)) {
      setTheme(theme);
    } else {
      setTheme("dark");
    }
  }, []);

  useEffect(() => {
    const userAuth = async () => {
      try {
        setLoading(true);
        const res = await axios.get("/auth/user");

        if (res.data.success) {
          const user = res.data.user;

          dispatch(setUser());
          dispatch(setUsername(user.username));
          dispatch(setAvatarUrl(user.avatar));
        }
      } catch (error: any) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    userAuth();
  }, []);

  if (error.type === "serverError") return <ServerError />;

  if (error.type === "networkError") return <NetworkError />;

  if (loading)
    return (
      <div className="initial-loading-screen">
        <div className="logo">
          <Logo />
        </div>
        <div className="propagate-loader">
          <GridLoader color="var(--color-blue)" />
        </div>
      </div>
    );
  return (
    <>
      {alert.value.message && <Alert />}
      {notify.value.message && <Notify />}
      {premiumComponent && <Subscription />}
      <Router>
        <Routes>
          <Route path="/" Component={user ? HomePage : LandingPage} />
          <Route
            path="/workspaces"
            Component={user ? WorkspacePage : LandingPage}
          />
          <Route
            path="/workspaces/:workspaceId"
            Component={user ? SingleWorkspacePage : LandingPage}
          />
          <Route
            path="/workspaces/:workspaceId/projects/:projectId"
            Component={user ? SingleProjectPage : LandingPage}
          />
          <Route
            path="/premium"
            Component={user ? SubscriptionPage : LandingPage}
          />
          <Route path="/profile" Component={user ? ProfilePage : LandingPage} />
          <Route path="/marketplace/:programId" Component={SingleProgramPage} />
          <Route
            path="/marketplace"
            Component={user ? MarketplacePage : LandingPage}
          />

          <Route path="/admin/login" Component={AdminLoginPage} />
          <Route
            path="/admin/dashboard"
            Component={user ? DashboardPage : AdminLoginPage}
          />
          <Route
            path="/admin/users"
            Component={user ? UsersPage : AdminLoginPage}
          />
          <Route
            path="/admin/programs"
            Component={user ? AdminProgramPage : AdminLoginPage}
          />
          <Route
            path="/admin/workspaces"
            Component={user ? AdminWorkspacePage : AdminLoginPage}
          />
          <Route
            path="/admin/subscriptions"
            Component={user ? AdminSubscriptionsPage : AdminLoginPage}
          />
          <Route path="*" Component={NotFound} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
