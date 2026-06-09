import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, Loader2, Eye, EyeOff } from 'lucide-react';
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
    confirmPassword: '',
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
    <div
      className={`min-h-screen flex items-center justify-center p-4 transition-colors ${
        isDark
          ? 'bg-[var(--void)]'
          : 'bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50'
      }`}
    >
      {/* زخارف خلفية متحركة (Orbs) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className={`absolute -top-40 -right-40 w-80 h-80 rounded-full blur-3xl opacity-20 animate-pulse-slow ${
            isDark ? 'bg-[var(--v)]' : 'bg-indigo-300'
          }`}
        />
        <div
          className={`absolute -bottom-40 -left-40 w-80 h-80 rounded-full blur-3xl opacity-20 animate-pulse-slow ${
            isDark ? 'bg-[var(--mg)]' : 'bg-pink-300'
          }`}
          style={{ animationDelay: '1s' }}
        />
      </div>

      <div
        className={`relative w-full max-w-md p-8 rounded-3xl shadow-2xl backdrop-blur-xl border transition-colors ${
          isDark
            ? 'bg-[var(--surface)] border-[var(--b2)]'
            : 'bg-white/80 border-white'
        }`}
      >
        {/* الشعار */}
        <div className="text-center mb-8">
          <div
            className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg ${
              isDark ? 'bg-[var(--b1)]' : 'bg-indigo-100'
            }`}
          >
            <svg className="w-10 h-10" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="lg" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#8b5cf6"/>
                  <stop offset="100%" stopColor="#db2777"/>
                </linearGradient>
              </defs>
              <rect x="2" y="3" width="28" height="26" rx="7" fill="none" stroke="url(#lg)" strokeWidth="2" opacity="0.6"/>
              <rect x="2" y="3" width="14" height="26" rx="7" fill="url(#lg)" opacity="0.9"/>
              <rect x="13" y="3" width="3" height="26" fill="url(#lg)" opacity="0.9"/>
              <text x="10" y="21" fontSize="11" fontWeight="900" fill="white" fontFamily="Georgia,serif" textAnchor="middle">N</text>
              <circle cx="28" cy="6" r="5" fill="url(#lg)"/>
              <text x="28" y="9" fontSize="6" fontWeight="900" fill="white" textAnchor="middle">!</text>
            </svg>
          </div>
          <h1 className={`text-2xl font-serif font-bold tracking-tight ${isDark ? 'text-[var(--txt)]' : 'text-gray-900'}`}>
            {isLogin ? 'Welcome Back' : 'Join Novelgram'}
          </h1>
          <p className={`mt-1.5 text-sm ${isDark ? 'text-[var(--txt2)]' : 'text-gray-500'}`}>
            {isLogin ? 'Sign in to continue your journey' : 'Start your writing adventure today'}
          </p>
        </div>

        {/* أزرار التبديل بين تسجيل الدخول والإنشاء */}
        <div className={`flex p-1 rounded-xl mb-6 ${isDark ? 'bg-[var(--surface2)]' : 'bg-gray-100'}`}>
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
              isLogin
                ? 'bg-white dark:bg-[var(--surface3)] text-[var(--txt)] shadow-sm'
                : 'text-[var(--txt3)] hover:text-[var(--txt)]'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
              !isLogin
                ? 'bg-white dark:bg-[var(--surface3)] text-[var(--txt)] shadow-sm'
                : 'text-[var(--txt3)] hover:text-[var(--txt)]'
            }`}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* اسم المستخدم (للتسجيل فقط) */}
          {!isLogin && (
            <div>
              <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-[var(--txt2)]' : 'text-gray-700'}`}>
                Username
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--txt3)]" />
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Choose a username"
                  className={`w-full pl-11 pr-4 py-3 rounded-xl border transition-all focus:ring-2 focus:outline-none ${
                    isDark
                      ? 'bg-[var(--surface2)] border-[var(--b2)] text-[var(--txt)] placeholder-[var(--txt3)] focus:ring-[var(--v)] focus:border-[var(--v)]'
                      : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500'
                  }`}
                  required={!isLogin}
                />
              </div>
            </div>
          )}

          {/* البريد الإلكتروني */}
          <div>
            <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-[var(--txt2)]' : 'text-gray-700'}`}>
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--txt3)]" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your@email.com"
                className={`w-full pl-11 pr-4 py-3 rounded-xl border transition-all focus:ring-2 focus:outline-none ${
                  isDark
                    ? 'bg-[var(--surface2)] border-[var(--b2)] text-[var(--txt)] placeholder-[var(--txt3)] focus:ring-[var(--v)] focus:border-[var(--v)]'
                    : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500'
                }`}
                required
              />
            </div>
          </div>

          {/* كلمة المرور */}
          <div>
            <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-[var(--txt2)]' : 'text-gray-700'}`}>
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--txt3)]" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className={`w-full pl-11 pr-12 py-3 rounded-xl border transition-all focus:ring-2 focus:outline-none ${
                  isDark
                    ? 'bg-[var(--surface2)] border-[var(--b2)] text-[var(--txt)] placeholder-[var(--txt3)] focus:ring-[var(--v)] focus:border-[var(--v)]'
                    : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500'
                }`}
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--txt3)] hover:text-[var(--txt)] transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* تأكيد كلمة المرور (للتسجيل فقط) */}
          {!isLogin && (
            <div>
              <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-[var(--txt2)]' : 'text-gray-700'}`}>
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--txt3)]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  className={`w-full pl-11 pr-4 py-3 rounded-xl border transition-all focus:ring-2 focus:outline-none ${
                    isDark
                      ? 'bg-[var(--surface2)] border-[var(--b2)] text-[var(--txt)] placeholder-[var(--txt3)] focus:ring-[var(--v)] focus:border-[var(--v)]'
                      : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500'
                  }`}
                  required={!isLogin}
                />
              </div>
            </div>
          )}

          {/* زر الإرسال */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${
              isDark
                ? 'bg-gradient-to-r from-[var(--v)] to-[var(--mg)] text-white shadow-lg shadow-[var(--v)]/30'
                : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30'
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

        {/* تذييل */}
        <div className="mt-6 text-center">
          <p className={`text-sm ${isDark ? 'text-[var(--txt2)]' : 'text-gray-500'}`}>
            {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className={`font-semibold hover:underline ${isDark ? 'text-[var(--vb)]' : 'text-indigo-600'}`}
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}