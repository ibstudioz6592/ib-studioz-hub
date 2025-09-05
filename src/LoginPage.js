import React, { useState, useEffect, useRef } from 'react';
import './LoginPage.css';
import { useDashboardContext } from './DashboardContext';

// Toast and Modal will be implemented as separate components later

const branches = [
  'CSE','IT','ECE','EEE','MECH','CIVIL','AERO','AUTO','BME','CHEM','IOT','AI','DS','CSBS'
];
const semesters = ['1','2','3','4','5','6','7','8'];

function LoginPage() {
  const { firebase, auth, db, user } = useDashboardContext();
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
  const [message, setMessage] = useState('');
  const [toast, setToast] = useState({ show: false, text: '', type: 'info' });
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');
  // Modal states
  const [showForgot, setShowForgot] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [showSocialModal, setShowSocialModal] = useState(false);
  const [socialUser, setSocialUser] = useState(null);
  const [socialForm, setSocialForm] = useState({ admissionNo: '', branch: '', semester: '', phone: '' });
  const [socialErrors, setSocialErrors] = useState({});
  const [socialLoading, setSocialLoading] = useState(false);
  const [socialMessage, setSocialMessage] = useState('');

  useEffect(() => {
    document.body.classList.toggle('dark-mode', darkMode);
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  // Password strength
  const getPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[$@#&!]/.test(password)) strength++;
    return strength;
  };

  // Form handlers
  const handleChange = e => {
    setForm({ ...form, [e.target.id]: e.target.value });
    setErrors({ ...errors, [e.target.id]: '' });
  };

  const validate = () => {
    const errs = {};
    if (!form.email) errs.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = 'Invalid email';
    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 6) errs.password = 'Min 6 characters';
    if (!isLogin) {
      if (!form.name) errs.name = 'Full name required';
      if (!form.admissionNo) errs.admissionNo = 'Admission number required';
      if (!form.branch) errs.branch = 'Select branch';
      if (!form.semester) errs.semester = 'Select semester';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Social form validation
  const validateSocialForm = () => {
    const errs = {};
    if (!socialForm.admissionNo) errs.admissionNo = 'Admission number required';
    if (!socialForm.branch) errs.branch = 'Select branch';
    if (!socialForm.semester) errs.semester = 'Select semester';
    if (socialForm.phone && !/^\d{10,}$/.test(socialForm.phone.replace(/\D/g, ''))) errs.phone = 'Valid phone required';
    setSocialErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Handle login/register submit
  const handleSubmit = async e => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setMessage('');
    try {
      if (isLogin) {
        const userCredential = await auth.signInWithEmailAndPassword(form.email, form.password);
        await db.collection('users').doc(userCredential.user.uid).update({
          lastLoginAt: firebase.firestore.FieldValue.serverTimestamp(),
          loginCount: firebase.firestore.FieldValue.increment(1)
        });
        setToast({ show: true, text: 'Login successful!', type: 'success' });
      } else {
        const userCredential = await auth.createUserWithEmailAndPassword(form.email, form.password);
        const userData = {
          name: form.name,
          admissionNo: form.admissionNo,
          email: form.email,
          role: 'student',
          branch: form.branch,
          semester: form.semester,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          lastLoginAt: firebase.firestore.FieldValue.serverTimestamp(),
          loginCount: 1
        };
        await db.collection('users').doc(userCredential.user.uid).set(userData);
        setMessage('Registration successful! Please login.');
        setToast({ show: true, text: 'Registration successful! Please login.', type: 'success' });
        setTimeout(() => setIsLogin(true), 1500);
      }
    } catch (error) {
      setMessage(error.message);
      setToast({ show: true, text: error.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Google login
  const handleGoogleLogin = async () => {
    setLoading(true);
    setMessage('');
    try {
      const provider = new firebase.auth.GoogleAuthProvider();
      const result = await auth.signInWithPopup(provider);
      const userDoc = await db.collection('users').doc(result.user.uid).get();
      if (!userDoc.exists) {
        setSocialUser({
          name: result.user.displayName || 'Google User',
          email: result.user.email,
          photoURL: result.user.photoURL,
          provider: 'Google'
        });
        setShowSocialModal(true);
      } else {
        await db.collection('users').doc(result.user.uid).update({
          lastLoginAt: firebase.firestore.FieldValue.serverTimestamp(),
          loginCount: firebase.firestore.FieldValue.increment(1)
        });
        setToast({ show: true, text: 'Google login successful!', type: 'success' });
      }
    } catch (error) {
      setMessage('Google sign-in failed. Please try again.');
      setToast({ show: true, text: 'Google sign-in failed. Please try again.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Microsoft login
  const handleMicrosoftLogin = async () => {
    setLoading(true);
    setMessage('');
    try {
      const provider = new firebase.auth.OAuthProvider('microsoft.com');
      const result = await auth.signInWithPopup(provider);
      const userDoc = await db.collection('users').doc(result.user.uid).get();
      if (!userDoc.exists) {
        setSocialUser({
          name: result.user.displayName || 'Microsoft User',
          email: result.user.email,
          photoURL: result.user.photoURL,
          provider: 'Microsoft'
        });
        setShowSocialModal(true);
      } else {
        await db.collection('users').doc(result.user.uid).update({
          lastLoginAt: firebase.firestore.FieldValue.serverTimestamp(),
          loginCount: firebase.firestore.FieldValue.increment(1)
        });
        setToast({ show: true, text: 'Microsoft login successful!', type: 'success' });
      }
    } catch (error) {
      setMessage('Microsoft sign-in failed. Please try again.');
      setToast({ show: true, text: 'Microsoft sign-in failed. Please try again.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Forgot password
  const handleForgotPassword = async () => {
    if (!resetEmail) {
      setResetMessage('Please enter your email address');
      setToast({ show: true, text: 'Please enter your email address', type: 'error' });
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(resetEmail)) {
      setResetMessage('Please enter a valid email address');
      setToast({ show: true, text: 'Please enter a valid email address', type: 'error' });
      return;
    }
    setResetMessage('');
    setLoading(true);
    try {
      await auth.sendPasswordResetEmail(resetEmail);
      setResetMessage('Password reset email sent! Check your inbox.');
      setToast({ show: true, text: 'Password reset email sent! Check your inbox.', type: 'success' });
      setTimeout(() => setShowForgot(false), 3000);
    } catch (error) {
      setResetMessage(error.message);
      setToast({ show: true, text: error.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Social registration submit
  const handleSocialSubmit = async e => {
    e.preventDefault();
    if (!validateSocialForm()) return;
    setSocialLoading(true);
    setSocialMessage('');
    try {
      const userData = {
        name: socialUser.name,
        admissionNo: socialForm.admissionNo,
        email: socialUser.email,
        role: 'student',
        branch: socialForm.branch,
        semester: socialForm.semester,
        phone: socialForm.phone,
        provider: socialUser.provider,
        photoURL: socialUser.photoURL,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        lastLoginAt: firebase.firestore.FieldValue.serverTimestamp(),
        loginCount: 1
      };
      await db.collection('users').doc(auth.currentUser.uid).set(userData);
      setSocialMessage('Registration successful! Redirecting...');
      setToast({ show: true, text: 'Registration successful! Redirecting...', type: 'success' });
      setTimeout(() => {
        setShowSocialModal(false);
        setSocialForm({ admissionNo: '', branch: '', semester: '', phone: '' });
        setSocialUser(null);
      }, 1500);
    } catch (error) {
      setSocialMessage('Registration failed. Please try again.');
      setToast({ show: true, text: 'Registration failed. Please try again.', type: 'error' });
    } finally {
      setSocialLoading(false);
    }
  };

  return (
    <>
      <div className="aurora-background"></div>
      <button className="dark-mode-toggle" onClick={() => setDarkMode(d => !d)} title="Toggle dark mode">
        <i className={darkMode ? 'fas fa-sun' : 'fas fa-moon'}></i>
      </button>
      <div className="container auth-container">
        <div className="auth-card">
          <div className="brand-logo">
            {/* SVG logo */}
            <svg width="50" height="50" viewBox="0 0 100 100">
              <defs>
                <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFD700" />
                  <stop offset="100%" stopColor="#FFA500" />
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              <circle cx="50" cy="50" r="45" fill="url(#goldGradient)" filter="url(#glow)" />
              <g fill="#121212" filter="url(#glow)">
                <rect x="30" y="25" width="12" height="50" rx="2" />
                <path d="M50,25 L50,75 L65,75 C75,75 80,70 80,62 C80,55 75,50 68,50 C75,50 80,45 80,38 C80,30 75,25 65,25 Z M55,35 L65,35 C68,35 70,37 70,40 C70,43 68,45 65,45 L55,45 Z M55,55 L65,55 C68,55 70,57 70,60 C70,63 68,65 65,65 L55,65 Z" />
              </g>
            </svg>
            <h1 className="brand-title-animated">IB STUDIOZ</h1>
          </div>
          <p className="auth-subtitle">Online Resources Hub</p>
          <form onSubmit={handleSubmit} noValidate>
            <h2>{isLogin ? 'Login' : 'Register'}</h2>
            {!isLogin && (
              <div className="form-group">
                <label htmlFor="name"><i className="fas fa-user"></i> Full Name</label>
                <input type="text" id="name" value={form.name} onChange={handleChange} placeholder="Enter your full name" />
                {errors.name && <div className="error-message">{errors.name}</div>}
              </div>
            )}
            <div className="form-group">
              <label htmlFor="email"><i className="fas fa-envelope"></i> Email Address</label>
              <input type="email" id="email" value={form.email} onChange={handleChange} placeholder="Enter your email address" required />
              {errors.email && <div className="error-message">{errors.email}</div>}
            </div>
            {!isLogin && (
              <div className="form-group">
                <label htmlFor="admissionNo"><i className="fas fa-id-card"></i> Admission No</label>
                <input type="text" id="admissionNo" value={form.admissionNo} onChange={handleChange} placeholder="e.g., 717821F123" />
                {errors.admissionNo && <div className="error-message">{errors.admissionNo}</div>}
              </div>
            )}
            <div className="form-group">
              <label htmlFor="password"><i className="fas fa-lock"></i> Password</label>
              <input type="password" id="password" value={form.password} onChange={handleChange} placeholder="Minimum 6 characters" required />
              {errors.password && <div className="error-message">{errors.password}</div>}
              {form.password && (
                <div className="password-strength">
                  <div className="strength-bar">
                    <div className={`strength-fill strength-${['weak','medium','strong','very-strong'][Math.min(getPasswordStrength(form.password)-1,3)]}`}></div>
                  </div>
                  <div className="strength-text">{['Weak','Medium','Strong','Very strong'][Math.min(getPasswordStrength(form.password)-1,3)]} password</div>
                </div>
              )}
            </div>
            {!isLogin && (
              <div id="registration-fields">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="branch"><i className="fas fa-graduation-cap"></i> Branch</label>
                    <select id="branch" value={form.branch} onChange={handleChange}>
                      <option value="">Select branch</option>
                      {branches.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                    {errors.branch && <div className="error-message">{errors.branch}</div>}
                  </div>
                  <div className="form-group">
                    <label htmlFor="semester"><i className="fas fa-calendar-alt"></i> Semester</label>
                    <select id="semester" value={form.semester} onChange={handleChange}>
                      <option value="">Select semester</option>
                      {semesters.map(s => <option key={s} value={s}>Semester {s}</option>)}
                    </select>
                    {errors.semester && <div className="error-message">{errors.semester}</div>}
                  </div>
                </div>
              </div>
            )}
            <div className="forgot-password">
              <a href="#" onClick={e => {e.preventDefault(); setShowForgot(true);}}>Forgot Password?</a>
            </div>
            <div className="message">{message}</div>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <span className="btn-spinner"></span> : <span className="btn-text">{isLogin ? 'Login' : 'Register'}</span>}
            </button>
            <div className="divider"><span>OR</span></div>
            <button type="button" className="btn btn-social btn-google" disabled={loading} onClick={handleGoogleLogin}>
              <i className="fab fa-google"></i> Continue with Google
            </button>
            <button type="button" className="btn btn-social btn-microsoft" disabled={loading} onClick={handleMicrosoftLogin}>
              <i className="fab fa-microsoft"></i> Continue with Microsoft
            </button>
          </form>
          <p className="toggle-auth">
            <span>{isLogin ? "Don't have an account?" : 'Already have an account?'}</span>
            <a href="#" onClick={e => {e.preventDefault(); setIsLogin(l => !l); setForm({name:'',email:'',password:'',admissionNo:'',branch:'',semester:''}); setMessage(''); setErrors({});}}>
              {isLogin ? 'Register Now' : 'Login'}
            </a>
          </p>
        </div>
      </div>

      {/* Toast notification */}
      {toast.show && (
        <div className={`toast show ${toast.type}`} style={{position:'fixed',top:20,right:20,zIndex:3000}}>
          <i className={`fas ${toast.type==='success'?'fa-check-circle':toast.type==='error'?'fa-exclamation-circle':'fa-info-circle'}`}></i>
          <span>{toast.text}</span>
        </div>
      )}
      {/* Toast auto-hide effect */}
      {toast.show && setTimeout(() => setToast(t => ({...t, show: false})), 4000)}

      {/* Forgot Password Modal */}
      {showForgot && (
        <div className="modal-overlay active" onClick={e => {if(e.target.classList.contains('modal-overlay')) setShowForgot(false);}}>
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">Reset Password</h3>
              <button className="modal-close" onClick={() => setShowForgot(false)}>&times;</button>
            </div>
            <div className="form-group">
              <label htmlFor="reset-email"><i className="fas fa-envelope"></i> Email Address</label>
              <input type="email" id="reset-email" value={resetEmail} onChange={e => setResetEmail(e.target.value)} placeholder="Enter your registered email" />
            </div>
            <div className="message">{resetMessage}</div>
            <button className="btn btn-primary" onClick={handleForgotPassword} disabled={loading}>
              {loading ? <span className="btn-spinner"></span> : <span className="btn-text">Send Reset Link</span>}
            </button>
          </div>
        </div>
      )}

      {/* Social Registration Modal */}
      {showSocialModal && socialUser && (
        <div className="modal-overlay active" onClick={e => {if(e.target.classList.contains('modal-overlay')) {setShowSocialModal(false); setSocialUser(null);}}}>
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">Complete Your Registration</h3>
              <button className="modal-close" onClick={() => {setShowSocialModal(false); setSocialUser(null);}}>&times;</button>
            </div>
            <div className="social-user-info">
              <img src={socialUser.photoURL || 'https://picsum.photos/seed/avatar/60/60.jpg'} alt="Profile" className="social-avatar" />
              <div className="social-details">
                <h3>{socialUser.name}</h3>
                <p>{socialUser.email}</p>
              </div>
            </div>
            <form onSubmit={handleSocialSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="social-admission"><i className="fas fa-id-card"></i> Admission No</label>
                  <input type="text" id="social-admission" value={socialForm.admissionNo} onChange={e => setSocialForm(f => ({...f, admissionNo: e.target.value}))} placeholder="e.g., 717821F123" required />
                  {socialErrors.admissionNo && <div className="error-message">{socialErrors.admissionNo}</div>}
                </div>
                <div className="form-group">
                  <label htmlFor="social-branch"><i className="fas fa-graduation-cap"></i> Branch</label>
                  <select id="social-branch" value={socialForm.branch} onChange={e => setSocialForm(f => ({...f, branch: e.target.value}))} required>
                    <option value="">Select branch</option>
                    {branches.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                  {socialErrors.branch && <div className="error-message">{socialErrors.branch}</div>}
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="social-semester"><i className="fas fa-calendar-alt"></i> Semester</label>
                  <select id="social-semester" value={socialForm.semester} onChange={e => setSocialForm(f => ({...f, semester: e.target.value}))} required>
                    <option value="">Select semester</option>
                    {semesters.map(s => <option key={s} value={s}>Semester {s}</option>)}
                  </select>
                  {socialErrors.semester && <div className="error-message">{socialErrors.semester}</div>}
                </div>
                <div className="form-group">
                  <label htmlFor="social-phone"><i className="fas fa-phone"></i> Phone Number</label>
                  <input type="tel" id="social-phone" value={socialForm.phone} onChange={e => setSocialForm(f => ({...f, phone: e.target.value}))} placeholder="Enter your phone number" />
                  {socialErrors.phone && <div className="error-message">{socialErrors.phone}</div>}
                </div>
              </div>
              <div className="message">{socialMessage}</div>
              <button type="submit" className="btn btn-primary" disabled={socialLoading}>
                {socialLoading ? <span className="btn-spinner"></span> : <span className="btn-text">Complete Registration</span>}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default LoginPage;
