import React, { useState, useEffect, useRef } from 'react';
import './LoginPage.css';
import { useDashboardContext } from './DashboardContext.jsx';

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
      <div className={`login-page ${darkMode ? 'dark' : ''}`}>
        <div className="login-container">
          <div className="logo-container">
            <img src="/logo.png" alt="Logo" className="logo" />
          </div>
          <form className="login-form" onSubmit={handleSubmit}>
            <h2>{isLogin ? 'Login' : 'Register'}</h2>
            {message && <div className="message">{message}</div>}
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={form.email}
                onChange={handleChange}
                className={errors.email ? 'error' : ''}
                required
              />
              {errors.email && <div className="error-message">{errors.email}</div>}
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={form.password}
                onChange={handleChange}
                className={errors.password ? 'error' : ''}
                required
              />
              {errors.password && <div className="error-message">{errors.password}</div>}
            </div>
            {!isLogin && (
              <>
                <div className="form-group">
                  <label htmlFor="name">Full Name</label>
                  <input
                    type="text"
                    id="name"
                    value={form.name}
                    onChange={handleChange}
                    className={errors.name ? 'error' : ''}
                    required
                  />
                  {errors.name && <div className="error-message">{errors.name}</div>}
                </div>
                <div className="form-group">
                  <label htmlFor="admissionNo">Admission Number</label>
                  <input
                    type="text"
                    id="admissionNo"
                    value={form.admissionNo}
                    onChange={handleChange}
                    className={errors.admissionNo ? 'error' : ''}
                    required
                  />
                  {errors.admissionNo && <div className="error-message">{errors.admissionNo}</div>}
                </div>
                <div className="form-group">
                  <label htmlFor="branch">Branch</label>
                  <select
                    id="branch"
                    value={form.branch}
                    onChange={handleChange}
                    className={errors.branch ? 'error' : ''}
                    required
                  >
                    <option value="">Select branch</option>
                    {branches.map(branch => (
                      <option key={branch} value={branch}>{branch}</option>
                    ))}
                  </select>
                  {errors.branch && <div className="error-message">{errors.branch}</div>}
                </div>
                <div className="form-group">
                  <label htmlFor="semester">Semester</label>
                  <select
                    id="semester"
                    value={form.semester}
                    onChange={handleChange}
                    className={errors.semester ? 'error' : ''}
                    required
                  >
                    <option value="">Select semester</option>
                    {semesters.map(semester => (
                      <option key={semester} value={semester}>{semester}</option>
                    ))}
                  </select>
                  {errors.semester && <div className="error-message">{errors.semester}</div>}
                </div>
              </>
            )}
            <div className="form-actions">
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Loading...' : isLogin ? 'Login' : 'Register'}
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setIsLogin(!isLogin)}
                disabled={loading}
              >
                {loading ? 'Loading...' : isLogin ? 'Create an account' : 'Already have an account?'}
              </button>
            </div>
            <div className="social-login">
              <button
                type="button"
                className="btn-google"
                onClick={handleGoogleLogin}
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Login with Google'}
              </button>
              <button
                type="button"
                className="btn-microsoft"
                onClick={handleMicrosoftLogin}
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Login with Microsoft'}
              </button>
            </div>
            <div className="forgot-password">
              <button
                type="button"
                onClick={() => setShowForgot(true)}
                disabled={loading}
                className="link"
              >
                Forgot password?
              </button>
            </div>
          </form>
          <div className="theme-toggle">
            <label>
              <input
                type="checkbox"
                checked={darkMode}
                onChange={() => setDarkMode(!darkMode)}
              />
              Dark mode
            </label>
          </div>
        </div>
      </div>

      {/* Forgot password modal */}
      {showForgot && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Reset Password</h2>
            {resetMessage && <div className="message">{resetMessage}</div>}
            <div className="form-group">
              <label htmlFor="resetEmail">Email</label>
              <input
                type="email"
                id="resetEmail"
                value={resetEmail}
                onChange={e => setResetEmail(e.target.value)}
                className={resetMessage ? 'error' : ''}
                required
              />
            </div>
            <div className="form-actions">
              <button
                type="button"
                className="btn-primary"
                onClick={handleForgotPassword}
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Send reset email'}
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setShowForgot(false)}
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
        <div className="modal-overlay">
          <div className="modal">
            <h2>Complete Registration</h2>
            {socialMessage && <div className="message">{socialMessage}</div>}
            <form className="social-form" onSubmit={handleSocialSubmit}>
              <div className="form-group">
                <label htmlFor="socialAdmissionNo">Admission Number</label>
                <input
                  type="text"
                  id="socialAdmissionNo"
                  value={socialForm.admissionNo}
                  onChange={e => setSocialForm({ ...socialForm, admissionNo: e.target.value })}
                  className={socialErrors.admissionNo ? 'error' : ''}
                  required
                />
                {socialErrors.admissionNo && <div className="error-message">{socialErrors.admissionNo}</div>}
              </div>
              <div className="form-group">
                <label htmlFor="socialBranch">Branch</label>
                <select
                  id="socialBranch"
                  value={socialForm.branch}
                  onChange={e => setSocialForm({ ...socialForm, branch: e.target.value })}
                  className={socialErrors.branch ? 'error' : ''}
                  required
                >
                  <option value="">Select branch</option>
                  {branches.map(branch => (
                    <option key={branch} value={branch}>{branch}</option>
                  ))}
                </select>
                {socialErrors.branch && <div className="error-message">{socialErrors.branch}</div>}
              </div>
              <div className="form-group">
                <label htmlFor="socialSemester">Semester</label>
                <select
                  id="socialSemester"
                  value={socialForm.semester}
                  onChange={e => setSocialForm({ ...socialForm, semester: e.target.value })}
                  className={socialErrors.semester ? 'error' : ''}
                  required
                >
                  <option value="">Select semester</option>
                  {semesters.map(semester => (
                    <option key={semester} value={semester}>{semester}</option>
                  ))}
                </select>
                {socialErrors.semester && <div className="error-message">{socialErrors.semester}</div>}
              </div>
              <div className="form-group">
                <label htmlFor="socialPhone">Phone (optional)</label>
                <input
                  type="text"
                  id="socialPhone"
                  value={socialForm.phone}
                  onChange={e => setSocialForm({ ...socialForm, phone: e.target.value })}
                  className={socialErrors.phone ? 'error' : ''}
                />
                {socialErrors.phone && <div className="error-message">{socialErrors.phone}</div>}
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-primary" disabled={socialLoading}>
                  {socialLoading ? 'Loading...' : 'Complete Registration'}
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowSocialModal(false)}
                  disabled={socialLoading}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default LoginPage;
