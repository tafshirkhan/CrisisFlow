
import AuthLayout from '../components/AuthLayout';
import AuthHeader from '../components/AuthHeader';
import RegisterForm from '../components/RegisterForm';

export default function RegisterPage() {
  return (
    <AuthLayout>
      <AuthHeader
        title="Create your account"
        description="Register with CrisisFlow to report emergencies."
      />

      <RegisterForm />
    </AuthLayout>
  );
}
