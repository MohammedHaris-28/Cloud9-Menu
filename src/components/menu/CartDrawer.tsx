
import {
  X,
  Plus,
  Minus,
  ShoppingBag,
  Loader2,
  Sparkles,
  Gift,
  Phone,
  CheckCircle2,
  UserRound,
  ShieldCheck,
  ExternalLink,
} from "lucide-react";

import type { CartItem } from "@/hooks/useCart";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
  items: CartItem[];
  totalPrice: number;
  onAdd: (item: any) => void;
  onRemove: (id: string) => void;
  onClear: () => void;
  restaurantId: string | null;
  tableId: string | undefined;
}

const CartDrawer = ({
  open,
  onClose,
  items,
  totalPrice,
  onAdd,
  onRemove,
  onClear,
  restaurantId,
  tableId,
}: CartDrawerProps) => {
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const [gstEnabled, setGstEnabled] = useState(false);
  const [gstPercentage, setGstPercentage] = useState(0);

  // Loyalty form state
  const [showCRMCard, setShowCRMCard] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [loyaltyConsent, setLoyaltyConsent] = useState(false);
  const [savedOrderId, setSavedOrderId] = useState<string | null>(null);
  const [isSavingCRM, setIsSavingCRM] = useState(false);
  const [savedSubtotal, setSavedSubtotal] = useState(0);
  const [savedItemCount, setSavedItemCount] = useState(0);
  const [savedPoints, setSavedPoints] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const fetchGST = async () => {
      if (!restaurantId) {
        setGstEnabled(false);
        setGstPercentage(0);
        return;
      }

      const { data, error } = await supabase
        .from("restaurants")
        .select("gst_enabled, gst_rate")
        .eq("id", restaurantId)
        .maybeSingle();

      if (error) {
        console.error("Failed to fetch GST settings:", error);
        return;
      }

      if (!cancelled && data) {
        setGstEnabled(data.gst_enabled ?? false);
        setGstPercentage(Number(data.gst_rate ?? 0));
      }
    };

    void fetchGST();

    return () => {
      cancelled = true;
    };
  }, [restaurantId]);

  const subtotal = totalPrice;

  const gstAmount = gstEnabled
    ? (subtotal * gstPercentage) / 100
    : 0;

  if (!open) return null;

  // PLACE ORDER
  const handlePlaceOrder = async () => {
    if (!restaurantId || !tableId) {
      toast.error("Session expired. Please scan the QR code again.");
      return;
    }

    if (items.length === 0) {
      toast.error("Your cart is empty.");
      return;
    }

    setIsPlacingOrder(true);

    try {
      const calculatedItems = items.reduce(
        (sum, item) => sum + item.quantity,
        0
      );

      const calculatedPoints = Math.floor(subtotal / 10);

      // Place the order through the secure database RPC.
      const { data, error } = await supabase.rpc("qr_place_order", {
        p_restaurant_id: restaurantId,
        p_table_id: tableId,
        p_customer_name: null,
        p_customer_phone: null,
        p_notes: null,
        p_items: items.map((item) => {
          const isCombo = Boolean((item as any).included_items);

          return {
            menu_item_id: isCombo ? null : item.id,
            combo_id: isCombo ? item.id : null,
            quantity: item.quantity,
            selected_variant:
              (item as any).selected_variant ?? null,
            notes: (item as any).notes ?? null,
          };
        }),
      });

      if (error) {
        console.error("qr_place_order failed:", error);
        throw new Error(error.message);
      }

      if (!data || data.success !== true || !data.order_id) {
        console.error("Unexpected order response:", data);

        throw new Error(
          data?.message || "The server did not confirm the order."
        );
      }

      setSavedOrderId(data.order_id);
      setSavedSubtotal(Number(data.subtotal ?? subtotal));
      setSavedItemCount(calculatedItems);
      setSavedPoints(calculatedPoints);

      onClear();
      setShowCRMCard(true);

      // Require fresh, explicit consent for each loyalty signup.
      setLoyaltyConsent(false);
      setCustomerName("");
      setCustomerPhone("");

      toast.success(
        `Order #${data.order_number} placed successfully!`
      );

      console.log("Confirmed order:", data);
    } catch (error: unknown) {
      console.error("Place order error:", error);

      toast.error(
        "Order failed: " +
          (error instanceof Error
            ? error.message
            : "An unexpected error occurred.")
      );
    } finally {
      setIsPlacingOrder(false);
    }
  };

  // SAVE LOYALTY CUSTOMER
  const handleSaveCustomer = async () => {
    if (!loyaltyConsent) {
      toast.error(
        "Please accept the Privacy Policy and Terms before joining."
      );
      return;
    }

    const phone = customerPhone.trim();

    if (!phone) {
      toast.error("Please enter your WhatsApp number.");
      return;
    }

    if (!/^[+]?[\d\s()-]{7,20}$/.test(phone)) {
      toast.error("Please enter a valid phone number.");
      return;
    }

    if (!restaurantId || !savedOrderId) {
      toast.error(
        "Order information is missing. Please contact staff."
      );
      return;
    }

    setIsSavingCRM(true);

    try {
      const { data, error } = await supabase.rpc("qr_join_loyalty", {
        p_restaurant_id: restaurantId,
        p_order_id: savedOrderId,
        p_customer_name: customerName.trim() || "Guest",
        p_customer_phone: phone,
        p_total_items: savedItemCount,
        p_total_spent: savedSubtotal,
        p_points: savedPoints,
      });

      if (error) {
        console.error("Loyalty registration failed:", error);
        throw new Error(error.message);
      }

      if (!data || data.success !== true) {
        throw new Error(
          data?.message ||
            "The server did not confirm loyalty registration."
        );
      }

      toast.success("Loyalty rewards activated!");

      setShowCRMCard(false);
      setLoyaltyConsent(false);
      onClose();
    } catch (error: unknown) {
      console.error("Save loyalty customer error:", error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Could not activate loyalty rewards."
      );
    } finally {
      setIsSavingCRM(false);
    }
  };

  const handleSkipLoyalty = () => {
    setShowCRMCard(false);
    setLoyaltyConsent(false);
    onClose();
  };

  return (
    <>
      {/* BACKDROP */}
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <section
        role="dialog"
        aria-modal="true"
        aria-label={showCRMCard ? "Loyalty rewards" : "Your order"}
        className="fixed bottom-0 left-0 right-0 z-50 mx-auto flex max-h-[92dvh] w-full max-w-2xl flex-col overflow-hidden rounded-t-[2rem] border border-zinc-200 bg-zinc-50 shadow-2xl"
      >
        {/* HANDLE */}
        <div className="mx-auto mb-1 mt-3 h-1.5 w-12 shrink-0 rounded-full bg-zinc-300" />

        {/* ORDER CONFIRMATION + LOYALTY */}
        {showCRMCard ? (
          <div className="flex-1 overflow-y-auto px-5 pb-8 pt-6 sm:px-8">
            <div className="flex flex-col items-center text-center">
              <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full border border-emerald-100 bg-emerald-50">
                <CheckCircle2 className="h-12 w-12 text-emerald-600" />
              </div>

              <h2 className="text-2xl font-black tracking-tight text-zinc-900 sm:text-3xl">
                Order Confirmed!
              </h2>

              <p className="mt-2 max-w-sm text-sm leading-relaxed text-zinc-500">
                Your order has been sent to the kitchen successfully.
                Enjoy your meal!
              </p>

              {/* LOYALTY CARD */}
              <div className="mt-7 w-full overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-orange-500 via-orange-500 to-rose-500 p-5 text-left text-white shadow-xl shadow-orange-500/15 sm:p-6">
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/15">
                    <Gift className="h-6 w-6" />
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-widest text-white/75">
                      You're invited
                    </p>

                    <h3 className="mt-0.5 text-xl font-black sm:text-2xl">
                      Join Loyalty Rewards
                    </h3>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/15 bg-white/10 p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <Gift className="h-4 w-4 shrink-0" />

                    <span className="text-sm font-bold">
                      Member Benefits
                    </span>
                  </div>

                  <ul className="space-y-2 text-sm text-white/90">
                    <li>✓ Earn loyalty points on eligible purchases</li>
                    <li>✓ Receive exclusive customer offers</li>
                    <li>✓ Discover special birthday promotions</li>
                    <li>✓ Get updates about selected combo deals</li>
                  </ul>
                </div>

                {/* CUSTOMER DETAILS */}
                <div className="mt-5 space-y-3">
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-bold text-white/90">
                      Your name <span className="font-normal">(optional)</span>
                    </span>

                    <div className="relative">
                      <UserRound className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />

                      <input
                        type="text"
                        autoComplete="name"
                        maxLength={100}
                        placeholder="Enter your name"
                        value={customerName}
                        onChange={(event) =>
                          setCustomerName(event.target.value)
                        }
                        className="h-12 w-full rounded-xl border border-white/20 bg-white pl-11 pr-4 text-sm font-medium text-zinc-900 outline-none placeholder:text-zinc-400 focus:ring-2 focus:ring-white/60"
                      />
                    </div>
                  </label>

                  <label className="block">
                    <span className="mb-1.5 block text-xs font-bold text-white/90">
                      WhatsApp number
                    </span>

                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />

                      <input
                        type="tel"
                        autoComplete="tel"
                        inputMode="tel"
                        maxLength={20}
                        required
                        placeholder="Enter your phone number"
                        value={customerPhone}
                        onChange={(event) =>
                          setCustomerPhone(event.target.value)
                        }
                        className="h-12 w-full rounded-xl border border-white/20 bg-white pl-11 pr-4 text-sm font-medium text-zinc-900 outline-none placeholder:text-zinc-400 focus:ring-2 focus:ring-white/60"
                      />
                    </div>
                  </label>

                  {/* REQUIRED PRIVACY & TERMS CONSENT */}
                  <div className="rounded-2xl border border-white/25 bg-black/10 p-4">
                    <label className="flex cursor-pointer items-start gap-3">
                      <input
                        type="checkbox"
                        checked={loyaltyConsent}
                        onChange={(event) =>
                          setLoyaltyConsent(event.target.checked)
                        }
                        className="mt-1 h-4 w-4 shrink-0 cursor-pointer accent-zinc-900"
                      />

                      <span className="text-xs leading-relaxed text-white/95 sm:text-sm">
                        I agree to the Privacy Policy and Terms &amp;
                        Conditions and consent to my details being used to
                        register and manage my loyalty membership.
                      </span>
                    </label>

                    <Link
                      to="/privacy&terms"
                      onClick={() => {
                        // Allow the user to read the policy without
                        // accidentally submitting the loyalty form.
                        setShowCRMCard(false);
                        setLoyaltyConsent(false);
                        onClose();
                      }}
                      className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-white underline decoration-white/60 underline-offset-4 transition hover:text-white/80"
                    >
                      <ShieldCheck className="h-4 w-4" />
                      Read Privacy Policy &amp; Terms
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  </div>

                  {/* SUBMIT */}
                  <button
                    type="button"
                    onClick={handleSaveCustomer}
                    disabled={isSavingCRM || !loyaltyConsent}
                    className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-zinc-950 px-4 font-bold text-white shadow-lg transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-700/70 disabled:text-white/60"
                  >
                    {isSavingCRM ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Activating rewards...
                      </>
                    ) : (
                      <>
                        <Gift className="h-4 w-4" />
                        Join Loyalty Program
                      </>
                    )}
                  </button>

                  {!loyaltyConsent && (
                    <p className="text-center text-[11px] text-white/80">
                      Please tick the checkbox above to continue.
                    </p>
                  )}

                  {/* SKIP */}
                  <button
                    type="button"
                    onClick={handleSkipLoyalty}
                    disabled={isSavingCRM}
                    className="w-full rounded-xl py-2 text-sm font-medium text-white/85 transition hover:bg-white/10 hover:text-white disabled:opacity-50"
                  >
                    No thanks, maybe later
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* CART HEADER */}
            <div className="flex shrink-0 items-center justify-between border-b border-zinc-100 px-5 py-4 sm:px-6">
              <div>
                <h2 className="text-2xl font-black tracking-tight text-zinc-900">
                  Your Order
                </h2>

                <p className="mt-0.5 text-sm text-zinc-500">
                  {items.length}{" "}
                  {items.length === 1 ? "item" : "items"} selected
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close cart"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-200 text-zinc-700 transition hover:bg-zinc-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* CART ITEMS */}
            <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4 sm:px-6">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-zinc-400">
                  <ShoppingBag className="mb-4 h-16 w-16 opacity-20" />

                  <p className="font-semibold">Your cart is empty</p>

                  <p className="mt-1 text-sm">
                    Add something delicious to get started.
                  </p>
                </div>
              ) : (
                items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 rounded-2xl border border-zinc-100 bg-white p-4 shadow-sm sm:gap-4"
                  >
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-bold text-zinc-800">
                        {item.name}
                      </h3>

                      {(item as any).included_items && (
                        <p className="mt-1 text-[10px] font-medium uppercase tracking-wider text-orange-600">
                          {(item as any).included_items
                            .map((includedItem: any) => includedItem.name)
                            .join(" • ")}
                        </p>
                      )}

                      <p className="mt-1 font-semibold text-zinc-500">
                        ₹{item.price.toFixed(2)}
                      </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-2 rounded-xl bg-zinc-100 p-1">
                      <button
                        type="button"
                        onClick={() => onRemove(item.id)}
                        aria-label={`Remove one ${item.name}`}
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-white transition hover:bg-zinc-200"
                      >
                        <Minus className="h-4 w-4 text-zinc-600" />
                      </button>

                      <span className="w-5 text-center font-bold text-zinc-800">
                        {item.quantity}
                      </span>

                      <button
                        type="button"
                        onClick={() => onAdd(item)}
                        aria-label={`Add one ${item.name}`}
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 transition hover:bg-zinc-700"
                      >
                        <Plus className="h-4 w-4 text-white" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* BILLING */}
            {items.length > 0 && (
              <div className="shrink-0 rounded-t-[1.75rem] border-t border-zinc-100 bg-white px-5 pb-6 pt-5 sm:px-6 sm:pb-8">
                <div className="mb-5 space-y-3">
                  <div className="flex justify-between text-sm text-zinc-500">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>

                  {gstEnabled && (
                    <div className="flex justify-between text-xs text-zinc-500">
                      <span>GST ({gstPercentage}%)</span>
                      <span>₹{gstAmount.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="border-t border-dashed border-zinc-200" />

                  <div className="flex items-center justify-between gap-3">
                    <span className="text-lg font-bold text-zinc-900">
                      Total Amount
                    </span>

                    <span className="text-2xl font-black text-zinc-900">
                      ₹{subtotal.toFixed(2)}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handlePlaceOrder}
                  disabled={isPlacingOrder}
                  className="flex w-full items-center justify-center gap-3 rounded-2xl bg-zinc-900 px-4 py-4 text-lg font-bold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
                >
                  {isPlacingOrder ? (
                    <>
                      <Loader2 className="h-6 w-6 animate-spin" />
                      Placing order...
                    </>
                  ) : (
                    <>
                      <span>Place Order</span>

                      <span className="h-1.5 w-1.5 rounded-full bg-zinc-500" />

                      <span>₹{subtotal.toFixed(2)}</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </>
  );
};

export default CartDrawer;
