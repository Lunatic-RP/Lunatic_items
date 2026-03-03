import { useState, useMemo, useEffect, useRef } from 'react';
import { items } from './constants/items';

const ITEMS_PER_PAGE = 24;

export default function App() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [page, setPage] = useState(1);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const loaderRef = useRef(null);

  // --- DÉTECTION D'URL (C'est tout ce qu'on ajoute) ---
  useEffect(() => {
    const handleInitialUrl = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash) {
        // On cherche l'item dont le chemin d'image contient le hash
        const foundItem = items.find(item => item.image.toLowerCase().includes(hash.toLowerCase()));
        if (foundItem) {
          setSearch(foundItem.name); // On remplit la recherche avec le nom de l'item
          setActiveCategory('all');
          setPage(1);
        }
      }
    };

    handleInitialUrl();
    // On écoute aussi si l'utilisateur change le hash manuellement dans sa barre d'adresse
    window.addEventListener('hashchange', handleInitialUrl);
    return () => window.removeEventListener('hashchange', handleInitialUrl);
  }, []);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleCategoryChange = (cat) => {
    setActiveCategory(cat);
    setPage(1);
    setIsSidebarOpen(false);
  };

  const categories = useMemo(() => {
    const cats = items.map(item => item.category);
    return ['all', ...new Set(cats)];
  }, []);

  const allFilteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) ||
                            item.id.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [search, activeCategory]);

  const visibleItems = allFilteredItems.slice(0, page * ITEMS_PER_PAGE);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && visibleItems.length < allFilteredItems.length) {
        setPage(prev => prev + 1);
      }
    }, { threshold: 0.1 });

    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [visibleItems.length, allFilteredItems.length]);

  // ON GARDE TA FONCTION DE CLIC ORIGINALE
  const copyToClipboard = (id) => {
    navigator.clipboard.writeText(id);
    const notification = document.createElement('div');
    notification.innerText = `Copié: ${id}`;
    notification.className = "fixed bottom-5 right-5 bg-[#c3a05b] text-black px-4 py-2 rounded-lg shadow-lg z-[100] font-bold border border-white/20";
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 2000);
  };

  return (
    <div className="flex min-h-screen bg-[#0a0a0f] text-slate-200 selection:bg-[#c3a05b]/30">
      <style dangerouslySetInnerHTML={{ __html: `
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #0a0a0f; }
        ::-webkit-scrollbar-thumb { background: #c3a05b; border-radius: 10px; }
        .sidebar-scroll { overscroll-behavior: contain; }
      `}} />

      {/* Bouton Burger */}
      <button 
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="fixed top-6 left-6 z-[70] md:hidden bg-[#c3a05b] p-3 rounded-xl text-black shadow-lg"
      >
        {isSidebarOpen ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
        )}
      </button>

      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] md:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed md:sticky top-0 left-0 z-[65] w-72 md:w-64 h-screen border-r border-white/5 bg-[#0d0d14]/95 transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} flex flex-col`}>
        <div className="p-6 pt-20 md:pt-6 flex-1 overflow-y-auto sidebar-scroll">
          <h2 className="text-[#c3a05b] font-black uppercase tracking-widest text-[10px] mb-8 opacity-50">Navigation</h2>
          <nav className="space-y-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium capitalize transition-all ${activeCategory === cat ? 'bg-[#c3a05b]/10 text-[#c3a05b] border border-[#c3a05b]/20' : 'text-gray-500 hover:bg-white/5 hover:text-gray-300'}`}
              >
                {cat === 'all' ? 'Tous les items' : cat.replace(/-/g, ' ')}
              </button>
            ))}
          </nav>
        </div>
        <div className="p-6 border-t border-white/5">
          <div className="text-[10px] text-gray-600 font-mono uppercase">
            LUNATIC ITEMS v1.0<br/><span className="text-[#c3a05b] italic">BY RIDERCOOL</span>
          </div>
        </div>
      </aside>

      <main className="flex-1 p-4 md:p-10">
        <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-12 mt-16 md:mt-0">
          <div>
            <h1 className="text-3xl md:text-4xl font-black uppercase italic">
              <span className="text-[#c3a05b]">Lunatic</span> Catalogue
            </h1>
          </div>
          <input 
            type="text"
            value={search} // Important pour que l'URL puisse remplir le champ
            placeholder="Rechercher..."
            className="w-full lg:w-96 bg-[#11111a] border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-[#c3a05b]/50 transition-all shadow-2xl"
            onChange={handleSearchChange}
          />
        </header>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 2xl:grid-cols-8 gap-3 md:gap-4">
          {visibleItems.map((item) => (
            <div 
              key={item.id}
              onClick={() => copyToClipboard(item.id)} // Retour à l'original
              className="group relative bg-[#11111a] border border-white/5 rounded-2xl p-3 md:p-4 flex flex-col items-center justify-between aspect-square hover:border-[#c3a05b]/40 transition-all cursor-pointer"
            >
              <div className="flex-1 flex items-center justify-center p-2 w-full overflow-hidden">
                <img 
                  src={item.image.startsWith('./') ? item.image : `./${item.image}`} 
                  alt={item.name} 
                  loading="lazy"
                  className="max-w-[85%] max-h-[85%] object-contain group-hover:scale-110 transition-transform" 
                />
              </div>
              <p className="text-[9px] md:text-[10px] font-bold text-gray-400 group-hover:text-[#c3a05b] uppercase truncate w-full text-center mt-2">{item.name}</p>
            </div>
          ))}
        </div>

        <div ref={loaderRef} className="h-20 w-full flex items-center justify-center" />
      </main>
    </div>
  );
}