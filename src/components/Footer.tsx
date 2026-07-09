import Logo from "./Logo";

export default function Footer() {
  return (
    <footer className="bg-olive text-white py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center text-cream">
        <div className="flex items-center gap-2 mb-3 sm:mb-0">
          <Logo className="h-6 text-gold" />
          <p className="text-xs text-cream/80">A quiet book café and alternative space.</p>
        </div>
        <p className="text-xs text-cream/50">&copy; {new Date().getFullYear()} Sifra. All rights reserved.</p>
      </div>
    </footer>
  );
}
