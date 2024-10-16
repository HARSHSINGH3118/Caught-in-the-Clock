import React, { useState, useEffect } from "react";
import "./App.css";

/* global chrome */

// Login component
const Login = ({ setLoggedInUser, toggleSignup, toggleForgotPassword }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    chrome.storage.local.get(["users"], (result) => {
      const users = result.users || {};
      if (users[email] && users[email].password === password) {
        chrome.storage.local.set({ loggedInUser: users[email] }, () => {
          alert("Login successful");
          setLoggedInUser(users[email]);
        });
      } else {
        alert("Invalid credentials. Please try again.");
      }
    });
  };

  return (
    <div className="auth-form">
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
      </form>
      <p>
        Don't have an account?{" "}
        <a href="#" onClick={toggleSignup}>
          Sign up
        </a>
      </p>
      <p>
        Forgot password?{" "}
        <a href="#" onClick={toggleForgotPassword}>
          Reset Password
        </a>
      </p>
    </div>
  );
};

// Signup component
const Signup = ({ setLoggedInUser, toggleSignup }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = (e) => {
    e.preventDefault();
    chrome.storage.local.get(["users"], (result) => {
      const users = result.users || {};
      if (users[email]) {
        alert("User already exists. Please log in.");
      } else {
        const newUser = { name, email, password };
        users[email] = newUser;
        chrome.storage.local.set({ users }, () => {
          chrome.storage.local.set({ loggedInUser: newUser }, () => {
            alert("Signup successful");
            setLoggedInUser(newUser);
          });
        });
      }
    });
  };

  return (
    <div className="auth-form">
      <h2>Signup</h2>
      <form onSubmit={handleSignup}>
        <input
          type="text"
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Signup</button>
      </form>
      <p>
        Already have an account?{" "}
        <a href="#" onClick={toggleSignup}>
          Login
        </a>
      </p>
    </div>
  );
};

// Forgot Password component
const ForgotPassword = ({ toggleLogin }) => {
  const [email, setEmail] = useState("");

  const handleResetPassword = (e) => {
    e.preventDefault();
    chrome.storage.local.get(["users"], (result) => {
      const users = result.users || {};
      if (users[email]) {
        const newPassword = prompt("Enter a new password:");
        if (newPassword) {
          users[email].password = newPassword;
          chrome.storage.local.set({ users }, () => {
            alert("Password reset successful. Please log in.");
            toggleLogin(); // Redirect to login after reset
          });
        }
      } else {
        alert("No account found with this email.");
      }
    });
  };

  return (
    <div className="auth-form">
      <h2>Reset Password</h2>
      <form onSubmit={handleResetPassword}>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit">Reset Password</button>
      </form>
      <p>
        <a href="#" onClick={toggleLogin}>
          Back to login
        </a>
      </p>
    </div>
  );
};

// Main App component with authentication and time tracking
function App() {
  const [currentSite, setCurrentSite] = useState("");
  const [currentSiteTime, setCurrentSiteTime] = useState(0);
  const [intervalId, setIntervalId] = useState(null);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [isSignup, setIsSignup] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);

  useEffect(() => {
    // Check if a user is logged in on mount
    chrome.storage.local.get(["loggedInUser"], (result) => {
      if (result.loggedInUser) {
        setLoggedInUser(result.loggedInUser);
      }
    });
  }, []);

  useEffect(() => {
    if (!loggedInUser) return;

    const fetchCurrentSiteData = () => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs.length === 0) return;
        const url = new URL(tabs[0].url);
        const hostname = url.hostname;
        setCurrentSite(hostname);

        // Fetch initial time spent on current site from storage
        chrome.storage.local.get(["history"], (result) => {
          const history = result.history || {};
          const siteTime = history[hostname] || 0;
          setCurrentSiteTime(siteTime);
        });
      });
    };

    // Fetch data initially
    fetchCurrentSiteData();

    // Set up interval to update the timer every second
    const newIntervalId = setInterval(() => {
      setCurrentSiteTime((prevTime) => prevTime + 1000); // Increment time by 1 second
    }, 1000);

    setIntervalId(newIntervalId);

    // Clean up interval on unmount
    return () => clearInterval(newIntervalId);
  }, [loggedInUser]);

  useEffect(() => {
    if (!currentSite || !loggedInUser) return;

    // Save the updated time to chrome storage
    chrome.storage.local.get(["history"], (result) => {
      const history = result.history || {};
      history[currentSite] = currentSiteTime;
      chrome.storage.local.set({ history });
    });
  }, [currentSiteTime, currentSite, loggedInUser]);

  const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    let timeString = "";
    if (hours > 0) {
      timeString += `${hours}h `;
    }
    if (minutes > 0 || hours > 0) {
      timeString += `${minutes}m `;
    }
    timeString += `${seconds}s`;

    return timeString;
  };

  const openHistoryPage = () => {
    chrome.tabs.create({ url: "history.html" });
  };

  // Toggle between Signup, Login, and Forgot Password
  const toggleSignup = () => setIsSignup(!isSignup);
  const toggleForgotPassword = () => setIsForgotPassword(!isForgotPassword);

  // If no user is logged in, show the login, signup, or forgot password screens
  if (!loggedInUser) {
    return isForgotPassword ? (
      <ForgotPassword toggleLogin={() => setIsForgotPassword(false)} />
    ) : isSignup ? (
      <Signup setLoggedInUser={setLoggedInUser} toggleSignup={toggleSignup} />
    ) : (
      <Login
        setLoggedInUser={setLoggedInUser}
        toggleSignup={toggleSignup}
        toggleForgotPassword={toggleForgotPassword}
      />
    );
  }

  // If the user is logged in, show the main time tracker screen
  return (
    <div className="App">
      <h1>Time Tracker Extension</h1>
      <div className="current-site">
        <h2>Current Site:</h2>
        <p>{currentSite}</p>
        <p>Time Spent: {formatTime(currentSiteTime)}</p>
      </div>
      <button onClick={openHistoryPage}>Track History</button>
      <button onClick={() => setLoggedInUser(null)}>Logout</button>
    </div>
  );
}

export default App;
