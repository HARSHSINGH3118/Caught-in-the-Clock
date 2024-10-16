import React, { useState } from "react";

const Login = ({ setLoggedInUser, setIsSignup }) => {
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
        <a href="#" onClick={() => setIsSignup(true)}>
          Sign up
        </a>
      </p>
    </div>
  );
};

export default Login;
