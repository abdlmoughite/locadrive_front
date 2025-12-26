import { useState } from "react";
import { callApi } from "../components/api";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await callApi("/login", "POST", { email, password });

      localStorage.setItem("token", res.token);
      localStorage.setItem("role", res.role);
      localStorage.setItem("user", res.user.id);

      if (res.role === "admin") navigate("/admin/");
      else if (res.role === "agence") navigate("/agence/Dashboard");
      else navigate("/support/");

    } catch (err) {
      setError(err.error || "Login failed");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-sm bg-white shadow-lg rounded-lg p-6"
      >
        <h2 className="text-2xl font-semibold text-center mb-6 text-gray-800">
          Connexion
        </h2>

        {error && (
          <p className="text-red-500 text-center mb-4 font-medium">
            {error}
          </p>
        )}

        <input
          type="email"
          placeholder="Email"
          className="w-full p-3 mb-4 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Mot de passe"
          className="w-full p-3 mb-4 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          className="w-full p-3 bg-blue-600 text-white rounded-lg text-lg hover:bg-blue-700 transition"
        >
          Se connecter
        </button>
      </form>
    </div>
  );
};

export default Login;