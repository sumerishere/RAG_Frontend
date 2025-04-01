import "./SignUpForm.css";
import { useState, useEffect } from "react";
import { Link } from 'react-router-dom';

const SignUpForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => {
    setAnimateIn(true);
  }, []);

  return (
    <div className="signup-container">
      <div className={`signup-card ${animateIn ? 'animate-in' : ''}`}>
        <div className="signup-header">
          <h1 className="signup-title">RAG AI Bot</h1>
          <p className="signup-subtitle">Create your account</p>
        </div>
        
        <div className="logo-container">
          <div className="logo-circle pulse">
            <img src="/favicon_io/freepik__background__67311.png" alt="icon" className="logo-image" />
          </div>
        </div>
        
        <form className="signup-form">
          <div className="form-group slide-in-right" style={{animationDelay: "0.1s"}}>
            <label htmlFor="name" className="form-label">Full Name</label>
            <input
              type="text"
              id="name"
              className="form-input"
              placeholder="John Doe"
            />
          </div>
          
          <div className="form-group slide-in-right" style={{animationDelay: "0.2s"}}>
            <label htmlFor="address" className="form-label">Address</label>
            <input
              type="text"
              id="address"
              className="form-input"
              placeholder="123 Main St, City, Country"
            />
          </div>
          
          <div className="form-group slide-in-right" style={{animationDelay: "0.3s"}}>
            <label htmlFor="mobile" className="form-label">Mobile Number</label>
            <input
              type="tel"
              id="mobile"
              className="form-input"
              placeholder="+1 234 567 8900"
            />
          </div>
          
          <div className="form-group slide-in-right" style={{animationDelay: "0.4s"}}>
            <label htmlFor="email" className="form-label">Email</label>
            <div className="email-input-container">
              <input
                type="email"
                id="email"
                className="form-input"
                placeholder="you@example.com"
              />
              <span className="email-icon">@</span>
            </div>
          </div>
          
          <div className="form-group slide-in-right" style={{animationDelay: "0.5s"}}>
            <label htmlFor="password" className="form-label">Password</label>
            <div className="password-input-container">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                className="form-input"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="password-toggle"
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="toggle-icon" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="toggle-icon" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                    <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          
          <div className="form-group slide-in-right" style={{animationDelay: "0.6s"}}>
            <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
            <div className="password-input-container">
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                className="form-input"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="password-toggle"
              >
                {showConfirmPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="toggle-icon" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="toggle-icon" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                    <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          
          <div className="form-group slide-in-right checkbox-group" style={{animationDelay: "0.7s"}}>
            <div className="checkbox-container">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                className="checkbox-input"
              />
              <label htmlFor="terms" className="checkbox-label">
                I agree to the <a href="#" className="terms-link">Terms</a>
              </label>
            </div>
          </div>
          
          <div className="form-group slide-in-right" style={{animationDelay: "0.8s"}}>
            <button
              type="submit"
              className="submit-button"
            >
              Sign up
            </button>
          </div>
        </form>
        
        <div className="divider slide-in-right" style={{animationDelay: "0.9s"}}>
          <div className="divider-line"></div>
          <div className="divider-text">Or continue with</div>
          <div className="divider-line"></div>
        </div>
        
        <div className="social-login slide-in-right" style={{animationDelay: "1s"}}>
          <a href="#" className="social-button twitter-button">
            <svg className="social-icon" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84" />
            </svg>
          </a>
          
          <a href="#" className="social-button github-button">
            <svg className="social-icon" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
            </svg>
          </a>
        </div>
        
        <p className="login-link slide-in-right" style={{animationDelay: "1.1s"}}>
          Already have an account?{" "}
          <Link to="/login">
            <span className="login-text">Sign in</span>
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignUpForm;