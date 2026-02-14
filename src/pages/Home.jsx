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
      {/* HERO RESPONSIVE: 
          - En móvil: texto centrado y padding menor.
          - En laptop (md): texto a la izquierda y tipografía gigante.
      */}
      <section className="bg-stone-900 text-white pt-24 md:pt-32 pb-20 md:pb-28 px-6 rounded-b-[3rem] md:rounded-b-[4rem] shadow-2xl relative overflow-hidden text-center md:text-left">
        <div className="absolute top-0 right-0 w-full md:w-1/2 h-full bg-amber-800/10 blur-[120px] rounded-full -translate-y-1/2" />
        
        <div className="container mx-auto relative z-10">
          <div className="flex items-center justify-center md:justify-start gap-3 mb-6">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <span className="text-amber-500 font-black uppercase tracking-[0.4em] text-[10px]">Cosecha 2026</span>
          </div>
          
          <h1 className="text-4xl sm:text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] mb-8">
            Café con <br /> <span className="text-amber-500">Alma de Origen.</span>
          </h1>
          
          <p className="text-stone-400 max-w-xl mx-auto md:mx-0 font-medium text-base md:text-lg leading-relaxed mb-10">
            Explora nuestra selección exclusiva de variedades cultivadas en las montañas de Támesis.
          </p>

          <a href="#seleccion" className="inline-flex items-center gap-3 bg-amber-600 text-stone-950 px-8 md:px-10 py-4 md:py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-amber-500 transition-all shadow-xl shadow-amber-900/40">
            Explorar Catálogo
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </section>

      {/* GRID DE PRODUCTOS RESPONSIVE:
          - 1 columna en móviles.
          - 2 columnas en tablets (sm).
          - 3 columnas en laptops pequeñas (lg).
          - 4 columnas en pantallas grandes (xl).
      */}
      <div id="seleccion" className="container mx-auto px-6 -mt-8 md:-mt-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
          {products?.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;