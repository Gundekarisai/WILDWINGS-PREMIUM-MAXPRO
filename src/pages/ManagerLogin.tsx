import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, User, Crown, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { api } from '../lib/api';

const gold = '#D4AF37';

export default function ManagerLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await api.verifyManager(username, password);
      if (data && data.length > 0) {
        localStorage.setItem(
          'wildwings_manager',
          JSON.stringify({
            username: data[0].username,
            displayName: data[0].display_name || data[0].username,
          })
        );
        navigate('/dashboard');
      } else {
        setError('Invalid credentials');
      }
    } catch (err) {
      setError('Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#050505',
        padding: '1rem',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        style={{
          width: '100%',
          maxWidth: '420px',
          padding: '2.5rem',
          borderRadius: '1.5rem',
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        {/* Crown Icon */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <Crown
            size={48}
            color={gold}
            style={{ marginBottom: '0.5rem' }}
          />
        </div>

        {/* Title */}
        <h1
          style={{
            textAlign: 'center',
            fontSize: '1.75rem',
            fontWeight: 700,
            color: gold,
            marginBottom: '0.25rem',
            letterSpacing: '0.02em',
          }}
        >
          Manager Login
        </h1>

        {/* Subtitle */}
        <p
          style={{
            textAlign: 'center',
            fontSize: '0.9rem',
            color: 'rgba(255, 255, 255, 0.6)',
            marginBottom: '2rem',
          }}
        >
          WildWings Premium Hotel
        </p>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1rem',
              borderRadius: '0.75rem',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              marginBottom: '1.25rem',
              color: '#ef4444',
              fontSize: '0.875rem',
            }}
          >
            <AlertCircle size={16} />
            {error}
          </motion.div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Username Input */}
          <div style={{ marginBottom: '1rem' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.875rem 1rem',
                borderRadius: '0.75rem',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                transition: 'border-color 0.2s',
              }}
            >
              <User size={18} color="rgba(255, 255, 255, 0.4)" />
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: '#fff',
                  fontSize: '0.95rem',
                  fontFamily: 'inherit',
                }}
              />
            </div>
          </div>

          {/* Password Input */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.875rem 1rem',
                borderRadius: '0.75rem',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                transition: 'border-color 0.2s',
              }}
            >
              <Lock size={18} color="rgba(255, 255, 255, 0.4)" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: '#fff',
                  fontSize: '0.95rem',
                  fontFamily: 'inherit',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {showPassword ? (
                  <EyeOff size={18} color="rgba(255, 255, 255, 0.4)" />
                ) : (
                  <Eye size={18} color="rgba(255, 255, 255, 0.4)" />
                )}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.875rem',
              borderRadius: '0.75rem',
              border: 'none',
              background: loading
                ? 'rgba(212, 175, 55, 0.5)'
                : 'linear-gradient(135deg, #D4AF37, #B8941F)',
              color: '#050505',
              fontSize: '1rem',
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'opacity 0.2s, transform 0.1s',
              letterSpacing: '0.03em',
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
