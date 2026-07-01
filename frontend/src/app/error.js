'use client';

import { useEffect } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

export default function Error({ error, reset }) {
  useEffect(() => {
    // Log real error in browser console for debugging.
    console.error(error);
  }, [error]);

  return (
    <section className="mx-auto grid min-h-[60vh] max-w-xl place-items-center px-4 py-16 text-center">
      <div>
        <div className="mx-auto grid size-12 place-items-center rounded-md bg-coral/10 text-coral">
          <AlertTriangle size={24} />
        </div>
        <h1 className="mt-5 text-2xl font-bold">Something went wrong</h1>
        <p className="mt-2 text-ink/65">We could not load this view. Try again, or return to the home page.</p>
        {/* reset asks Next.js to retry rendering this route. */}
        <button type="button" className="btn-primary mt-5" onClick={reset}>
          <RotateCcw size={16} />
          Try again
        </button>
      </div>
    </section>
  );
}
