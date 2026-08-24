import { Outlet } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export const ClientLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#F7F9FB] text-[#191C1E] antialiased">
      <Header />
      <main className="flex-1 w-full">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
