import Navbar from "./Navbar";
import Footer from "./Footer";

export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-ivory text-ink">
      <Navbar />
      <main className="flex-grow max-w-5xl w-full mx-auto px-6 sm:px-10">
        {children}
      </main>
      <Footer />
    </div>
  );
}