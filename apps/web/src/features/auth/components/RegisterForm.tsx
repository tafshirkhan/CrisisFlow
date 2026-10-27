
import { useState, type FormEvent } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { register } from '../api/authApi';
import FormInput from './FormInput';
import AuthSubmitButton from './AuthSubmitButton';

export default function RegisterForm() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    if (password.length < 12) {
      toast.error('Password must contain at least 12 characters.');
      return;
    }

    setLoading(true);

    try {
      await register({
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        password,
      });

      toast.success('Account created. Please sign in.');
      navigate('/login');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(
          error.response?.data?.message ??
            'Unable to create your account. Please try again.',
        );
      } else {
        toast.error('An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormInput
        id="register-full-name"
        label="Full name"
        type="text"
        name="fullName"
        autoComplete="name"
        minLength={2}
        maxLength={120}
        required
        placeholder="Your full name"
        value={fullName}
        onChange={(event) => setFullName(event.target.value)}
      />

      <FormInput
        id="register-email"
        label="Email address"
        type="email"
        name="email"
        autoComplete="email"
        required
        placeholder="you@example.com"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
      />

      <FormInput
        id="register-password"
        label="Password"
        type="password"
        name="password"
        autoComplete="new-password"
        minLength={12}
        maxLength={128}
        required
        placeholder="At least 12 characters"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
      />

      <FormInput
        id="register-confirm-password"
        label="Confirm password"
        type="password"
        name="confirmPassword"
        autoComplete="new-password"
        minLength={12}
        maxLength={128}
        required
        placeholder="Enter the password again"
        value={confirmPassword}
        onChange={(event) => setConfirmPassword(event.target.value)}
      />

      <AuthSubmitButton
        loading={loading}
        loadingText="Creating account..."
      >
        Create account
      </AuthSubmitButton>

      <p className="text-center text-sm text-slate-600">
        Already registered?{' '}
        <Link
          to="/login"
          className="font-semibold text-blue-700 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}
