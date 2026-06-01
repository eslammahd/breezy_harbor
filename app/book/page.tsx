'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import { supabase } from '@/lib/supabase';
import { generateConfirmationCode, formatDate, formatTime } from '@/lib/utils';
import type { Slot } from '@/lib/supabase';
import Link from 'next/link';

function BookingForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const slotId = searchParams.get('slot');

  const [slot, setSlot] = useState<Slot | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    patient_name: '',
    phone: '',
    session_type: 'therapy',
    notes: '',
  });

  useEffect(() => {
    if (!slotId) { setLoading(false); return; }
    supabase
      .from('available_slots')
      .select('*')
      .eq('id', slotId)
      .eq('is_available', true)
      .single()
      .then(({ data, error }) => {
        if (error || !data) setError('This slot is no longer available.');
        else setSlot(data);
        setLoading(false);
      });
  }, [slotId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slot) return;
    setSubmitting(true);
    setError('');

    const confirmationCode = generateConfirmationCode();

    // Mark slot as unavailable and create booking atomically
    const { error: slotError } = await supabase
      .from('available_slots')
      .update({ is_available: false })
      .eq('id', slot.id)
      .eq('is_available', true);

    if (slotError) {
      setError('This slot was just taken. Please go back and choose another.');
      setSubmitting(false);
      return;
    }

    const { error: bookingError } = await supabase
      .from('bookings')
      .insert({
        patient_name: form.patient_name.trim(),
        phone: form.phone.trim(),
        session_type: form.session_type,
        slot_id: slot.id,
        confirmation_code: confirmationCode,
        payment_status: 'pending',
        notes: form.notes.trim() || null,
      });

    if (bookingError) {
      // Revert slot availability on failure
      await supabase.from('available_slots').update({ is_available: true }).eq('id', slot.id);
      setError('Booking failed. Please try again.');
      setSubmitting(false);
      return;
    }

    router.push(`/confirmation?code=${confirmationCode}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!slotId || error === 'This slot is no longer available.') {
    return (
      <div className="card text-center py-12 max-w-md mx-auto">
        <p className="text-4xl mb-4">⚠️</p>
        <p className="text-slate-700 font-medium mb-4">{error || 'No slot selected.'}</p>
        <Link href="/" className="btn-primary inline-block">← Browse Slots</Link>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      <Link href="/" className="text-sm text-brand-600 hover:underline mb-6 inline-block">← Back to slots</Link>

      {slot && (
        <div className="bg-brand-50 border border-brand-200 rounded-2xl p-4 mb-6 flex items-center gap-4">
          <div className="text-3xl">📅</div>
          <div>
            <p className="font-semibold text-brand-800">{formatDate(slot.slot_date)}</p>
            <p className="text-brand-600 text-sm">{formatTime(slot.slot_time)} · {slot.duration_minutes} minutes</p>
          </div>
        </div>
      )}

      <div className="card">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">Book Your Session</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-5 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
            <input
              type="text"
              name="patient_name"
              value={form.patient_name}
              onChange={handleChange}
              required
              placeholder="Enter your full name"
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Phone Number</label>
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              required
              placeholder="e.g. 01012345678"
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Session Type</label>
            <select
              name="session_type"
              value={form.session_type}
              onChange={handleChange}
              required
              className="input-field"
            >
              <option value="therapy">Therapy / Counselling</option>
              <option value="psychiatry">Psychiatry Consultation</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Additional Notes <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              rows={3}
              placeholder="Anything you'd like Dr. Saad to know beforehand..."
              className="input-field resize-none"
            />
          </div>

          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? 'Confirming...' : 'Confirm Booking →'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function BookPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <BookingForm />
    </Suspense>
  );
}
