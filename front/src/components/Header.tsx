import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import './Header.css';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // 토큰 유무로 로그인 상태를 판단합니다.
  const isLoggedIn = !!localStorage.getItem('token');

  const handleLogout = () => {
    // 추천 결과가 활성화된 상태에서만 경고창 표시
    if (location.pathname === '/recommend' && (window as any).isRecommendationResultsActive) {
      if (!window.confirm('로그아웃 하시겠습니까? 추천된 활동 정보는 사라지며 다시 입력해야 합니다.')) {
        return;
      }
    }
    // 로그아웃 로직: 토큰 삭제 후 로그인 페이지로 이동
    localStorage.removeItem('token');
    console.log('로그아웃');
    alert('로그아웃 되었습니다.');
    navigate('/login');
  };

  const handleNavClick = (to: string, e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    
    // 추천 결과가 활성화된 상태에서만 경고창 표시
    if (location.pathname === '/recommend' && (window as any).isRecommendationResultsActive) {
      if (!window.confirm('페이지를 이동하시겠습니까? 추천된 활동 정보는 사라지며 다시 입력해야 합니다.')) {
        return;
      }
    }
    
    navigate(to);
  };

  return (
    <header className="header new-header-layout">
      <div className="header-spacer"></div>
      <nav className="header-left-nav">
        {isLoggedIn && (
          <>
            <a 
              href="/past-activities" 
              className={location.pathname === "/past-activities" ? "nav-item active" : "nav-item"}
              onClick={(e) => handleNavClick("/past-activities", e)}
            >
              이전 활동
            </a>
            <a 
              href="/" 
              className={location.pathname === "/" ? "nav-item active" : "nav-item"}
              onClick={(e) => handleNavClick("/", e)}
            >
              HOME
            </a>
            <a 
              href="/recommend" 
              className={location.pathname === "/recommend" ? "nav-item active" : "nav-item"}
              onClick={(e) => handleNavClick("/recommend", e)}
            >
              활동 추천
            </a>
            <a 
              href="/roadmap" 
              className={location.pathname === "/roadmap" ? "nav-item active" : "nav-item"}
              onClick={(e) => handleNavClick("/roadmap", e)}
            >
              로드맵
            </a>
          </>
        )}
      </nav>
      
      <div className="header-right-actions">
        {isLoggedIn ? (
          <>
            <button className="logout-btn" onClick={handleLogout}>로그아웃</button>
            <button className="profile-icon-btn" onClick={() => handleNavClick('/my-info')} title="내 정보 보기">
              {/* 프로필 아이콘 */}
              <div className="user-icon-placeholder">🙂</div>
            </button>
          </>
        ) : (
          <>
            <button className="login-btn-header" onClick={() => navigate('/login')}>로그인</button>
            <button className="signup-btn-header" onClick={() => navigate('/signup')}>회원가입</button>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;