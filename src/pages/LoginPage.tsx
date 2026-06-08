import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Mail, Lock, User, ArrowRight, Loader2, Eye, EyeOff, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    confirmPassword: ''
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!isLogin && formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (!isLogin && formData.username.length < 3) {
      toast.error('Username must be at least 3 characters');
      return;
    }

    try {
      setIsLoading(true);

      if (isLogin) {
        await signIn(formData.email, formData.password);
        toast.success('Welcome back!');
      } else {
        await signUp(formData.email, formData.password, formData.username);
        toast.success('Account created! Welcome to Novelgram.');
      }

      navigate('/');
    } catch (error: any) {
      toast.error(error.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 transition-colors ${
      isDark 
        ? 'bg-gradient-to-br from-gray-950 via-gray-900 to-black' 
        : 'bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100'
    }`}>
      {/* Decorative blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute -top-40 -right-40 w-80 h-80 rounded-full blur-3xl opacity-20 ${
          isDark ? 'bg-red-500' : 'bg-indigo-400'
        }`} />
        <div className={`absolute -bottom-40 -left-40 w-80 h-80 rounded-full blur-3xl opacity-20 ${
          isDark ? 'bg-purple-500' : 'bg-pink-400'
        }`} />
      </div>

      <div className={`relative w-full max-w-md p-8 rounded-3xl shadow-2xl backdrop-blur-sm transition-colors ${
        isDark ? 'bg-gray-900/90 border border-gray-800' : 'bg-white/90 border border-white'
      }`}>
        {/* Logo */}
        <div className="text-center mb-8">
          <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg ${
            isDark ? 'bg-red-600/20' : 'bg-indigo-100'
          }`}>
            <BookOpen className={`w-10 h-10 ${isDark ? 'text-red-400' : 'text-indigo-600'}`} />
          </div>
          <h1 className={`text-2xl font-extrabold tracking-tight ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className={`mt-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            {isLogin 
              ? 'Sign in to continue your reading journey' 
              : 'Join thousands of readers and writers'
            }
          </p>
        </div>

        {/* Toggle Login/Signup */}
        <div className={`flex p-1 rounded-xl mb-6 ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
              isLogin
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
              !isLogin
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username (Sign Up) */}
          {!isLogin && (
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Username
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Choose a username"
                  className={`w-full pl-12 pr-4 py-3 rounded-xl border transition-all focus:ring-2 focus:outline-none ${
                    isDark 
                      ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:ring-red-500 focus:border-red-500' 
                      : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500'
                  }`}
                  required={!isLogin}
                />
              </div>
            </div>
          )}

          {/* Email */}
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your@email.com"
                className={`w-full pl-12 pr-4 py-3 rounded-xl border transition-all focus:ring-2 focus:outline-none ${
                  isDark 
                    ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:ring-red-500 focus:border-red-500' 
                    : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500'
                }`}
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className={`w-full pl-12 pr-12 py-3 rounded-xl border transition-all focus:ring-2 focus:outline-none ${
                  isDark 
                    ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:ring-red-500 focus:border-red-500' 
                    : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500'
                }`}
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Confirm Password (Sign Up) */}
          {!isLogin && (
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  className={`w-full pl-12 pr-4 py-3 rounded-xl border transition-all focus:ring-2 focus:outline-none ${
                    isDark 
                      ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:ring-red-500 focus:border-red-500' 
                      : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500'
                  }`}
                  required={!isLogin}
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed ${
              isDark 
                ? 'bg-gradient-to-r from-red-600 to-pink-600 text-white hover:from-red-500 hover:to-pink-500' 
                : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-500 hover:to-purple-500'
            }`}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            {isLogin ? "Don't have an account?" : 'Already have an account?'}
            {' '}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className={`font-semibold hover:underline ${
                isDark ? 'text-red-400' : 'text-indigo-600'
              }`}
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}