
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Sparkles,
  MessageSquare,
  Instagram,
  Facebook,
  Mail,
  Phone,
  X,
  Globe,
  Utensils,
  ExternalLink,
  LoaderCircle,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

interface FloatingActionsProps {
  restaurantId: string;
}

interface RestaurantLinks {
  id: string;
  name: string;
  instagram: string | null;
  facebook: string | null;
  whatsapp: string | null;
  email: string | null;
  google_review_url: string | null;
  website_url: string | null;
  zomato_url: string | null;
  swiggy_url: string | null;
}

const EMPTY_LINKS: RestaurantLinks = {
  id: "",
  name: "",
  instagram: null,
  facebook: null,
  whatsapp: null,
  email: null,
  google_review_url: null,
  website_url: null,
  zomato_url: null,
  swiggy_url: null,
};

function normalizeWebUrl(value?: string | null): string | null {
  const input = value?.trim();

  if (!input) return null;

  try {
    const url = new URL(
      /^https?:\/\//i.test(input) ? input : `https://${input}`
    );

    if (!["https:", "http:"].includes(url.protocol)) return null;
    if (!url.hostname.includes(".")) return null;

    return url.href;
  } catch {
    return null;
  }
}

function normalizeSocialUrl(
  value: string | null | undefined,
  platform: "instagram" | "facebook"
): string | null {
  const input = value?.trim();

  if (!input) return null;

  const allowedHosts =
    platform === "instagram"
      ? ["instagram.com", "www.instagram.com"]
      : ["facebook.com", "www.facebook.com", "m.facebook.com"];

  if (/^https?:\/\//i.test(input)) {
    const url = normalizeWebUrl(input);

    if (!url) return null;

    try {
      const parsed = new URL(url);

      return allowedHosts.includes(parsed.hostname.toLowerCase())
        ? url
        : null;
    } catch {
      return null;
    }
  }

  const username = input
    .replace(/^@/, "")
    .replace(/^\/+|\/+$/g, "");

  if (!/^[a-zA-Z0-9._]+$/.test(username)) return null;

  return platform === "instagram"
    ? `https://www.instagram.com/${username}/`
    : `https://www.facebook.com/${username}`;
}

function normalizeWhatsAppUrl(
  value?: string | null
): string | null {
  const input = value?.trim();

  if (!input) return null;

  if (/^https?:\/\//i.test(input)) {
    const url = normalizeWebUrl(input);

    if (!url) return null;

    try {
      const parsed = new URL(url);

      return [
        "wa.me",
        "api.whatsapp.com",
        "web.whatsapp.com",
      ].includes(parsed.hostname.toLowerCase())
        ? url
        : null;
    } catch {
      return null;
    }
  }

  const digits = input.replace(/\D/g, "");

  if (digits.length < 8 || digits.length > 15) return null;

  return `https://wa.me/${digits}`;
}

function normalizeEmail(value?: string | null): string | null {
  const email = value?.trim();

  return email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ? email
    : null;
}

const FloatingActions = ({
  restaurantId,
}: FloatingActionsProps) => {
  const [open, setOpen] = useState(false);
  const [restaurant, setRestaurant] =
    useState<RestaurantLinks>(EMPTY_LINKS);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const fetchRestaurant = useCallback(async () => {
    const id = restaurantId?.trim();

    if (!id) {
      setRestaurant(EMPTY_LINKS);
      setFetchError(
        "The restaurant ID is missing. Pass the restaurants.id UUID to FloatingActions."
      );
      setLoading(false);

      console.error("[FloatingActions] Missing restaurantId prop.");

      return;
    }

    setLoading(true);
    setFetchError(null);

    try {
      console.info("[FloatingActions] Fetching public restaurant links", {
        restaurantId: id,
        supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
      });

      // This view exposes only public contact and social-link fields.
      // Do not query the full restaurants table from the public website.
      const { data, error } = await supabase
        .from("public_restaurant_contact")
        .select(`
          id,
          name,
          slug,
          phone,
          email,
          whatsapp,
          instagram,
          facebook,
          website_url,
          zomato_url,
          swiggy_url,
          google_review_url
        `)
        .eq("id", id)
        .maybeSingle();

      if (error) {
        console.error(
          "[FloatingActions] Public contact query failed",
          {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint,
            restaurantId: id,
          }
        );

        setRestaurant(EMPTY_LINKS);
        setFetchError(
          `Could not load restaurant links (${error.code || "query error"}). Check that public_restaurant_contact exists and SELECT access is granted.`
        );

        return;
      }

      if (!data) {
        console.warn(
          "[FloatingActions] No public restaurant row found.",
          {
            restaurantId: id,
            supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
          }
        );

        setRestaurant(EMPTY_LINKS);
        setFetchError(
          "No restaurant record was returned. Verify the restaurant ID, Supabase project URL, and public view permissions."
        );

        return;
      }

      setRestaurant({
        id: data.id,
        name: data.name || "",
        instagram: data.instagram,
        facebook: data.facebook,
        whatsapp: data.whatsapp,
        email: data.email,
        google_review_url: data.google_review_url,
        website_url: data.website_url,
        zomato_url: data.zomato_url,
        swiggy_url: data.swiggy_url,
      });

      console.info("[FloatingActions] Public contact links loaded", {
        restaurantId: data.id,
        restaurantName: data.name,
        instagramAvailable: Boolean(data.instagram?.trim()),
        facebookAvailable: Boolean(data.facebook?.trim()),
        whatsappAvailable: Boolean(data.whatsapp?.trim()),
        emailAvailable: Boolean(data.email?.trim()),
        websiteAvailable: Boolean(data.website_url?.trim()),
        zomatoAvailable: Boolean(data.zomato_url?.trim()),
        swiggyAvailable: Boolean(data.swiggy_url?.trim()),
        reviewAvailable: Boolean(data.google_review_url?.trim()),
      });
    } catch (error) {
      console.error(
        "[FloatingActions] Unexpected fetch exception:",
        error
      );

      setRestaurant(EMPTY_LINKS);
      setFetchError(
        "An unexpected error occurred while loading contact links."
      );
    } finally {
      setLoading(false);
    }
  }, [restaurantId]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      // fetchRestaurant updates state internally. Prevent stale updates
      // if this component unmounts while the request is running.
      const id = restaurantId?.trim();

      if (!id) {
        setRestaurant(EMPTY_LINKS);
        setFetchError(
          "The restaurant ID is missing. Pass restaurants.id to FloatingActions."
        );
        setLoading(false);
        return;
      }

      setLoading(true);
      setFetchError(null);

      try {
        console.info("[FloatingActions] Fetching public contact data", {
          restaurantId: id,
          supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
        });

        const { data, error } = await supabase
          .from("public_restaurant_contact")
          .select(`
            id,
            name,
            phone,
            email,
            whatsapp,
            instagram,
            facebook,
            website_url,
            zomato_url,
            swiggy_url,
            google_review_url
          `)
          .eq("id", id)
          .maybeSingle();

        if (cancelled) return;

        if (error) {
          console.error("[FloatingActions] Query error:", {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint,
            restaurantId: id,
          });

          setRestaurant(EMPTY_LINKS);
          setFetchError(
            `Could not load restaurant links (${error.code || "query error"}). Check the public view and its SELECT permissions.`
          );

          return;
        }

        if (!data) {
          console.warn(
            "[FloatingActions] Query returned no visible row.",
            {
              restaurantId: id,
              supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
            }
          );

          setRestaurant(EMPTY_LINKS);
          setFetchError(
            "No restaurant record was found for this ID. Verify the public view and restaurant ID."
          );

          return;
        }

        setRestaurant({
          id: data.id,
          name: data.name || "",
          instagram: data.instagram,
          facebook: data.facebook,
          whatsapp: data.whatsapp,
          email: data.email,
          google_review_url: data.google_review_url,
          website_url: data.website_url,
          zomato_url: data.zomato_url,
          swiggy_url: data.swiggy_url,
        });

        console.info("[FloatingActions] Contact data loaded", {
          restaurantId: data.id,
          restaurantName: data.name,
          instagramAvailable: Boolean(data.instagram?.trim()),
          emailAvailable: Boolean(data.email?.trim()),
        });
      } catch (error) {
        if (cancelled) return;

        console.error("[FloatingActions] Unexpected error:", error);

        setRestaurant(EMPTY_LINKS);
        setFetchError(
          "An unexpected error occurred while loading contact links."
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [restaurantId, retryCount]);

  const actions = useMemo(
    () => [
      {
        key: "whatsapp",
        label: "WhatsApp",
        url: normalizeWhatsAppUrl(restaurant.whatsapp),
        icon: Phone,
        styles: "bg-green-50 text-green-800 hover:bg-green-100",
        iconStyles: "text-green-600",
      },
      {
        key: "instagram",
        label: "Instagram",
        url: normalizeSocialUrl(restaurant.instagram, "instagram"),
        icon: Instagram,
        styles: "bg-pink-50 text-pink-800 hover:bg-pink-100",
        iconStyles: "text-pink-600",
      },
      {
        key: "facebook",
        label: "Facebook",
        url: normalizeSocialUrl(restaurant.facebook, "facebook"),
        icon: Facebook,
        styles: "bg-blue-50 text-blue-800 hover:bg-blue-100",
        iconStyles: "text-blue-600",
      },
      {
        key: "email",
        label: "Email",
        url: normalizeEmail(restaurant.email)
          ? `mailto:${normalizeEmail(restaurant.email)}`
          : null,
        icon: Mail,
        styles: "bg-slate-100 text-slate-800 hover:bg-slate-200",
        iconStyles: "text-slate-600",
      },
      {
        key: "website",
        label: "Website",
        url: normalizeWebUrl(restaurant.website_url),
        icon: Globe,
        styles: "bg-violet-50 text-violet-800 hover:bg-violet-100",
        iconStyles: "text-violet-600",
      },
      {
        key: "zomato",
        label: "Order on Zomato",
        url: normalizeWebUrl(restaurant.zomato_url),
        icon: Utensils,
        styles: "bg-red-50 text-red-800 hover:bg-red-100",
        iconStyles: "text-red-600",
      },
      {
        key: "swiggy",
        label: "Order on Swiggy",
        url: normalizeWebUrl(restaurant.swiggy_url),
        icon: Utensils,
        styles: "bg-orange-50 text-orange-800 hover:bg-orange-100",
        iconStyles: "text-orange-600",
      },
    ],
    [restaurant]
  );

  const reviewUrl = normalizeWebUrl(restaurant.google_review_url);

  const hasAnyLinks =
    actions.some((action) => Boolean(action.url)) ||
    Boolean(reviewUrl);

  const openLink = (url: string | null) => {
    if (!url) return;

    if (url.startsWith("mailto:")) {
      window.location.href = url;
      return;
    }

    try {
      const parsed = new URL(url);

      if (!["https:", "http:"].includes(parsed.protocol)) return;

      window.open(parsed.href, "_blank", "noopener,noreferrer");
    } catch {
      console.error("[FloatingActions] Invalid URL:", url);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open contact and social links"
        aria-expanded={open}
        className="fixed bottom-28 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-900 text-white shadow-xl transition-all duration-200 hover:scale-105 hover:bg-zinc-800 focus:outline-none focus:ring-4 focus:ring-zinc-300"
      >
        <Sparkles className="h-5 w-5" />
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Close contact links overlay"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 cursor-default bg-black/40 backdrop-blur-[2px]"
          />

          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="floating-actions-title"
            className="fixed bottom-0 left-0 right-0 z-50 max-h-[85dvh] overflow-y-auto rounded-t-[2rem] border border-zinc-100 bg-white p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-2xl animate-in slide-in-from-bottom duration-300"
          >
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2
                  id="floating-actions-title"
                  className="text-lg font-bold tracking-tight text-zinc-900"
                >
                  Connect with us
                </h2>

                <p className="mt-1 text-sm text-zinc-500">
                  {restaurant.name
                    ? `Connect with ${restaurant.name}.`
                    : "Follow us, contact us, or order online."}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 text-zinc-700 transition hover:bg-zinc-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {loading && (
              <div className="flex items-center justify-center gap-3 py-10 text-sm text-zinc-500">
                <LoaderCircle className="h-5 w-5 animate-spin" />
                Loading contact links...
              </div>
            )}

            {!loading && fetchError && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                <div className="flex items-start gap-3">
                  <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

                  <div className="flex-1">
                    <p className="font-semibold">
                      Links couldn't be loaded.
                    </p>

                    <p className="mt-1">{fetchError}</p>

                    <button
                      type="button"
                      onClick={() => setRetryCount((count) => count + 1)}
                      className="mt-3 inline-flex items-center gap-2 rounded-lg bg-amber-100 px-3 py-2 font-semibold hover:bg-amber-200"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Try again
                    </button>
                  </div>
                </div>
              </div>
            )}

            {!loading && !fetchError && hasAnyLinks && (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {actions.map((action) => {
                  if (!action.url) return null;

                  const Icon = action.icon;

                  return (
                    <button
                      key={action.key}
                      type="button"
                      onClick={() => openLink(action.url)}
                      className={`flex min-h-14 items-center gap-3 rounded-xl p-4 text-left transition-colors ${action.styles}`}
                    >
                      <Icon
                        className={`h-5 w-5 shrink-0 ${action.iconStyles}`}
                      />

                      <span className="flex-1 text-sm font-semibold">
                        {action.label}
                      </span>

                      <ExternalLink className="h-4 w-4 opacity-50" />
                    </button>
                  );
                })}

                {reviewUrl && (
                  <button
                    type="button"
                    onClick={() => openLink(reviewUrl)}
                    className="flex min-h-14 items-center gap-3 rounded-xl bg-amber-50 p-4 text-left text-amber-800 transition-colors hover:bg-amber-100 sm:col-span-2"
                  >
                    <MessageSquare className="h-5 w-5 shrink-0 text-amber-600" />

                    <span className="flex-1 text-sm font-bold">
                      Leave a Google Review
                    </span>

                    <ExternalLink className="h-4 w-4 opacity-50" />
                  </button>
                )}
              </div>
            )}

            {!loading && !fetchError && !hasAnyLinks && (
              <div className="rounded-xl bg-zinc-50 px-5 py-8 text-center">
                <Globe className="mx-auto mb-3 h-8 w-8 text-zinc-400" />

                <p className="font-semibold text-zinc-800">
                  Contact links aren't available yet.
                </p>

                <p className="mt-1 text-sm text-zinc-500">
                  Please contact the restaurant directly.
                </p>
              </div>
            )}

            <p className="mt-5 text-center text-xs text-zinc-400">
              We look forward to connecting with you.
            </p>
          </section>
        </>
      )}
    </>
  );
};

export default FloatingActions;
