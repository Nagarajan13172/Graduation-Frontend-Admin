
import { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { FaGraduationCap, FaUsers, FaFilter, FaFileExcel, FaUserShield, FaSearch, FaUniversity, FaVenusMars, FaUtensils, FaChartLine, FaGlobe, FaPray, FaLanguage, FaMapMarkerAlt, FaUserGraduate, FaFileDownload, FaTimes, FaFilePdf, FaImage, FaEye, FaDownload, FaSpinner } from 'react-icons/fa';
import { API_BASE } from '../api';
import { getToken, removeToken } from '../auth';

export default function Dashboard({ onLogout }) {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [degreeFilter, setDegreeFilter] = useState('');
  const [genderFilter, setGenderFilter] = useState('');
  const [lunchFilter, setLunchFilter] = useState('');
  const [communityFilter, setCommunityFilter] = useState('');
  const [nationalityFilter, setNationalityFilter] = useState('');
  const [religionFilter, setReligionFilter] = useState('');
  const [placeOfBirthFilter, setPlaceOfBirthFilter] = useState('');
  const [isRegisteredGraduateFilter, setIsRegisteredGraduateFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [particles, setParticles] = useState([]);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [isLoadingDocument, setIsLoadingDocument] = useState(false);

  const DEGREE_OPTIONS = ['UG', 'PG'];
  const GENDER_OPTIONS = ['Male', 'Female', 'Other'];
  const LUNCH_OPTIONS = ['VEG', 'NON-VEG'];
  const COMMUNITY_OPTIONS = ['OC', 'BC', 'SC', 'ST', 'MBC'];
  const DISTRICT_OPTIONS = ['Dharmapuri', 'Krishnagiri', 'Namakkal', 'Salem'];
  const REGISTERED_GRADUATE_OPTIONS = ['Yes', 'No'];

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await axios.get(`${API_BASE}/graduation/all`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        setStudents(response.data);
        setFilteredStudents(response.data);
      } catch (err) {
        console.error('Error fetching students:', err);
        toast.error('Session expired or unauthorized');
        removeToken();
        onLogout();
      }
    };
    fetchStudents();
  }, [onLogout]);

  useEffect(() => {
    const filtered = students.filter((student) =>
      (searchTerm ? student.full_name.toLowerCase().includes(searchTerm.toLowerCase()) : true) &&
      (degreeFilter ? student.degree_name === degreeFilter : true) &&
      (genderFilter ? student.gender === genderFilter : true) &&
      (lunchFilter ? student.lunch_required === lunchFilter : true) &&
      (communityFilter ? student.community === communityFilter : true) &&
      (nationalityFilter ? student.nationality === nationalityFilter : true) &&
      (religionFilter ? student.religion === religionFilter : true) &&
      (placeOfBirthFilter ? student.place_of_birth === placeOfBirthFilter : true) &&
      (isRegisteredGraduateFilter ? (isRegisteredGraduateFilter === 'Yes' ? student.is_registered_graduate : !student.is_registered_graduate) : true)
    );
    setFilteredStudents(filtered);
    setCurrentPage(1);
  }, [searchTerm, degreeFilter, genderFilter, lunchFilter, communityFilter, nationalityFilter, religionFilter, placeOfBirthFilter, isRegisteredGraduateFilter, students]);

  useEffect(() => {
    const generateParticles = () => {
      const newParticles = Array.from({ length: 50 }, () => ({
        id: Math.random(),
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: Math.random() * 12 + 6,
        speedX: (Math.random() - 0.5) * 3,
        speedY: (Math.random() - 0.5) * 3,
        color: `hsl(${Math.random() * 60 + 200}, 70%, 80%)`,
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
    }, 50);

    return () => clearInterval(interval);
  }, []);

  const downloadCSV = () => {
    if (!filteredStudents.length) {
      toast.error('No data to export');
      return;
    }

    const header = [
      'ID', 'Full Name', 'Date of Birth', 'Gender', 'Guardian Name', 'Nationality', 'Religion', 'Email',
      'Mobile Number', 'Place of Birth', 'Community', 'Mother Tongue', 'Aadhar Number', 'Degree Name',
      'University Name', 'Degree Pattern', 'Convocation Year', 'Is Registered Graduate', 'Occupation',
      'Address', 'Lunch Required', 'Companion Option', 'Created At', 'Updated At'
    ].join(',');
    const rows = filteredStudents.map((s) => [
      s.id,
      `"${s.full_name}"`,
      s.date_of_birth,
      s.gender,
      `"${s.guardian_name}"`,
      s.nationality,
      s.religion,
      s.email || '',
      s.mobile_number,
      s.place_of_birth,
      s.community,
      s.mother_tongue,
      s.aadhar_number,
      `"${s.degree_name}"`,
      `"${s.university_name}"`,
      s.degree_pattern,
      s.convocation_year,
      s.is_registered_graduate ? 'Yes' : 'No',
      `"${s.occupation}"`,
      `"${s.address}"`,
      s.lunch_required,
      s.companion_option,
      `"${new Date(s.created_at).toLocaleString()}"`,
      `"${new Date(s.updated_at).toLocaleString()}"`
    ].join(','));
    const blob = new Blob([header + '\n' + rows.join('\n')], { type: 'text/csv' });

    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'student_registrations.csv';
    a.click();
  };

  const openDocumentModal = (student) => {
    setSelectedStudent(student);
    setModalOpen(true);
  };

  const downloadFile = async (studentId, fileType) => {
    try {
      const response = await axios.get(`${API_BASE}/graduation/file/${studentId}/${fileType}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${fileType}${response.headers['content-type'].includes('pdf') ? '.pdf' : '.jpg'}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Error downloading file:', err);
      toast.error('Failed to download file');
    }
  };

  const downloadAllDocuments = async (studentId, studentName) => {
    try {
      const response = await axios.get(`${API_BASE}/graduation/files/${studentId}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${studentName.replace(/\s+/g, '_')}_documents.zip`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Error downloading all documents:', err);
      toast.error('Failed to download all documents');
    }
  };

  const viewDocument = async (studentId, fileType) => {
    setIsLoadingDocument(true);
    try {
      const response = await axios.get(`${API_BASE}/graduation/file/${studentId}/${fileType}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
        responseType: 'blob',
      });

      const isImage = fileType.includes('photo') || fileType.includes('signature');
      const mimeType = response.headers['content-type'];
      const url = URL.createObjectURL(new Blob([response.data], { type: mimeType }));

      // Open a new window
      const popup = window.open('', '_blank');
      if (!popup) {
        toast.error('Popup blocked. Please allow popups for this site.');
        setIsLoadingDocument(false);
        return;
      }

      // Create HTML content for the popup
      popup.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${fileType}</title>
            <style>
              body {
                margin: 0;
                padding: 0;
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
                background: #f0f4ff;
                font-family: 'Arial', sans-serif;
              }
              .container {
                max-width: 100%;
                max-height: 100vh;
                display: flex;
                justify-content: center;
                align-items: center;
                padding: 20px;
                box-sizing: border-box;
              }
              img, iframe {
                max-width: 100%;
                max-height: 90vh;
                border-radius: 10px;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
              }
              iframe {
                width: 100%;
                height: 90vh;
                border: none;
              }
            </style>
          </head>
          <body>
            <div class="container">
              ${isImage ? `<img src="${url}" alt="${fileType}" />` : `<iframe src="${url}" title="${fileType}"></iframe>`}
            </div>
          </body>
        </html>
      `);
      popup.document.close();
      setIsLoadingDocument(false);
    } catch (err) {
      console.error('Error viewing document:', err);
      toast.error('Failed to load document');
      setIsLoadingDocument(false);
    }
  };

  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentEntries = filteredStudents.slice(indexOfFirstEntry, indexOfLastEntry);
  const totalPages = Math.ceil(filteredStudents.length / entriesPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const totalStudents = students.length;
  const totalUG = students.filter((s) => s.degree_name === 'UG').length;
  const totalPG = students.filter((s) => s.degree_name === 'PG').length;

  return (
    <div className="min-h-screen bg-white relative overflow-hidden pt-28 pb-12 px-4 sm:px-6 lg:px-8">
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@700;800;900&family=Poppins:wght@300;400;500;600;700;800&display=swap');
          .font-inter { font-family: 'Inter', sans-serif; }
          .font-poppins { font-family: 'Poppins', sans-serif; }
          .shadow-text { text-shadow: 0 3px 8px rgba(0, 0, 0, 0.3); }
          .card-modern {
            position: relative;
            overflow: hidden;
            transition: all 0.4s ease;
            box-shadow: 0 12px 40px rgba(59, 130, 246, 0.15);
            border-radius: 32px;
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(12px);
          }
          .card-modern:hover {
            transform: translateY(-10px);
            box-shadow: 0 16px 60px rgba(59, 130, 246, 0.25);
          }
          .header-modern {
            box-shadow: 0 10px 40px rgba(59, 130, 246, 0.4);
            border-bottom: 4px solid rgba(59, 130, 246, 0.6);
          }
          .card-glow::before {
            content: '';
            position: absolute;
            inset: -4px;
            background: linear-gradient(45deg, #3B82F6, #60A5FA, #93C5FD, #14B8A6);
            border-radius: 36px;
            filter: blur(12px);
            opacity: 0.25;
            z-index: -1;
            transition: opacity 0.4s ease;
          }
          .card-modern:hover .card-glow::before {
            opacity: 0.5;
          }
          .card-border-blue {
            border: 4px solid transparent;
            background: linear-gradient(white, white) padding-box, linear-gradient(45deg, #3B82F6, #60A5FA) border-box;
          }
          .card-border-indigo {
            border: 4px solid transparent;
            background: linear-gradient(white, white) padding-box, linear-gradient(45deg, #4F46E5, #818CF8) border-box;
          }
          .card-border-teal {
            border: 4px solid transparent;
            background: linear-gradient(white, white) padding-box, linear-gradient(45deg, #14B8A6, #2DD4BF) border-box;
          }
          .card-icon-glow {
            position: relative;
            transition: transform 0.3s ease;
          }
          .card-icon-glow::after {
            content: '';
            position: absolute;
            inset: -2px;
            background: radial-gradient(circle, rgba(255,255,255,0.3), transparent);
            border-radius: 50%;
            opacity: 0;
            transition: opacity 0.3s ease;
          }
          .card-icon-glow:hover::after {
            opacity: 1;
          }
          .card-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            border-radius: 32px;
            background: linear-gradient(135deg, rgba(255,255,255,0.1), transparent);
            pointer-events: none;
          }
          .card-ripple {
            position: absolute;
            border-radius: 50%;
            background: rgba(255,255,255,0.3);
            transform: scale(0);
            animation: ripple 0.6s linear;
            pointer-events: none;
          }
          @keyframes ripple {
            to {
              transform: scale(4);
              opacity: 0;
            }
          }
          .modal-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.7);
            backdrop-filter: blur(8px);
            z-index: 1000;
            display: flex;
            justify-content: center;
            align-items: center;
          }
          .modal-content {
            background: white;
            border-radius: 24px;
            padding: 3rem;
            max-width: 95vw;
            max-height: 95vh;
            overflow-y: auto;
            position: relative;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            border: 2px solid rgba(59, 130, 246, 0.3);
            background: linear-gradient(145deg, #ffffff, #f0f4ff);
          }
          .modal-section {
            background: rgba(243, 244, 246, 0.9);
            border-radius: 16px;
            padding: 2rem;
            margin-bottom: 2rem;
            backdrop-filter: blur(6px);
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
            transition: all 0.3s ease;
          }
          .modal-section:hover {
            transform: translateY(-4px);
            box-shadow: 0 6px 30px rgba(0, 0, 0, 0.15);
          }
          .document-button {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.75rem 1.75rem;
            border-radius: 12px;
            font-weight: 600;
            font-size: 1rem;
            transition: all 0.3s ease;
            border: 2px solid transparent;
          }
          .view-button {
            background: linear-gradient(45deg, #4F46E5, #818CF8);
            color: white;
          }
          .view-button:hover {
            background: linear-gradient(45deg, #4338CA, #6366F1);
            box-shadow: 0 4px 15px rgba(79, 70, 229, 0.4);
          }
          .download-button {
            background: linear-gradient(45deg, #14B8A6, #2DD4BF);
            color: white;
          }
          .download-button:hover {
            background: linear-gradient(45deg, #0D9488, #26A69A);
            box-shadow: 0 4px 15px rgba(20, 184, 166, 0.4);
          }
          .download-all-button {
            background: linear-gradient(45deg, #8B5CF6, #A78BFA);
            color: white;
          }
          .download-all-button:hover {
            background: linear-gradient(45deg, #7C3AED, #8B5CF6);
            box-shadow: 0 4px 15px rgba(139, 92, 246, 0.4);
          }
          .loading-spinner {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100px;
            color: #4F46E5;
          }
        `}
      </style>
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none opacity-40"
        viewBox="0 0 1920 1080"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="modernGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#1E3A8A', stopOpacity: 0.7 }} />
            <stop offset="50%" style={{ stopColor: '#3B82F6', stopOpacity: 0.6 }} />
            <stop offset="100%" style={{ stopColor: '#60A5FA', stopOpacity: 0.5 }} />
          </linearGradient>
          <radialGradient id="radialGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" style={{ stopColor: '#93C5FD', stopOpacity: 0.5 }} />
            <stop offset="100%" style={{ stopColor: '#1E3A8A', stopOpacity: 0.2 }} />
          </radialGradient>
        </defs>
        <g>
          <rect x="0" y="0" width="1920" height="1080" fill="url(#modernGradient)" opacity="0.2" />
          <circle cx="300" cy="200" r="250" fill="url(#radialGradient)" opacity="0.3" />
          <circle cx="1600" cy="800" r="300" fill="url(#radialGradient)" opacity="0.25" />
          <path
            d="M0,600 C400,400 800,600 1200,400 C1600,200 2000,400 1920,600"
            fill="none"
            stroke="url(#modernGradient)"
            strokeWidth="50"
            opacity="0.35"
          />
          <rect x="900" y="300" width="500" height="250" rx="50" fill="url(#radialGradient)" opacity="0.2" transform="rotate(45 1150 425)" />
          <path
            d="M100,900 C500,700 900,900 1300,700 C1700,500 2100,700 1920,900"
            fill="none"
            stroke="url(#modernGradient)"
            strokeWidth="40"
            opacity="0.3"
          />
          <circle cx="1100" cy="150" r="150" fill="url(#radialGradient)" opacity="0.25" />
          <path
            d="M200,100 C600,300 1000,100 1400,300 C1800,500 2200,300 1920,100"
            fill="none"
            stroke="url(#modernGradient)"
            strokeWidth="30"
            opacity="0.3"
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
                opacity: 0.7,
              }}
              transition={{ duration: 0.04, ease: 'linear' }}
              className="absolute rounded-full blur-sm"
              style={{
                width: particle.size,
                height: particle.size,
                background: particle.color,
                boxShadow: '0 0 25px rgba(59, 130, 246, 0.7)',
              }}
            />
          ))}
        </AnimatePresence>
      </div>
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
        className="fixed top-0 left-0 right-0 h-25 bg-gradient-to-r from-blue-900 to-black header-modern z-50 flex items-center justify-between px-8 lg:px-12"
      >
        <div className="flex items-center gap-4">
          <img
            src="./logo.png"
            alt="University Logo"
            className="w-18 h-18 rounded-full border-2 border-blue-300/50"
          />
          <motion.h1
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-3xl font-inter font-extrabold text-white tracking-tight shadow-text"
          >
            Graduation Portal Admin Dashboard
          </motion.h1>
        </div>
        <motion.button
          onClick={() => {
            removeToken();
            onLogout();
          }}
          whileHover={{ scale: 1.05, boxShadow: '0 0 25px rgba(239,68,68,0.8)' }}
          whileTap={{ scale: 0.95 }}
          className="px-6 py-3 bg-red-600 text-white rounded-xl font-poppins font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 border-2 border-red-400/50"
        >
          <FaUserShield className="text-xl" />
          Logout
        </motion.button>
      </motion.header>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
        className="max-w-8xl mx-auto relative z-10 mt-10"
      >
        <div className="flex items-center justify-center mb-10">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, delay: 0.3, type: 'spring', stiffness: 100 }}
            className="relative w-16 h-16 mr-4 flex items-center justify-center"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full shadow-lg" />
            <FaUsers className="relative z-10 text-4xl text-white" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }} />
            <div className="absolute inset-0 bg-blue-300/30 rounded-full animate-pulse" />
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-5xl font-inter font-extrabold text-blue-900 text-center tracking-tight shadow-text"
          >
            Student Registrations Overview
          </motion.h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {[
            { 
              icon: FaUsers, 
              title: 'Total Students', 
              value: totalStudents, 
              border: 'card-border-blue', 
              delay: 0.3,
              subText: `${Math.round((totalStudents / (totalStudents || 1)) * 100)}% of Total`,
              color: '#3B82F6',
              trend: totalStudents > 100 ? 'up' : 'down',
              trendValue: totalStudents > 100 ? '+12%' : '-8%',
              detailText: 'All registered students across programs'
            },
            { 
              icon: FaGraduationCap, 
              title: 'UG Students', 
              value: totalUG, 
              border: 'card-border-indigo', 
              delay: 0.4,
              subText: `${Math.round((totalUG / (totalStudents || 1)) * 100)}% of Total`,
              color: '#4F46E5',
              trend: totalUG > 50 ? 'up' : 'down',
              trendValue: totalUG > 50 ? '+15%' : '-5%',
              detailText: 'Undergraduate program registrations'
            },
            { 
              icon: FaUniversity, 
              title: 'PG Students', 
              value: totalPG, 
              border: 'card-border-teal', 
              delay: 0.5,
              subText: `${Math.round((totalPG / (totalStudents || 1)) * 100)}% of Total`,
              color: '#14B8A6',
              trend: totalPG > 30 ? 'up' : 'down',
              trendValue: totalPG > 30 ? '+10%' : '-3%',
              detailText: 'Postgraduate program registrations'
            },
          ].map((card, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.95, rotateX: 15 }}
              animate={{ opacity: 1, scale: 1, rotateX: 0 }}
              transition={{ duration: 0.6, delay: card.delay, type: 'spring', stiffness: 120 }}
              className={`relative card-modern card-glow ${card.border} rounded-3xl p-8 flex flex-col gap-4 transition-all duration-400`}
              onMouseEnter={() => setHoveredCard(index)}
              onMouseLeave={() => setHoveredCard(null)}
              onClick={(e) => {
                const ripple = document.createElement('div');
                ripple.className = 'card-ripple';
                const rect = e.currentTarget.getBoundingClientRect();
                ripple.style.left = `${e.clientX - rect.left - 20}px`;
                ripple.style.top = `${e.clientY - rect.top - 20}px`;
                e.currentTarget.appendChild(ripple);
                setTimeout(() => ripple.remove(), 600);
              }}
            >
              <div className="card-overlay" />
              <div className="flex items-center justify-between">
                <motion.div
                  className="w-16 h-16 bg-gray-100/50 rounded-2xl flex items-center justify-center backdrop-blur-md card-icon-glow"
                  whileHover={{ scale: 1.15, rotate: 5 }}
                  transition={{ duration: 0.3 }}
                >
                  <card.icon className="text-3xl" style={{ color: card.color, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }} />
                </motion.div>
                <motion.div
                  className="text-sm font-poppins font-medium flex items-center gap-1"
                  style={{ color: card.trend === 'up' ? '#14B8A6' : '#EF4444' }}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <FaChartLine className="text-lg" />
                  {card.trend === 'up' ? '↑' : '↓'} {card.trendValue}
                </motion.div>
              </div>
              <div className="relative z-10">
                <h3 className="text-xl font-poppins font-semibold text-gray-800 tracking-wide">{card.title}</h3>
                <motion.p
                  className="text-4xl font-inter font-extrabold text-gray-900"
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: card.delay + 0.2, type: 'spring' }}
                >
                  {card.value}
                </motion.p>
                <motion.p
                  className="text-sm font-poppins text-gray-600 mt-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: hoveredCard === index ? 1 : 0, y: hoveredCard === index ? 0 : 10 }}
                  transition={{ duration: 0.3 }}
                >
                  {card.subText}
                </motion.p>
                <motion.p
                  className="text-xs font-poppins text-gray-500 mt-1"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: hoveredCard === index ? 1 : 0, y: hoveredCard === index ? 0 : 10 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  {card.detailText}
                </motion.p>
              </div>
              <motion.div
                className="absolute inset-0 rounded-3xl"
                style={{ background: `radial-gradient(circle at top right, ${card.color}10, transparent)` }}
                initial={{ opacity: 0 }}
                animate={{ opacity: hoveredCard === index ? 0.3 : 0 }}
                transition={{ duration: 0.4 }}
              />
              <motion.div
                className="absolute bottom-0 left-0 w-full h-1.5"
                style={{ background: card.color }}
                initial={{ scaleX: 0, originX: 0 }}
                animate={{ scaleX: hoveredCard === index ? 1 : 0 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              />
              <motion.div
                className="absolute top-0 right-0 w-16 h-16"
                style={{ background: `radial-gradient(circle at center, ${card.color}15, transparent)` }}
                initial={{ scale: 0 }}
                animate={{ scale: hoveredCard === index ? 1 : 0 }}
                transition={{ duration: 0.4, type: 'spring', stiffness: 100 }}
              />
            </motion.div>
          ))}
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="bg-white/95 backdrop-blur-md rounded-3xl shadow-xl border-4 border-blue-500/50 ring-2 ring-blue-100/30 p-8 mb-12"
        >
          <h3 className="text-3xl font-inter font-extrabold text-blue-900 mb-6 flex items-center gap-3">
            <FaFilter className="text-blue-600 text-2xl" />
            Advanced Filters
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            <div>
              <label className="block text-blue-800 font-semibold mb-2 flex items-center gap-2 text-lg font-poppins">
                <FaSearch className="text-blue-600" />
                Student Name
              </label>
              <input
                type="text"
                placeholder="Search by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300 font-poppins text-blue-900 placeholder-blue-400/60 text-lg"
              />
            </div>
            <div>
              <label className="block text-blue-800 font-semibold mb-2 flex items-center gap-2 text-lg font-poppins">
                <FaGraduationCap className="text-blue-600" />
                Degree
              </label>
              <select
                value={degreeFilter}
                onChange={(e) => setDegreeFilter(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300 font-poppins text-blue-900 text-lg"
              >
                <option value="">All Degrees</option>
                {DEGREE_OPTIONS.map((degree) => (
                  <option key={degree} value={degree}>{degree}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-blue-800 font-semibold mb-2 flex items-center gap-2 text-lg font-poppins">
                <FaVenusMars className="text-blue-600" />
                Gender
              </label>
              <select
                value={genderFilter}
                onChange={(e) => setGenderFilter(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300 font-poppins text-blue-900 text-lg"
              >
                <option value="">All Genders</option>
                {GENDER_OPTIONS.map((gender) => (
                  <option key={gender} value={gender}>{gender}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-blue-800 font-semibold mb-2 flex items-center gap-2 text-lg font-poppins">
                <FaUtensils className="text-blue-600" />
                Lunch Preference
              </label>
              <select
                value={lunchFilter}
                onChange={(e) => setLunchFilter(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300 font-poppins text-blue-900 text-lg"
              >
                <option value="">All Preferences</option>
                {LUNCH_OPTIONS.map((lunch) => (
                  <option key={lunch} value={lunch}>{lunch}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-blue-800 font-semibold mb-2 flex items-center gap-2 text-lg font-poppins">
                <FaUsers className="text-blue-600" />
                Community
              </label>
              <select
                value={communityFilter}
                onChange={(e) => setCommunityFilter(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300 font-poppins text-blue-900 text-lg"
              >
                <option value="">All Communities</option>
                {COMMUNITY_OPTIONS.map((community) => (
                  <option key={community} value={community}>{community}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-blue-800 font-semibold mb-2 flex items-center gap-2 text-lg font-poppins">
                <FaGlobe className="text-blue-600" />
                Nationality
              </label>
              <input
                type="text"
                placeholder="Search by nationality..."
                value={nationalityFilter}
                onChange={(e) => setNationalityFilter(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300 font-poppins text-blue-900 placeholder-blue-400/60 text-lg"
              />
            </div>
            <div>
              <label className="block text-blue-800 font-semibold mb-2 flex items-center gap-2 text-lg font-poppins">
                <FaPray className="text-blue-600" />
                Religion
              </label>
              <input
                type="text"
                placeholder="Search by religion..."
                value={religionFilter}
                onChange={(e) => setReligionFilter(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300 font-poppins text-blue-900 placeholder-blue-400/60 text-lg"
              />
            </div>
            <div>
              <label className="block text-blue-800 font-semibold mb-2 flex items-center gap-2 text-lg font-poppins">
                <FaMapMarkerAlt className="text-blue-600" />
                Place of Birth
              </label>
              <select
                value={placeOfBirthFilter}
                onChange={(e) => setPlaceOfBirthFilter(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300 font-poppins text-blue-900 text-lg"
              >
                <option value="">All Places</option>
                {DISTRICT_OPTIONS.map((district) => (
                  <option key={district} value={district}>{district}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-blue-800 font-semibold mb-2 flex items-center gap-2 text-lg font-poppins">
                <FaUserGraduate className="text-blue-600" />
                Registered Graduate
              </label>
              <select
                value={isRegisteredGraduateFilter}
                onChange={(e) => setIsRegisteredGraduateFilter(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300 font-poppins text-blue-900 text-lg"
              >
                <option value="">All</option>
                {REGISTERED_GRADUATE_OPTIONS.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="bg-white/95 backdrop-blur-md rounded-3xl shadow-xl border-4 border-blue-600/50 ring-2 ring-blue-100/30 hover:ring-blue-300/50 transition-all duration-400 p-8"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-3xl font-inter font-extrabold text-blue-900 flex items-center gap-3">
              <FaUniversity className="text-blue-600 text-2xl" />
              Student Registration Records
            </h3>
            <motion.button
              onClick={downloadCSV}
              whileHover={{ scale: 1.05, boxShadow: '0 0 25px rgba(59,130,246,0.8)' }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-400 text-white rounded-2xl font-poppins font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 border-2 border-blue-300/50"
            >
              <FaFileExcel className="text-xl" />
              Export CSV
            </motion.button>
          </div>
          <div className="flex justify-between items-center mb-4 text-blue-800">
            <div className="flex items-center gap-2">
              <label className="font-poppins font-semibold text-lg">Show</label>
              <select
                value={entriesPerPage}
                onChange={(e) => {
                  setEntriesPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-3 py-2 rounded-2xl bg-gray-50 border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300 font-poppins text-blue-900 text-lg"
              >
                {[10, 25, 50, 100].map((num) => (
                  <option key={num} value={num}>{num} entries</option>
                ))}
              </select>
            </div>
            <div className="font-poppins text-lg">
              Showing {indexOfFirstEntry + 1} to {Math.min(indexOfLastEntry, filteredStudents.length)} of {filteredStudents.length} entries
            </div>
          </div>
          <div className="overflow-x-auto">
            {currentEntries.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
                className="flex flex-col items-center justify-center py-16"
              >
                <motion.div
                  className="relative w-24 h-24 mb-6 flex items-center justify-center"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full shadow-lg" />
                  <FaUsers className="relative z-10 text-5xl text-white" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }} />
                  <div className="absolute inset-0 bg-blue-300/30 rounded-full animate-pulse" />
                </motion.div>
                <h3 className="text-2xl font-inter font-bold text-blue-900 mb-2">No Students Found</h3>
                <p className="text-lg font-poppins text-blue-600/80">Try adjusting your filters to see more results.</p>
              </motion.div>
            ) : (
              <table className="w-full table-auto border-collapse text-base">
                <thead>
                  <tr className="bg-blue-600 text-white">
                    <th className="px-6 py-4 text-left font-poppins font-extrabold text-lg">Full Name</th>
                    <th className="px-6 py-4 text-left font-poppins font-extrabold text-lg">Date of Birth</th>
                    <th className="px-6 py-4 text-left font-poppins font-extrabold text-lg">Gender</th>
                    <th className="px-6 py-4 text-left font-poppins font-extrabold text-lg">Guardian Name</th>
                    <th className="px-6 py-4 text-left font-poppins font-extrabold text-lg">Nationality</th>
                    <th className="px-6 py-4 text-left font-poppins font-extrabold text-lg">Religion</th>
                    <th className="px-6 py-4 text-left font-poppins font-extrabold text-lg">Email</th>
                    <th className="px-6 py-4 text-left font-poppins font-extrabold text-lg">Mobile Number</th>
                    <th className="px-6 py-4 text-left font-poppins font-extrabold text-lg">Place of Birth</th>
                    <th className="px-6 py-4 text-left font-poppins font-extrabold text-lg">Community</th>
                    <th className="px-6 py-4 text-left font-poppins font-extrabold text-lg">Mother Tongue</th>
                    <th className="px-6 py-4 text-left font-poppins font-extrabold text-lg">Aadhar Number</th>
                    <th className="px-6 py-4 text-left font-poppins font-extrabold text-lg">Degree Name</th>
                    <th className="px-6 py-4 text-left font-poppins font-extrabold text-lg">University Name</th>
                    <th className="px-6 py-4 text-left font-poppins font-extrabold text-lg">Degree Pattern</th>
                    <th className="px-6 py-4 text-left font-poppins font-extrabold text-lg">Convocation Year</th>
                    <th className="px-6 py-4 text-left font-poppins font-extrabold text-lg">Registered Graduate</th>
                    <th className="px-6 py-4 text-left font-poppins font-extrabold text-lg">Occupation</th>
                    <th className="px-6 py-4 text-left font-poppins font-extrabold text-lg">Address</th>
                    <th className="px-6 py-4 text-left font-poppins font-extrabold text-lg">Lunch Required</th>
                    <th className="px-6 py-4 text-left font-poppins font-extrabold text-lg">Companion Option</th>
                    <th className="px-6 py-4 text-left font-poppins font-extrabold text-lg">Created At</th>
                    <th className="px-6 py-4 text-left font-poppins font-extrabold text-lg">Updated At</th>
                    <th className="px-6 py-4 text-left font-poppins font-extrabold text-lg">Documents</th>
                  </tr>
                </thead>
                <tbody>
                  {currentEntries.map((student, index) => (
                    <motion.tr
                      key={student.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.05 }}
                      className="border-b border-blue-100 hover:bg-blue-50/70 transition-all duration-200"
                    >
                      <td className="px-6 py-4 font-poppins font-bold text-blue-900 text-lg">{student.full_name}</td>
                      <td className="px-6 py-4 font-poppins font-bold text-blue-900 text-lg">{student.date_of_birth}</td>
                      <td className="px-6 py-4 font-poppins font-bold text-blue-900 text-lg">{student.gender}</td>
                      <td className="px-6 py-4 font-poppins font-bold text-blue-900 text-lg">{student.guardian_name}</td>
                      <td className="px-6 py-4 font-poppins font-bold text-blue-900 text-lg">{student.nationality}</td>
                      <td className="px-6 py-4 font-poppins font-bold text-blue-900 text-lg">{student.religion}</td>
                      <td className="px-6 py-4 font-poppins font-bold text-blue-900 text-lg">{student.email || 'N/A'}</td>
                      <td className="px-6 py-4 font-poppins font-bold text-blue-900 text-lg">{student.mobile_number}</td>
                      <td className="px-6 py-4 font-poppins font-bold text-blue-900 text-lg">{student.place_of_birth}</td>
                      <td className="px-6 py-4 font-poppins font-bold text-blue-900 text-lg">{student.community}</td>
                      <td className="px-6 py-4 font-poppins font-bold text-blue-900 text-lg">{student.mother_tongue}</td>
                      <td className="px-6 py-4 font-poppins font-bold text-blue-900 text-lg">{student.aadhar_number}</td>
                      <td className="px-6 py-4 font-poppins font-bold text-blue-900 text-lg">{student.degree_name}</td>
                      <td className="px-6 py-4 font-poppins font-bold text-blue-900 text-lg">{student.university_name}</td>
                      <td className="px-6 py-4 font-poppins font-bold text-blue-900 text-lg">{student.degree_pattern}</td>
                      <td className="px-6 py-4 font-poppins font-bold text-blue-900 text-lg">{student.convocation_year}</td>
                      <td className="px-6 py-4 font-poppins font-bold text-blue-900 text-lg">{student.is_registered_graduate ? 'Yes' : 'No'}</td>
                      <td className="px-6 py-4 font-poppins font-bold text-blue-900 text-lg">{student.occupation}</td>
                      <td className="px-6 py-4 font-poppins font-bold text-blue-900 text-lg">{student.address}</td>
                      <td className="px-6 py-4 font-poppins font-bold text-blue-900 text-lg">{student.lunch_required}</td>
                      <td className="px-6 py-4 font-poppins font-bold text-blue-900 text-lg">{student.companion_option}</td>
                      <td className="px-6 py-4 font-poppins font-bold text-blue-900 text-lg">{new Date(student.created_at).toLocaleString()}</td>
                      <td className="px-6 py-4 font-poppins font-bold text-blue-900 text-lg">{new Date(student.updated_at).toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <motion.button
                          onClick={() => openDocumentModal(student)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="px-4 py-2 bg-blue-600 text-white rounded-xl font-poppins font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                          View Documents
                        </motion.button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          {currentEntries.length > 0 && (
            <div className="flex justify-between items-center mt-6">
              <motion.button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-4 py-2 bg-blue-600 text-white rounded-2xl font-poppins font-semibold text-lg ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Previous
              </motion.button>
              <div className="flex gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <motion.button
                    key={page}
                    onClick={() => paginate(page)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className={`px-4 py-2 rounded-2xl font-poppins font-semibold text-lg ${currentPage === page ? 'bg-blue-600 text-white' : 'bg-gray-100 text-blue-900 border border-blue-200'}`}
                  >
                    {page}
                  </motion.button>
                ))}
              </div>
              <motion.button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-4 py-2 bg-blue-600 text-white rounded-2xl font-poppins font-semibold text-lg ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Next
              </motion.button>
            </div>
          )}
        </motion.div>
      </motion.div>
      <AnimatePresence>
        {modalOpen && selectedStudent && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setModalOpen(false)}
          >
            <motion.div
              className="modal-content"
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              transition={{ duration: 0.4, type: 'spring', stiffness: 100 }}
              onClick={(e) => e.stopPropagation()}
            >
              <motion.button
                className="absolute top-4 right-4 text-gray-600 hover:text-red-600"
                onClick={() => setModalOpen(false)}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
              >
                <FaTimes size={24} />
              </motion.button>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-inter font-extrabold text-blue-900">
                  Documents for {selectedStudent.full_name}
                </h2>
                <motion.button
                  className="document-button download-all-button"
                  onClick={() => downloadAllDocuments(selectedStudent.id, selectedStudent.full_name)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={isLoadingDocument}
                >
                  <FaDownload />
                  Download All
                </motion.button>
              </div>
              <div className="grid gap-6">
                {[
                  { type: 'applicant_photo', label: 'Applicant Photo', icon: FaImage },
                  { type: 'aadhar_copy', label: 'Aadhar Copy', icon: FaFilePdf },
                  { type: 'residence_certificate', label: 'Residence Certificate', icon: FaFilePdf },
                  { type: 'degree_certificate', label: 'Degree Certificate', icon: FaFilePdf },
                  { type: 'other_university_certificate', label: 'Other University Certificate', icon: FaFilePdf, conditional: selectedStudent.is_registered_graduate },
                  { type: 'signature', label: 'Signature', icon: FaImage },
                ].map((doc, index) => (
                  doc.conditional !== false && (
                    <motion.div
                      key={doc.type}
                      className="modal-section"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-poppins font-semibold text-blue-800 flex items-center gap-2">
                          <doc.icon className="text-blue-600" />
                          {doc.label}
                        </h3>
                        <div className="flex gap-3">
                          <motion.button
                            className="document-button view-button"
                            onClick={() => viewDocument(selectedStudent.id, doc.type)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            disabled={isLoadingDocument}
                          >
                            <FaEye />
                            View
                          </motion.button>
                          <motion.button
                            className="document-button download-button"
                            onClick={() => downloadFile(selectedStudent.id, doc.type)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            disabled={isLoadingDocument}
                          >
                            <FaFileDownload />
                            Download
                          </motion.button>
                        </div>
                      </div>
                      {isLoadingDocument && (
                        <div className="loading-spinner">
                          <FaSpinner className="animate-spin text-3xl" />
                        </div>
                      )}
                    </motion.div>
                  )
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
