import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Eye, EyeOff, Lock, Mail, User, AlertCircle, CheckCircle } from 'lucide-react';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetMode, setResetMode] = useState(false);
  const { login, register, resetPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (isLogin) {
        const result = await login(email, password);
        if (!result.success) {
          setError(result.error);
        }
      } else {
        // Registration validation
        if (password !== confirmPassword) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }
        if (password.length < 6) {
          setError('Password should be at least 6 characters');
          setLoading(false);
          return;
        }

        const result = await register(email, password, name);
        if (result.success) {
          setSuccess('Account created successfully! You can now log in.');
          setIsLogin(true);
          setEmail('');
          setPassword('');
          setName('');
          setConfirmPassword('');
        } else {
          setError(result.error);
        }
      }
    } catch (error) {
      setError('An unexpected error occurred');
    }

    setLoading(false);
  };

  const handlePasswordReset = async () => {
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const result = await resetPassword(email);
      if (result.success) {
        setSuccess('Password reset email sent! Check your inbox.');
        setResetMode(false);
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Failed to send reset email');
    }

    setLoading(false);
  };

  if (resetMode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <img
              className="mx-auto h-28 w-auto"
              src="/Logo.jpeg"
              alt="Ghana School Feeding Programme"
            />
            <h2 className="mt-6 text-3xl font-bold text-gray-900">
              Reset Password
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Enter your email address and we'll send you a link to reset your password.
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={(e) => { e.preventDefault(); handlePasswordReset(); }}>
            <div className="bg-white py-8 px-6 shadow-lg rounded-lg space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm flex items-center">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {success}
                </div>
              )}

              <div>
                <label htmlFor="reset-email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="reset-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={loading || !email}
                  className="flex-1 flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
                <button
                  type="button"
                  onClick={() => setResetMode(false)}
                  className="flex-1 flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                >
                  Back to Login
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-ghana-primary-900 via-ghana-primary-800 to-ghana-primary-700 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full mix-blend-multiply filter blur-xl animate-pulse-slow"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-ghana-secondary-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse-slow" style={{animationDelay: '1s'}}></div>
        <div className="absolute -bottom-20 left-40 w-72 h-72 bg-white rounded-full mix-blend-multiply filter blur-xl animate-pulse-slow" style={{animationDelay: '2s'}}></div>
      </div>
      
      <div className="max-w-md w-full space-y-8 relative z-10">
        <div className="text-center">
          <div className="mx-auto w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-2xl mb-6 animate-fade-in">
            <span className="text-ghana-primary-700 font-bold text-3xl">GS</span>
          </div>
          <h2 className="mt-6 text-5xl font-bold text-white animate-slide-down">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="mt-4 text-xl text-ghana-primary-200 font-medium animate-slide-down" style={{animationDelay: '0.2s'}}>
            {isLogin
              ? 'Sign in to manage GSFP content'
              : 'Create your admin account'
            }
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="bg-white/95 backdrop-blur-xl py-10 px-8 shadow-2xl rounded-3xl space-y-8 border border-white/20 animate-slide-up" style={{animationDelay: '0.4s'}}>
            {error && (
              <div className="bg-error-50 border-2 border-error-200 text-error-700 px-6 py-4 rounded-2xl text-sm flex items-center animate-slide-up shadow-soft">
                <AlertCircle className="h-5 w-5 mr-3 flex-shrink-0" />
                {error}
              </div>
            )}

            {success && (
              <div className="bg-success-50 border-2 border-success-200 text-success-700 px-6 py-4 rounded-2xl text-sm flex items-center animate-slide-up shadow-soft">
                <CheckCircle className="h-5 w-5 mr-3 flex-shrink-0" />
                {success}
              </div>
            )}

            {!isLogin && (
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-ghana-neutral-700 mb-3">
                  Full Name
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-ghana-neutral-400 group-focus-within:text-ghana-primary-500 transition-colors duration-200" />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required={!isLogin}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input-field pl-12 pr-4 py-4 text-lg rounded-2xl border-2 border-ghana-neutral-200 focus:border-ghana-primary-400 focus:ring-4 focus:ring-ghana-primary-100 transition-all duration-200"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-ghana-neutral-700 mb-3">
                Email Address
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-ghana-neutral-400 group-focus-within:text-ghana-primary-500 transition-colors duration-200" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-12 pr-4 py-4 text-lg rounded-2xl border-2 border-ghana-neutral-200 focus:border-ghana-primary-400 focus:ring-4 focus:ring-ghana-primary-100 transition-all duration-200"
                  placeholder="admin@gsfp.gov.gh"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-ghana-neutral-700 mb-3">
                Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-ghana-neutral-400 group-focus-within:text-ghana-primary-500 transition-colors duration-200" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-12 pr-14 py-4 text-lg rounded-2xl border-2 border-ghana-neutral-200 focus:border-ghana-primary-400 focus:ring-4 focus:ring-ghana-primary-100 transition-all duration-200"
                  placeholder="Enter your password"
                />
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-ghana-neutral-400 hover:text-ghana-neutral-600 focus:outline-none transition-colors duration-200 p-1"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            </div>

            {!isLogin && (
              <div>
                <label htmlFor="confirm-password" className="block text-sm font-semibold text-ghana-neutral-700 mb-3">
                  Confirm Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-ghana-neutral-400 group-focus-within:text-ghana-primary-500 transition-colors duration-200" />
                  </div>
                  <input
                    id="confirm-password"
                    name="confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required={!isLogin}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="input-field pl-12 pr-14 py-4 text-lg rounded-2xl border-2 border-ghana-neutral-200 focus:border-ghana-primary-400 focus:ring-4 focus:ring-ghana-primary-100 transition-all duration-200"
                    placeholder="Confirm your password"
                  />
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="text-ghana-neutral-400 hover:text-ghana-neutral-600 focus:outline-none transition-colors duration-200 p-1"
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary text-lg font-semibold py-4 rounded-2xl shadow-large hover:shadow-large hover:scale-[1.02] transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-ghana-primary-100"
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-3">
                    <div className="loading-spinner"></div>
                    <span>Signing in...</span>
                  </div>
                ) : (
                  <span>{isLogin ? 'Sign In to GSFP Admin' : 'Create Admin Account'}</span>
                )}
              </button>
            </div>

            <div className="mt-6 text-center">
              <p className="text-ghana-primary-200 text-sm font-medium animate-fade-in" style={{animationDelay: '0.8s'}}>
                {isLogin ? "Don't have an admin account?" : "Already have an account?"}{' '}
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="font-semibold text-white hover:text-ghana-primary-200 transition-colors duration-200 underline underline-offset-2"
                >
                  {isLogin ? 'Create Account' : 'Sign In'}
                </button>
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
