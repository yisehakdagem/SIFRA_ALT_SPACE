import Hero from "@/components/Hero";
import Link from "next/link";

export default function HomePage() {
  return (
    <main>
      <Hero />
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Link href="/books" className="block bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center hover:shadow-md hover:-translate-y-1 transition-all duration-300 group cursor-pointer">
            <h3 className="text-2xl font-bold mb-4 font-serif text-olive group-hover:text-gold transition-colors">Explore Books</h3>
            <p className="text-gray-600">Browse our extensive collection of classic and contemporary literature.</p>
          </Link>
          
          <Link href="/cafe" className="block bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center hover:shadow-md hover:-translate-y-1 transition-all duration-300 group cursor-pointer">
            <h3 className="text-2xl font-bold mb-4 font-serif text-olive group-hover:text-gold transition-colors">Café Menu</h3>
            <p className="text-gray-600">Discover our specialty coffees, teas, and fresh daily pastries.</p>
          </Link>
          
          <Link href="/events" className="block bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center hover:shadow-md hover:-translate-y-1 transition-all duration-300 group cursor-pointer">
            <h3 className="text-2xl font-bold mb-4 font-serif text-olive group-hover:text-gold transition-colors">Upcoming Events</h3>
            <p className="text-gray-600">Join our book clubs, poetry readings, and community gatherings.</p>
          </Link>
        </div>
      </section>
    </main>
  );
}