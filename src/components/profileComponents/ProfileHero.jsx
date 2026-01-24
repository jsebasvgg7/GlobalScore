// src/components/profileComponents/ProfileHero.jsx
import React from 'react';
import { Crown } from 'lucide-react';
import { calculateAccuracy } from '../../utils/profileUtils';

export default function ProfileHero({ userData, currentUser }) {
  const accuracy = calculateAccuracy(currentUser);

  // Calcular edad desde fecha de nacimiento (si existe)
  const calculateAge = (birthDate) => {
    if (!birthDate) return null;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const age = calculateAge(userData.date_of_birth);
  const userInitial = userData.name?.charAt(0).toUpperCase() || 'U';

  return (
    <div className="profile-hero">
      {/* Avatar Section */}
      <div className="avatar-section">
        <div className="avatar-circle">
          {userData.avatar_url ? (
            <img src={userData.avatar_url} alt={userData.name} />
          ) : (
            <div className="avatar-placeholder-modern">
              {userInitial}
            </div>
          )}
        </div>
        <div className="level-badge-modern">
          <Crown size={14} fill="currentColor" />
          <span>{userData.level || 1}</span>
        </div>
      </div>

      {/* User Info Section */}
      <div className="user-info-section">
        <h2 className="user-name-display">{userData.name}</h2>
        
        {/* Gender & Age Row */}
        {(userData.gender || age) && (
          <div className="user-meta-row">
            {userData.gender && (
              <>
                <span className="user-meta-label">GENDER</span>
                <span className="user-meta-value">{userData.gender}</span>
              </>
            )}
            {age && (
              <>
                <span className="user-meta-label">AGE</span>
                <span className="user-meta-value">{age}</span>
              </>
            )}
            {userData.date_of_birth && (
              <>
                <span className="user-meta-label">BIRTHDAY</span>
                <span className="user-meta-value">
                  {new Date(userData.date_of_birth).toLocaleDateString('en-US', { 
                    month: '2-digit', 
                    day: '2-digit', 
                    year: 'numeric' 
                  })}
                </span>
              </>
            )}
          </div>
        )}

        {/* User ID Card - Estilo clínico */}
        <div className="user-id-card">
          <span className="user-id-text">
            {`USER-${String(currentUser.id).padStart(4, '0')}`}
          </span>
          <div className="info-icon">i</div>
        </div>

        {/* Date of Birth Display */}
        {userData.date_of_birth && (
          <div className="user-dob">
            {new Date(userData.date_of_birth).toLocaleDateString('en-US', { 
              month: '2-digit', 
              day: '2-digit', 
              year: 'numeric' 
            })}
          </div>
        )}

        {/* Stats Mini Row */}
        <div className="stats-mini-row">
          <div className="stat-mini">
            <div className="stat-mini-value">{currentUser?.predictions || 0}</div>
            <div className="stat-mini-label">Predictions</div>
          </div>
          <div className="stat-mini-divider"></div>
          <div className="stat-mini">
            <div className="stat-mini-value">{currentUser?.points || 0}</div>
            <div className="stat-mini-label">Points</div>
          </div>
          <div className="stat-mini-divider"></div>
          <div className="stat-mini">
            <div className="stat-mini-value">{accuracy}%</div>
            <div className="stat-mini-label">Accuracy</div>
          </div>
        </div>
      </div>
    </div>
  );
}