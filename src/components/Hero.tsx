import Link from "next/link";

export default function Hero() {
  return (
    <section className="bg-olive text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 space-y-6 text-center md:text-left">
            <h1 className="text-4xl md:text-6xl font-serif font-bold leading-tight">
              Coffee, Books &<br />
              Meaningful Moments
            </h1>
            <p className="text-lg md:text-xl font-sans text-cream max-w-xl mx-auto md:mx-0">
              Enjoy great coffee, explore books, attend events and become part of our community.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Link href="/books" className="px-8 py-3 bg-gold text-dark font-semibold rounded-lg shadow-md hover:bg-gold-light text-center">
                Explore Books
              </Link>
              <Link href="/login" className="px-8 py-3 border border-beige text-beige font-semibold rounded-lg hover:bg-beige hover:text-dark text-center">
                Login
              </Link>
            </div>
          </div>
          <div className="flex-1 w-full h-64 md:h-96 relative">
            <img src="https://picsum.photos/800/600?random=1" alt="Sifra" className="w-full h-full object-cover rounded-xl shadow-xl" />
          </div>
        </div>
      </div>
    </section>
  );
}
