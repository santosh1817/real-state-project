'use client';

import Link from 'next/link';
import { Building2, LogOut, Plus, UserRound } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../features/auth/authSlice';

export default function Header() {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.accessToken);

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold">
          <span className="grid size-9 place-items-center rounded-md bg-leaf text-white"><Building2 size={20} /></span>
          EstateFlow
        </Link>
        <nav className="flex items-center gap-2">
          <Link href="/properties/new" className="btn-primary"><Plus size={16} /> List</Link>
          {token ? (
            <button className="btn-ghost" onClick={() => dispatch(logout())} title="Logout"><LogOut size={16} /></button>
          ) : (
            <Link href="/login" className="btn-ghost"><UserRound size={16} /> Login</Link>
          )}
        </nav>
      </div>
    </header>
  );
}
