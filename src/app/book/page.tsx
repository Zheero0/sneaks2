
import { BookingForm } from '@/components/BookingForm';
import { Header } from '@/components/Header';
import { Droplets } from 'lucide-react';

export default function BookPage() {
  return (
    <div className="bg-background text-foreground">
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
        <div className="absolute left-1/2 top-0 h-[100vh] w-[100vw] -translate-x-1/2 bg-[radial-gradient(circle_50%_50%_at_50%_50%,#8EACFF33,transparent)] backdrop-blur-[2px]"></div>
      </div>
      
      <div className="relative z-10 flex flex-col min-h-screen">
        <Header />
        <main className="container mx-auto px-4 py-16 flex-1 flex items-center justify-center">
          <div className="w-full max-w-3xl">
            <div className="relative z-20">
              <BookingForm />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

    