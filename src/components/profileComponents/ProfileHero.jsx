// src/components/profileComponents/ProfileHero.jsx
import React from 'react';
import { Trophy, Heart, Globe, Crown } from 'lucide-react';
import { calculateAccuracy } from '../../utils/profileUtils';

export default function ProfileHero({ userData, currentUser }) {
  const accuracy = calculateAccuracy(currentUser);

  return (
    <div className="profile-hero">
      <div className="avatar-section">
        <div className="avatar-circle">
          {userData.avatar_url ? (
            <img src={userData.avatar_url} alt={userData.name} />
          ) : (
            <div className="avatar-placeholder-modern">
              {userData.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div className="level-badge-modern">
          <Crown size={12} />
          <span>{userData.level}</span>
        </div>
      </div>

      <div className="user-info-section">
        <h2 className="user-name-display">{userData.name}</h2>
        <p className="user-email-display">{userData.email}</p>
        {userData.bio && <p className="user-bio-display">{userData.bio}</p>}
        
        {(userData.favorite_team || userData.favorite_player || userData.nationality) && (
          <div className="user-tags">
            {userData.favorite_team && (
              <span className="user-tag">
                <Trophy size={12} /> {userData.favorite_team}
              </span>
            )}
            {userData.favorite_player && (
              <span className="user-tag">
                <Heart size={12} /> {userData.favorite_player}
              </span>
            )}
            {userData.nationality && (
              <span className="user-tag">
                <Globe size={12} /> {userData.nationality}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}