import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '', // Added name field as is typical for registration, but sticking to user JSON if strictly required. 
              // User JSON example for signup only showed email/pass: { "email": "...", "password": "..." }
              // I will stick to email/pass to match the user request exactly unless the API requires name.
              // Most /register endpoints need a name. I'll add it but make it optional or just email/pass if that's what user implied. 
              // User request JSON: { "email": "...", "password": "..." } for *signup api*.
              // I will just use email/password to be safe with the specific request, but usually register needs more.
              // Actually, I'll add a name field just in case, it's better UX.
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // POST https://aelvix-ai-backend.onrender.com/api/users/register
      // Sending payload. If the API doesn't accept 'name', it might verify 'email' and 'password' only.
      // I will send just what is in state.
      const response = await axios.post('https://aelvix-ai-backend.onrender.com/api/users/register', {
        name: formData.name || undefined, // Send if present
        email: formData.email,
        password: formData.password
      });
      console.log('Signup success:', response.data);
      alert('Account created successfully! Please login.');
      navigate('/login');
    } catch (err) {
      console.error('Signup error:', err);
      // Detailed error logging
      if (err.response) {
         console.log('Error data:', err.response.data);
         console.log('Error status:', err.response.status);
      }
      setError(err.response?.data?.message || 'Registration failed. Try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
            Create an account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Enter your information to get started
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
             <Input
              label="Full Name"
              name="name"
              type="text"
              placeholder="John Doe"
              value={formData.name}
              onChange={handleChange}
            />
            <Input
              label="Email"
              name="email"
              type="email"
              required
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
            />
            <Input
              label="Password"
              name="password"
              type="password"
              required
              placeholder="Create a password"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">
              {error}
            </div>
          )}

          <Button type="submit" isLoading={isLoading}>
            Sign up
          </Button>

          <div className="text-sm text-center">
            <Link to="/login" className="font-medium text-gray-900 hover:text-gray-700 underline underline-offset-4">
              Already have an account? Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup;
