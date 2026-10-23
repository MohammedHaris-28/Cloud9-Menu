
import { useState, useRef, useEffect } from "react";
import { Search, ShoppingBag, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import logo from "@/assets/cloud 9.webp";

interface DiningTable {
  id: string;
  restaurant_id: string;
  table_number: number | null;
  name: string | null;
  short_id: string | null;
  status?: string | null;
  is_active?: boolean | null;
}

interface MenuHeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  cartCount: number;
  onCartClick: () => void;
  table?: Partial<DiningTable> | null;
  restaurant?: { id?: string; name?: string } | null;
  tableId?: string;
  shortId?: string;
}

const getText = (...values: unknown[]): string => {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }

    if (typeof value === "number" && Number.isFinite(value)) {
      return String(value);
    }
  }

  return "";
};

const isUuid = (value: string): boolean =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    value
  );

const MenuHeader = ({
  searchQuery,
  onSearchChange,
  cartCount,
  onCartClick,
  table,
  restaurant,
  tableId,
  shortId,
}: MenuHeaderProps) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [fetchedTable, setFetchedTable] = useState<DiningTable | null>(null);
  const [tableLoading, setTableLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchOpen) {
      inputRef.current?.focus();
    }
  }, [isSearchOpen]);

  useEffect(() => {
    let cancelled = false;

    const loadTable = async () => {
      const params = new URLSearchParams(window.location.search);

      // Support common QR/menu URL parameter names.
      const idFromUrl = getText(
        tableId,
        params.get("tableId"),
        params.get("table_id"),
        params.get("tableUuid"),
        params.get("table_uuid")
      );

      const shortIdFromUrl = getText(
        shortId,
        params.get("short_id"),
        params.get("shortId")
      );

      // A URL such as ?table=1 can represent a table number,
      // while ?table=<UUID> can represent a table ID.
      const tableParam = getText(params.get("table"));

      const suppliedTable = table as Partial<DiningTable> | null | undefined;

      const suppliedId = getText(suppliedTable?.id);
      const suppliedShortId = getText(suppliedTable?.short_id);
      const suppliedNumber = suppliedTable?.table_number;
      const suppliedName = getText(suppliedTable?.name);

      const restaurantId = getText(
        restaurant?.id,
        suppliedTable?.restaurant_id
      );

      const identifier = idFromUrl || tableParam;
      const lookupId = identifier && isUuid(identifier) ? identifier : "";
      const lookupShortId = shortIdFromUrl || suppliedShortId;

      const numberText =
  identifier && !isUuid(identifier) && /^\d+$/.test(identifier)
    ? identifier
    : !suppliedName && suppliedTable?.table_number != null
      ? String(suppliedTable.table_number)
      : "";

      const fallbackTable =
        suppliedId || suppliedName || suppliedNumber != null
          ? (suppliedTable as DiningTable)
          : null;

      // If no URL identifier exists, use the parent's table record.
      // Only query by a supplied table ID if a record is incomplete.
      if (
        !lookupId &&
        !lookupShortId &&
        !numberText &&
        !suppliedId
      ) {
        if (!cancelled) {
          setFetchedTable(fallbackTable);
          setTableLoading(false);
        }
        return;
      }

      // If the parent already supplied a complete table and the URL
      // contains no identifier, there is nothing else to fetch.
      if (
        !identifier &&
        !shortIdFromUrl &&
        suppliedName &&
        suppliedNumber != null
      ) {
        if (!cancelled) {
          setFetchedTable(fallbackTable);
          setTableLoading(false);
        }
        return;
      }

      if (!cancelled) {
        setTableLoading(true);
      }

      try {
        let query = supabase
          .from("restaurant_tables")
          .select(
            "id, restaurant_id, table_number, name, short_id, status, is_active"
          )
          .eq("is_active", true);

        if (lookupId) {
          query = query.eq("id", lookupId);
        } else if (lookupShortId) {
          query = query.eq("short_id", lookupShortId);
        } else if (numberText) {
          query = query.eq("table_number", Number(numberText));
        } else if (suppliedId) {
          query = query.eq("id", suppliedId);
        } else {
          if (!cancelled) {
            setFetchedTable(fallbackTable);
          }
          return;
        }

        // Restrict lookup to the current restaurant whenever known.
        if (restaurantId) {
          query = query.eq("restaurant_id", restaurantId);
        }

        const { data, error } = await query.maybeSingle();

        if (error) {
          console.error("MenuHeader: table lookup failed:", error);

          if (!cancelled) {
            setFetchedTable(fallbackTable);
          }

          return;
        }

        if (!cancelled) {
          if (data) {
            setFetchedTable(data as DiningTable);
          } else {
            console.warn(
              "MenuHeader: no active table matched the URL identifier.",
              {
                identifier,
                shortIdFromUrl,
                restaurantId,
              }
            );
            setFetchedTable(fallbackTable);
          }
        }
      } catch (error) {
        console.error("MenuHeader: unexpected table lookup error:", error);

        if (!cancelled) {
          setFetchedTable(fallbackTable);
        }
      } finally {
        if (!cancelled) {
          setTableLoading(false);
        }
      }
    };

    void loadTable();

    return () => {
      cancelled = true;
    };
  }, [
    tableId,
    shortId,
    table?.id,
    table?.name,
    table?.table_number,
    table?.short_id,
    table?.restaurant_id,
    restaurant?.id,
  ]);

  // Prefer the fetched database record; fall back to the parent record.
  const activeTable =
    fetchedTable ?? (table as DiningTable | null | undefined) ?? null;

  const tableName = getText(activeTable?.name);

  const tableNumber = getText(activeTable?.table_number);

  const tableLabel = tableName
    ? tableNumber &&
      tableName.toLowerCase() !== `table ${tableNumber}`.toLowerCase()
      ? `${tableName} · Table ${tableNumber}`
      : tableName
    : tableNumber
      ? `Table ${tableNumber}`
      : tableLoading
        ? "Loading table..."
        : "Table information unavailable";

  const restaurantName = getText(restaurant?.name) || "Cloud 9 Family Restaurant";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200/70 bg-white/95 backdrop-blur-xl dark:border-zinc-800/70 dark:bg-zinc-950/95">
      <div className="container mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4">
        {/* Restaurant branding and table information */}
        <div
          className={cn(
            "flex min-w-0 shrink-0 items-center gap-3 transition-all duration-300",
            isSearchOpen ? "hidden sm:flex" : "flex"
          )}
        >
          <div className="h-11 w-11 shrink-0 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:h-12 sm:w-12">
            <img
              src={logo}
              alt={`${restaurantName} logo`}
              className="h-full w-full object-contain p-1"
              draggable={false}
            />
          </div>

          <div className="flex min-w-0 flex-col">
            <span className="max-w-[150px] truncate text-base font-black leading-tight tracking-tight text-zinc-900 dark:text-zinc-100 sm:max-w-[220px] md:max-w-none md:text-lg">
              {restaurantName}
            </span>

            <div className="mt-1 flex min-w-0 items-center gap-1.5">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>

              <span
                className="max-w-[220px] truncate text-[10px] font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400"
                title={tableLabel}
              >
                {tableLabel}
              </span>
            </div>
          </div>
        </div>

        {/* Menu search and cart */}
        <div
          className={cn(
            "flex min-w-0 flex-1 items-center gap-2 transition-all duration-300",
            isSearchOpen ? "justify-start" : "justify-end"
          )}
        >
          <div
            className={cn(
              "relative flex items-center transition-all duration-300 ease-in-out",
              isSearchOpen ? "w-full" : "w-11 shrink-0"
            )}
          >
            <div
              className={cn(
                "flex h-11 w-full items-center rounded-2xl transition-all duration-300",
                isSearchOpen
                  ? "bg-zinc-100 px-2 ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800"
                  : "bg-transparent"
              )}
            >
              <button
                type="button"
                onClick={() => setIsSearchOpen(true)}
                disabled={isSearchOpen}
                aria-label="Search menu"
                aria-expanded={isSearchOpen}
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all",
                  !isSearchOpen &&
                    "bg-zinc-100 hover:scale-105 active:scale-95 dark:bg-zinc-900"
                )}
              >
                <Search
                  className={cn(
                    "transition-transform",
                    isSearchOpen ? "h-4 w-4" : "h-5 w-5"
                  )}
                />
              </button>

              <input
                ref={inputRef}
                type="text"
                placeholder="Search for dishes..."
                aria-label="Search for dishes"
                value={searchQuery}
                onChange={(event) => onSearchChange(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Escape") {
                    setIsSearchOpen(false);
                    onSearchChange("");
                  }
                }}
                className={cn(
                  "min-w-0 flex-1 bg-transparent text-sm font-semibold text-zinc-900 outline-none placeholder:text-zinc-400 dark:text-zinc-100",
                  isSearchOpen
                    ? "ml-2 opacity-100"
                    : "pointer-events-none w-0 opacity-0"
                )}
              />

              {isSearchOpen && (
                <button
                  type="button"
                  onClick={() => {
                    setIsSearchOpen(false);
                    onSearchChange("");
                  }}
                  aria-label="Clear search and close"
                  className="ml-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors hover:bg-zinc-200 dark:hover:bg-zinc-800"
                >
                  <X className="h-4 w-4 text-zinc-500" />
                </button>
              )}
            </div>
          </div>

          {!isSearchOpen && (
            <button
              type="button"
              onClick={onCartClick}
              aria-label={`Open cart, ${cartCount} items`}
              className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-zinc-900 shadow-xl shadow-zinc-200 transition-all hover:scale-105 active:scale-95 dark:bg-zinc-100 dark:shadow-none"
            >
              <ShoppingBag className="h-5 w-5 text-white dark:text-zinc-900" />

              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-emerald-500 px-1 text-[10px] font-black text-white ring-2 ring-white dark:ring-zinc-950">
                  {cartCount > 99 ? "99+" : cartCount}
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
