import { useState, useRef, useEffect } from "react";
import { Search, ShoppingBag, UtensilsCrossed, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface MenuHeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  cartCount: number;
  onCartClick: () => void;
  table?: any;
  restaurant?: any;
}

const MenuHeader = ({ 
  searchQuery, 
  onSearchChange, 
  cartCount, 
  onCartClick, 
  table,
  restaurant
}: MenuHeaderProps) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchOpen) {
      inputRef.current?.focus();
    }
  }, [isSearchOpen]);

  return (
    <header className="sticky top-0 z-50 w-full bg-white/90 dark:bg-zinc-950/90 backdrop-blur-xl border-b border-zinc-200/50 dark:border-zinc-800/50">
      <div className="container max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
        
        {/* Left: Branding & Table Info */}
        <div className={cn(
          "flex items-center gap-3 transition-all duration-300",
          isSearchOpen ? "hidden sm:flex shrink-0" : "flex shrink-0"
        )}>
          <div className="h-10 w-10 rounded-2xl overflow-hidden shadow-lg shadow-emerald-900/10 bg-white flex items-center justify-center">
  {restaurant?.logo ? (
    <img
      src={restaurant.logo}
      alt="logo"
      className="h-full w-full object-cover"
    />
  ) : (
    <UtensilsCrossed className="h-5 w-5 text-[#1a4d3e]" />
  )}
</div>
          
          <div className="flex flex-col">
            <span className="text-base md:text-lg font-black tracking-tight text-zinc-900 dark:text-zinc-100 leading-tight truncate max-w-[120px] md:max-w-none">
               {restaurant?.name || "Restaurant"}
            </span>
            <div className="flex items-center gap-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
  {table
    ? `${table.name} • Table ${table.table_number}`
    : "Table --"}
</span>
            </div>
          </div>
        </div>

        {/* Center/Right: Search & Cart Container */}
        <div className={cn(
          "flex items-center gap-2 flex-1 transition-all duration-300",
          isSearchOpen ? "justify-start" : "justify-end"
        )}>
          
          {/* Expanding Search Component */}
          <div className={cn(
            "relative flex items-center transition-all duration-500 ease-in-out",
            isSearchOpen ? "w-full" : "w-10"
          )}>
            <div className={cn(
              "flex items-center w-full h-11 rounded-2xl transition-all duration-300",
              isSearchOpen ? "bg-zinc-100 dark:bg-zinc-900 px-3 ring-1 ring-zinc-200 dark:ring-zinc-800" : "bg-transparent"
            )}>
              
              <button
                onClick={() => setIsSearchOpen(true)}
                disabled={isSearchOpen}
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all",
                  !isSearchOpen ? "bg-zinc-100 dark:bg-zinc-900 hover:scale-105 active:scale-95" : "text-zinc-400"
                )}
              >
                <Search className={cn("transition-transform", isSearchOpen ? "h-4 w-4" : "h-5 w-5")} />
              </button>

              <input
                ref={inputRef}
                type="text"
                placeholder="Search for dishes..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className={cn(
                  "w-full bg-transparent text-sm font-bold focus:outline-none transition-all duration-300",
                  isSearchOpen ? "opacity-100 ml-2 mr-1" : "opacity-0 w-0 pointer-events-none"
                )}
              />

              {isSearchOpen && (
                <button 
                  onClick={() => {
                    setIsSearchOpen(false);
                    onSearchChange("");
                  }}
                  className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-xl transition-colors shrink-0"
                >
                  <X className="h-4 w-4 text-zinc-500" />
                </button>
              )}
            </div>
          </div>

          {/* Cart Button */}
          {!isSearchOpen && (
            <button
              onClick={onCartClick}
              className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-zinc-900 dark:bg-zinc-100 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-zinc-200 dark:shadow-none"
            >
              <ShoppingBag className="h-5 w-5 text-white dark:text-zinc-900" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-black text-white ring-4 ring-white dark:ring-zinc-950 animate-in zoom-in">
                  {cartCount}
                </span>
              )}
            </button>
          )}
        </div>

      </div>
    </header>
  );
};

export default MenuHeader;