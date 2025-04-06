import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

function SignupPage() {
  const [formData, setFormData] = useState({ username: "", password: "", email: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await axios.post("http://localhost:8080/api/signup", formData);

      console.log("Login Success:", response.data);
      navigate('/dashboard');
    } catch (err) {
      setError("Login failed. Please check your credentials.");
      console.error("Login Error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 dark:from-gray-800 dark:via-black dark:to-gray-900 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md p-8 md:p-10 space-y-6 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl">
        <h2 className="text-3xl font-extrabold text-center text-gray-900 dark:text-white">Welcome Back</h2>
        <p className="text-center text-sm text-gray-600 dark:text-gray-400">Log in to access your AI Digest.</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div>
            <input
              name="username"
              type="text"
              value={formData.username}
              onChange={handleChange}
              placeholder="Username"
              className="w-full px-3 py-2.5 border rounded-md dark:bg-gray-700"
              required
            />
          </div>
          <div>
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              className="w-full px-3 py-2.5 border rounded-md dark:bg-gray-700"
              required
            />
          </div>
          <div>
            <input
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              className="w-full px-3 py-2.5 border rounded-md dark:bg-gray-700"
              required
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-md"
          >
            {isSubmitting ? 'Logging In...' : 'Log In'}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="px-2 bg-white dark:bg-gray-800 text-sm text-gray-500 dark:text-gray-400">Or continue with</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={() => window.open("http://localhost:8080/auth/google", "_self")}
            className="w-full py-2 px-4 border rounded-md bg-white dark:bg-gray-700"
          >
            Google
          </button>
          <button
            onClick={() => window.open("http://localhost:8080/auth/github", "_self")}
            className="w-full py-2 px-4 border rounded-md bg-white dark:bg-gray-700"
          >
            GitHub
          </button>
        </div>

      
      </div>
    </div>
  );
}

export default SignupPage;
