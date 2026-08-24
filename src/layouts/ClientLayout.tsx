import { Outlet } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export const ClientLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-brand-bg text-brand-navy">
      <Header />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
