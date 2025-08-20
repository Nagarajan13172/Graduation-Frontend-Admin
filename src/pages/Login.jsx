import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUserShield, FaLock, FaSignInAlt } from 'react-icons/fa';
import { API_BASE } from '../api';
import { saveToken } from '../auth';

export default function Login({ onLogin }) {
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const generateParticles = () => {
      const newParticles = Array.from({ length: 100 }, () => ({
        id: Math.random(),
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: Math.random() * 12 + 6,
        speedX: (Math.random() - 0.5) * 4,
        speedY: (Math.random() - 0.5) * 4,
        color: `hsl(${Math.random() * 60 + 200}, 85%, 85%)`,
      }));
      setParticles(newParticles);
    };

    generateParticles();
    const interval = setInterval(() => {
      setParticles((prev) =>
        prev.map((p) => {
          let newX = p.x + p.speedX;
          let newY = p.y + p.speedY;
          if (newX < 0 || newX > window.innerWidth) p.speedX *= -1;
          if (newY < 0 || newY > window.innerHeight) p.speedY *= -1;
          return {
            ...p,
            x: newX,
            y: newY,
            size: p.size + (Math.random() - 0.5) * 0.3,
          };
        })
      );
    }, 20);

    return () => clearInterval(interval);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLoginData({ ...loginData, [name]: value });
    if (value.trim()) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateFields = () => {
    const newErrors = {};
    if (!loginData.username.trim()) newErrors.username = 'Username is required';
    if (!loginData.password.trim()) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateFields()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    try {
      console.log('Sending login request:', { API_BASE, loginData }); // Debug log
      const response = await axios.post(`${API_BASE}/admin/login`, loginData);
      console.log('Login response:', response.data); // Debug log
      saveToken(response.data.token);
      toast.success('Login successful!');
      onLogin();
    } catch (err) {
      console.error('Login error:', err); // Debug log
      let errorMessage = 'Login failed. Please try again.';
      if (err.response) {
        if (err.response.status === 401) {
          errorMessage = 'Invalid username or password.';
        } else if (err.response.status === 500) {
          errorMessage = 'Server error. Please try again later.';
        } else {
          errorMessage = err.response.data?.error || errorMessage;
        }
      } else if (err.request) {
        errorMessage = 'No response from server. Check your network connection.';
      }
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white relative overflow-hidden flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@700;800;900&family=Poppins:wght@300;400;500;600;700;800&display=swap');
          .font-inter { font-family: 'Inter', sans-serif; }
          .font-poppins { font-family: 'Poppins', sans-serif; }
          .shadow-text { text-shadow: 0 3px 8px rgba(0, 0, 0, 0.3); }
          .login-card {
            position: relative;
            overflow: hidden;
            box-shadow: 0 14px 50px rgba(59, 130, 246, 0.3);
            border-radius: 36px;
          
            backdrop-filter: blur(15px);
            transition: all 0.4s ease;
          }
          .login-card:hover {
            transform: translateY(-10px);
            box-shadow: 0 18px 70px rgba(59, 130, 246, 0.4);
          }
          .card-glow::before {
            content: '';
            position: absolute;
            inset: -6px;
          
            border-radius: 42px;
            filter: blur(15px);
            opacity: 0.35;
            z-index: -1;
            transition: opacity 0.4s ease;
          }
          .login-card:hover .card-glow::before {
            opacity: 0.7;
          }
          .card-border {
            border: 4px solid transparent;
            background: linear-gradient(white, white) padding-box, linear-gradient(45deg, #3B82F6, #60A5FA, #4F46E5) border-box;
          }
          .input-glow {
            position: relative;
            transition: all 0.3s ease;
          }
          .input-glow::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            height: 3px;
            background: linear-gradient(to right, #3B82F6, #60A5FA);
            transform: scaleX(0);
            transform-origin: left;
            transition: transform 0.4s ease;
          }
          .input-glow:focus-within::after {
            transform: scaleX(1);
          }
          .card-ripple {
            position: absolute;
            border-radius: 50%;
            background: rgba(59, 130, 246, 0.3);
            transform: scale(0);
            animation: ripple 0.7s linear;
            pointer-events: none;
          }
          @keyframes ripple {
            to {
              transform: scale(5);
              opacity: 0;
            }
          }
          .button-glow {
            position: relative;
            overflow: hidden;
          }
          .button-glow::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
            transition: left 0.5s ease;
          }
          .button-glow:hover::before {
            left: 100%;
          }
        `}
      </style>
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none opacity-45"
        viewBox="0 0 1920 1080"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="modernGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#1E3A8A', stopOpacity: 0.75 }} />
            <stop offset="50%" style={{ stopColor: '#3B82F6', stopOpacity: 0.65 }} />
            <stop offset="100%" style={{ stopColor: '#60A5FA', stopOpacity: 0.55 }} />
          </linearGradient>
          <radialGradient id="radialGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" style={{ stopColor: '#93C5FD', stopOpacity: 0.6 }} />
            <stop offset="100%" style={{ stopColor: '#1E3A8A', stopOpacity: 0.25 }} />
          </radialGradient>
        </defs>
        <g>
          <rect x="0" y="0" width="1920" height="1080" fill="url(#modernGradient)" opacity="0.25" />
          <circle cx="300" cy="200" r="300" fill="url(#radialGradient)" opacity="0.35" />
          <circle cx="1600" cy="800" r="350" fill="url(#radialGradient)" opacity="0.3" />
          <path
            d="M0,600 C400,400 800,600 1200,400 C1600,200 2000,400 1920,600"
            fill="none"
            stroke="url(#modernGradient)"
            strokeWidth="60"
            opacity="0.4"
          />
          <rect x="900" y="300" width="600" height="300" rx="60" fill="url(#radialGradient)" opacity="0.25" transform="rotate(45 1200 450)" />
          <path
            d="M100,900 C500,700 900,900 1300,700 C1700,500 2100,700 1920,900"
            fill="none"
            stroke="url(#modernGradient)"
            strokeWidth="50"
            opacity="0.35"
          />
          <circle cx="1100" cy="150" r="200" fill="url(#radialGradient)" opacity="0.3" />
          <path
            d="M200,100 C600,300 1000,100 1400,300 C1800,500 2200,300 1920,100"
            fill="none"
            stroke="url(#modernGradient)"
            strokeWidth="40"
            opacity="0.35"
          />
        </g>
      </svg>
      <div className="absolute inset-0 pointer-events-none">
        <AnimatePresence>
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              initial={{ opacity: 0.6, scale: 0 }}
              animate={{
                x: particle.x,
                y: particle.y,
                scale: particle.size / 8,
                opacity: 0.75,
              }}
              transition={{ duration: 0.02, ease: 'linear' }}
              className="absolute rounded-full blur-sm"
              style={{
                width: particle.size,
                height: particle.size,
                background: particle.color,
                boxShadow: '0 0 30px rgba(59, 130, 246, 0.8)',
              }}
            />
          ))}
        </AnimatePresence>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
        className="min-w-[200px] w-[40%] h-[500px] login-card card-glow card-border rounded-3xl p-10 relative z-10 "
        onClick={(e) => {
          const ripple = document.createElement('div');
          ripple.className = 'card-ripple';
          const rect = e.currentTarget.getBoundingClientRect();
          ripple.style.left = `${e.clientX - rect.left - 20}px`;
          ripple.style.top = `${e.clientY - rect.top - 20}px`;
          e.currentTarget.appendChild(ripple);
          setTimeout(() => ripple.remove(), 700);
        }}
      >
        <motion.div
          className="absolute inset-0 rounded-3xl"
          style={{  }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ duration: 0.5 }}
        />
        <motion.div
          className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-indigo-500"
          initial={{ scaleX: 0, originX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.7, ease: 'easeOut', delay: 0.3 }}
        />
        <motion.h2
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-4xl font-inter font-extrabold text-blue-900 text-center mb-8 tracking-tight shadow-text flex items-center justify-center gap-3"
        >
          <FaUserShield className="text-blue-600 text-3xl" />
          Admin Portal
        </motion.h2>
        <form onSubmit={handleLogin} className="space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="input-glow"
          >
            <label className="block text-blue-800 font-semibold mb-2 flex items-center gap-3 text-lg font-poppins">
              <FaUserShield className="text-blue-600 text-2xl" />
              Username
            </label>
            <input
              type="text"
              name="username"
              value={loginData.username}
              onChange={handleChange}
              className="w-full px-6 py-4 rounded-xl bg-gray-50/80 border border-blue-200/50 focus:outline-none focus:ring-4 focus:ring-blue-500/50 transition-all duration-300 font-poppins text-blue-900 text-lg placeholder-blue-400/60 backdrop-blur-sm"
              placeholder="Enter username"
              required
            />
            {errors.username && (
              <motion.p
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-500 text-sm mt-1 font-poppins"
              >
                {errors.username}
              </motion.p>
            )}
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="input-glow"
          >
            <label className="block text-blue-800 font-semibold mb-2 flex items-center gap-3 text-lg font-poppins">
              <FaLock className="text-blue-600 text-2xl" />
              Password
            </label>
            <input
              type="password"
              name="password"
              value={loginData.password}
              onChange={handleChange}
              className="w-full px-6 py-4 rounded-xl bg-gray-50/80 border border-blue-200/50 focus:outline-none focus:ring-4 focus:ring-blue-500/50 transition-all duration-300 font-poppins text-blue-900 text-lg placeholder-blue-400/60 backdrop-blur-sm"
              placeholder="Enter password"
              required
            />
            {errors.password && (
              <motion.p
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-500 text-sm mt-1 font-poppins"
              >
                {errors.password}
              </motion.p>
            )}
          </motion.div>
          <motion.button
            type="submit"
            disabled={isLoading}
            whileHover={{ scale: 1.05, boxShadow: '0 0 35px rgba(59,130,246,0.8)' }}
            whileTap={{ scale: 0.95 }}
            className={`w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-bold font-poppins text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3 border-2 border-blue-400/50 button-glow ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <FaSignInAlt className="text-2xl" />
            {isLoading ? 'Logging in...' : 'Secure Login'}
          </motion.button>
        </form>
        <motion.div
          className="absolute top-0 right-0 w-24 h-24"
          style={{ background: 'radial-gradient(circle at center, rgba(59, 130, 246, 0.25), transparent)' }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.6, type: 'spring', stiffness: 120, delay: 0.5 }}
        />
        <motion.div
          className="absolute bottom-0 left-0 w-20 h-20"
          style={{ background: 'radial-gradient(circle at center, rgba(59, 130, 246, 0.2), transparent)' }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.6, type: 'spring', stiffness: 120, delay: 0.6 }}
        />
      </motion.div>
    </div>
  );
}