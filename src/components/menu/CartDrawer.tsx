import { X, Plus, Minus, ShoppingBag, Loader2, ReceiptText, Trash2 } from "lucide-react";
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
  open, onClose, items, totalPrice, onAdd, onRemove, onClear, restaurantId, tableId 
}: CartDrawerProps) => {
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [gstEnabled, setGstEnabled] = useState(false);
  const [gstPercentage, setGstPercentage] = useState(0);

  useEffect(() => {
    const fetchGST = async () => {
      if (!restaurantId) return;
      const { data } = await supabase
        .from("restaurants")
        .select("gst_enabled, gst_rate")
        .eq("id", restaurantId)
        .single();

      if (data) {
        setGstEnabled(data.gst_enabled ?? false);
        setGstPercentage(data.gst_rate ?? 0);
      }
    };
    fetchGST();
  }, [restaurantId]);

  const subtotal = totalPrice;
  const gstAmount = gstEnabled ? (subtotal * gstPercentage) / 100 : 0;
  
  if (!open) return null;

  const handlePlaceOrder = async () => {
    if (!restaurantId || !tableId) {
      toast.error("Session expired. Please scan QR again.");
      return;
    }
    setIsPlacingOrder(true);
    try {
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          restaurant_id: restaurantId,
          table_id: tableId,
          status: "pending",
          subtotal: subtotal,
          cgst: 0,
          sgst: 0,
          total: subtotal,
          tax_percentage: gstEnabled ? gstPercentage : 0,
        })
        .select().single();

      if (orderError) throw orderError;

      const orderItems = items.map((item) => ({
        order_id: order.id,
        menu_item_id: (item as any).included_items ? null : item.id,
        combo_id: (item as any).included_items ? item.id : null,
        quantity: item.quantity,
        price: item.price,
      }));

      const { error: itemsError } = await supabase.from("order_items").insert(orderItems);
      if (itemsError) throw itemsError;

      toast.success("Order sent to kitchen! 👨‍🍳");
      onClear();
      onClose();
    } catch (error: any) {
      toast.error("Order failed: " + (error.message || "Error"));
    } finally {
      setIsPlacingOrder(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />

      <div className="fixed bottom-0 left-0 right-0 z-50 bg-zinc-50 rounded-t-[2rem] shadow-2xl max-h-[90vh] flex flex-col transition-transform duration-300 ease-out">
        
        {/* Handle Bar */}
        <div className="w-12 h-1.5 bg-zinc-300 rounded-full mx-auto mt-3 mb-1" />

        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <h2 className="font-bold text-2xl text-zinc-900">Your Order</h2>
            <p className="text-sm text-zinc-500">{items.length} items selected</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 bg-zinc-200 rounded-full hover:bg-zinc-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ITEMS LIST */}
        <div className="flex-1 overflow-y-auto px-6 space-y-4 py-2">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-zinc-400">
              <ShoppingBag className="w-16 h-16 mb-4 opacity-20" />
              <p>Your cart is empty</p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="bg-white p-4 rounded-2xl flex items-center gap-4 shadow-sm border border-zinc-100">
                <div className="flex-1">
                  <h3 className="font-bold text-zinc-800">{item.name}</h3>
                  {/* Combo details */}
                  {(item as any).included_items && (
                    <p className="text-[10px] uppercase tracking-wider text-orange-600 font-medium mt-0.5">
                      {(item as any).included_items.map((i: any) => i.name).join(" • ")}
                    </p>
                  )}
                  <p className="text-zinc-500 font-medium mt-1">₹{item.price.toFixed(2)}</p>
                </div>

                <div className="flex items-center bg-zinc-100 rounded-xl p-1 gap-3">
                  <button
                    onClick={() => onRemove(item.id)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-white shadow-sm active:scale-95 transition-transform"
                  >
                    <Minus className="w-4 h-4 text-zinc-600" />
                  </button>
                  <span className="font-bold text-zinc-800 w-4 text-center">{item.quantity}</span>
                  <button
                    onClick={() => onAdd(item)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-zinc-900 shadow-sm active:scale-95 transition-transform"
                  >
                    <Plus className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* BILLING SUMMARY */}
        {items.length > 0 && (
          <div className="bg-white border-t border-zinc-100 px-6 pt-6 pb-8 rounded-t-[2rem] shadow-[0_-10px_40px_rgba(0,0,0,0,04)]">
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-zinc-500 text-sm">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              {gstEnabled && (
                <div className="flex justify-between text-zinc-400 text-xs italic">
                  <span>GST ({gstPercentage}%) included in price</span>
                  <span>₹{gstAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="h-px bg-dashed bg-zinc-200 w-full border-t border-dashed my-2" />
              <div className="flex justify-between items-center">
                <span className="font-bold text-lg text-zinc-900">Total Amount</span>
                <span className="font-black text-2xl text-zinc-900">₹{subtotal.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={isPlacingOrder}
              className="w-full bg-zinc-900 disabled:bg-zinc-400 text-white py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 shadow-xl shadow-zinc-200 active:scale-[0.98] transition-all"
            >
              {isPlacingOrder ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  <span>Place Order</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
                  <span>₹{subtotal.toFixed(2)}</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;