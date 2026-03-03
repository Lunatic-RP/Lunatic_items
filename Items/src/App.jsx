import { useState, useMemo, useEffect, useRef } from 'react';
import { items } from './constants/items';

const ITEMS_PER_PAGE = 20;

export default function App() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [page, setPage] = useState(1);
  const loaderRef = useRef(null);

  // Fonctions de modification (On reset la page ici, pas dans un effect)
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleCategoryChange = (cat) => {
    setActiveCategory(cat);
    setPage(1);
  };

  // Extraction des catégories
  const categories = useMemo(() => {
    const cats = items.map(item => item.category);
    return ['all', ...new Set(cats)];
  }, []);

  // Filtrage des items
  const allFilteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) ||
                            item.id.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [search, activeCategory]);

  // Calcul des items visibles en fonction de la page
  const visibleItems = allFilteredItems.slice(0, page * ITEMS_PER_PAGE);

  // Intersection Observer (Seul effect autorisé pour l'API externe Browser)
  useEffect(() => {
    window.scrollTo(0, 0);
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  // Scroll infini
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && visibleItems.length < allFilteredItems.length) {
        setPage(prev => prev + 1);
      }
    }, { threshold: 0.1 });

    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [visibleItems.length, allFilteredItems.length]);

  const copyToClipboard = (id) => {
    navigator.clipboard.writeText(id);
    const notification = document.createElement('div');
    notification.innerText = `Copié: ${id}`;
    notification.className = "fixed bottom-5 right-5 bg-[#c3a05b] text-black px-4 py-2 rounded-lg shadow-lg z-50 font-bold border border-white/20";
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 2000);
  };

  return (
    <div className="flex min-h-screen bg-[#0a0a0f] text-slate-200 selection:bg-[#c3a05b]/30">
      <style dangerouslySetInnerHTML={{ __html: `
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #0a0a0f; }
        ::-webkit-scrollbar-thumb { background: #c3a05b; border-radius: 10px; }
        * { scrollbar-width: thin; scrollbar-color: #c3a05b #0a0a0f; }
      `}} />

      {/* Sidebar */}
      <aside className="w-64 border-r border-white/5 bg-[#0d0d14]/80 backdrop-blur-md sticky top-0 h-screen hidden md:flex flex-col">
        <div className="p-6 flex-1 overflow-y-auto">
          <h2 className="text-[#c3a05b] font-black uppercase tracking-widest text-[10px] mb-8 opacity-50">Navigation</h2>
          <nav className="space-y-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium capitalize transition-all ${
                  activeCategory === cat 
                  ? 'bg-[#c3a05b]/10 text-[#c3a05b] border border-[#c3a05b]/20' 
                  : 'text-gray-500 hover:bg-white/5 hover:text-gray-300'
                }`}
              >
                {cat === 'all' ? 'Tous les items' : cat.replace(/-/g, ' ')}
              </button>
            ))}
          </nav>
        </div>
        
        <div className="p-6 border-t border-white/5 bg-[#0d0d14]">
          <div className="text-[10px] text-gray-600 font-mono leading-relaxed uppercase">
            LUNATIC ITEMS v1.0<br/>
            <span className="text-[#c3a05b] tracking-tighter italic">BY RIDERCOOL</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 lg:p-10">
        <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black tracking-tighter uppercase italic">
              <span className="text-[#c3a05b]">Lunatic</span> Catalogue
            </h1>
            <p className="text-gray-500 text-[10px] font-mono uppercase tracking-[0.2em] mt-1">Items Lunatic RP</p>
          </div>

          <input 
            type="text"
            placeholder="Rechercher..."
            className="w-full lg:w-96 bg-[#11111a] border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-[#c3a05b]/50 transition-all shadow-2xl"
            onChange={handleSearchChange}
          />
        </header>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 2xl:grid-cols-8 gap-4">
          {visibleItems.map((item) => (
            <div 
              key={item.id}
              onClick={() => copyToClipboard(item.id)}
              className="group relative bg-[#11111a] border border-white/5 rounded-2xl p-4 flex flex-col items-center justify-between aspect-square hover:border-[#c3a05b]/40 hover:bg-[#c3a05b]/[0.02] transition-all duration-300 cursor-pointer"
            >
              <div className="flex-1 flex items-center justify-center p-2">
                <img src={item.image.startsWith('./') ? item.image : `./${item.image}`} alt={item.name} className="max-w-[80%] max-h-[80%] object-contain group-hover:scale-110 transition-transform duration-500"/>
              </div>
              <div className="w-full text-center mt-2">
                <p className="text-[10px] font-bold text-gray-400 group-hover:text-[#c3a05b] truncate uppercase">{item.name}</p>
                <p className="text-[8px] font-mono text-gray-700 mt-0.5">{item.category}</p>
              </div>
            </div>
          ))}
        </div>

        <div ref={loaderRef} className="h-20 w-full flex items-center justify-center mt-10">
          {visibleItems.length < allFilteredItems.length && (
            <div className="w-6 h-6 border-2 border-[#c3a05b]/20 border-b-[#c3a05b] rounded-full animate-spin" />
          )}
        </div>
      </main>
    </div>
  );
}