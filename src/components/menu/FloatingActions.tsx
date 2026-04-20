import { useEffect, useState } from "react";
import {
  Sparkles,
  MessageSquare,
  Instagram,
  Facebook,
  Mail,
  Phone,
  X
} from "lucide-react";
import { supabase } from "@/lib/supabase";

interface FloatingActionsProps {
  restaurantId: string;
}

const FloatingActions = ({ restaurantId }: FloatingActionsProps) => {
  const [open, setOpen] = useState(false);
  const [restaurant, setRestaurant] = useState<any>(null);
const [loading, setLoading] = useState(true);
  // 🔹 Fetch restaurant data
  useEffect(() => {
  const fetchRestaurant = async () => {
    if (!restaurantId) return;

    const { data, error } = await supabase
      .from("restaurants")
      .select(`
  instagram,
  facebook,
  whatsapp,
  email,
  google_review_url,
  website_url,
  zomato_url,
  swiggy_url
`)
      .eq("id", restaurantId)
      .single();

    console.log("FLOATING DATA:", data, error);

    setRestaurant(data);
    setLoading(false);
  };

  fetchRestaurant();
}, [restaurantId]);

  // 🔹 Helper to open links safely
  const openLink = (url?: string) => {
    if (!url) return;
    window.open(url, "_blank");
  };
const hasAnyLinks =
  restaurant?.whatsapp ||
  restaurant?.instagram ||
  restaurant?.facebook ||
  restaurant?.email ||
  restaurant?.google_review_url ||
  restaurant?.website_url ||
  restaurant?.zomato_url ||
  restaurant?.swiggy_url;
  return (
    <>
      {/* 🔥 FLOATING BUTTON */}
      <div className="fixed bottom-28 right-5 z-40">
        <button
          onClick={() => setOpen(true)}
          className="flex items-center justify-center bg-zinc-900 text-white p-4 rounded-2xl shadow-xl hover:scale-105 transition-all"
        >
          <Sparkles className="w-5 h-5" />
        </button>
      </div>

      {/* 🔥 OVERLAY */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-50"
          onClick={() => setOpen(false)}
        />
      )}

      {/* 🔥 BOTTOM SHEET */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-[2rem] p-6 transition-transform duration-300 ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
      >
        {/* HEADER */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg">Connect with us</h3>
          <button onClick={() => setOpen(false)}>
            <X />
          </button>
        </div>

        {/* ACTION BUTTONS */}
        <div className="grid grid-cols-2 gap-4">

          {/* WhatsApp */}
          {restaurant?.whatsapp && (
            <button
              onClick={() => openLink(restaurant.whatsapp)}
              className="flex items-center gap-3 p-4 rounded-xl bg-green-50 hover:bg-green-100"
            >
              <Phone className="text-green-600" />
              <span className="font-semibold">WhatsApp</span>
            </button>
          )}

          {/* Instagram */}
          {restaurant?.instagram && (
            <button
              onClick={() => openLink(restaurant.instagram)}
              className="flex items-center gap-3 p-4 rounded-xl bg-pink-50 hover:bg-pink-100"
            >
              <Instagram className="text-pink-600" />
              <span className="font-semibold">Instagram</span>
            </button>
          )}

          {/* Facebook */}
          {restaurant?.facebook && (
            <button
              onClick={() => openLink(restaurant.facebook)}
              className="flex items-center gap-3 p-4 rounded-xl bg-blue-50 hover:bg-blue-100"
            >
              <Facebook className="text-blue-600" />
              <span className="font-semibold">Facebook</span>
            </button>
          )}

          {/* Email */}
          {restaurant?.email && (
            <button
              onClick={() => openLink(`mailto:${restaurant.email}`)}
              className="flex items-center gap-3 p-4 rounded-xl bg-gray-100 hover:bg-gray-200"
            >
              <Mail />
              <span className="font-semibold">Email</span>
            </button>
          )}
          {restaurant?.website_url && (
  <button
    onClick={() => openLink(restaurant.website_url)}
    className="flex items-center gap-3 p-4 rounded-xl bg-zinc-100 hover:bg-zinc-200"
  >
    🌐
    <span className="font-semibold">Website</span>
  </button>
)}
{restaurant?.zomato_url && (
  <button
    onClick={() => openLink(restaurant.zomato_url)}
    className="flex items-center gap-3 p-4 rounded-xl bg-red-50 hover:bg-red-100"
  >
    🍽️
    <span className="font-semibold">Zomato</span>
  </button>
)}
{restaurant?.swiggy_url && (
  <button
    onClick={() => openLink(restaurant.swiggy_url)}
    className="flex items-center gap-3 p-4 rounded-xl bg-orange-50 hover:bg-orange-100"
  >
    🍽️
    <span className="font-semibold">Swiggy</span>
  </button>
)}
          {/* Review */}
          {restaurant?.google_review_url && (
            <button
              onClick={() => openLink(restaurant.google_review_url)}
              className="col-span-2 flex items-center justify-center gap-3 p-4 rounded-xl bg-orange-100 hover:bg-orange-200"
            >
              <MessageSquare className="text-orange-600" />
              <span className="font-bold">Leave a Review</span>
              <Sparkles className="w-4 h-4 text-orange-500" />
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default FloatingActions;