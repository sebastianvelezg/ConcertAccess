"use client";

import { useState, useEffect } from "react";
import { users } from "../../data/users";
import { useAuth } from "../../components/AuthProvider";
import { useRouter } from "next/navigation";
import Image from "next/image";
import image1 from "../../images/c7.jpg";
import { Mail, Lock } from "lucide-react";

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
    return null;
  }

  return (
    <div className="relative flex items-center justify-center min-h-screen overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Image
          src={image1}
          alt="Concert background"
          layout="fill"
          objectFit="cover"
          className="filter brightness-50"
        />
      </div>

      <div className="relative z-10 w-full max-w-md p-8 bg-black bg-opacity-30 backdrop-blur-md shadow-2xl rounded-2xl m-4 border border-gray-600">
        <h3 className="text-3xl font-bold text-center text-white mb-6">
          Welcome Back
        </h3>
        <p className="text-center text-gray-300 mb-8">
          Please login to access your tickets
        </p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <label
              className="block text-sm font-medium text-gray-300 mb-1"
              htmlFor="email"
            >
              Email Address
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Enter your email"
                className="w-full px-4 py-2 pl-10 bg-gray-800 bg-opacity-50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-white placeholder-gray-400"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Mail
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={18}
              />
            </div>
          </div>
          <div className="relative">
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                placeholder="Enter your password"
                className="w-full px-4 py-2 pl-10 bg-gray-800 bg-opacity-50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-white placeholder-gray-400"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Lock
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={18}
              />
            </div>
          </div>
          <div>
            <button
              type="submit"
              className="w-full px-6 py-3 text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-all font-semibold"
            >
              Login
            </button>
          </div>
        </form>
        {error && <p className="text-red-400 text-center mt-4">{error}</p>}
        <p className="text-center text-sm text-gray-400 mt-6">
          Forgot your password?{" "}
          <a
            href="#"
            className="text-purple-400 hover:text-purple-300 transition"
          >
            Reset here
          </a>
        </p>
      </div>
    </div>
  );
}
