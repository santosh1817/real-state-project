'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { setCredentials } from '../../features/auth/authSlice';
import { useLoginMutation, useRegisterMutation } from '../../features/auth/authApi';
import { getApiErrorMessage } from '../../lib/apiError';

const loginSchema = z.object({ email: z.string().email(), password: z.string().min(8) });
const registerSchema = loginSchema.extend({ name: z.string().min(2), phone: z.string().optional() });

export default function LoginPage() {
  // mode controls whether this screen behaves as login or register.
  const [mode, setMode] = useState('login');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const schema = mode === 'login' ? loginSchema : registerSchema;
  // shouldUnregister removes register-only fields when switching back to login.
  const { register: registerField, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '', password: '', phone: '' },
    shouldUnregister: true
  });
  const [login, loginState] = useLoginMutation();
  const [register, registerState] = useRegisterMutation();
  const dispatch = useDispatch();
  const router = useRouter();
  const isSubmitting = loginState.isLoading || registerState.isLoading;

  async function submit(values) {
    setError('');
    try {
      // Pick login or register mutation based on current mode.
      const result = await (mode === 'login' ? login(values) : register(values)).unwrap();
      // Store returned tokens/user, then go to listings.
      dispatch(setCredentials(result));
      router.push('/');
    } catch (apiError) {
      setError(getApiErrorMessage(apiError, 'Authentication failed'));
    }
  }

  return (
    <section className="mx-auto grid min-h-[calc(100vh-72px)] max-w-md content-center px-4 py-10">
      <form onSubmit={handleSubmit(submit)} className="grid gap-4 rounded-md border border-line bg-white p-6 shadow-soft">
        <div>
          <h1 className="text-2xl font-bold">{mode === 'login' ? 'Login' : 'Create account'}</h1>
          <p className="mt-1 text-sm text-ink/60">Manage listings and contact verified owners.</p>
        </div>
        {mode === 'register' && <Field placeholder="Name" error={errors.name?.message} {...registerField('name')} />}
        <Field placeholder="Email" type="email" error={errors.email?.message} {...registerField('email')} />
        {mode === 'register' && <Field placeholder="Phone" error={errors.phone?.message} {...registerField('phone')} />}
        <PasswordField
          placeholder="Password"
          type={showPassword ? 'text' : 'password'}
          error={errors.password?.message}
          isVisible={showPassword}
          onToggle={() => setShowPassword((current) => !current)}
          {...registerField('password')}
        />
        {error && <p className="text-sm text-coral">{error}</p>}
        <button className="btn-primary" disabled={isSubmitting}>{isSubmitting ? 'Please wait...' : mode === 'login' ? 'Login' : 'Register'}</button>
        <button type="button" className="text-sm font-semibold text-leaf" onClick={() => {
          // Clear old form state when switching between login and register.
          setError('');
          reset({ name: '', email: '', password: '', phone: '' });
          setMode(mode === 'login' ? 'register' : 'login');
        }}>
          {mode === 'login' ? 'Need an account?' : 'Already registered?'}
        </button>
        <Link className="text-center text-sm text-ink/55" href="/">Back to listings</Link>
      </form>
    </section>
  );
}

function Field({ error, ...props }) {
  return (
    <label className="grid gap-1">
      <input className="field" {...props} />
      {error && <span className="text-xs text-coral">{error}</span>}
    </label>
  );
}

function PasswordField({ error, isVisible, onToggle, ...props }) {
  return (
    <label className="grid gap-1">
      <span className="relative">
        <input className="field pr-11" {...props} />
        <button
          type="button"
          className="absolute right-3 top-1/2 grid size-7 -translate-y-1/2 place-items-center text-ink/55 transition hover:text-leaf"
          onClick={onToggle}
          aria-label={isVisible ? 'Hide password' : 'Show password'}
          title={isVisible ? 'Hide password' : 'Show password'}
        >
          {isVisible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </span>
      {error && <span className="text-xs text-coral">{error}</span>}
    </label>
  );
}
