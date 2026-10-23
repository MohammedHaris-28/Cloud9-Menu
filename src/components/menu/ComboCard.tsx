
import { useState } from "react";
import type { MouseEvent } from "react";
import {
  Plus,
  Check,
  Tag,
  Package,
  ChevronDown,
  Utensils,
  AlertCircle,
} from "lucide-react";

import {
  getMenuImageUrl,
  type MenuCombo,
} from "@/data/menuData";

// ============================================
// TYPES
// ============================================

export interface ComboItem {
  id?: string;
  name: string;
  quantity: number;
  image_url?: string | null;
}

interface RawComboMenuItem {
  id?: string;
  name?: string | null;
  image_url?: string | null;
}

interface RawComboItem {
  quantity?: number | null;
  menu_items?: RawComboMenuItem | RawComboMenuItem[] | null;
  menu_item?: RawComboMenuItem | null;
}

type ComboBase = Omit<MenuCombo, "included_items">;

export interface ComboWithItems extends ComboBase {
  included_items: ComboItem[];

  // Raw Supabase relation, accepted while normalizing fetched data.
  menu_combo_items?: RawComboItem[] | null;
}

interface ComboCardProps {
  item: ComboWithItems;
  onAdd: (item: ComboWithItems) => void;
  view: "grid" | "list";
}

// ============================================
// HELPERS
// ============================================

const formatPrice = (
  price: number | string | null | undefined
): number => {
  const value = Number(price ?? 0);
  return Number.isFinite(value) ? value : 0;
};

const normalizeComboItems = (item: ComboWithItems): ComboItem[] => {
  const directItems = Array.isArray(item.included_items)
    ? item.included_items
    : [];

  // Use already-normalized items when they contain dish names.
  const normalizedDirectItems = directItems.filter(
    (dish) =>
      dish &&
      typeof dish.name === "string" &&
      dish.name.trim().length > 0
  );

  if (normalizedDirectItems.length > 0) {
    return normalizedDirectItems;
  }

  // Otherwise, try the raw Supabase relationship.
  const rawItems = item.menu_combo_items ?? [];

  return rawItems.flatMap((entry) => {
    const relation = entry.menu_items ?? entry.menu_item ?? null;

    const dish = Array.isArray(relation) ? relation[0] : relation;

    if (!dish?.name?.trim()) {
      return [];
    }

    return [
      {
        id: dish.id,
        name: dish.name.trim(),
        image_url: dish.image_url ?? null,
        quantity: Math.max(1, Number(entry.quantity) || 1),
      },
    ];
  });
};

// ============================================
// COMBO CARD
// ============================================

const ComboCard = ({ item, onAdd, view }: ComboCardProps) => {
  const [justAdded, setJustAdded] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const includedItems = normalizeComboItems(item);

  const displayPrice = formatPrice(item.discount_price);
  const originalPrice = formatPrice(item.total_price);
  const savingAmount = Math.max(0, originalPrice - displayPrice);

  const imageUrl = getMenuImageUrl(item.image_url);
  const isAvailable = item.is_available !== false;

  const handleAdd = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();

    if (!isAvailable || justAdded) return;

    onAdd({
      ...item,
      included_items: includedItems,
    });

    setJustAdded(true);

    window.setTimeout(() => {
      setJustAdded(false);
    }, 1000);
  };

  // ============================================
  // BADGE
  // ============================================

  const ComboBadge = () => (
    <div className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-zinc-950/90 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-white shadow-lg backdrop-blur-md">
      <Package className="h-3.5 w-3.5 text-orange-400" />
      Combo Offer
    </div>
  );

  // ============================================
  // DISH LIST
  // ============================================

  const DishList = ({ compact = false }: { compact?: boolean }) => {
    if (includedItems.length === 0) {
      return (
        <div className="my-3 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-amber-800">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />

          <div>
            <p className="text-xs font-bold">
              Dish details unavailable
            </p>

            <p className="mt-1 text-xs leading-relaxed">
              No dish names were returned for this combo. Check the
              combo-to-menu-item relationship in Supabase.
            </p>
          </div>
        </div>
      );
    }

    const visibleItems =
      compact && !isExpanded
        ? includedItems.slice(0, 3)
        : includedItems;

    const remainingCount =
      includedItems.length - visibleItems.length;

    return (
      <div className="mt-3 space-y-2">
        {visibleItems.map((dish, index) => (
          <div
            key={`${dish.id ?? dish.name}-${index}`}
            className="flex min-w-0 items-center gap-3 rounded-xl border border-zinc-100 bg-zinc-50 p-2.5 transition-colors hover:border-orange-100 hover:bg-orange-50/40"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
              <Check className="h-4 w-4" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="break-words text-sm font-semibold capitalize leading-snug text-zinc-800">
                {dish.name}
              </p>
            </div>

            <span className="shrink-0 rounded-full bg-white px-2.5 py-1 text-xs font-bold text-zinc-600 ring-1 ring-zinc-200">
              ×{Math.max(1, Number(dish.quantity) || 1)}
            </span>
          </div>
        ))}

        {remainingCount > 0 && (
          <button
            type="button"
            onClick={() => setIsExpanded(true)}
            className="w-full rounded-lg px-2 py-2 text-left text-xs font-bold text-orange-600 transition-colors hover:bg-orange-50"
          >
            + {remainingCount} more dish
            {remainingCount > 1 ? "es" : ""} — Show all
          </button>
        )}

        {compact &&
          isExpanded &&
          includedItems.length > 3 && (
            <button
              type="button"
              onClick={() => setIsExpanded(false)}
              className="w-full rounded-lg px-2 py-2 text-left text-xs font-bold text-zinc-500 hover:bg-zinc-100"
            >
              Show less
            </button>
          )}
      </div>
    );
  };

  // ============================================
  // PRICE
  // ============================================

  const PriceBlock = ({ large = false }: { large?: boolean }) => (
    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
      <span
        className={`font-black tracking-tight text-zinc-950 ${
          large ? "text-2xl" : "text-xl"
        }`}
      >
        ₹{displayPrice.toFixed(0)}
      </span>

      {originalPrice > displayPrice && (
        <span className="text-sm font-semibold text-zinc-400 line-through">
          ₹{originalPrice.toFixed(0)}
        </span>
      )}
    </div>
  );

  // ============================================
  // LIST VIEW
  // ============================================

  if (view === "list") {
    return (
      <article
        className={`group relative overflow-hidden rounded-3xl border border-zinc-200/80 bg-white p-3 shadow-sm transition-all duration-300 hover:border-orange-200 hover:shadow-lg sm:p-4 ${
          !isAvailable ? "opacity-70" : ""
        }`}
      >
        <div className="flex items-start gap-3 sm:gap-5">
          <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-2xl bg-zinc-100 sm:h-36 sm:w-36">
            <img
              src={imageUrl}
              alt={item.name}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />

            <div className="absolute left-1.5 top-1.5">
              <ComboBadge />
            </div>
          </div>

          <div className="flex min-w-0 flex-1 flex-col">
            <h3 className="break-words text-base font-extrabold capitalize leading-tight text-zinc-950 sm:text-lg">
              {item.name}
            </h3>

            {item.description && (
              <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-zinc-500 sm:text-sm">
                {item.description}
              </p>
            )}

            <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-zinc-500">
              <Utensils className="h-3.5 w-3.5" />

              {includedItems.length} included dish
              {includedItems.length === 1 ? "" : "es"}
            </div>

            <DishList compact />

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-zinc-100 pt-3">
              <div>
                <PriceBlock />

                {savingAmount > 0 && (
                  <span className="mt-1 inline-flex items-center gap-1 text-xs font-bold text-emerald-700">
                    <Tag className="h-3 w-3" />
                    Save ₹{savingAmount.toFixed(0)}
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={handleAdd}
                disabled={!isAvailable}
                aria-label={`Add ${item.name} to cart`}
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-all duration-200 disabled:cursor-not-allowed disabled:bg-zinc-300 ${
                  justAdded
                    ? "bg-emerald-600 text-white"
                    : "bg-zinc-950 text-white hover:bg-orange-600 active:scale-95"
                }`}
              >
                {justAdded ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <Plus className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {!isAvailable && (
          <div className="mt-3 rounded-xl bg-zinc-100 px-3 py-2 text-center text-xs font-bold text-zinc-500">
            Currently unavailable
          </div>
        )}
      </article>
    );
  }

  // ============================================
  // GRID VIEW
  // ============================================

  return (
    <article
      className={`group relative flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-zinc-200/80 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-orange-200 hover:shadow-xl ${
        !isAvailable ? "opacity-70" : ""
      }`}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-zinc-100">
        <img
          src={imageUrl}
          alt={item.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />

        <div className="absolute left-3 top-3">
          <ComboBadge />
        </div>

        {savingAmount > 0 && (
          <div className="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-full bg-emerald-600 px-3 py-1.5 text-[11px] font-black text-white shadow-lg">
            <Tag className="h-3 w-3" />
            SAVE ₹{savingAmount.toFixed(0)}
          </div>
        )}

        {!isAvailable && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/35">
            <span className="rounded-full bg-white px-4 py-2 text-xs font-black text-zinc-900">
              Currently unavailable
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="min-w-0 break-words text-lg font-extrabold capitalize leading-snug text-zinc-950">
            {item.name}
          </h3>

          {includedItems.length > 3 && (
            <button
              type="button"
              onClick={() =>
                setIsExpanded((previous) => !previous)
              }
              aria-label={
                isExpanded
                  ? "Collapse included dishes"
                  : "Expand included dishes"
              }
              aria-expanded={isExpanded}
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-zinc-200 text-zinc-600 transition-all hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600 ${
                isExpanded ? "rotate-180" : ""
              }`}
            >
              <ChevronDown className="h-4 w-4" />
            </button>
          )}
        </div>

        {item.description && (
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-zinc-500">
            {item.description}
          </p>
        )}

        <div className="mt-3 flex items-center gap-2 text-xs font-bold text-zinc-500">
          <Utensils className="h-4 w-4 text-orange-500" />
          What's included

          <span className="rounded-full bg-orange-50 px-2 py-0.5 text-orange-700">
            {includedItems.length} dish
            {includedItems.length === 1 ? "" : "es"}
          </span>
        </div>

        <DishList compact />

        <div className="mt-auto border-t border-zinc-100 pt-4">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <PriceBlock large />

              {savingAmount > 0 && (
                <p className="mt-1 text-[11px] font-semibold text-emerald-700">
                  You save ₹{savingAmount.toFixed(0)}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={handleAdd}
              disabled={!isAvailable}
              aria-label={`Add ${item.name} to cart`}
              className={`flex h-11 shrink-0 items-center justify-center gap-2 rounded-full px-4 font-bold transition-all duration-200 disabled:cursor-not-allowed disabled:bg-zinc-300 ${
                justAdded
                  ? "bg-emerald-600 text-white"
                  : "bg-zinc-950 text-white hover:bg-orange-600 active:scale-95"
              }`}
            >
              {justAdded ? (
                <>
                  <Check className="h-4 w-4" />
                  <span className="text-xs">Added</span>
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  <span className="text-xs">Add combo</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};

export default ComboCard;
