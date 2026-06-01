import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Dr. Saad Therapy — Book a Session',
  description: 'Book a therapy or psychiatry session with Dr. Saad online. Easy booking, pay via Instapay or Vodafone Cash.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans bg-slate-50 text-slate-800 min-h-screen">
        <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand-700 flex items-center justify-center text-white font-bold text-lg">S</div>
            <div>
              <p className="font-semibold text-slate-900 leading-tight">Dr. Saad</p>
              <p className="text-xs text-slate-500">Therapist &amp; Psychiatrist</p>
            </div>
          </div>
        </header>
        <main className="max-w-4xl mx-auto px-4 py-8">
          {children}
        </main>
        <footer className="border-t border-slate-200 mt-16">
          <div className="max-w-4xl mx-auto px-4 py-6 text-center text-sm text-slate-400">
            &copy; {new Date().getFullYear()} Dr. Saad Therapy. All rights reserved.
          </div>
        </footer>
      </body>
    </html>
  );
}
