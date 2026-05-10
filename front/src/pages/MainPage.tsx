import './MainPage.css';
import logoImg from './logo2.png'; 

const MainPage = () => {
  return (
    <div className="main-container main-page-with-description">
      <div className="main-logo-section">
        <img 
          src={logoImg} 
          alt="Quantum Logo" 
          className="home-main-logo" 
        />
      </div>
      
      <div className="main-description-section">
        <p className="description-subtitle">당신의 이야기로 빚어낸 1:1 활동 큐레이터, 스꾸터</p>
        <p className="description-paragraph">
          개인의 고유한 능력과 과거의 경험 그리고 선호 데이터를 기반으로 
          나만의 맞춤형 활동을 큐레이션합니다.
        </p>
      </div>
    </div>
  );
};

export default MainPage;