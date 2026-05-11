import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { useState } from 'react';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import ProfileModal from './components/ProfileModal';
import MainPage from './pages/MainPage';
import LoginPage from './pages/LoginPage'; 
import SignupPage from './pages/SignupPage'; 
import CareerTest from './pages/career-test';
import RecommendPage from './pages/RecommendPage';
import RoadmapPage from './pages/RoadmapPage';
import PastActivitiesPage from './pages/PastActivitiesPage';
import ActivitiesPage from './pages/ActivitiesPage';
import './App.css';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isLoggedIn = !!localStorage.getItem('token');
  
  if (!isLoggedIn) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

const AppContent = () => {
  const location = useLocation();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const hideLayoutPaths = ['/login', '/signup'];
  const shouldHideLayout = hideLayoutPaths.includes(location.pathname);
  const isLoggedIn = !!localStorage.getItem('token');

  return (
    <div className={shouldHideLayout ? "auth-layout" : (isLoggedIn ? "main-layout" : "guest-layout")}>
      {!shouldHideLayout && isLoggedIn && <Sidebar />}
      <div className="content-wrapper">
        {!shouldHideLayout && <TopBar onProfileClick={() => setIsProfileModalOpen(true)} />}
        <main className={shouldHideLayout ? "" : "main-content"}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/" element={<MainPage />} />
            
            {/* Protected Routes */}
            <Route path="/test" element={<ProtectedRoute><CareerTest /></ProtectedRoute>} />
            <Route path="/preference" element={<ProtectedRoute><RecommendPage forceInputView={true} /></ProtectedRoute>} />
            <Route path="/recommend" element={<ProtectedRoute><RecommendPage /></ProtectedRoute>} />
            <Route path="/roadmap" element={<ProtectedRoute><RoadmapPage /></ProtectedRoute>} />
            <Route path="/past-activities" element={<ProtectedRoute><PastActivitiesPage /></ProtectedRoute>} />
            <Route path="/activities" element={<ProtectedRoute><ActivitiesPage /></ProtectedRoute>} />
            <Route path="/my-info" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>

      <ProfileModal 
        isOpen={isProfileModalOpen} 
        onClose={() => setIsProfileModalOpen(false)} 
      />
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