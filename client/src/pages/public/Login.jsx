import { zodResolver } from '@hookform/resolvers/zod';
import { Lock, Mail } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { Link, useLocation, useNavigate } from 'react-router';
import toast from 'react-hot-toast';
import Alert from '../../components/ui/Alert.jsx';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';
import { loginUser } from '../../features/auth/authSlice.js';
import { loginSchema } from '../../features/auth/schemas.js';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import { applyServerErrors } from '../../lib/formErrors.js';

export default function Login() {
  useDocumentTitle('Log in');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [formError, setFormError] = useState(null);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(loginSchema), defaultValues: { email: '', password: '' } });

  const onSubmit = async (values) => {
    setFormError(null);
    try {
      await dispatch(loginUser(values)).unwrap();
      toast.success('Welcome back!');
      navigate(location.state?.from?.pathname ?? '/dashboard', { replace: true });
    } catch (error) {
      setFormError(applyServerErrors(error, setError));
    }
  };

  return (
    <>
      <h1 className="text-3xl font-extrabold">Welcome back</h1>
      <p className="mt-1.5 text-sm text-slate-600">Log in to pick up where you left off.</p>

      {location.state?.from && !formError && (
        <div role="status" className="mt-5 flex items-center gap-2.5 rounded-xl border border-brand-100 bg-brand-50/70 px-3.5 py-2.5 text-sm text-brand-900">
          <Lock className="h-4 w-4 shrink-0 text-brand-600" aria-hidden="true" /> Please log in to continue.
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-6 space-y-4">
        {formError && <Alert>{formError}</Alert>}
        <Input label="Email" icon={Mail} type="email" autoComplete="email" error={errors.email?.message} {...register('email')} />
        <Input label="Password" icon={Lock} type="password" autoComplete="current-password" error={errors.password?.message} {...register('password')} />
        <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>Log in</Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        No account yet? <Link to="/register" className="font-medium text-brand-700 underline decoration-brand-300 underline-offset-4 transition-colors hover:text-brand-900 hover:decoration-brand-600">Sign up</Link>
      </p>
    </>
  );
}
