import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export default async function AdminRoot() {
  const cookieStore = await cookies();
  const session = cookieStore.get('admin_session');
  if (session?.value === 'authenticated') {
    redirect('/admin/dashboard');
  } else {
    redirect('/admin/login');
  }
}
