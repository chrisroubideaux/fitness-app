// 
import { useState } from 'react';
import { FaFacebookSquare, FaGoogle } from 'react-icons/fa';
//import axios from 'axios';

const Login: React.FC = () => {
  const [error] = useState<string | null>(null);

  // Google redirect login
  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:5000/auth/google/login';
  };

  // Facebook redirect login
  const handleFacebookLogin = () => {
    window.open('http://localhost:5000/auth/facebook/login', '_self');
  };

  return (
    <div className="container py-5" style={{ maxWidth: '400px', margin: 'auto' }}>
      <h2 className="text-center mb-4">Login</h2>

      <div className="d-flex flex-column gap-3">
        <button
          className="btn btn-outline-danger d-flex align-items-center justify-content-center gap-2"
          onClick={handleGoogleLogin}
        >
          <FaGoogle /> Continue with Google
        </button>

        <button
          className="btn btn-outline-primary d-flex align-items-center justify-content-center gap-2"
          onClick={handleFacebookLogin}
        >
          <FaFacebookSquare /> Continue with Facebook
        </button>

        {error && <p className="text-danger text-center mt-3">{error}</p>}
      </div>
    </div>
  );
};

export default Login;
