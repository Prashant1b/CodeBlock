import { Routes, Route } from "react-router"; 
import { useLocation } from "react-router-dom";
import useAuth from "./auth/useAuth";

import LoginPage from "./Pages/LoginPage";
import SignupPage from "./Pages/SignupPage";
import ForgotPasswordSmsPage from "./Pages/ForgotPasswordSmsPage";
import HomePage from "./Pages/HomePage";
import RequireAuth from "./auth/RequireAuth";
import Profile from "./Pages/Profile";
import Header from "./components/header/Header";
import ResetPasswordPage from "./Pages/ResetPasswordPage";
import Problems from "./Pages/Problems";
import ProblemSolve from "./Pages/ProblemSolve";
import NotFound from "./Pages/NotFound";

import AdminRoute from "./components/admin/AdminRoute";
import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./Pages/admin/AdminDashboard";
import ProblemsList from "./Pages/admin/ProblemList";
import ProblemForm from "./Pages/admin/ProblemForm";
import AdminUsers from "./Pages/admin/AdminUser";
import AdminContests from "./Pages/admin/AdminContests";
import ContestPage from "./Pages/ContestPage";
import ContestDetailPage from "./Pages/ContestDetailPage";
import ContestProblemSolvePage from "./Pages/ContestProblemSolvePage";
import DiscussPage from "./Pages/DiscussPage";
import DiscussDetailPage from "./Pages/DiscussDetailPage";

function App() {
  const { user } = useAuth();
  const location = useLocation();
  const isContestFullscreen = /^\/contest\/[^/]+(\/problem\/[^/]+)?$/.test(
    location.pathname
  );

  return (
    <div>
      {!isContestFullscreen ? <Header /> : null}

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/signin" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordSmsPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/problems" element={<Problems />} />
        <Route path="/problem/:id" element={<ProblemSolve />} />
        <Route path="/contest" element={<ContestPage />} />
        <Route path="/contest/:id" element={<ContestDetailPage />} />
        <Route path="/contest/:id/problem/:pid" element={<ContestProblemSolvePage />} />
        <Route path="/discuss" element={<DiscussPage />} />
        <Route path="/discuss/:id" element={<DiscussDetailPage />} />

        <Route element={<RequireAuth />}>
          <Route path="/profile" element={<Profile />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
        </Route>

        <Route element={<AdminRoute />}>
          <Route
            path="/admin"
            element={
              <AdminLayout
                userName={user?.firstname || user?.emailid || "Admin"}
              />
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="problems" element={<ProblemsList />} />
            <Route path="contests" element={<AdminContests />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="problems/new" element={<ProblemForm />} />
            <Route path="problems/:id/edit" element={<ProblemForm />} />
          </Route>
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default App;
