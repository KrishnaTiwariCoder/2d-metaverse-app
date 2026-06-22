import React, { useState } from 'react';
import { signin, signup } from '../utils/auth';
import { useDispatch } from 'react-redux';
import { setCurrentUser, setMyId, storeToken } from '../redux/authslice';

export default function AuthPage() {
  const [screen, setScreen] = useState('welcome'); // welcome, signup, signin

  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    type: 'user'
  });

  const handleSubmit = async () => {
    if(screen === 'signup'){
      const res = await signup(formData.username, formData.password);
      if(res == 1){
        setScreen('signin');
      }
    }else{
      const res = await signin(formData.username, formData.password);
      
        dispatch(storeToken(res&& res.token));
        dispatch(setMyId(res&& res.user._id));
        dispatch(setCurrentUser({id: res&& res.user._id, username: res&& res.user.username}));      
    }
  };

  const handleChange = (e:any) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.logo}>👋</span>
        <span style={styles.brandName}>Metaverse</span>
      </div>

      <div style={styles.content}>
        {screen === 'welcome' && (
          <div style={styles.card}>
            {/* <div style={styles.cardHeader}> */}
            <div>
              <span style={styles.emoji}>👋</span>
              <h1 style={styles.title}>Welcome to Metaverse!</h1>
            </div>
            {/* <p style={styles.description}> */}
            <p>
              We're working hard to get Metaverse ready for everyone! While we wrap up
              the finishing touches, we're adding people gradually to make sure nothing
              breaks :)
            </p>
            <button 
              style={styles.primaryButton}
              onClick={() => setScreen('signup')}
            >
              Get your username →
            </button>
            {/* <div style={styles.footer}> */}
            <div>
              <span style={styles.footerText}>Have an invite text? </span>
              <button 
                style={styles.linkButton}
                onClick={() => setScreen('signin')}
              >
                Sign in
              </button>
            </div>
          </div>
        )}

        {screen === 'signup' && (
          <div style={styles.card}>
            {/* <div style={styles.cardHeader}> */}
            <div>
              <span style={styles.emoji}>😊</span>
              <h1 style={styles.title}>Pick a username</h1>
            </div>
            <div style={styles.formContainer}>
              {/* <div style={styles.inputGroup}> */}
              <div>
                {/* <span style={styles.inputPrefix}>@</span> */}
                <span>@</span>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="username"
                //   style={styles.input}
                />
              </div>
              <p 
            //   style={styles.hint}
              >Username can be used for the login</p>
              
              <div 
            //   style={styles.inputGroup}
              >
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Password"
                //   style={styles.input}
                />
              </div>
              
              <button onClick={handleSubmit} style={styles.primaryButton}>
                Next →
              </button>
            </div>
            <div 
            // style={styles.footer}
            >
              <button 
                style={styles.linkButton}
                onClick={() => setScreen('welcome')}
              >
                ← Back
              </button>
              <span style={styles.footerDivider}>|</span>
              <button 
                style={styles.linkButton}
                onClick={() => setScreen('signin')}
              >
                Sign in
              </button>
            </div>
          </div>
        )}

        {screen === 'signin' && (
          <div style={styles.card}>
            <div 
            // style={styles.cardHeader}
            >
              <span style={styles.emoji}>👋</span>
              <h1 style={styles.title}>Welcome back!</h1>
            </div>
            <div 
            style={styles.formContainer}>
              <div 
            //   style={styles.inputGroup}
              >
                <span 
                // style={styles.inputPrefix}
                >@</span>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="username"
                //   style={styles.input}
                />
              </div>
              
              <div 
            //   style={styles.inputGroup}
              >
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Password"
                //   style={styles.input}
                />
              </div>
              
              <button onClick={handleSubmit} style={styles.primaryButton}>
                Sign in →
              </button>
            </div>
            <div 
            // style={styles.footer}
            >
              <button 
                style={styles.linkButton}
                onClick={() => setScreen('welcome')}
              >
                ← Back
              </button>
              <span style={styles.footerDivider}>|</span>
              <button 
                style={styles.linkButton}
                onClick={() => setScreen('signup')}
              >
                Create account
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#1a1a1a',
    color: '#ffffff',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  header: {
    padding: '20px 40px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  logo: {
    fontSize: '24px',
  },
  brandName: {
    fontSize: '18px',
    fontWeight: '600',
  },
  content: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 'calc(100vh - 100px)',
    padding: '20px',
  },
  card: {
    backgroundColor: '#2a2a2a',
    borderRadius: '16px',
    padding: '48px',
    maxWidth: '480px',
    width: '100%',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
  },
  cardHeader: {
    textAlign: 'center',
    marginBottom: '24px',
  },
  emoji: {
    fontSize: '48px',
    display: 'block',
    marginBottom: '16px',
  },
  title: {
    fontSize: '24px',
    fontWeight: '600',
    margin: '0',
  },
  description: {
    textAlign: 'center',
    color: '#b0b0b0',
    lineHeight: '1.6',
    marginBottom: '32px',
    fontSize: '15px',
  },
  formContainer: {
    marginBottom: '24px',
  },
  inputGroup: {
    position: 'relative',
    marginBottom: '16px',
  },
  inputPrefix: {
    position: 'absolute',
    left: '16px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#666',
    fontSize: '16px',
  },
  input: {
    width: '100%',
    padding: '14px 16px',
    paddingLeft: '36px',
    backgroundColor: '#1a1a1a',
    border: '1px solid #3a3a3a',
    borderRadius: '8px',
    color: '#ffffff',
    fontSize: '15px',
    outline: 'none',
    boxSizing: 'border-box',
  },
  hint: {
    fontSize: '13px',
    color: '#808080',
    textAlign: 'center',
    marginTop: '-8px',
    marginBottom: '24px',
  },
  primaryButton: {
    width: '100%',
    padding: '14px 24px',
    backgroundColor: '#0066ff',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  footer: {
    textAlign: 'center',
    marginTop: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  },
  footerText: {
    color: '#808080',
    fontSize: '14px',
  },
  footerDivider: {
    color: '#4a4a4a',
  },
  linkButton: {
    background: 'none',
    border: 'none',
    color: '#0066ff',
    cursor: 'pointer',
    fontSize: '14px',
    padding: '0',
    fontWeight: '500',
  },
};