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

type RestaurantRow = {
  id: string;
  name?: string;
  slug: string;
  [key: string]: unknown;
};

type TableRow = {
  id: string;
  restaurant_id: string;
  table_number: number;
  short_id?: string | null;
  is_active?: boolean | null;
  [key: string]: unknown;
};

const Index = () => {
  const { slug, tableSlug } = useParams<{ slug: string; tableSlug: string }>();
  const cart = useCart();

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [combos, setCombos] = useState<MenuCombo[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [restaurant, setRestaurant] = useState<RestaurantRow | null>(null);
  const [table, setTable] = useState<TableRow | null>(null);

  const [loading, setLoading] = useState(true);
  const [invalidTable, setInvalidTable] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [cartOpen, setCartOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [showSplash, setShowSplash] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let splashTimer: ReturnType<typeof setTimeout> | undefined;

    const loadData = async () => {
      setLoading(true);
      setInvalidTable(false);
      setLoadError(null);

      if (!slug || !tableSlug) {
        setInvalidTable(true);
        setLoading(false);
        return;
      }

      try {
        // Resolve restaurant first. This also scopes all table lookups to the
        // restaurant in the URL, avoiding accidental cross-restaurant matches.
        const { data: restaurantData, error: restaurantError } = await supabase
          .from("restaurants")
          .select("*")
          .eq("slug", slug)
          .maybeSingle();

        if (restaurantError) throw restaurantError;
        if (!restaurantData) {
          if (!cancelled) setInvalidTable(true);
          return;
        }

        const restaurantId = restaurantData.id as string;
        let tableData: TableRow | null = null;

        // Older QR format: /menu/:slug/:tableUUID
        if (tableSlug.length === 36) {
          const { data, error } = await supabase
            .from("tables")
            .select("*")
            .eq("restaurant_id", restaurantId)
            .eq("id", tableSlug)
            .maybeSingle();

          if (error) throw error;
          tableData = (data as TableRow | null) ?? null;
        }

        // Current QR format: table-1-t62b8be or table-1-62b8be.
        // The part after "-t" is treated as the short ID, but both stored
        // conventions (with/without leading "t") are supported.
        if (!tableData) {
          const hybridMatch = tableSlug.match(/^table-(\d+)-t?(.+)$/i);

          if (hybridMatch) {
            const tableNumber = Number(hybridMatch[1]);
            const shortId = hybridMatch[2];

            const shortIdCandidates = Array.from(
              new Set([shortId, `t${shortId}`, `-${shortId}`, `t-${shortId}`])
            );

            for (const candidate of shortIdCandidates) {
              const { data, error } = await supabase
                .from("tables")
                .select("*")
                .eq("restaurant_id", restaurantId)
                .eq("short_id", candidate)
                .maybeSingle();

              if (error) throw error;
              if (data) {
                tableData = data as TableRow;
                break;
              }
            }

            // Fallback to the table number only within the matched restaurant.
            if (!tableData && Number.isFinite(tableNumber)) {
              const { data, error } = await supabase
                .from("tables")
                .select("*")
                .eq("restaurant_id", restaurantId)
                .eq("table_number", tableNumber)
                .maybeSingle();

              if (error) throw error;
              tableData = (data as TableRow | null) ?? null;
            }
          } else {
            // Legacy format: table-1
            const numberMatch = tableSlug.match(/^table-(\d+)$/i);
            if (numberMatch) {
              const { data, error } = await supabase
                .from("tables")
                .select("*")
                .eq("restaurant_id", restaurantId)
                .eq("table_number", Number(numberMatch[1]))
                .maybeSingle();

              if (error) throw error;
              tableData = (data as TableRow | null) ?? null;
            }
          }
        }

        if (!tableData) {
          if (!cancelled) setInvalidTable(true);
          return;
        }

        // Do not allow a disabled table QR to open the ordering menu.
        if (tableData.is_active === false) {
          if (!cancelled) {
            setInvalidTable(true);
            setLoadError("This table is currently inactive. Please ask staff for assistance.");
          }
          return;
        }

        const [menuRes, comboRes] = await Promise.all([
          supabase
            .from("menu_categories")
            .select("*, menu_items(*)")
            .eq("restaurant_id", restaurantId),
          supabase
            .from("menu_combos")
            .select("*, menu_combo_items(quantity, menu_items(name))")
            .eq("restaurant_id", restaurantId)
            .eq("is_available", true),
        ]);

        if (menuRes.error) throw menuRes.error;
        if (comboRes.error) throw comboRes.error;

        const allItems: MenuItem[] =
          (menuRes.data ?? []).flatMap((category: any) =>
            (category.menu_items ?? []).map((item: any) => ({
              ...item,
              category_id: category.id,
              category_name: category.name,
            }))
          );

        const allCombos: MenuCombo[] = (comboRes.data ?? []).map((combo: any) => ({
          ...combo,
          included_items: (combo.menu_combo_items ?? []).map((junction: any) => ({
            name: junction.menu_items?.name ?? "Unknown Item",
            quantity: junction.quantity ?? 1,
          })),
        }));

        if (cancelled) return;

        setTable(tableData);
        setRestaurant(restaurantData as RestaurantRow);
        setCategories((menuRes.data ?? []) as Category[]);
        setMenuItems(allItems);
        setCombos(allCombos);
        setShowSplash(true);

        splashTimer = setTimeout(() => {
          if (!cancelled) setShowSplash(false);
        }, 3000);
      } catch (error) {
        console.error("Failed to load QR menu:", error);
        if (!cancelled) {
          setLoadError(
            error instanceof Error
              ? error.message
              : "An unexpected error occurred while loading the menu."
          );
          toast.error("Failed to load menu. Please try again.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void loadData();

    return () => {
      cancelled = true;
      if (splashTimer) clearTimeout(splashTimer);
    };
  }, [slug, tableSlug]);

  const activeCategoryName = useMemo(() => {
    if (activeCategory === "All") return "All Items";
    if (activeCategory === "Combos") return "Featured Bundles";
    const found = categories.find((category) => category.id === activeCategory);
    return found ? `${found.name} Items` : "Menu Items";
  }, [activeCategory, categories]);

  const displayContent = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const isCombosTab = activeCategory === "Combos";

    const filteredItems = isCombosTab
      ? []
      : menuItems.filter((item) => {
          const matchesCategory =
            activeCategory === "All" || item.category_id === activeCategory;
          return (
            matchesCategory &&
            item.name.toLowerCase().includes(query) &&
            item.is_available
          );
        });

    const filteredCombos = isCombosTab
      ? combos.filter(
          (combo) =>
            combo.name.toLowerCase().includes(query) && combo.is_available
        )
      : [];

    return { filteredItems, filteredCombos };
  }, [activeCategory, searchQuery, menuItems, combos]);

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-white">
        <Loader2 className="w-10 h-10 animate-spin text-zinc-900" />
        <p className="mt-4 text-zinc-400 font-bold tracking-tighter uppercase text-xs">
          Loading Menu...
        </p>
      </div>
    );
  }

  if (invalidTable) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white px-6 text-center">
        <ShoppingBag className="mb-4 h-10 w-10 text-zinc-300" />
        <h1 className="text-lg font-bold text-zinc-900">Invalid Table QR</h1>
        <p className="mt-2 max-w-md text-sm text-zinc-500">
          {loadError ??
            "We couldn't find this table. Please scan the QR code again or ask a staff member for help."}
        </p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white px-6 text-center">
        <h1 className="text-lg font-bold text-zinc-900">Unable to load menu</h1>
        <p className="mt-2 max-w-md text-sm text-zinc-500">{loadError}</p>
        <button
          className="mt-4 rounded-xl bg-zinc-900 px-4 py-2 text-white"
          onClick={() => window.location.reload()}
        >
          Try again
        </button>
      </div>
    );
  }

  if (showSplash) {
    return (
      <MenuSplash
        onFinish={() => setShowSplash(false)}
        restaurant={restaurant}
      />
    );
  }

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

      <div className="fixed bottom-6 left-0 right-0 px-4 z-40 flex flex-col items-center gap-4 pointer-events-none">
        <div className="pointer-events-auto shadow-2xl rounded-full">
          <FloatingActions restaurantId={restaurant?.id} />
        </div>

        {cart.totalItems > 0 && !cartOpen && (
          <button
            onClick={() => setCartOpen(true)}
            className="pointer-events-auto w-full max-w-md flex justify-between items-center bg-zinc-900 p-2 pl-6 rounded-2xl text-white shadow-[0_20px_50px_rgba(0,0,0,0.3)] animate-in slide-in-from-bottom-10 duration-500"
          >
            <div className="flex flex-col items-start leading-none">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-1">
                Your Order
              </span>
              <span className="text-lg font-bold">
                ₹{cart.totalPrice.toFixed(2)}
              </span>
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
        tableId={table?.id}
      />

      <ReviewModal open={reviewOpen} onClose={() => setReviewOpen(false)} />
    </div>
  );
};

export default Index;
