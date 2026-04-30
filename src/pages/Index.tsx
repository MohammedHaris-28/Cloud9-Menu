import { useState, useMemo, useEffect } from "react";
import { useParams } from "react-router-dom";
import MenuHeader from "@/components/menu/MenuHeader";
import CategoryTabs from "@/components/menu/CategoryTabs";
import MenuCard from "@/components/menu/MenuCard";
import ComboCard from "@/components/menu/ComboCard";
import ViewToggle from "@/components/menu/ViewToggle";
import CartDrawer from "@/components/menu/CartDrawer";
import FloatingActions from "@/components/menu/FloatingActions";
import ReviewModal from "@/components/menu/ReviewModal";
import { useCart } from "@/hooks/useCart";
import { Loader2, ShoppingBag, ChevronRight } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { MenuItem, MenuCombo, Category } from "@/data/menuData";
import MenuSplash from "@/components/MenuSplash"; 

const Index = () => {
  const { slug, tableSlug } = useParams(); // ✅ UPDATED
  const cart = useCart();

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [combos, setCombos] = useState<MenuCombo[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [restaurant, setRestaurant] = useState<any>(null);
  const [table, setTable] = useState<any>(null);

  const [loading, setLoading] = useState(true);
  const [invalidTable, setInvalidTable] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [cartOpen, setCartOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
 

useEffect(() => {
  const timer = setTimeout(() => {
    setShowSplash(false);
  }, 2500);

  return () => clearTimeout(timer);
}, []);
  /* ✅ Extract table number from slug */
  const extractTableNumber = (slug: string) => {
    const match = slug?.match(/table-(\d+)/);
    return match ? parseInt(match[1]) : null;
  };

 useEffect(() => {
  const loadData = async () => {
    if (!tableSlug) {
      setInvalidTable(true);
      return;
    }

    setLoading(true);

    try {
      let tableData = null;

/* ===============================
   CASE 1: UUID (old QR)
=============================== */
if (tableSlug.length === 36) {
  const { data } = await supabase
    .from("tables")
    .select("*")
    .eq("id", tableSlug)
    .single();

  tableData = data;
}

/* ===============================
   CASE 2: HYBRID SLUG
   table-1-t0e96a  ✅ BEST
=============================== */
if (!tableData && tableSlug.includes("-t")) {
  const idPart = tableSlug.split("-t")[1];

  const { data } = await supabase
    .from("tables")
    .select("*")
    .eq("short_id", idPart);

  if (data && data.length > 0) {
    tableData = data[0];
  }
}

/* ===============================
   CASE 3: table-number fallback
=============================== */
if (!tableData && tableSlug.startsWith("table-")) {
  const tableNumber = parseInt(tableSlug.split("-")[1]);

  const { data: restaurantData } = await supabase
    .from("restaurants")
    .select("id")
    .eq("slug", slug)
    .single();

  if (restaurantData) {
    const { data } = await supabase
      .from("tables")
      .select("*")
      .eq("restaurant_id", restaurantData.id)
      .eq("table_number", tableNumber)
      .single();

    tableData = data;
  }
}

      if (!tableData) {
        setInvalidTable(true);
        return;
      }

      setTable(tableData);

      const restaurantId = tableData.restaurant_id;

      const [menuRes, restRes, comboRes] = await Promise.all([
        supabase
          .from("menu_categories")
          .select(`*, menu_items(*)`)
          .eq("restaurant_id", restaurantId),

        supabase
          .from("restaurants")
          .select("*")
          .eq("id", restaurantId)
          .single(),

        supabase
          .from("menu_combos")
          .select(`*, menu_combo_items (quantity, menu_items (name))`)
          .eq("restaurant_id", restaurantId)
          .eq("is_available", true),
      ]);

      if (menuRes.error) throw menuRes.error;

      const allItems =
        menuRes.data?.flatMap((cat: any) =>
          (cat.menu_items || []).map((item: any) => ({
            ...item,
            category_id: cat.id,
            category_name: cat.name,
          }))
        ) || [];

      const allCombos = (comboRes.data || []).map((c: any) => ({
        ...c,
        included_items: (c.menu_combo_items || []).map((j: any) => ({
          name: j.menu_items?.name || "Unknown Item",
          quantity: j.quantity || 1,
        })),
      }));

      setCategories(menuRes.data || []);
      setMenuItems(allItems);
      setCombos(allCombos);
      setRestaurant(restRes.data);
    } catch (err) {
      toast.error("Failed to load menu");
    } finally {
      setLoading(false);
    }
  };

  loadData();
}, [slug, tableSlug]);

  const activeCategoryName = useMemo(() => {
    if (activeCategory === "All") return "All Items";
    if (activeCategory === "Combos") return "Featured Bundles";
    const found = categories.find((c) => c.id === activeCategory);
    return found ? `${found.name} Items` : "Menu Items";
  }, [activeCategory, categories]);

  const displayContent = useMemo(() => {
    const query = searchQuery.toLowerCase();
    const isCombosTab = activeCategory === "Combos";

    const filteredItems = isCombosTab
      ? []
      : menuItems.filter((item) => {
          const matchesCategory =
            activeCategory === "All" ||
            item.category_id === activeCategory;

          return (
            matchesCategory &&
            item.name.toLowerCase().includes(query) &&
            item.is_available
          );
        });

    const filteredCombos = !isCombosTab
      ? []
      : combos.filter(
          (combo) =>
            combo.name.toLowerCase().includes(query) &&
            combo.is_available
        );

    return { filteredItems, filteredCombos };
  }, [activeCategory, searchQuery, menuItems, combos]);

  if (invalidTable)
    return (
      <div className="h-screen flex items-center justify-center font-bold">
        Invalid Table QR
      </div>
    );
  // REPLACE YOUR OLD if(showSplash) BLOCK WITH THIS:
if (showSplash) {
  return <MenuSplash onFinish={() => setShowSplash(false)} />;
}

  if (loading)
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-white">
        <Loader2 className="w-10 h-10 animate-spin text-zinc-900" />
        <p className="mt-4 text-zinc-400 font-bold tracking-tighter uppercase text-xs">
          Loading Menu...
        </p>
      </div>
    );

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 pb-44">
      <MenuHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        cartCount={cart.totalItems}
        onCartClick={() => setCartOpen(true)}
        restaurant={restaurant}
        table={table}
      />

      <div className="sticky top-[64px] z-30 bg-white/95 backdrop-blur-md border-b">
        <CategoryTabs
          active={activeCategory}
          onChange={setActiveCategory}
          categories={categories}
        />
      </div>

      <main className="container max-w-5xl mx-auto px-4 pt-6">
        <div className="flex justify-between items-center mb-6">
          <span className="text-xs font-bold text-zinc-400 uppercase">
            {activeCategoryName}
          </span>

          {activeCategory !== "Combos" && (
            <ViewToggle view={view} onChange={setView} />
          )}
        </div>

        {activeCategory === "Combos" ? (
          <div className="grid md:grid-cols-2 gap-6">
            {displayContent.filteredCombos.map((combo) => (
              <ComboCard
                key={combo.id}
                item={combo as any}
                onAdd={(item: any) =>
                  cart.addItem({
                    ...item,
                    price: item.discount_price,
                  })
                }
                view="grid"
              />
            ))}
          </div>
        ) : (
          <div
            className={
              view === "grid"
                ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
                : "flex flex-col gap-4"
            }
          >
            {displayContent.filteredItems.map((item) => (
              <MenuCard
                key={item.id}
                item={item}
                onAdd={cart.addItem}
                view={view}
              />
            ))}
          </div>
        )}

        {displayContent.filteredItems.length === 0 &&
          displayContent.filteredCombos.length === 0 && (
            <div className="text-center py-20 text-zinc-300">
              <ShoppingBag className="mx-auto mb-2 opacity-20" />
              <p>No items found</p>
            </div>
          )}
      </main>
       {/* --- FOOTER UI (FAB + CART) --- */}
      <div className="fixed bottom-6 left-0 right-0 px-4 z-40 flex flex-col items-center gap-4 pointer-events-none">
        
        {/* Floating Actions: Positioned naturally above the cart */}
        <div className="pointer-events-auto shadow-2xl rounded-full">
           <FloatingActions restaurantId={restaurant?.id} />
        </div>

        {/* Checkout Bar: Adaptive Mobile Bottom Bar */}
        {cart.totalItems > 0 && !cartOpen && (
          <button
            onClick={() => setCartOpen(true)}
            className="pointer-events-auto w-full max-w-md flex justify-between items-center bg-zinc-900 p-2 pl-6 rounded-2xl text-white shadow-[0_20px_50px_rgba(0,0,0,0.3)] animate-in slide-in-from-bottom-10 duration-500"
          >
            <div className="flex flex-col items-start leading-none">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-1">Your Order</span>
              <span className="text-lg font-bold">₹{cart.totalPrice.toFixed(2)}</span>
            </div>
            
            <div className="flex items-center gap-2 bg-white/10 py-3 px-5 rounded-xl font-bold text-sm">
              <span>{cart.totalItems} Items</span>
              <ChevronRight className="w-4 h-4 opacity-50" />
            </div>
          </button>
        )}
      </div>

      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        items={cart.items}
        totalPrice={cart.totalPrice}
        onAdd={cart.addItem}
        onRemove={cart.removeItem}
        onClear={cart.clearCart}
        restaurantId={restaurant?.id}
        tableId={table?.id} // ✅ IMPORTANT FIX
      />

      <ReviewModal
        open={reviewOpen}
        onClose={() => setReviewOpen(false)}
      />
    </div>
  );
};

export default Index;