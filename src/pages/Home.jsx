import { useProducts } from '../hooks/useProducts';
import ProductCard from '../components/ProductCard';
import { Loader2, Coffee, Sparkles, ArrowRight } from 'lucide-react';

const Home = () => {
  const { data: products, isLoading } = useProducts();

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center py-32 bg-stone-50 min-h-screen">
      <div className="relative">
        <Loader2 className="w-16 h-16 animate-spin text-amber-800 opacity-20" />
        <Coffee className="w-8 h-8 text-amber-900 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
      </div>
    </div>
  );

  return (
    <div className="bg-stone-50 min-h-screen pb-20">
      {/* HERO: pt-32 es el secreto para que el Navbar fijo no lo oculte */}
      <section className="bg-stone-900 text-white pt-32 pb-28 px-6 rounded-b-[4rem] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-amber-800/10 blur-[120px] rounded-full -translate-y-1/2" />
        
        <div className="container mx-auto relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <span className="text-amber-500 font-black uppercase tracking-[0.4em] text-[10px]">Cosecha 2026</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] mb-8">
            Café con <br /> <span className="text-amber-500">Alma de Origen.</span>
          </h1>
          
          <p className="text-stone-400 max-w-xl font-medium text-lg leading-relaxed mb-10">
            Explora nuestra selección exclusiva de variedades cultivadas en las montañas de Támesis.
          </p>

          <a href="#seleccion" className="inline-flex items-center gap-3 bg-amber-600 text-stone-950 px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-amber-500 transition-all shadow-xl shadow-amber-900/40">
            Explorar Catálogo
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </section>

      {/* PRODUCTOS */}
      <div id="seleccion" className="container mx-auto px-6 -mt-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products?.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;