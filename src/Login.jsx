import React, { useState, useEffect } from "react";
import logo from "./assets/AB Buss.jpg";
import "./Login.css";

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    const existingUsers = localStorage.getItem("users");
    if (!existingUsers) {
      const defaultUsers = [
        { username: "andris", password: "1234", role: "driver" },
        { username: "janis", password: "1234", role: "driver" },
        { username: "didzis", password: "1234", role: "driver" },
        { username: "admin", password: "admin123", role: "admin" }
      ];
      localStorage.setItem("users", JSON.stringify(defaultUsers));
    }
  }, []);

  const handleLogin = () => {
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
      localStorage.setItem("loggedInUser", JSON.stringify(user));
      onLogin(user); // <- svarīgi saglabāt šo!
    } else {
      alert("Nepareizs lietotājvārds vai parole.");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <div className="login-container">
      <img src={logo} alt="AB Buss Logo" className="login-logo" />

      <input
        type="text"
        placeholder="Lietotājvārds"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        onKeyDown={handleKeyPress}
        className="login-input"
      />
      <input
        type="password"
        placeholder="Parole"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onKeyDown={handleKeyPress}
        className="login-input"
      />
      <button onClick={handleLogin} className="login-button">Ieiet</button>
    </div>
  );
};

export default Login;
