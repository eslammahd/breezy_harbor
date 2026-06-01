'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Booking = {
  id: string;
  patient_name: string;
  phone: string;
  session_type: string;
  confirmation_code: string;
  payment_confirmed: boolean;
  created_at: string;
  available_slots: { date: string; time: string } | null;
};

type Slot = {
  id: string;
  date: string;
  time: string;
  duration: number;
  is_available: boolean;
};

export default function AdminDashboardClient({
  bookings: initialBookings,
  slots: initialSlots,
}: {
  bookings: Booking[];
  slots: Slot[];
}) {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [slots, setSlots] = useState<Slot[]>(initialSlots);
  const [activeTab, setActiveTab] = useState<'bookings' | 'slots'>('bookings');
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newDuration, setNewDuration] = useState('60');
  const [addingSlot, setAddingSlot] = useState(false);
  const [slotError, setSlotError] = useState('');

  async function togglePayment(id: string, current: boolean) {
    const res = await fetch('/api/admin/bookings/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, payment_confirmed: !current }),
    });
    if (res.ok) {
      setBookings(prev =>
        prev.map(b => b.id === id ? { ...b, payment_confirmed: !current } : b)
      );
    }
  }

  async function addSlot(e: React.FormEvent) {
    e.preventDefault();
    setAddingSlot(true);
    setSlotError('');
    const res = await fetch('/api/admin/slots', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: newDate, time: newTime, duration: parseInt(newDuration) }),
    });
    const data = await res.json();
    if (res.ok) {
      setSlots(prev => [...prev, data.slot].sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time)));
      setNewDate('');
      setNewTime('');
      setNewDuration('60');
    } else {
      setSlotError(data.error || 'Failed to add slot.');
    }
    setAddingSlot(false);
  }

  async function removeSlot(id: string) {
    const res = await fetch('/api/admin/slots', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      setSlots(prev => prev.filter(s => s.id !== id));
    }
  }

  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
  }

  const formatDate = (d: string) =>
    new Date(d + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });

  const formatTime = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${m.toString().padStart(2, '0')} ${ampm}`;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Dr. Saad — Admin Panel</h1>
          <p className="text-sm text-slate-500">Manage bookings and available slots</p>
        </div>
        <button onClick={logout} className="text-sm text-slate-500 hover:text-red-500 transition font-medium">
          Sign out
        </button>
      </header>

      {/* Stats bar */}
      <div className="bg-white border-b border-slate-100 px-6 py-3 flex gap-6">
        <div className="text-center">
          <p className="text-2xl font-bold text-teal-600">{bookings.length}</p>
          <p className="text-xs text-slate-500">Total Bookings</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-green-600">{bookings.filter(b => b.payment_confirmed).length}</p>
          <p className="text-xs text-slate-500">Paid</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-amber-500">{bookings.filter(b => !b.payment_confirmed).length}</p>
          <p className="text-xs text-slate-500">Awaiting Payment</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-slate-600">{slots.filter(s => s.is_available).length}</p>
          <p className="text-xs text-slate-500">Open Slots</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 pt-6">
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
              activeTab === 'bookings'
                ? 'bg-teal-600 text-white'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Bookings
          </button>
          <button
            onClick={() => setActiveTab('slots')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
              activeTab === 'slots'
                ? 'bg-teal-600 text-white'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Manage Slots
          </button>
        </div>

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            {bookings.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <p className="text-lg font-medium">No bookings yet</p>
                <p className="text-sm">Bookings will appear here once patients start booking.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="text-left px-4 py-3 font-semibold text-slate-600">Patient</th>
                      <th className="text-left px-4 py-3 font-semibold text-slate-600">Phone</th>
                      <th className="text-left px-4 py-3 font-semibold text-slate-600">Session</th>
                      <th className="text-left px-4 py-3 font-semibold text-slate-600">Slot</th>
                      <th className="text-left px-4 py-3 font-semibold text-slate-600">Code</th>
                      <th className="text-left px-4 py-3 font-semibold text-slate-600">Payment</th>
                      <th className="text-left px-4 py-3 font-semibold text-slate-600">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {bookings.map(b => (
                      <tr key={b.id} className="hover:bg-slate-50 transition">
                        <td className="px-4 py-3 font-medium text-slate-800">{b.patient_name}</td>
                        <td className="px-4 py-3 text-slate-600">{b.phone}</td>
                        <td className="px-4 py-3 text-slate-600">{b.session_type}</td>
                        <td className="px-4 py-3 text-slate-600">
                          {b.available_slots
                            ? `${formatDate(b.available_slots.date)} ${formatTime(b.available_slots.time)}`
                            : '—'}
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded">{b.confirmation_code}</span>
                        </td>
                        <td className="px-4 py-3">
                          {b.payment_confirmed ? (
                            <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded-full">
                              ✓ Confirmed
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 text-xs font-semibold px-2 py-1 rounded-full">
                              ⏳ Pending
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => togglePayment(b.id, b.payment_confirmed)}
                            className={`text-xs font-semibold px-3 py-1 rounded-lg transition ${
                              b.payment_confirmed
                                ? 'bg-slate-100 text-slate-600 hover:bg-red-50 hover:text-red-600'
                                : 'bg-teal-600 text-white hover:bg-teal-700'
                            }`}
                          >
                            {b.payment_confirmed ? 'Unconfirm' : 'Confirm Payment'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Slots Tab */}
        {activeTab === 'slots' && (
          <div className="space-y-6">
            {/* Add slot form */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-base font-semibold text-slate-800 mb-4">Add New Slot</h2>
              <form onSubmit={addSlot} className="flex flex-wrap gap-3 items-end">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Date</label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={e => setNewDate(e.target.value)}
                    required
                    min={new Date().toISOString().split('T')[0]}
                    className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Time</label>
                  <input
                    type="time"
                    value={newTime}
                    onChange={e => setNewTime(e.target.value)}
                    required
                    className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Duration (min)</label>
                  <select
                    value={newDuration}
                    onChange={e => setNewDuration(e.target.value)}
                    className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="30">30 min</option>
                    <option value="45">45 min</option>
                    <option value="60">60 min</option>
                    <option value="90">90 min</option>
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={addingSlot}
                  className="bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-teal-700 transition disabled:opacity-60"
                >
                  {addingSlot ? 'Adding…' : '+ Add Slot'}
                </button>
              </form>
              {slotError && <p className="text-red-500 text-sm mt-2">{slotError}</p>}
            </div>

            {/* Slots list */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              {slots.length === 0 ? (
                <div className="p-12 text-center text-slate-400">
                  <p className="text-lg font-medium">No slots yet</p>
                  <p className="text-sm">Add your first available slot above.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {slots.map(s => (
                    <div key={s.id} className="flex items-center justify-between px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-2 h-2 rounded-full bg-teal-500"></div>
                        <div>
                          <p className="font-medium text-slate-800">{formatDate(s.date)}</p>
                          <p className="text-sm text-slate-500">{formatTime(s.time)} · {s.duration || 60} min</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                          s.is_available ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {s.is_available ? 'Available' : 'Booked'}
                        </span>
                        {s.is_available && (
                          <button
                            onClick={() => removeSlot(s.id)}
                            className="text-xs text-red-500 hover:text-red-700 font-medium transition"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <div className="h-12" />
    </div>
  );
}
