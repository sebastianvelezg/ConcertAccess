"use client";

import { useState, useEffect } from "react";
import { users } from "../../data/users";
import { useAuth } from "../../components/AuthProvider";
import { useRouter } from "next/navigation";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      login(userData);
    }
  }, []);

  useEffect(() => {
    if (user) {
      switch (user.role) {
        case "admin":
          router.push("/admin/add-route");
          break;
        case "staff":
          router.push("/staff");
          break;
        default:
          router.push("/user");
      }
    }
  }, [user, router]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    const user = users.find(
      (u) => u.email === email && u.password === password
    );

    if (user) {
      login(user);
    } else {
      setError("Invalid email or password");
    }
  };

  if (user) {
    return null; // Or you could return a loading spinner here
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="px-8 py-6 mt-4 text-left bg-white shadow-lg">
        <h3 className="text-2xl font-bold text-center">
          Login to your account
        </h3>
        <form onSubmit={handleSubmit}>
          <div className="mt-4">
            <div>
              <label className="block" htmlFor="email">
                Email
              </label>
              <input
                type="text"
                placeholder="Email"
                className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="mt-4">
              <label className="block">Password</label>
              <input
                type="password"
                placeholder="Password"
                className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="flex items-baseline justify-between">
              <button className="px-6 py-2 mt-4 text-white bg-blue-600 rounded-lg hover:bg-blue-900">
                Login
              </button>
            </div>
          </div>
        </form>
        {error && <p className="text-red-500 mt-4">{error}</p>}
      </div>
    </div>
  );
}
