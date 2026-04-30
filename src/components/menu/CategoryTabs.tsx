import { Category } from "@/data/menuData";
import { 
  Sparkles, Utensils, ChefHat, IceCream, 
  GlassWater, Flame, LayoutGrid, Package 
} from "lucide-react";

// ✅ Icon mapping
const categoryIcons: Record<string, React.ReactNode> = {
  All: <Sparkles className="w-4 h-4" />,
  Combos: <Package className="w-4 h-4" />,
  Starters: <Utensils className="w-4 h-4" />,
  "Main Course": <ChefHat className="w-4 h-4" />,
  Desserts: <IceCream className="w-4 h-4" />,
  Juices: <GlassWater className="w-4 h-4" />,
  Specials: <Flame className="w-4 h-4" />,
  Drinks: <GlassWater className="w-4 h-4" />,
};

interface CategoryTabsProps {
  active: string;
  onChange: (id: string) => void;
  categories: Category[];
}

const CategoryTabs = ({ active, onChange, categories }: CategoryTabsProps) => {

  // ✅ Theme-based styles (NO hardcoded colors)
  const getBtnStyles = (isActive: boolean) => `
    relative flex items-center gap-2 px-5 py-2.5 rounded-2xl whitespace-nowrap
    text-sm font-semibold transition-all duration-300 ease-out active:scale-95 select-none
    ${
      isActive
        ? "bg-primary text-primary-foreground shadow-card-hover translate-y-[-1px]"
        : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
    }
  `;

  return (
    <div className="w-full bg-background/70 backdrop-blur-xl border-b border-border">
      <div className="flex gap-3 overflow-x-auto py-4 px-4 scrollbar-hide items-center">

        {/* 🔹 All */}
        <button
          onClick={() => onChange("All")}
          className={getBtnStyles(active === "All")}
        >
          <Sparkles className={`w-4 h-4 ${active === "All" ? "scale-110" : ""}`} />
          <span>All</span>
        </button>

        {/* 🔹 Combos */}
        <button
          onClick={() => onChange("Combos")}
          className={getBtnStyles(active === "Combos")}
        >
          <Package className={`w-4 h-4 ${active === "Combos" ? "scale-110 text-primary" : ""}`} />
          <span className="tracking-tight">Combos</span>

          {active === "Combos" && (
            <span className="absolute -top-1 -right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
          )}
        </button>

        {/* 🔹 Dynamic Categories */}
        {categories.map((cat) => {
          const isActive = active === cat.id;
          const Icon = categoryIcons[cat.name] || <LayoutGrid className="w-4 h-4" />;

          return (
            <button
              key={cat.id}
              onClick={() => onChange(cat.id)}
              className={getBtnStyles(isActive)}
            >
              <span className={`transition-transform duration-300 ${isActive ? "scale-110" : ""}`}>
                {Icon}
              </span>

              <span className="tracking-tight">{cat.name}</span>

              {isActive && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary opacity-70" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryTabs;