import React, { useState, useEffect } from "react";

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

    const user = users.find(
      (u) => u.username === username && u.password === password
    );

    if (user) {
      localStorage.setItem("loggedInUser", JSON.stringify(user));
      onLogin(user); // <- ŠEIT pārslēdzam uz nākamo skatu caur App.jsx
    } else {
      alert("Nepareizs lietotājvārds vai parole.");
    }
  };

  return (
    <div className="login">
      <h2>Pieslēgties</h2>
      <input
        type="text"
        placeholder="Lietotājvārds"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="password"
        placeholder="Parole"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleLogin}>Ieiet</button>
    </div>
  );
};

export default Login;
