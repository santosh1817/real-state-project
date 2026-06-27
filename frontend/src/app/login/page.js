'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { z } from 'zod';
import { setCredentials } from '../../features/auth/authSlice';
import { useLoginMutation, useRegisterMutation } from '../../store/api';

const loginSchema = z.object({ email: z.string().email(), password: z.string().min(8) });
const registerSchema = loginSchema.extend({ name: z.string().min(2), phone: z.string().optional() });

export default function LoginPage() {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [error, setError] = useState('');
  const [login, loginState] = useLoginMutation();
  const [register, registerState] = useRegisterMutation();
  const dispatch = useDispatch();
  const router = useRouter();

  async function submit(event) {
    event.preventDefault();
    setError('');
    const parsed = (mode === 'login' ? loginSchema : registerSchema).safeParse(form);
    if (!parsed.success) return setError('Please enter valid details.');
    try {
      const result = await (mode === 'login' ? login(parsed.data) : register(parsed.data)).unwrap();
      dispatch(setCredentials(result));
      router.push('/');
    } catch (apiError) {
      setError(apiError?.data?.message || 'Authentication failed');
    }
  }

  return (
    <section className="mx-auto grid min-h-[calc(100vh-72px)] max-w-md content-center px-4 py-10">
      <form onSubmit={submit} className="grid gap-4 rounded-md border border-line bg-white p-6 shadow-soft">
        <div>
          <h1 className="text-2xl font-bold">{mode === 'login' ? 'Login' : 'Create account'}</h1>
          <p className="mt-1 text-sm text-ink/60">Manage listings and contact verified owners.</p>
        </div>
        {mode === 'register' && <input className="field" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />}
        <input className="field" placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        {mode === 'register' && <input className="field" placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />}
        <input className="field" placeholder="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        {error && <p className="text-sm text-coral">{error}</p>}
        <button className="btn-primary" disabled={loginState.isLoading || registerState.isLoading}>{mode === 'login' ? 'Login' : 'Register'}</button>
        <button type="button" className="text-sm font-semibold text-leaf" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
          {mode === 'login' ? 'Need an account?' : 'Already registered?'}
        </button>
        <Link className="text-center text-sm text-ink/55" href="/">Back to listings</Link>
      </form>
    </section>
  );
}
