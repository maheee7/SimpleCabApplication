import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { resetPassword as resetPasswordAPI } from '../../service/AuthService';
import './reset-password.css';

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [step, setStep] = useState<'email' | 'reset'>('email');
  const [passwordStrength, setPasswordStrength] = useState(0);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'newPassword') {
      let strength = 0;
      if (value.length >= 6) strength++;
      if (value.length >= 8) strength++;
      if (/[A-Z]/.test(value)) strength++;
      if (/[0-9]/.test(value)) strength++;
      if (/[^A-Za-z0-9]/.test(value)) strength++;
      setPasswordStrength(strength);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    // In a real app, you would send a reset link to email
    // For now, we'll move to password reset step
    setSuccess('Please enter your new password below');
    setStep('reset');
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (!formData.newPassword || !formData.confirmPassword) {
        setError('Please fill in all password fields');
        setIsLoading(false);
        return;
      }

      if (formData.newPassword.length < 6) {
        setError('Password must be at least 6 characters long');
        setIsLoading(false);
        return;
      }

      if (formData.newPassword !== formData.confirmPassword) {
        setError('Passwords do not match');
        setIsLoading(false);
        return;
      }

      // Call reset password API. If user is not authenticated, include email to allow unauthenticated reset.
      const token = localStorage.getItem('accessToken');
      if (token) {
        await resetPasswordAPI(formData.newPassword, formData.confirmPassword);
      } else {
        if (!formData.email) {
          setError('Email is required to reset password when not logged in');
          setIsLoading(false);
          return;
        }
        await resetPasswordAPI(formData.newPassword, formData.confirmPassword, formData.email);
      }

      setSuccess('Password reset successfully! Redirecting to login...');
      setTimeout(() => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        navigate('/');
      }, 2000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Password reset failed. Please try again.';
      setError(errorMessage);
      console.error('Reset password error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength === 0) return '#ddd';
    if (passwordStrength <= 2) return '#ff4444';
    if (passwordStrength <= 3) return '#ffaa00';
    return '#44aa44';
  };

  return (
    <div className="reset-password-container">
      <div className="reset-password-box">
        <h1 className="reset-password-title">Reset Password</h1>
        <p className="reset-password-subtitle">Enter your new password below</p>

        <form onSubmit={step === 'email' ? handleEmailSubmit : handlePasswordReset} className="reset-password-form">
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          {step === 'email' && (
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleInputChange}
                disabled={isLoading}
                required
              />
            </div>
          )}

          {step === 'reset' && (
            <>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="newPassword">New Password</label>
                  <input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    placeholder="Enter new password"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    required
                  />
                  {formData.newPassword && (
                    <div className="password-strength">
                      <div className="strength-bar">
                        <div
                          className="strength-fill"
                          style={{
                            width: `${(passwordStrength / 5) * 100}%`,
                            backgroundColor: getPasswordStrengthColor(),
                          }}
                        ></div>
                      </div>
                      <small>
                        Strength:{' '}
                        {passwordStrength === 0 && 'Very Weak'}
                        {passwordStrength === 1 && 'Weak'}
                        {passwordStrength === 2 && 'Fair'}
                        {passwordStrength === 3 && 'Good'}
                        {passwordStrength === 4 && 'Strong'}
                        {passwordStrength === 5 && 'Very Strong'}
                      </small>
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm Password</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    placeholder="Confirm password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    required
                  />
                  {formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (
                    <small className="password-mismatch">Passwords do not match</small>
                  )}
                </div>
              </div>
            </>
          )}

          <button type="submit" className="reset-password-button" disabled={isLoading}>
            {isLoading
              ? 'Processing...'
              : step === 'email'
                ? 'Continue'
                : 'Reset Password'}
          </button>
        </form>

        <div className="reset-password-footer">
          <p>
            <a href="/" onClick={() => navigate('/')}>
              Back to Login
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
