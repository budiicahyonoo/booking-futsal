import { redirect } from 'next/navigation';

export default function Home() {
  // Langsung arahkan (tendang) pengunjung dari "/" ke "/auth/login"
  redirect('/auth/login');
}