import React, { useState } from "react";

const Signup = ({ setLoggedInUser, setIsSignup }) => {
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
        <a href="#" onClick={() => setIsSignup(false)}>
          Login
        </a>
      </p>
    </div>
  );
};

export default Signup;
