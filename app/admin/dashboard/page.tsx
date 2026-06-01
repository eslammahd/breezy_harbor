import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import AdminDashboardClient from './AdminDashboardClient';

export default async function AdminDashboard() {
  const cookieStore = await cookies();
  const session = cookieStore.get('admin_session');
  if (session?.value !== 'authenticated') {
    redirect('/admin/login');
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: bookings } = await supabase
    .from('bookings')
    .select('*, available_slots(date, time)')
    .order('created_at', { ascending: false });

  const { data: slots } = await supabase
    .from('available_slots')
    .select('*')
    .order('date', { ascending: true })
    .order('time', { ascending: true });

  return <AdminDashboardClient bookings={bookings ?? []} slots={slots ?? []} />;
}
