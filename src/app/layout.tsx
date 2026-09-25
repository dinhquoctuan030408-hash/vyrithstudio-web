import type { Metadata, Viewport } from 'next';
import '@/styles/globals.css';
import { AuthProvider } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import FloatingFeedbackButton from '@/components/FloatingFeedbackButton';

export const metadata: Metadata = {
  title: {
    template: 'Vyrith Studio - %s',
    default: 'Vyrith Studio - Next-Gen Software & Game Hub',
  },
  description: 'Independent R&D hub engineering high-performance software, C++ engines, and virtual worlds.',
  icons: {
    icon: '/icons/channel.png',
    shortcut: '/icons/channel.png',
    apple: '/icons/channel.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className="bg-[#090D16] min-h-screen text-slate-100 relative selection:bg-blue-600 selection:text-white antialiased overflow-x-hidden">
        <div className="fixed top-[-10vw] left-[15vw] w-[45vw] h-[45vw] max-w-[600px] max-h-[600px] bg-[#4F46E5]/15 blur-[120px] pointer-events-none rounded-full" />
        <div className="fixed bottom-[-10vw] right-[10vw] w-[50vw] h-[50vw] max-w-[700px] max-h-[700px] bg-[#3B82F6]/10 blur-[140px] pointer-events-none rounded-full" />

        <AuthProvider>
          <Navbar />
          <main className="relative z-10 w-full min-h-[calc(100vh-5rem)] flex flex-col justify-between">
            {children}
          </main>
          <FloatingFeedbackButton />
        </AuthProvider>
      </body>
    </html>
  );
}