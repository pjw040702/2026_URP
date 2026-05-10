import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import MainPage from './pages/MainPage';
import LoginPage from './pages/LoginPage'; 
import SignupPage from './pages/SignupPage'; 
import CareerTest from './pages/career-test';
import RecommendPage from './pages/RecommendPage';
import RoadmapPage from './pages/RoadmapPage';
import PastActivitiesPage from './pages/PastActivitiesPage';
import ActivitiesPage from './pages/ActivitiesPage';
import './App.css';

const AppContent = () => {
  const location = useLocation();
  const hideLayoutPaths = ['/login', '/signup'];
  const shouldHideLayout = hideLayoutPaths.includes(location.pathname);
  const isLoggedIn = !!localStorage.getItem('token');

  return (
    <div className={shouldHideLayout ? "auth-layout" : (isLoggedIn ? "main-layout" : "guest-layout")}>
      {!shouldHideLayout && isLoggedIn && <Sidebar />}
      <div className="content-wrapper">
        {!shouldHideLayout && <TopBar />}
        <main className={shouldHideLayout ? "" : "main-content"}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/" element={<MainPage />} />
            <Route path="/test" element={<CareerTest />} />
            <Route path="/preference" element={<RecommendPage forceInputView={true} />} />
            <Route path="/recommend" element={<RecommendPage />} />
            <Route path="/roadmap" element={<RoadmapPage />} />
            <Route path="/past-activities" element={<PastActivitiesPage />} />
            <Route path="/activities" element={<ActivitiesPage />} />
            <Route path="/my-info" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;