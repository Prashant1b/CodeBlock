import { Route, Routes } from 'react-router'
import LoginPage from './Pages/LoginPage';
import SignupPage from './Pages/SignupPage';
import HomePage from './Pages/HomePage';
import RequireAuth from './auth/RequireAuth';
import Profile from './Pages/Profile';
import Header from './components/header/Header';
import ResetPasswordPage from './Pages/ResetPasswordPage';
import Problems from './Pages/Problems';
import ProblemSolve from './Pages/ProblemSolve';

function App() {
  return (
    <div>
      <Header />
      <Routes>
        <Route path="/" element={<HomePage/>}/>
        <Route path="/signin" element={<LoginPage/>}/>
        <Route path="/signup" element={<SignupPage/>}/>
        <Route path="/problems" element={<Problems />} />
         <Route path="/problem/:id" element={<ProblemSolve />} />
        <Route element={<RequireAuth />}>
          <Route path="profile" element={<Profile />} />
           <Route path="/reset-password" element={<ResetPasswordPage />} />
        </Route>
      </Routes>
    </div>
  )
}

export default App
