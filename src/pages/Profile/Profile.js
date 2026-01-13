import React, { useEffect, useState } from 'react';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('userToken');
        if (!token) {
          setError('No authentication token found. Please log in first.');
          setLoading(false);
          return;
        }
        const response = await fetch('http://localhost:5000/api/users/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          if (response.status === 403) {
            // Token is invalid or expired - clear it and redirect to login
            localStorage.removeItem('userToken');
            localStorage.removeItem('userEmail');
            throw new Error('Your session has expired. Please log in again.');
          }
          throw new Error(errorData.error || `HTTP ${response.status}: Failed to fetch profile`);
        }
        const data = await response.json();
        setUser(data.user);
      } catch (err) {
        console.error('Profile fetch error:', err);
        setError(`Could not load profile: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) return <div>Loading profile...</div>;
  if (error) return <div>{error}</div>;
  if (!user) return <div>No user data found.</div>;

  return (
    <div className="profile-container">
      <h1>User Profile</h1>
      <div className="profile-details">
        <p><strong>Name:</strong> {user.name}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Role:</strong> {user.role}</p>
        <p><strong>Status:</strong> {user.status}</p>
        <p><strong>Joined:</strong> {user.created_at}</p>
      </div>
      <button onClick={() => window.location.href = '/quiz-selection'} style={{marginTop: '2rem', padding: '1rem 2rem', fontSize: '1rem'}}>Select Quiz</button>
    </div>
  );
};

export default Profile;