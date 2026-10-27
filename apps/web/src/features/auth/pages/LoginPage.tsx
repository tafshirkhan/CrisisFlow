
import AuthLayout from '../components/AuthLayout';
import AuthHeader from '../components/AuthHeader';
import LoginForm from '../components/LoginForm';

export default function LoginPage() {
  return (
    <AuthLayout>
      <AuthHeader
        title="Welcome to CrisisFlow"
        description="Sign in to access your emergency response dashboard."
      />

      <LoginForm />
    </AuthLayout>
  );
}
