import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLogin } from '../hooks/api';
import { getApiErrorMessage } from '../api/errors';

//---
export default function LoginPage() {
  const navigate = useNavigate();
  const login = useLogin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    login.mutate(
      { email, password },
      {
        onSuccess: () => navigate('/dashboard'),
      },
    );
  };

  return (
    <div className="min-h-screen w-full bg-gray-100 flex items-center justify-center p-4">
      {/* Card Wrapper */}
      <div className="w-full max-w-4xl flex flex-col md:flex-row rounded-2xl overflow-hidden shadow-2xl" style={{ minHeight: 480 }}>

        {/* ===== LEFT PANEL ===== */}
        <div className="relative w-full md:w-1/2 bg-red-500 flex flex-col justify-between p-10 overflow-hidden">
          {/* Decorative Circles */}
          <div
            className="circle-ring border-[28px] border-white opacity-20"
            style={{ width: 300, height: 300, bottom: -90, right: -90 }}
          />
          <div
            className="circle-ring bg-white opacity-10"
            style={{ width: 180, height: 180, bottom: -40, right: -30 }}
          />

          {/* Top Content */}
          <div className="relative z-10">
            <h2 className="text-white text-lg font-semibold mb-4 leading-snug">
              Welcome to DTLC LOGISTIC
            </h2>
            <p className="text-white text-xs font-light leading-relaxed opacity-90 max-w-xs">
              Welcome to our trusted courier service platform, where speed, reliability, and security come first. We specialize in delivering your parcels safely and on time, whether it's local shipments or nationwide deliveries.Our advanced tracking system ensures you stay updated at every step, giving you complete peace of mind. With a strong network and dedicated team, we are committed to providing efficient logistics solutions tailored to your needs.Login to manage your shipments, track deliveries in real-time, and experience seamless courier services like never before.
            </p>
          </div>

          {/* Bottom Button */}
          <div className="relative z-10 mt-10">
            <button className="border border-white text-white text-xs px-6 py-2 rounded-full tracking-wide hover:bg-white hover:text-red-500 transition-all duration-200 ease-in-out">
              Read More
            </button>
          </div>
        </div>

        {/* ===== RIGHT PANEL ===== */}
        <div className="w-full md:w-1/2 bg-white flex flex-col items-center justify-center px-10 md:px-14 py-14">
          {/* Heading */}
          <h1 className="text-2xl font-medium text-gray-700 tracking-wide mb-1">Signin</h1>
          <div className="w-8 h-0.5 bg-red-500 mb-10 rounded-full"></div>

          {/* Form */}
          <form className="w-full flex flex-col gap-5" onSubmit={handleLogin}>
            {/* Email */}
            <div className="relative w-full">
              <input
                type="email"
                autoComplete="email"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-200 rounded-md px-4 py-3 text-sm text-gray-600 placeholder:text-gray-400 focus:border-red-400 focus:ring-1 focus:ring-red-300 transition-all duration-150 pr-10"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </span>
            </div>

            {/* Password Field */}
            <div className="relative w-full">
              <input
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-200 rounded-md px-4 py-3 text-sm text-gray-600 placeholder:text-gray-400 focus:border-red-400 focus:ring-1 focus:ring-red-300 transition-all duration-150 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 10.677A2 2 0 0012 14a2 2 0 001.323-.5" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.362 7.561C5.68 8.74 4.279 10.417 3.5 12c1.5 3 5 7 8.5 7 1.401 0 2.78-.38 4.03-1.016" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.88 5.1A8.6 8.6 0 0112 5c3.5 0 7 4 8.5 7a16.1 16.1 0 01-2.489 3.454" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={login.isPending}
              className="w-full mt-3 bg-red-500 hover:bg-red-600 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold py-3 rounded-full tracking-widest uppercase transition-all duration-200 ease-in-out shadow-sm hover:shadow-md"
            >
              {login.isPending ? 'Signing in...' : 'Login'}
            </button>

            {login.isError && (
              <p className="text-xs text-red-500 text-center mt-2 font-medium">
                {getApiErrorMessage(login.error)}
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
