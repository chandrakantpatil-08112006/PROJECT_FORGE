import { zodResolver } from '@hookform/resolvers/zod';
import { AtSign, Lock, Mail, UserRound } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router';
import toast from 'react-hot-toast';
import Alert from '../../components/ui/Alert.jsx';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';
import { registerUser } from '../../features/auth/authSlice.js';
import { registerSchema } from '../../features/auth/schemas.js';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import { applyServerErrors } from '../../lib/formErrors.js';

/** Rough, friendly strength hint. The real rules live in the schema and on the server. */
function PasswordMeter({ value = '' }) {
  const score = [value.length >= 8, value.length >= 12, /[a-z]/.test(value) && /[A-Z]/.test(value), /\d/.test(value) && /[^A-Za-z0-9]/.test(value)].filter(Boolean).length;
  const levels = [
    { label: 'Enter a password', color: '#e8eaf3' },
    { label: 'Weak', color: '#f43f5e' },
    { label: 'Fair', color: '#f59e0b' },
    { label: 'Good', color: '#84cc16' },
    { label: 'Strong', color: '#10b981' },
  ];
  const level = value ? levels[Math.max(1, score)] : levels[0];
  return (
    <div aria-live="polite" className="-mt-1">
      <div className="flex gap-1.5">
        {[1, 2, 3, 4].map((step) => <span key={step} className="strength-seg" style={value && step <= Math.max(1, score) ? { background: level.color } : undefined} />)}
      </div>
      <p className="mt-1.5 text-xs font-medium text-slate-500">{value ? `Password strength: ${level.label}` : level.label}</p>
    </div>
  );
}

export default function Register() {
  useDocumentTitle('Create account');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [formError, setFormError] = useState(null);
  const {
    register,
    handleSubmit,
    setError,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(registerSchema), defaultValues: { name: '', username: '', email: '', password: '' } });

  const onSubmit = async (values) => {
    setFormError(null);
    try {
      await dispatch(registerUser(values)).unwrap();
      toast.success('Account created. Welcome to ProjectForge!');
      navigate('/dashboard', { replace: true });
    } catch (error) {
      setFormError(applyServerErrors(error, setError));
    }
  };

  return (
    <>
      <h1 className="text-3xl font-extrabold">Create your account</h1>
      <p className="mt-1.5 text-sm text-slate-600">Post a project or join one that fits your skills.</p>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-6 space-y-4">
        {formError && <Alert>{formError}</Alert>}
        <Input label="Full name" icon={UserRound} autoComplete="name" error={errors.name?.message} {...register('name')} />
        <Input
          label="Username"
          icon={AtSign}
          autoComplete="username"
          hint="Letters, numbers, hyphens and underscores."
          error={errors.username?.message}
          {...register('username')}
        />
        <Input label="Email" icon={Mail} type="email" autoComplete="email" error={errors.email?.message} {...register('email')} />
        <Input
          label="Password"
          icon={Lock}
          type="password"
          autoComplete="new-password"
          hint="At least 8 characters."
          error={errors.password?.message}
          {...register('password')}
        />
        <PasswordMeter value={watch('password')} />
        <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>Create account</Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        Already registered? <Link to="/login" className="font-medium text-brand-700 underline decoration-brand-300 underline-offset-4 transition-colors hover:text-brand-900 hover:decoration-brand-600">Log in</Link>
      </p>
    </>
  );
}
