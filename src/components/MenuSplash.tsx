
import { useEffect, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import logo from "@/assets/cloud 9.webp";

interface Props {
  onFinish: () => void;
  restaurant?: {
    name?: string;
    logo?: string;
  } | null;
}

export default function MenuSplash({ onFinish, restaurant }: Props) {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const introTimer = window.setTimeout(() => setStage(1), 100);
    const exitTimer = window.setTimeout(() => setStage(2), 2800);
    const finishTimer = window.setTimeout(() => onFinish(), 3500);

    return () => {
      window.clearTimeout(introTimer);
      window.clearTimeout(exitTimer);
      window.clearTimeout(finishTimer);
    };
  }, [onFinish]);

  const restaurantName =
    restaurant?.name?.trim() || "Mayya's Residency";

  const restaurantLogo = restaurant?.logo || logo;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex min-h-[100dvh] w-full flex-col items-center justify-center overflow-hidden bg-[#FAFBFF] text-slate-900 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        stage === 2
          ? "pointer-events-none scale-[1.025] opacity-0 blur-sm"
          : "scale-100 opacity-100"
      }`}
      role="status"
      aria-label={`Loading ${restaurantName}`}
    >
      {/* Soft, premium background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-80 w-80 rounded-full bg-blue-200/45 blur-[100px] sm:h-[28rem] sm:w-[28rem]" />

        <div className="absolute -bottom-32 -right-24 h-96 w-96 rounded-full bg-pink-200/40 blur-[110px] sm:h-[32rem] sm:w-[32rem]" />

        <div className="absolute left-1/2 top-1/2 h-[min(90vw,620px)] w-[min(90vw,620px)] -translate-x-1/2 -translate-y-1/2 rounded-full border border-slate-200/60" />

        <div className="absolute left-1/2 top-1/2 h-[min(72vw,490px)] w-[min(72vw,490px)] -translate-x-1/2 -translate-y-1/2 rounded-full border border-slate-200/50" />

        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.05)_0%,rgba(250,251,255,0.2)_60%,#FAFBFF_100%)]" />
      </div>

      {/* Top accent line */}
      <div
        className={`absolute left-1/2 top-0 h-[3px] w-24 -translate-x-1/2 rounded-b-full bg-gradient-to-r from-blue-500 via-indigo-400 to-pink-400 transition-all duration-1000 ${
          stage >= 1 ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Main content */}
      <main className="relative z-10 flex w-full max-w-xl flex-col items-center px-6 text-center sm:px-10">
        {/* Logo */}
        <div
          className={`relative mb-9 transition-all duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            stage >= 1
              ? "translate-y-0 scale-100 opacity-100"
              : "translate-y-8 scale-90 opacity-0"
          }`}
        >
          {/* Soft logo glow */}
          <div className="absolute -inset-5 rounded-[2.5rem] bg-gradient-to-br from-blue-200/50 to-pink-200/50 blur-2xl" />

          {/* Logo container */}
          <div className="relative grid h-32 w-32 place-items-center overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white p-1.5 shadow-[0_20px_60px_rgba(30,41,59,0.12)] sm:h-36 sm:w-36">
            <img
              src={restaurantLogo}
              alt={`${restaurantName} logo`}
              className="block h-full w-full object-contain"
              draggable={false}
            />
          </div>

          {/* Minimal accent beneath the logo */}
          <div className="absolute -bottom-3 left-1/2 h-1 w-12 -translate-x-1/2 rounded-full bg-gradient-to-r from-blue-500 to-pink-400" />
        </div>

        {/* Welcome label */}
        <div
          className={`mb-4 flex items-center gap-3 transition-all duration-700 delay-150 ${
            stage >= 1
              ? "translate-y-0 opacity-100"
              : "translate-y-3 opacity-0"
          }`}
        >
          <span className="h-px w-7 bg-blue-300" />

          <span className="text-[10px] font-bold uppercase tracking-[0.38em] text-slate-500 sm:text-xs">
            Welcome to
          </span>

          <span className="h-px w-7 bg-pink-300" />
        </div>

        {/* Restaurant name */}
        <h1
          className={`max-w-full break-words text-3xl font-black leading-tight tracking-[-0.045em] text-slate-900 transition-all duration-1000 delay-200 sm:text-5xl ${
            stage >= 1
              ? "translate-y-0 opacity-100"
              : "translate-y-5 opacity-0"
          }`}
        >
          {restaurantName}
        </h1>

        {/* Supporting text */}
        <p
          className={`mt-3 max-w-sm text-xs font-medium leading-relaxed tracking-wide text-slate-500 transition-all duration-700 delay-300 sm:text-sm ${
            stage >= 1 ? "opacity-100" : "opacity-0"
          }`}
        >
          A little moment of comfort, served beautifully.
        </p>

        {/* Loading progress */}
        <div
          className={`mt-12 w-full max-w-[210px] transition-all duration-700 delay-300 ${
            stage >= 1
              ? "translate-y-0 opacity-100"
              : "translate-y-3 opacity-0"
          }`}
        >
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[9px] font-bold uppercase tracking-[0.24em] text-slate-400">
              Preparing your menu
            </span>

            <ArrowUpRight className="h-3.5 w-3.5 text-blue-500" />
          </div>

          <div className="relative h-[3px] overflow-hidden rounded-full bg-slate-200">
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-blue-500 via-indigo-400 to-pink-400 transition-[width] ease-linear"
              style={{
                width: stage >= 1 ? "100%" : "0%",
                transitionDuration: "3500ms",
              }}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer
        className={`absolute bottom-8 left-0 right-0 z-10 flex flex-col items-center gap-3 px-4 transition-all duration-1000 delay-300 sm:bottom-10 ${
          stage >= 1
            ? "translate-y-0 opacity-100"
            : "translate-y-4 opacity-0"
        }`}
      >
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />

            <span className="relative h-2 w-2 rounded-full bg-emerald-500" />
          </span>

          <span className="text-[9px] font-semibold uppercase tracking-[0.24em] text-slate-500">
            Your dining experience awaits
          </span>
        </div>

        <span className="text-[10px] font-medium tracking-[0.15em] text-slate-400">
          POWERED BY{" "}
          <span className="font-black text-slate-800">#2CODE</span>
        </span>
      </footer>
    </div>
  );
}
