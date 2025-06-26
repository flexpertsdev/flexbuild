import { LoginForm } from '@/components/auth';
import { Link } from 'react-router-dom';

export const LoginPage = () => {
  return (
    <div className="w-full">
      <LoginForm />
      <p className="mt-8 text-center text-sm text-neutral-600">
        Don't have an account?{' '}
        <Link to="/signup" className="text-primary-600 hover:text-primary-500 font-medium">
          Sign up for free
        </Link>
      </p>
    </div>
  );
};