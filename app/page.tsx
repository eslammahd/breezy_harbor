import { supabase } from '@/lib/supabase';
import { formatDate, formatTime } from '@/lib/utils';
import Link from 'next/link';

export const revalidate = 0;

async function getAvailableSlots() {
  const today = new Date().toISOString().split('T')[0];
  const { data, error } = await supabase
    .from('available_slots')
    .select('*')
    .eq('is_available', true)
    .gte('slot_date', today)
    .order('slot_date', { ascending: true })
    .order('slot_time', { ascending: true });
  if (error) return [];
  return data || [];
}

export default async function HomePage() {
  const slots = await getAvailableSlots();

  const grouped: Record<string, typeof slots> = {};
  for (const slot of slots) {
    if (!grouped[slot.slot_date]) grouped[slot.slot_date] = [];
    grouped[slot.slot_date].push(slot);
  }

  return (
    <div className="space-y-10">
      {/* Hero */}
      <section className="text-center py-10">
        <div className="inline-flex items-center gap-2 bg-brand-50 text-brand-700 text-sm font-medium px-4 py-2 rounded-full mb-6">
          <span className="w-2 h-2 bg-brand-500 rounded-full animate-pulse"></span>
          Online sessions — book from anywhere
        </div>
        <h1 className="text-4xl font-bold text-slate-900 mb-4 leading-tight">
          Book a Session with<br />
          <span className="text-brand-700">Dr. Saad</span>
        </h1>
        <p className="text-slate-500 text-lg max-w-xl mx-auto">
          Therapy &amp; psychiatry consultations online. Pick a time that works for you,
          book in minutes, and pay via Instapay or Vodafone Cash.
        </p>
      </section>

      {/* How it works */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { step: '1', icon: '📅', title: 'Pick a slot', desc: 'Choose a date and time that suits you below' },
          { step: '2', icon: '📝', title: 'Fill in details', desc: 'Your name, phone, and type of session' },
          { step: '3', icon: '💳', title: 'Pay offline', desc: 'Send payment via Instapay or Vodafone Cash' },
        ].map(({ step, icon, title, desc }) => (
          <div key={step} className="card text-center">
            <div className="text-3xl mb-3">{icon}</div>
            <h3 className="font-semibold text-slate-800 mb-1">{title}</h3>
            <p className="text-sm text-slate-500">{desc}</p>
          </div>
        ))}
      </section>

      {/* Available Slots */}
      <section>
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Available Slots</h2>
        {Object.keys(grouped).length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-4xl mb-4">📭</p>
            <p className="text-slate-600 font-medium">No available slots right now.</p>
            <p className="text-slate-400 text-sm mt-1">Please check back soon.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(grouped).map(([date, daySlots]) => (
              <div key={date}>
                <h3 className="text-sm font-semibold text-brand-700 uppercase tracking-wide mb-3">
                  {formatDate(date)}
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {daySlots.map((slot) => (
                    <Link
                      key={slot.id}
                      href={`/book?slot=${slot.id}`}
                      className="card hover:border-brand-400 hover:shadow-md transition-all cursor-pointer text-center group border-2 border-transparent"
                    >
                      <p className="text-lg font-bold text-slate-800 group-hover:text-brand-700">
                        {formatTime(slot.slot_time)}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">{slot.duration_minutes} min</p>
                      <p className="mt-3 text-xs font-semibold text-brand-600 bg-brand-50 px-2 py-1 rounded-full inline-block">
                        Book →
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
