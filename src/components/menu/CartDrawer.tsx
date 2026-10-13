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
} from "lucide-react";

import type { CartItem } from "@/hooks/useCart";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useState, useEffect } from "react";

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

  // CRM STATES
  const [showCRMCard, setShowCRMCard] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [savedOrderId, setSavedOrderId] = useState<string | null>(null);
  const [isSavingCRM, setIsSavingCRM] = useState(false);
  const [savedSubtotal, setSavedSubtotal] = useState(0);
const [savedItemCount, setSavedItemCount] = useState(0);
const [savedPoints, setSavedPoints] = useState(0);

  useEffect(() => {
    const fetchGST = async () => {
      if (!restaurantId) return;

      const { data } = await supabase
        .from("restaurants")
        .select("gst_enabled, gst_rate")
        .eq("id", restaurantId)
        .maybeSingle();

      if (data) {
        setGstEnabled(data.gst_enabled ?? false);
        setGstPercentage(data.gst_rate ?? 0);
      }
    };

    fetchGST();
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

      // IMPORTANT: Create the order through the secure database RPC.
      // Do not insert directly into orders or order_items from the browser.
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
            selected_variant: (item as any).selected_variant ?? null,
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

      // Save the ID returned by the database.
      setSavedOrderId(data.order_id);
      setSavedSubtotal(Number(data.subtotal ?? subtotal));
      setSavedItemCount(calculatedItems);
      setSavedPoints(calculatedPoints);

      // Clear cart only after the database confirms success.
      onClear();
      setShowCRMCard(true);

      toast.success(
        `Order #${data.order_number} placed successfully!`
      );

      console.log("Confirmed order:", data);
    } catch (error: unknown) {
      console.error("Place order error:", error);

      const message =
        error instanceof Error
          ? error.message
          : "An unexpected error occurred.";

      toast.error("Order failed: " + message);
    } finally {
      setIsPlacingOrder(false);
    }
  };

  // SAVE CRM CUSTOMER
 
const handleSaveCustomer = async () => {
  const phone = customerPhone.trim();

  if (!phone) {
    toast.error("Phone number required");
    return;
  }

  if (!restaurantId || !savedOrderId) {
    toast.error("Order information is missing. Please contact staff.");
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
      throw new Error("The server did not confirm loyalty registration.");
    }

    toast.success("Loyalty rewards activated 🎉");
    setShowCRMCard(false);
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


  return (
    <>
      {/* BACKDROP */}
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="fixed bottom-0 left-0 right-0 z-50 bg-zinc-50 rounded-t-[2rem] shadow-2xl max-h-[92vh] flex flex-col overflow-hidden">

        {/* HANDLE */}
        <div className="w-12 h-1.5 bg-zinc-300 rounded-full mx-auto mt-3 mb-1" />

        {/* CRM SUCCESS SCREEN */}
        {showCRMCard ? (
          <div className="flex-1 overflow-y-auto px-6 py-8">

            <div className="flex flex-col items-center text-center">

              {/* SUCCESS ICON */}
              <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mb-6">
                <CheckCircle2 className="w-14 h-14 text-green-600" />
              </div>

              <h2 className="text-3xl font-black text-zinc-900">
                Order Confirmed
              </h2>

              <p className="text-zinc-500 mt-2 max-w-sm">
                Your order has been sent to the kitchen successfully.
              </p>

              {/* LOYALTY CARD */}
              <div className="w-full mt-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl p-6 text-white shadow-2xl">

                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                    <Gift className="w-6 h-6" />
                  </div>

                  <div className="text-left">
                    <p className="text-sm opacity-80">
                      Loyalty Rewards
                    </p>

                    <h3 className="text-2xl font-black">
                      Earn Free Rewards
                    </h3>
                  </div>
                </div>

                <div className="bg-white/10 rounded-2xl p-4 text-left">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4" />
                    <span className="font-semibold text-sm">
                      Member Benefits
                    </span>
                  </div>

                  <ul className="text-sm space-y-1 opacity-90">
                    <li>• Earn loyalty points</li>
                    <li>• Exclusive repeat customer offers</li>
                    <li>• Birthday discounts</li>
                    <li>• Early access combo deals</li>
                  </ul>
                </div>

                {/* INPUTS */}
                <div className="space-y-3 mt-5">

                  <input
                    type="text"
                    placeholder="Your Name (Optional)"
                    value={customerName}
                    onChange={(e) =>
                      setCustomerName(e.target.value)
                    }
                    className="w-full h-12 rounded-2xl bg-white text-zinc-900 px-4 outline-none"
                  />

                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-4 top-4 text-zinc-400" />

                    <input
                      type="tel"
                      placeholder="WhatsApp Number"
                      value={customerPhone}
                      onChange={(e) =>
                        setCustomerPhone(e.target.value)
                      }
                      className="w-full h-12 rounded-2xl bg-white text-zinc-900 pl-11 pr-4 outline-none"
                    />
                  </div>

                  <button
                    onClick={handleSaveCustomer}
                    disabled={isSavingCRM}
                    className="w-full h-12 rounded-2xl bg-zinc-950 text-white font-bold flex items-center justify-center"
                  >
                    {isSavingCRM ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      "Join Loyalty Program"
                    )}
                  </button>

                  {/* SKIP */}
                  <button
                    onClick={() => {
                      setShowCRMCard(false);
                      onClose();
                    }}
                    className="w-full text-sm text-white/80 pt-2"
                  >
                    Skip for now
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* HEADER */}
            <div className="flex items-center justify-between px-6 py-4">
              <div>
                <h2 className="font-bold text-2xl text-zinc-900">
                  Your Order
                </h2>

                <p className="text-sm text-zinc-500">
                  {items.length} items selected
                </p>
              </div>

              <button
                onClick={onClose}
                className="p-2 bg-zinc-200 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* ITEMS */}
            <div className="flex-1 overflow-y-auto px-6 space-y-4 py-2">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-zinc-400">
                  <ShoppingBag className="w-16 h-16 mb-4 opacity-20" />
                  <p>Your cart is empty</p>
                </div>
              ) : (
                items.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white p-4 rounded-2xl flex items-center gap-4 shadow-sm border border-zinc-100"
                  >
                    <div className="flex-1">
                      <h3 className="font-bold text-zinc-800">
                        {item.name}
                      </h3>

                      {(item as any).included_items && (
                        <p className="text-[10px] uppercase tracking-wider text-orange-600 font-medium mt-0.5">
                          {(item as any).included_items
                            .map((i: any) => i.name)
                            .join(" • ")}
                        </p>
                      )}

                      <p className="text-zinc-500 font-medium mt-1">
                        ₹{item.price.toFixed(2)}
                      </p>
                    </div>

                    <div className="flex items-center bg-zinc-100 rounded-xl p-1 gap-3">
                      <button
                        onClick={() => onRemove(item.id)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-white"
                      >
                        <Minus className="w-4 h-4 text-zinc-600" />
                      </button>

                      <span className="font-bold text-zinc-800 w-4 text-center">
                        {item.quantity}
                      </span>

                      <button
                        onClick={() => onAdd(item)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-zinc-900"
                      >
                        <Plus className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* BILLING */}
            {items.length > 0 && (
              <div className="bg-white border-t border-zinc-100 px-6 pt-6 pb-8 rounded-t-[2rem]">

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-zinc-500 text-sm">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>

                  {gstEnabled && (
                    <div className="flex justify-between text-zinc-400 text-xs italic">
                      <span>
                        GST ({gstPercentage}%) included
                      </span>

                      <span>
                        ₹{gstAmount.toFixed(2)}
                      </span>
                    </div>
                  )}

                  <div className="border-t border-dashed" />

                  <div className="flex justify-between items-center">
                    <span className="font-bold text-lg text-zinc-900">
                      Total Amount
                    </span>

                    <span className="font-black text-2xl text-zinc-900">
                      ₹{subtotal.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* PLACE ORDER */}
                <button
                  onClick={handlePlaceOrder}
                  disabled={isPlacingOrder}
                  className="w-full bg-zinc-900 disabled:bg-zinc-400 text-white py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3"
                >
                  {isPlacingOrder ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <>
                      <span>Place Order</span>

                      <div className="w-1.5 h-1.5 rounded-full bg-zinc-500" />

                      <span>
                        ₹{subtotal.toFixed(2)}
                      </span>
                    </>
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default CartDrawer;