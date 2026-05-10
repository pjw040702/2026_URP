import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { api } from '../api';
import Loading from './Loading';

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
  const barWidth = 40;
  const gap = 45;
  const chartWidth = (barWidth + gap) * data.length + gap;

  return (
    <div className="type-chart-container" style={{ width: '100%', overflowX: 'auto', padding: '10px 0' }}>
      <svg width={chartWidth} height={chartHeight + 50} style={{ display: 'block', margin: '0 auto' }}>
        {data.map((d, i) => {
          let barHeight = 0;
          if (d.value > 0) {
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
                rx={8}
              />
              <rect
                className="data-bar"
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                fill="#3b82f6"
                rx={8}
              >
                <title>{`${d.label}: ${d.value.toExponential(4)}`}</title>
              </rect>
              <text
                x={x + barWidth / 2}
                y={chartHeight + 30}
                className="bar-label-text"
                style={{ fontSize: '11px', fontWeight: '500', fill: '#64748b', textAnchor: 'middle' }}
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

const AbilityResult = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState<{
    has_test_result: boolean;
    ability_url: string;
    scores: number[];
  }>({
    has_test_result: false,
    ability_url: '',
    scores: []
  });

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
        has_test_result: data.has_test_result,
        ability_url: data.ability_url || '',
        scores: vector
      });
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;

  return (
    <div className="ability-result-section">
      <div className="section-group">
        <h2 style={{ marginBottom: '24px', color: '#1e293b' }}>내 능력 분석 결과</h2>
        {userInfo.has_test_result ? (
          <div className="result-card" style={{ background: 'white', padding: '30px', borderRadius: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
            <div className="chart-wrapper" style={{ marginBottom: '30px' }}>
               <TypeBarChart scores={userInfo.scores} />
            </div>
            <div className="button-group" style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                className="report-btn"
                style={{ padding: '12px 24px', background: '#f1f5f9', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '600' }}
                onClick={() => window.open(userInfo.ability_url, '_blank')}
              >
                결과 리포트 보기
              </button>
              <button 
                className="retest-btn" 
                style={{ padding: '12px 24px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '600' }}
                onClick={() => navigate('/test', { state: { restart: true } })}
              >
                다시 검사하기
              </button>
            </div>
          </div>
        ) : (
          <div className="no-result-card" style={{ background: 'white', padding: '50px', borderRadius: '20px', textAlign: 'center', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
            <div className="chart-placeholder" style={{ fontSize: '48px', marginBottom: '20px' }}>📊</div>
            <p className="no-result-text" style={{ color: '#64748b', marginBottom: '24px' }}>유형 분석 정보가 없습니다. 검사를 실시하세요.</p>
            <button 
              onClick={() => navigate('/test', { state: { startNow: true } })} 
              className="retest-btn primary"
              style={{ padding: '14px 32px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              검사 시작하기
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AbilityResult;
