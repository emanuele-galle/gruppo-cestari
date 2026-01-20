import { Header } from '@/components/public/header';
import { Footer } from '@/components/public/footer';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main id="main-content" className="flex-1" role="main">{children}</main>
      <Footer />
    </>
  );
}
