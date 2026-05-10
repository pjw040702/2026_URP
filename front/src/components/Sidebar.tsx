import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { api } from '../api';
import './Sidebar.css';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userStatus, setUserStatus] = useState({
    hasPastActivities: false,
    hasTestResult: false,
  });

  const isLoggedIn = !!localStorage.getItem('token');

  useEffect(() => {
    if (isLoggedIn) {
      Promise.all([
        api.get('/users/me'),
        api.get('/users/me/past-activities'),
      ]).then(([userData, pastData]) => {
        // pastData가 존재하면(null이 아니면) 기록을 시도한 것으로 간주하여 통과 허용
        const hasPast = !!pastData; 
        setUserStatus({
          hasTestResult: userData.has_test_result,
          hasPastActivities: hasPast,
        });
      });
    }
  }, [isLoggedIn, location.pathname]);

  const handleNavClick = (to: string, e: React.MouseEvent, disabled?: boolean, msg?: string) => {
    e.preventDefault();

    if (disabled) {
      alert(msg || '이전 단계를 먼저 완료해주세요.');
      return;
    }
    
    // 추천 결과가 활성화된 상태에서만 경고창 표시
    if (location.pathname === '/recommend' && (window as any).isRecommendationResultsActive) {
      if (!window.confirm('페이지를 이동하시겠습니까? 추천된 활동 정보는 사라지며 다시 입력해야 합니다.')) {
        return;
      }
    }
    
    navigate(to);
  };

  if (!isLoggedIn) return null;

  const isStep3Disabled = !userStatus.hasPastActivities || !userStatus.hasTestResult;
  const step3Msg = !userStatus.hasPastActivities 
    ? '활동 기록을 먼저 완료해주세요.' 
    : '능력 검사를 먼저 완료해주세요.';

  return (
    <aside className="sidebar">
      <div className="sidebar-logo" onClick={(e) => handleNavClick("/", e)}>
        <button className="home-icon-btn" title="홈으로 이동">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
          </svg>
        </button>
      </div>
      
      <nav className="sidebar-nav">
        <div className={`nav-group ${location.pathname === "/past-activities" ? "active" : ""} ${userStatus.hasPastActivities ? "completed" : ""}`}>
          <div className="step-indicator">
            {userStatus.hasPastActivities ? "✓" : "1"}
          </div>
          <a 
            href="/past-activities" 
            className="nav-item"
            onClick={(e) => handleNavClick("/past-activities", e)}
          >
            <span className="step-label">STEP 01</span>
            <span className="nav-label">활동 기록</span>
          </a>
        </div>

        <div className={`nav-group ${location.pathname === "/test" ? "active" : ""} ${userStatus.hasTestResult ? "completed" : ""}`}>
          <div className="step-indicator">
            {userStatus.hasTestResult ? "✓" : "2"}
          </div>
          <a 
            href="/test" 
            className="nav-item"
            onClick={(e) => handleNavClick("/test", e)}
          >
            <span className="step-label">STEP 02</span>
            <span className="nav-label">능력 검사</span>
          </a>
        </div>

        <div className={`nav-group ${location.pathname === "/preference" ? "active" : ""} ${isStep3Disabled ? "disabled" : ""}`}>
          <div className="step-indicator">3</div>
          <a 
            href="/preference" 
            className="nav-item"
            onClick={(e) => handleNavClick("/preference", e, isStep3Disabled, step3Msg)}
          >
            <span className="step-label">STEP 03</span>
            <span className="nav-label">선호 문장 입력</span>
          </a>
        </div>

        <div className={`nav-group ${location.pathname === "/recommend" ? "active" : ""} ${isStep3Disabled ? "disabled" : ""}`}>
          <div className="step-indicator">4</div>
          <a 
            href="/recommend" 
            className="nav-item"
            onClick={(e) => handleNavClick("/recommend", e, isStep3Disabled, step3Msg)}
          >
            <span className="step-label">STEP 04</span>
            <span className="nav-label">활동 추천</span>
          </a>
        </div>
      </nav>

      <div className="sidebar-footer">
      </div>
    </aside>
  );
};

export default Sidebar;
