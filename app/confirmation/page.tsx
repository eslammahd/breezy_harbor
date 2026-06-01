'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import { supabase } from '@/lib/supabase';
import { formatDate, formatTime } from '@/lib/utils';
import type { Booking, Slot } from '@/lib/supabase';
import Link from 'next/link';

type BookingWithSlot = Booking & { available_slots: Slot };

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const code = searchParams.get('code');

  const [booking, setBooking] = useState<BookingWithSlot | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!code) { setLoading(false); return; }
    supabase
      .from('bookings')
      .select('*, available_slots(*)')
      .eq('confirmation_code', code)
      .single()
      .then(({ data }) => {
        setBooking(data as BookingWithSlot | null);
        setLoading(false);
      });
  }, [code]);

  const copyCode = () => {
    if (code) {
      navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="card text-center py-12 max-w-md mx-auto">
        <p className="text-4xl mb-4">❓</p>
        <p className="text-slate-700 font-medium mb-4">Booking not found.</p>
        <Link href="/" className="btn-primary inline-block">← Go Home</Link>
      </div>
    );
  }

  const slot = booking.available_slots;

  return (
    <div className="max-w-lg mx-auto space-y-6">
      {/* Success Banner */}
      <div className="card bg-green-50 border-green-200 text-center">
        <div className="text-5xl mb-4">✅</div>
        <h1 className="text-2xl font-bold text-green-800 mb-2">Booking Confirmed!</h1>
        <p className="text-green-700">Your session with Dr. Saad is reserved. Please complete payment to finalise.</p>
      </div>

      {/* Booking Summary */}
      <div className="card">
        <h2 className="font-semibold text-slate-700 mb-4 text-sm uppercase tracking-wide">Booking Summary</h2>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-500">Patient</span>
            <span className="font-medium text-slate-800">{booking.patient_name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Phone</span>
            <span className="font-medium text-slate-800">{booking.phone}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Session</span>
            <span className="font-medium text-slate-800 capitalize">{booking.session_type}</span>
          </div>
          {slot && (
            <>
              <div className="flex justify-between">
                <span className="text-slate-500">Date</span>
                <span className="font-medium text-slate-800">{formatDate(slot.slot_date)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Time</span>
                <span className="font-medium text-slate-800">{formatTime(slot.slot_time)}</span>
              </div>
            </>
          )}
        </div>

        <div className="mt-5 pt-5 border-t border-slate-100">
          <p className="text-xs text-slate-500 mb-2 uppercase tracking-wide font-medium">Your Confirmation Code</p>
          <button
            onClick={copyCode}
            className="w-full flex items-center justify-between bg-brand-50 border-2 border-brand-200 rounded-xl px-5 py-4 hover:border-brand-400 transition-colors group"
          >
            <span className="text-2xl font-bold tracking-widest text-brand-700 font-mono">{booking.confirmation_code}</span>
            <span className="text-xs text-brand-500 font-medium">{copied ? '✓ Copied!' : 'Tap to copy'}</span>
          </button>
          <p className="text-xs text-slate-400 mt-2">Include this code in your payment note so Dr. Saad can match your payment.</p>
        </div>
      </div>

      {/* Payment Instructions */}
      <div className="card">
        <h2 className="font-semibold text-slate-700 mb-4 text-sm uppercase tracking-wide">How to Pay</h2>
        <div className="space-y-4">
          {/* Instapay */}
          <div className="bg-slate-50 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-sm">IP</div>
              <div>
                <p className="font-semibold text-slate-800">Instapay</p>
                <p className="text-xs text-slate-500">Bank transfer via Instapay app</p>
              </div>
            </div>
            <div className="bg-white rounded-lg p-3 border border-slate-200">
              <p className="text-xs text-slate-500 mb-1">Instapay Username / Phone</p>
              <p className="font-bold text-slate-800 text-lg">01000000000</p>
            </div>
          </div>

          {/* Vodafone Cash */}
          <div className="bg-slate-50 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center text-white font-bold text-sm">VC</div>
              <div>
                <p className="font-semibold text-slate-800">Vodafone Cash</p>
                <p className="text-xs text-slate-500">Mobile wallet transfer</p>
              </div>
            </div>
            <div className="bg-white rounded-lg p-3 border border-slate-200">
              <p className="text-xs text-slate-500 mb-1">Vodafone Cash Number</p>
              <p className="font-bold text-slate-800 text-lg">01000000000</p>
            </div>
          </div>
        </div>

        <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="text-sm text-amber-800">
            <span className="font-semibold">Important:</span> Please include your confirmation code <span className="font-mono font-bold">{booking.confirmation_code}</span> in the payment note/description.
          </p>
        </div>
      </div>

      <div className="text-center">
        <Link href="/" className="text-sm text-slate-500 hover:text-brand-600 underline">← Book another session</Link>
      </div>
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <ConfirmationContent />
    </Suspense>
  );
}
