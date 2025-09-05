import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, GoogleAuthProvider, OAuthProvider, signInWithPopup, onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { getFirestore, doc, setDoc, updateDoc, getDoc } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';
import { getStorage } from 'firebase/storage';
import { ChevronRight, Sun, Moon, AtSign, KeyRound, User, CircleCheck, CircleX } from 'lucide-react';

const branches = [
  'CSE', 'IT', 'ECE', 'EEE', 'MECH', 'CIVIL', 'AERO', 'AUTO', 'BME', 'CHEM', 'IOT', 'AI', 'DS', 'CSBS'
];
const semesters = ['1', '2', '3', '4', '5', '6', '7', '8'];

// --- Main App Component ---
export default function App() {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    admissionNo: '',
    branch: '',
    semester: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, text: '', type: 'info' });
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');

  // Modal states
  const [showForgot, setShowForgot] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

  const [showSocialModal, setShowSocialModal] = useState(false);
  const [socialUser, setSocialUser] = useState(null);
  const [socialForm, setSocialForm] = useState({ admissionNo: '', branch: '', semester: '', phone: '' });
  const [socialErrors, setSocialErrors] = useState({});
  const [socialLoading, setSocialLoading] = useState(false);

  // Firebase state
  const [firebase, setFirebase] = useState(null);
  const [auth, setAuth] = useState(null);
  const [db, setDb] = useState(null);
  const [user, setUser] = useState(null);
  const isAuthReady = useRef(false);

  // Initialize Firebase and Auth listener
  useEffect(() => {
    // Firebase global variables are provided by the Canvas environment
    const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
    const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};

    try {
      const app = initializeApp(firebaseConfig);
      const authInstance = getAuth(app);
      const dbInstance = getFirestore(app);

      setFirebase(app);
      setAuth(authInstance);
      setDb(dbInstance);

      // Auth state change listener
      const unsubscribe = onAuthStateChanged(authInstance, async (currentUser) => {
        if (!isAuthReady.current) {
          isAuthReady.current = true;
          // Use custom token if available, otherwise sign in anonymously
          if (typeof __initial_auth_token !== 'undefined') {
            await signInWithCustomToken(authInstance, __initial_auth_token);
          } else {
            await signInAnonymously(authInstance);
          }
        }
        setUser(currentUser);
      });

      return () => unsubscribe();
    } catch (error) {
      console.error("Firebase initialization failed:", error);
    }
  }, []);

  // Update body class for dark mode
  useEffect(() => {
    document.body.classList.toggle('dark', darkMode);
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  // Password strength
  const getPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) strength++;
    return strength;
  };

  // Form handlers
  const handleChange = (e) => {
    setForm({ ...form, [e.target.id]: e.target.value });
    setErrors({ ...errors, [e.target.id]: '' });
  };

  // Validate form fields
  const validate = () => {
    const errs = {};
    if (!form.email) {
      errs.email = 'Email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      errs.email = 'Invalid email';
    }
    if (!form.password) {
      errs.password = 'Password is required';
    } else if (form.password.length < 6) {
      errs.password = 'Password must be at least 6 characters long';
    }
    if (!isLogin) {
      if (!form.name) errs.name = 'Full name required';
      if (!form.admissionNo) errs.admissionNo = 'Admission number required';
      if (!form.branch) errs.branch = 'Select a branch';
      if (!form.semester) errs.semester = 'Select a semester';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Social form validation
  const validateSocialForm = () => {
    const errs = {};
    if (!socialForm.admissionNo) errs.admissionNo = 'Admission number required';
    if (!socialForm.branch) errs.branch = 'Select a branch';
    if (!socialForm.semester) errs.semester = 'Select a semester';
    if (socialForm.phone && !/^\d{10,}$/.test(socialForm.phone.replace(/\D/g, ''))) {
      errs.phone = 'Valid phone number required';
    }
    setSocialErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Show Toast notification
  const showToast = (text, type = 'info') => {
    setToast({ show: true, text, type });
    setTimeout(() => {
      setToast({ show: false, text: '', type: 'info' });
    }, 3000);
  };

  // Handle email/password login or register
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, form.email, form.password);
        showToast('Login successful!', 'success');
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, form.email, form.password);
        const userData = {
          name: form.name,
          admissionNo: form.admissionNo,
          email: form.email,
          role: 'student',
          branch: form.branch,
          semester: form.semester,
          createdAt: Date.now(),
          lastLoginAt: Date.now(),
          loginCount: 1
        };
        await setDoc(doc(db, 'users', userCredential.user.uid), userData);
        showToast('Registration successful! Please login.', 'success');
        setTimeout(() => setIsLogin(true), 1500);
      }
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle Google login
  const handleSocialLogin = async (providerName) => {
    setLoading(true);
    let provider;
    if (providerName === 'google') {
      provider = new GoogleAuthProvider();
    } else if (providerName === 'microsoft') {
      provider = new OAuthProvider('microsoft.com');
    }

    try {
      const result = await signInWithPopup(auth, provider);
      const userDocRef = doc(db, 'users', result.user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        setSocialUser({
          name: result.user.displayName || 'Social User',
          email: result.user.email,
          photoURL: result.user.photoURL,
          provider: providerName
        });
        setShowSocialModal(true);
      } else {
        await updateDoc(userDocRef, {
          lastLoginAt: Date.now(),
          loginCount: userDoc.data().loginCount + 1
        });
        showToast(`${providerName} login successful!`, 'success');
      }
    } catch (error) {
      showToast(`${providerName} sign-in failed.`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle forgot password
  const handleForgotPassword = async () => {
    if (!resetEmail || !/^\S+@\S+\.\S+$/.test(resetEmail)) {
      showToast('Please enter a valid email address.', 'error');
      return;
    }
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      showToast('Password reset email sent! Check your inbox.', 'success');
      setTimeout(() => setShowForgot(false), 3000);
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle social registration submit
  const handleSocialSubmit = async (e) => {
    e.preventDefault();
    if (!validateSocialForm()) return;
    setSocialLoading(true);
    try {
      const userData = {
        name: socialUser.name,
        admissionNo: socialForm.admissionNo,
        email: socialUser.email,
        role: 'student',
        branch: socialForm.branch,
        semester: socialForm.semester,
        phone: socialForm.phone || null,
        provider: socialUser.provider,
        photoURL: socialUser.photoURL || null,
        createdAt: Date.now(),
        lastLoginAt: Date.now(),
        loginCount: 1
      };
      await setDoc(doc(db, 'users', auth.currentUser.uid), userData);
      showToast('Registration successful! Redirecting...', 'success');
      setTimeout(() => {
        setShowSocialModal(false);
        setSocialForm({ admissionNo: '', branch: '', semester: '', phone: '' });
        setSocialUser(null);
      }, 1500);
    } catch (error) {
      showToast('Registration failed. Please try again.', 'error');
    } finally {
      setSocialLoading(false);
    }
  };

  const getPasswordStrengthColor = (strength) => {
    switch (strength) {
      case 0:
      case 1:
        return 'bg-red-500';
      case 2:
        return 'bg-orange-500';
      case 3:
        return 'bg-yellow-500';
      case 4:
      case 5:
        return 'bg-green-500';
      default:
        return 'bg-gray-300';
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
      <div className="w-full max-w-xl mx-auto p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl transition-all duration-300 transform scale-100 hover:scale-[1.01]">
        <div className="flex flex-col items-center">
          <div className="w-24 h-24 mb-6">
            <img src="https://placehold.co/96x96/60A5FA/fff?text=Logo" alt="Logo" className="w-full h-full object-cover rounded-full shadow-lg transition-transform duration-300 hover:rotate-6" />
          </div>
          <h2 className="text-3xl font-bold mb-2 text-center text-gray-800 dark:text-white transition-colors duration-300">
            {isLogin ? 'Welcome Back!' : 'Create Your Account'}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-center mb-8 transition-colors duration-300">
            {isLogin ? 'Sign in to access your dashboard' : 'Join us and start your journey'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
            <div className="relative">
              <input
                type="text"
                id="name"
                value={form.name}
                onChange={handleChange}
                className={`w-full p-3 pl-10 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all duration-300 ${errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white'}`}
                placeholder="Full Name"
                required
              />
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 transition-colors duration-300" size={20} />
              {errors.name && <div className="mt-1 text-sm text-red-500">{errors.name}</div>}
            </div>
          )}

          <div className="relative">
            <input
              type="email"
              id="email"
              value={form.email}
              onChange={handleChange}
              className={`w-full p-3 pl-10 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all duration-300 ${errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white'}`}
              placeholder="Email Address"
              required
            />
            <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 transition-colors duration-300" size={20} />
            {errors.email && <div className="mt-1 text-sm text-red-500">{errors.email}</div>}
          </div>

          <div className="relative">
            <input
              type="password"
              id="password"
              value={form.password}
              onChange={handleChange}
              className={`w-full p-3 pl-10 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all duration-300 ${errors.password ? 'border-red-500' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white'}`}
              placeholder="Password"
              required
            />
            <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 transition-colors duration-300" size={20} />
            {errors.password && <div className="mt-1 text-sm text-red-500">{errors.password}</div>}
            {!isLogin && form.password.length > 0 && (
              <div className="mt-2 h-2 rounded-full overflow-hidden">
                <div className={`h-full transition-all duration-300 ${getPasswordStrengthColor(getPasswordStrength(form.password))}`} style={{ width: `${(getPasswordStrength(form.password) / 5) * 100}%` }}></div>
              </div>
            )}
          </div>

          {!isLogin && (
            <>
              <div className="relative">
                <input
                  type="text"
                  id="admissionNo"
                  value={form.admissionNo}
                  onChange={handleChange}
                  className={`w-full p-3 pl-10 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all duration-300 ${errors.admissionNo ? 'border-red-500' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white'}`}
                  placeholder="Admission Number"
                  required
                />
                <ChevronRight className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 transition-colors duration-300" size={20} />
                {errors.admissionNo && <div className="mt-1 text-sm text-red-500">{errors.admissionNo}</div>}
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="relative">
                  <select
                    id="branch"
                    value={form.branch}
                    onChange={handleChange}
                    className={`w-full p-3 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all duration-300 appearance-none ${errors.branch ? 'border-red-500' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white'}`}
                    required
                  >
                    <option value="">Select Branch</option>
                    {branches.map(branch => <option key={branch} value={branch}>{branch}</option>)}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <ChevronRight className="h-5 w-5 text-gray-400 dark:text-gray-500 rotate-90" />
                  </div>
                  {errors.branch && <div className="mt-1 text-sm text-red-500">{errors.branch}</div>}
                </div>
                <div className="relative">
                  <select
                    id="semester"
                    value={form.semester}
                    onChange={handleChange}
                    className={`w-full p-3 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all duration-300 appearance-none ${errors.semester ? 'border-red-500' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white'}`}
                    required
                  >
                    <option value="">Select Semester</option>
                    {semesters.map(semester => <option key={semester} value={semester}>{semester}</option>)}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <ChevronRight className="h-5 w-5 text-gray-400 dark:text-gray-500 rotate-90" />
                  </div>
                  {errors.semester && <div className="mt-1 text-sm text-red-500">{errors.semester}</div>}
                </div>
              </div>
            </>
          )}

          <div className="space-y-4">
            <button
              type="submit"
              className="w-full p-3 rounded-lg font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all duration-300 disabled:bg-blue-300 dark:disabled:bg-blue-800 flex items-center justify-center"
              disabled={loading}
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                isLogin ? 'Login' : 'Register'
              )}
            </button>
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="w-full text-blue-600 dark:text-blue-400 font-medium hover:underline transition-colors duration-300"
              disabled={loading}
            >
              {isLogin ? 'Create an account' : 'Already have an account?'}
            </button>
          </div>
        </form>

        <div className="relative flex items-center my-8">
          <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
          <span className="flex-shrink mx-4 text-gray-500 dark:text-gray-400 text-sm">Or continue with</span>
          <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
        </div>

        <div className="flex flex-col space-y-4">
          <button
            onClick={() => handleSocialLogin('google')}
            className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-medium flex items-center justify-center space-x-2 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-300 disabled:opacity-50"
            disabled={loading}
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
            <span>Login with Google</span>
          </button>
          <button
            onClick={() => handleSocialLogin('microsoft')}
            className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-medium flex items-center justify-center space-x-2 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-300 disabled:opacity-50"
            disabled={loading}
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/microsoft.svg" alt="Microsoft" className="w-5 h-5" />
            <span>Login with Microsoft</span>
          </button>
        </div>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => setShowForgot(true)}
            className="text-sm text-gray-500 dark:text-gray-400 hover:underline transition-colors duration-300"
            disabled={loading}
          >
            Forgot your password?
          </button>
        </div>

        <div className="absolute top-4 right-4">
          <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-full text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-700 transition-colors duration-300">
            {darkMode ? <Sun size={24} /> : <Moon size={24} />}
          </button>
        </div>
      </div>

      {/* Forgot password modal */}
      {showForgot && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-opacity duration-300">
          <div className="relative w-full max-w-md p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl transition-all duration-300">
            <h2 className="text-2xl font-bold mb-4 text-center text-gray-800 dark:text-white">Reset Password</h2>
            <p className="text-center text-gray-500 dark:text-gray-400 mb-6">Enter your email to receive a password reset link.</p>
            <div className="relative mb-4">
              <input
                type="email"
                id="resetEmail"
                value={resetEmail}
                onChange={e => setResetEmail(e.target.value)}
                className="w-full p-3 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-colors duration-300 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Email Address"
                required
              />
              <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
            </div>
            <div className="flex flex-col space-y-4">
              <button
                type="button"
                onClick={handleForgotPassword}
                className="w-full p-3 rounded-lg font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all duration-300 disabled:bg-blue-300 dark:disabled:bg-blue-800 flex items-center justify-center"
                disabled={loading}
              >
                {loading ? (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : 'Send Reset Email'}
              </button>
              <button
                type="button"
                onClick={() => setShowForgot(false)}
                className="w-full p-3 rounded-lg font-bold text-gray-600 dark:text-gray-400 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-300 disabled:opacity-50"
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Social registration modal */}
      {showSocialModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-opacity duration-300">
          <div className="relative w-full max-w-md p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl transition-all duration-300">
            <h2 className="text-2xl font-bold mb-4 text-center text-gray-800 dark:text-white">Complete Registration</h2>
            <p className="text-center text-gray-500 dark:text-gray-400 mb-6">Just a few more details to set up your account.</p>
            <form onSubmit={handleSocialSubmit} className="space-y-4">
              <div className="relative">
                <input
                  type="text"
                  id="socialAdmissionNo"
                  value={socialForm.admissionNo}
                  onChange={e => setSocialForm({ ...socialForm, admissionNo: e.target.value })}
                  className={`w-full p-3 pl-10 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all duration-300 ${socialErrors.admissionNo ? 'border-red-500' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white'}`}
                  placeholder="Admission Number"
                  required
                />
                <ChevronRight className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
                {socialErrors.admissionNo && <div className="mt-1 text-sm text-red-500">{socialErrors.admissionNo}</div>}
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="relative">
                  <select
                    id="socialBranch"
                    value={socialForm.branch}
                    onChange={e => setSocialForm({ ...socialForm, branch: e.target.value })}
                    className={`w-full p-3 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all duration-300 appearance-none ${socialErrors.branch ? 'border-red-500' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white'}`}
                    required
                  >
                    <option value="">Select Branch</option>
                    {branches.map(branch => <option key={branch} value={branch}>{branch}</option>)}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <ChevronRight className="h-5 w-5 text-gray-400 dark:text-gray-500 rotate-90" />
                  </div>
                  {socialErrors.branch && <div className="mt-1 text-sm text-red-500">{socialErrors.branch}</div>}
                </div>
                <div className="relative">
                  <select
                    id="socialSemester"
                    value={socialForm.semester}
                    onChange={e => setSocialForm({ ...socialForm, semester: e.target.value })}
                    className={`w-full p-3 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all duration-300 appearance-none ${socialErrors.semester ? 'border-red-500' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white'}`}
                    required
                  >
                    <option value="">Select Semester</option>
                    {semesters.map(semester => <option key={semester} value={semester}>{semester}</option>)}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <ChevronRight className="h-5 w-5 text-gray-400 dark:text-gray-500 rotate-90" />
                  </div>
                  {socialErrors.semester && <div className="mt-1 text-sm text-red-500">{socialErrors.semester}</div>}
                </div>
              </div>
              
              <div className="relative">
                <input
                  type="text"
                  id="socialPhone"
                  value={socialForm.phone}
                  onChange={e => setSocialForm({ ...socialForm, phone: e.target.value })}
                  className={`w-full p-3 pl-10 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all duration-300 ${socialErrors.phone ? 'border-red-500' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white'}`}
                  placeholder="Phone (optional)"
                />
                <ChevronRight className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
                {socialErrors.phone && <div className="mt-1 text-sm text-red-500">{socialErrors.phone}</div>}
              </div>

              <div className="flex flex-col space-y-4 mt-6">
                <button
                  type="submit"
                  className="w-full p-3 rounded-lg font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all duration-300 disabled:bg-blue-300 dark:disabled:bg-blue-800 flex items-center justify-center"
                  disabled={socialLoading}
                >
                  {socialLoading ? (
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : 'Complete Registration'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowSocialModal(false)}
                  className="w-full p-3 rounded-lg font-bold text-gray-600 dark:text-gray-400 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-300 disabled:opacity-50"
                  disabled={socialLoading}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast notifications */}
      <div className={`fixed bottom-4 left-1/2 -translate-x-1/2 p-4 rounded-lg shadow-lg text-white transition-transform duration-300 transform ${toast.show ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0'} ${toast.type === 'success' ? 'bg-green-500' : toast.type === 'error' ? 'bg-red-500' : 'bg-gray-500'}`}>
        <div className="flex items-center space-x-2">
          {toast.type === 'success' && <CircleCheck size={20} />}
          {toast.type === 'error' && <CircleX size={20} />}
          <span>{toast.text}</span>
        </div>
      </div>
    </div>
  );
}
