import { useRef, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { api } from '../api';
import Loading from '../components/Loading';
import AbilityResult from '../components/AbilityResult';

type Question = {
  question: string;
  qitemNo: number;
  answer01?: string | null;
  answer02?: string | null;
  answer03?: string | null;
  answer04?: string | null;
  answer05?: string | null;
  answer06?: string | null;
  answer07?: string | null;
  answer08?: string | null;
  answer09?: string | null;
  answer10?: string | null;
  answerScore01?: string | null;
  answerScore02?: string | null;
  answerScore03?: string | null;
  answerScore04?: string | null;
  answerScore05?: string | null;
  answerScore06?: string | null;
  answerScore07?: string | null;
  answerScore08?: string | null;
  answerScore09?: string | null;
  answerScore10?: string | null;
  tip1Score?: string | null;
  tip2Score?: string | null;
  tip3Score?: string | null;
  tip1Desc?: string | null;
  tip2Desc?: string | null;
  tip3Desc?: string | null;
};

type Choice = {
  label: string;
  score: string;
};

function CareerTest() {
  const navigate = useNavigate();
  const location = useLocation();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [resultUrl, setResultUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testStarted, setTestStarted] = useState(false);
  const [showResult, setShowResult] = useState(true);
  const [selectedGender, setSelectedGender] = useState<string>('');
  const [selectedGrade, setSelectedGrade] = useState<string>('');

  const [startDt] = useState(Date.now());
  const questionRefs = useRef<(HTMLDivElement | null)[]>([]);

  const API_KEY = '7e5af4e6c5fbe064f07ba221a72feb8d';

  useEffect(() => {
    if (location.state?.restart) {
      setShowResult(false);
      setTestStarted(false);
    } else {
      setShowResult(true);
    }
  }, [location.state]);

  const loadQuestions = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/inspct/openapi/test/questions', {
        params: {
          apikey: API_KEY,
          q: 10,
        },
      });

      if (res.data?.RESULT) {
        setQuestions(res.data.RESULT);
      } else {
        alert(`문항을 불러오지 못했습니다.\n${res.data?.ERROR_REASON || '응답 형식이 올바르지 않습니다.'}`);
        setTestStarted(false);
      }
    } catch (e: any) {
      const errorMsg = e.response ? JSON.stringify(e.response.data) : e.message;
      alert(`문항 로딩 실패\n${errorMsg}`);
      setTestStarted(false);
    } finally {
      setLoading(false);
    }
  };

  const handleStartTest = () => {
    if (!selectedGender || !selectedGrade) {
      alert('성별과 학년을 선택해주세요.');
      return;
    }
    setTestStarted(true);
    loadQuestions();
  };

  const getChoices = (q: Question): Choice[] => {
    const list: Choice[] = [];

    for (let i = 1; i <= 10; i++) {
      const answerKey = `answer${String(i).padStart(2, '0')}` as keyof Question;
      const scoreKey = `answerScore${String(i).padStart(2, '0')}` as keyof Question;

      const label = q[answerKey];
      const score = q[scoreKey];

      if (label && score) {
        list.push({
          label: String(label),
          score: String(score),
        });
      }
    }

    return list;
  };

  const handleSelect = (qNo: number, value: string, idx: number) => {
    setAnswers((prev) => ({
      ...prev,
      [String(qNo)]: value,
    }));

    if (idx < questions.length - 1) {
      setTimeout(() => {
        questionRefs.current[idx + 1]?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }, 80);
    }
  };

  const handleSubmit = async () => {
    if (questions.length === 0) return;

    if (Object.keys(answers).length < questions.length) {
      const unansweredIdx = questions.findIndex(q => !answers[String(q.qitemNo)]);
      if (unansweredIdx !== -1) {
        setTimeout(() => {
          questionRefs.current[unansweredIdx]?.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          });
        }, 100);
      }
      alert('응답하지 않은 문항이 존재합니다.');
      return;
    }

    setIsSubmitting(true);
    try {
      const answerString = questions
        .sort((a, b) => a.qitemNo - b.qitemNo)
        .map((q) => answers[String(q.qitemNo)])
        .join(',');

      const payload = {
        apikey: API_KEY,
        qestrnSeq: '10',
        trgetSe: '100208',
        gender: selectedGender,
        school: '',
        grade: selectedGrade,
        startDtm: startDt,
        answers: answerString,
      };

      const res = await axios.post('/api/inspct/openapi/test/report', payload, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (res.data?.SUCC_YN === 'Y' && res.data?.RESULT?.url) {
        setResultUrl(res.data.RESULT.url);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        await api.post('/users/me/test-result', payload);
        window.dispatchEvent(new CustomEvent('testCompleted'));
      } else {
        alert(`실패 이유: ${res.data?.ERROR_REASON || JSON.stringify(res.data)}`);
      }
    } catch (e: any) {
      const errorMsg = e.response ? JSON.stringify(e.response.data) : e.message;
      alert(`네트워크 오류\n${errorMsg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <Loading />;

  if (showResult) {
    return (
      <div className="test-result-view">
        <AbilityResult />
      </div>
    );
  }

  if (!testStarted) {
    return (
      <div className="test-start-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 0' }}>
        <div style={{ maxWidth: '500px', width: '100%', backgroundColor: '#ffffff', padding: '50px 40px', borderRadius: '25px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', textAlign: 'center' }}>
          <h1 style={{ color: '#4a6b82', marginBottom: '10px', fontSize: '1.5rem' }}>주요능력효능감검사</h1>
          <p style={{ color: '#68859a', marginBottom: '40px', fontSize: '0.9rem' }}>검사 전 기본 정보를 입력해주세요.</p>
          <div style={{ marginBottom: '30px', textAlign: 'center' }}>
            <label style={{ display: 'block', marginBottom: '12px', fontWeight: '600', color: '#4a6b82' }}>성별 *</label>
            <div style={{ display: 'flex', gap: '15px' }}>
              <label style={{ flex: 1, padding: '14px', border: `2px solid ${selectedGender === '100323' ? '#78a2be' : '#e9eff5'}`, borderRadius: '12px', cursor: 'pointer', textAlign: 'center', backgroundColor: selectedGender === '100323' ? '#f1f8ff' : '#fff', fontWeight: selectedGender === '100323' ? 'bold' : 'normal', color: selectedGender === '100323' ? '#355266' : '#556677' }}>
                <input type="radio" name="gender" value="100323" checked={selectedGender === '100323'} onChange={(e) => setSelectedGender(e.target.value)} style={{ display: 'none' }} /> 남자
              </label>
              <label style={{ flex: 1, padding: '14px', border: `2px solid ${selectedGender === '100324' ? '#78a2be' : '#e9eff5'}`, borderRadius: '12px', cursor: 'pointer', textAlign: 'center', backgroundColor: selectedGender === '100324' ? '#f1f8ff' : '#fff', fontWeight: selectedGender === '100324' ? 'bold' : 'normal', color: selectedGender === '100324' ? '#355266' : '#556677' }}>
                <input type="radio" name="gender" value="100324" checked={selectedGender === '100324'} onChange={(e) => setSelectedGender(e.target.value)} style={{ display: 'none' }} /> 여자
              </label>
            </div>
          </div>
          <div style={{ marginBottom: '40px', textAlign: 'center' }}>
            <label style={{ display: 'block', marginBottom: '12px', fontWeight: '600', color: '#4a6b82' }}>학년/구분 *</label>
            <select value={selectedGrade} onChange={(e) => setSelectedGrade(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '2px solid #e9eff5', fontSize: '1rem', color: '#4a6b82', backgroundColor: '#fff', cursor: 'pointer' }}>
              <option value="">선택해주세요</option>
              <option value="1">1학년</option>
              <option value="2">2학년</option>
              <option value="3">3학년</option>
              <option value="4">4학년</option>
              <option value="0">기타</option>
            </select>
          </div>
          <button onClick={handleStartTest} style={{ width: '100%', padding: '16px', fontSize: '1.1rem', backgroundColor: '#5b7a8c', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold' }}>검사 시작</button>
          <button onClick={() => setShowResult(true)} style={{ width: '100%', marginTop: '12px', padding: '12px', fontSize: '1rem', backgroundColor: 'transparent', color: '#68859a', border: 'none', cursor: 'pointer' }}>취소</button>
        </div>
      </div>
    );
  }

  const progress = questions.length > 0 ? Math.round((Object.keys(answers).length / questions.length) * 100) : 0;

  return (
    <div style={{ backgroundColor: '#f4f7f9', minHeight: '100vh', paddingBottom: '60px' }}>
      {isSubmitting && <Loading />}
      <div style={{ position: 'sticky', top: '70px', zIndex: 100, backgroundColor: 'white', padding: '15px', borderBottom: '1px solid #d1dee8' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem' }}>
            <strong>검사 진행률</strong>
            <span>{progress}%</span>
          </div>
          <div style={{ width: '100%', height: '8px', backgroundColor: '#e9eff5', borderRadius: '10px', overflow: 'hidden' }}>
            <div style={{ width: `${progress}%`, height: '100%', backgroundColor: '#78a2be', transition: '0.3s' }} />
          </div>
        </div>
      </div>
      <div style={{ maxWidth: '700px', margin: '30px auto', backgroundColor: '#ffffff', padding: '40px', borderRadius: '25px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
        <h1 style={{ textAlign: 'center', color: '#4a6b82', marginBottom: '18px', fontSize: '1.6rem' }}>주요능력효능감검사</h1>
        {resultUrl ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <h2 style={{ color: '#4a6b82', marginBottom: '12px' }}>검사가 완료되었습니다.</h2>
            <p style={{ color: '#66788a', marginBottom: '24px' }}>아래 버튼을 누르면 결과 페이지로 이동합니다.</p>
            <a href={resultUrl} target="_blank" rel="noreferrer" style={{ display: 'inline-block', padding: '16px 40px', backgroundColor: '#5b7a8c', color: 'white', textDecoration: 'none', borderRadius: '15px', fontWeight: 'bold', marginBottom: '20px' }}>결과 리포트 보기</a>
            <div><button onClick={() => setShowResult(true)} style={{ padding: '12px 24px', backgroundColor: '#eef4f7', color: '#4a6b82', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold' }}>결과 목록으로 이동</button></div>
          </div>
        ) : (
          <>
            {questions.map((q, idx) => (
              <div key={q.qitemNo} ref={(el) => { questionRefs.current[idx] = el; }} style={{ marginBottom: '50px', borderBottom: '1px solid #f1f5f8', paddingBottom: '20px' }}>
                <p style={{ fontWeight: '600', marginBottom: '20px', lineHeight: 1.6 }}>{idx + 1}. {q.question}</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px' }}>
                  {getChoices(q).map((choice) => {
                    const isSelected = answers[String(q.qitemNo)] === choice.score;
                    return (
                      <label key={`${q.qitemNo}-${choice.score}`} style={{ display: 'block', padding: '14px 16px', border: `2px solid ${isSelected ? '#78a2be' : '#f0f4f8'}`, borderRadius: '15px', cursor: 'pointer', backgroundColor: isSelected ? '#f1f8ff' : '#fff', transition: '0.2s' }}>
                        <input type="radio" name={`question-${q.qitemNo}`} value={choice.score} checked={isSelected} onChange={() => handleSelect(q.qitemNo, choice.score, idx)} style={{ display: 'none' }} />
                        <span style={{ fontSize: '0.95rem', color: isSelected ? '#355266' : '#556677', fontWeight: isSelected ? 700 : 500 }}>{choice.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
            <button onClick={handleSubmit} disabled={isSubmitting} style={{ width: '100%', padding: '22px', fontSize: '1.1rem', backgroundColor: isSubmitting ? '#bcc7cf' : '#5b7a8c', color: 'white', border: 'none', borderRadius: '20px', cursor: isSubmitting ? 'default' : 'pointer', fontWeight: 'bold' }}>{isSubmitting ? '분석 중...' : '결과 확인하기'}</button>
          </>
        )}
      </div>
    </div>
  );
}

export default CareerTest;
