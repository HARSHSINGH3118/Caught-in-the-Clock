import React from 'react';

const Dashboard = ({ setLoggedInUser }) => {
  const handleLogout = () => {
    chrome.storage.local.remove('loggedInUser', () => {
      alert('Logged out successfully');
      setLoggedInUser(null);
    });
  };

  return (
    <div>
      <h1>Welcome to the Dashboard</h1>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default Dashboard;
