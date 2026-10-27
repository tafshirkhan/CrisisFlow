
import { useState, type FormEvent } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { login } from '../api/authApi';
import FormInput from './FormInput';
import AuthSubmitButton from './AuthSubmitButton';

export default function LoginForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { refreshUser } = useAuth();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

   try {
    const result = await login({
        email: email.trim().toLowerCase(),
        password,
    });
  sessionStorage.setItem('crisisflow_access_token', result.accessToken);
  await refreshUser();
  toast.success('Login successful.');
  navigate('/', { replace: true });
    } catch (error) {
    if (axios.isAxiosError(error)) {
        toast.error(
        error.response?.data?.message ??
            'Unable to log in. Please check your details.',
        );
    } else {
        toast.error('An unexpected error occurred.');
    }
    } finally {
    setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <FormInput
        id="login-email"
        label="Email address"
        type="email"
        name="email"
        autoComplete="email"
        placeholder="you@example.com"
        required
        value={email}
        onChange={(event) => setEmail(event.target.value)}
      />

      <FormInput
        id="login-password"
        label="Password"
        type="password"
        name="password"
        autoComplete="current-password"
        placeholder="Enter your password"
        required
        value={password}
        onChange={(event) => setPassword(event.target.value)}
      />

      <AuthSubmitButton
        loading={loading}
        loadingText="Signing in..."
      >
        Sign in
      </AuthSubmitButton>

      <p className="text-center text-sm text-slate-600">
        Don't have an account?{' '}
        <Link
          to="/register"
          className="font-semibold text-blue-700 hover:underline"
        >
          Create an account
        </Link>
      </p>
    </form>
  );
}
