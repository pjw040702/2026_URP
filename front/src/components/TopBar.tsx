import { useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import ProfileModal from './ProfileModal';
import './TopBar.css';

interface TopBarProps {
  onProfileClick: () => void;
}

const TopBar = ({ onProfileClick }: TopBarProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isLoggedIn = !!localStorage.getItem('token');

  const handleLogout = () => {
    if (location.pathname === '/recommend' && (window as any).isRecommendationResultsActive) {
      if (!window.confirm('로그아웃 하시겠습니까? 추천된 활동 정보는 사라지며 다시 입력해야 합니다.')) {
        return;
      }
    }
    localStorage.removeItem('token');
    localStorage.removeItem('hasPreference');
    localStorage.removeItem('hasRecommendation');
    localStorage.removeItem('skippedActivities');
    alert('로그아웃 되었습니다.');
    navigate('/');
  };

  return (
    <div className="top-bar">
      <div className="top-bar-right">
        {isLoggedIn ? (
          <>
            <button 
              className="heart-icon-btn" 
              onClick={() => navigate('/roadmap')}
              title="좋아요 표시한 활동 보기"
            >
              <span className="heart-icon">❤️</span>
            </button>
            <button 
              className="profile-icon-btn" 
              onClick={onProfileClick}
              title="내 정보 보기"
            >
              <div className="user-icon-placeholder">🙂</div>
            </button>
            <button className="top-logout-btn" onClick={handleLogout}>
              로그아웃
            </button>
          </>
        ) : (
          <>
            <button className="top-login-btn" onClick={() => navigate('/login')}>로그인</button>
            <button className="top-signup-btn" onClick={() => navigate('/signup')}>회원가입</button>
          </>
        )}
      </div>
    </div>
  );
};

export default TopBar;
