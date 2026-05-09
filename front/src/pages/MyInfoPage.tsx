import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { api } from '../api';
import Loading from '../components/Loading';
import './MyInfoPage.css';

interface UserInfo {
  id: string;
  name: string;
  school_year: number;
  has_test_result: boolean;
  ability_url: string;
  scores: number[]; // 0~1 사이의 값들
}

const typeLabels = [
  "신체ㆍ운동능력",
  "공간ㆍ지각능력",
  "음악능력",
  "창의력",
  "언어능력",
  "수리ㆍ논리능력",
  "자기성찰능력",
  "대인관계능력",
  "자연친화능력"
];

const TypeBarChart = ({ scores }: { scores: number[] }) => {
  const data = typeLabels.map((label, i) => ({
    label,
    value: scores[i] || 0
  }));

  const chartHeight = 250;
  const barWidth = 35;
  const gap = 20;
  const chartWidth = (barWidth + gap) * data.length + gap;

  return (
    <div className="type-chart-container" style={{ width: '100%', overflowX: 'auto' }}>
      <svg width={chartWidth} height={chartHeight + 40} style={{ display: 'block', margin: '0 auto' }}>
        {data.map((d, i) => {
          // 모든 항목이 바 그래프로 보이게 하기 위한 시각적 스케일링
          // 0이 아닌 값은 아주 작더라도 최소 10px 이상의 높이를 가지도록 함
          let barHeight = 0;
          if (d.value > 0) {
            // 로그 스케일 적용하여 극도로 작은 값(1e-18)과 큰 값(1)을 모두 한 화면에 표시
            // -18승 근처의 값들도 약 15~20px 정도의 높이를 갖게 됨
            const logVal = Math.max(Math.log10(d.value), -18); 
            const normalizedLog = (logVal + 18) / 18; 
            barHeight = 10 + (normalizedLog * (chartHeight - 10));
          }
          
          const x = gap + i * (barWidth + gap);
          const y = chartHeight - barHeight;

          return (
            <g key={d.label} className="chart-bar-group">
              <rect
                x={x}
                y={0}
                width={barWidth}
                height={chartHeight}
                fill="#f1f5f9"
                rx={6}
              />
              <rect
                className="data-bar"
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                fill="#3b82f6"
                rx={6}
              >
                <title>{`${d.label}: ${d.value.toExponential(4)}`}</title>
              </rect>
              {/* 숫자는 제거하고 바 그래프만 노출 */}
              <text
                x={x + barWidth / 2}
                y={chartHeight + 25}
                className="bar-label-text"
                style={{ fontSize: '9px' }}
              >
                {d.label.split('ㆍ')[0]}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

const MyInfoPage = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState<UserInfo>({
    id: '',
    name: '',
    school_year: 0,
    has_test_result: false,
    ability_url: '',
    scores: []
  });
  const [editGrade, setEditGrade] = useState('');

  useEffect(() => {
    api.get('/users/me').then(data => {
      const source = data.ability || data.test_result || data.scores || data;
      
      const getVal = (label: string) => {
        const clean = (s: string) => s.replace(/[ㆍ·\s]/g, '');
        const target = clean(label);
        const key = Object.keys(source).find(k => clean(k) === target);
        const val = key ? source[key] : 0;
        return typeof val === 'number' ? val : parseFloat(val) || 0;
      };

      const vector = typeLabels.map(label => getVal(label));

      setUserInfo({
        id: String(data.user_id),
        name: data.name,
        school_year: data.school_year,
        has_test_result: data.has_test_result,
        ability_url: data.ability_url || '',
        scores: vector
      });
      setEditGrade(String(data.school_year));
    }).finally(() => setLoading(false));
  }, []);

  const toggleEdit = async () => {
    if (isEditing) {
      setLoading(true);
      await api.put('/users/me', { school_year: Number(editGrade) });
      setUserInfo(prev => ({ ...prev, school_year: Number(editGrade) }));
      setLoading(false);
    }
    setIsEditing(!isEditing);
  };

  if (loading) return <Loading />;

  return (
    <div className="my-info-page">
      <div className="my-info-container">
        <div className="left-panel">
          <div className="title-row">
            <h2>내 정보</h2>
            <button className="edit-toggle-btn" onClick={toggleEdit}>
              {isEditing ? '저장' : '수정'}
            </button>
          </div>

          <div className="info-card">
            <div className="info-item">
              <div className="info-row">
                <span className="info-tag">아이디:</span>
                <span className="info-text">{userInfo.id}</span>
              </div>
            </div>
            <div className="info-item">
              <div className="info-row">
                <span className="info-tag">이름:</span>
                <span className="info-text">{userInfo.name}</span>
              </div>
            </div>
            <div className="info-item">
              {isEditing ? (
                <>
                  <label>학년</label>
                  <select
                    value={editGrade}
                    onChange={(e) => setEditGrade(e.target.value)}
                    className="grade-select"
                  >
                    <option value="1">1학년</option>
                    <option value="2">2학년</option>
                    <option value="3">3학년</option>
                    <option value="4">4학년</option>
                  </select>
                </>
              ) : (
                <div className="info-row">
                  <span className="info-tag">학년:</span>
                  <span className="info-text">{userInfo.school_year}학년</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="right-panel">
          <div className="section-group">
            <h2>내 유형</h2>
            {userInfo.has_test_result ? (
              <div className="result-card">
                <div className="chart-wrapper">
                   <TypeBarChart scores={userInfo.scores} />
                </div>
                <div className="button-group">
                  <button
                    className="report-btn"
                    onClick={() => window.open(userInfo.ability_url, '_blank')}
                  >
                    결과 리포트 보기
                  </button>
                  <button className="retest-btn" onClick={() => navigate('/test')}>
                    다시 검사하기
                  </button>
                </div>
              </div>
            ) : (
              <div className="no-result-card">
                <div className="chart-placeholder">[유형 분석 차트]</div>
                <p className="no-result-text">유형 분석 정보가 없습니다. 검사를 실시하세요.</p>
                <button onClick={() => navigate('/test')} className="retest-btn primary">검사하기</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyInfoPage;
