import { useState, useEffect } from 'react';
import { api } from '../api';
import Loading from './Loading';
import './ProfileModal.css';

interface UserInfo {
  id: string;
  name: string;
  school_year: number;
}

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProfileModal = ({ isOpen, onClose }: ProfileModalProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState<UserInfo>({
    id: '',
    name: '',
    school_year: 0,
  });
  const [editGrade, setEditGrade] = useState('');

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      api.get('/users/me').then(data => {
        setUserInfo({
          id: String(data.user_id),
          name: data.name,
          school_year: data.school_year,
        });
        setEditGrade(String(data.school_year));
      }).finally(() => setLoading(false));
    }
  }, [isOpen]);

  const toggleEdit = async () => {
    if (isEditing) {
      setLoading(true);
      await api.put('/users/me', { school_year: Number(editGrade) });
      setUserInfo(prev => ({ ...prev, school_year: Number(editGrade) }));
      setLoading(false);
    }
    setIsEditing(!isEditing);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="profile-modal-card" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>내 정보</h3>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        {loading ? (
          <div className="modal-loading-wrapper">
            <Loading />
          </div>
        ) : (
          <div className="modal-content">
            <div className="info-grid">
              <div className="info-row">
                <span className="info-label">아이디</span>
                <span className="info-value">{userInfo.id}</span>
              </div>
              <div className="info-row">
                <span className="info-label">이름</span>
                <span className="info-value">{userInfo.name}</span>
              </div>
              <div className="info-row">
                <span className="info-label">학년</span>
                {isEditing ? (
                  <select
                    value={editGrade}
                    onChange={(e) => setEditGrade(e.target.value)}
                    className="modal-grade-select"
                  >
                    <option value="1">1학년</option>
                    <option value="2">2학년</option>
                    <option value="3">3학년</option>
                    <option value="4">4학년</option>
                  </select>
                ) : (
                  <span className="info-value">{userInfo.school_year}학년</span>
                )}
              </div>
            </div>

            <div className="modal-actions">
              <button className="modal-edit-btn" onClick={toggleEdit}>
                {isEditing ? '저장 완료' : '정보 수정'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileModal;
