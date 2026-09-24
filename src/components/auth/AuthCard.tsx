import { Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowLeftRight,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import type { ReactNode } from "react";

interface AuthCardProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

export function AuthCard({ title, subtitle, children }: AuthCardProps) {
  return (
    <div className="min-h-screen bg-base-100 flex flex-col md:grid md:grid-cols-12">
      {/* Left Column: Visual & Trust Showcase (Visible on iPad and PC) */}
      <div className="hidden md:flex md:col-span-5 lg:col-span-6 bg-base-200/60 border-r border-base-300 relative flex-col justify-between p-8 lg:p-14 overflow-hidden select-none">
        {/* Ambient Backlight Glow */}
        <div className="absolute top-1/4 -left-12 w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-0 w-80 h-80 bg-secondary/15 rounded-full blur-3xl pointer-events-none" />

        {/* Top Branding */}
        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-2.5 group">
            <span className="w-10 h-10 rounded-2xl bg-primary text-primary-content flex items-center justify-center font-black shadow-md group-hover:scale-105 transition-transform">
              <ArrowLeftRight className="w-5 h-5 stroke-[2.5]" />
            </span>
            <span className="text-2xl font-black tracking-tight text-base-content">
              swappy<span className="text-primary font-black">.</span>
            </span>
          </Link>
          <p className="mt-2 text-xs font-bold text-base-content/60 tracking-wide uppercase">
            Nigeria Premier iPhone Exchange
          </p>
        </div>

        {/* Center: Device Photography & Floating Verification Pills */}
        <div className="relative z-10 my-auto py-8 flex flex-col items-center">
          <div className="relative w-full max-w-sm lg:max-w-md aspect-4/3 flex items-center justify-center">
            {/* Primary Phone Image */}
            <img
              src="/iphone_1.png"
              alt="Apple iPhone 15 Pro Max Natural Titanium"
              className="w-4/5 h-auto object-contain drop-shadow-2xl z-10 transform hover:scale-102 transition-transform duration-300"
            />

            {/* Secondary Layered Image */}
            <img
              src="/iphone_13.png"
              alt="Apple iPhone Midnight"
              className="w-3/5 h-auto object-contain drop-shadow-xl absolute -bottom-4 -left-2 opacity-85 hidden lg:block -rotate-6"
            />

            {/* Floating Trust Badges */}
            <div className="absolute top-4 -right-2 bg-base-100/90 backdrop-blur-md border border-base-300 rounded-2xl p-3 shadow-xl z-20 flex items-center gap-2.5 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="w-8 h-8 rounded-xl bg-success/15 text-success flex items-center justify-center flex-shrink-0">
                <Zap className="w-4 h-4 fill-success" />
              </div>
              <div>
                <div className="text-xs font-extrabold text-base-content">
                  Battery 95%+
                </div>
                <div className="text-[10px] text-base-content/60 font-medium">
                  Verified Peak Performance
                </div>
              </div>
            </div>

            <div className="absolute bottom-6 right-2 bg-base-100/90 backdrop-blur-md border border-base-300 rounded-2xl p-3 shadow-xl z-20 flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="w-8 h-8 rounded-xl bg-primary/20 text-primary-content flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-4 h-4 text-primary" />
              </div>
              <div>
                <div className="text-xs font-extrabold text-base-content">
                  Physical Inspection
                </div>
                <div className="text-[10px] text-base-content/60 font-medium">
                  Face ID & TrueTone Tested
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-2 text-xs font-bold text-base-content/75 bg-base-100/70 border border-base-300/80 px-4 py-2 rounded-full shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span>
              Over 10,000 verified iPhone swaps completed in Lagos and Abuja
            </span>
          </div>
        </div>

        {/* Bottom Trust Matrix */}
        <div className="relative z-10 pt-6 border-t border-base-300/60 grid grid-cols-3 gap-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
            <span className="text-xs font-semibold text-base-content/80">
              No Escrow Trap
            </span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-secondary flex-shrink-0" />
            <span className="text-xs font-semibold text-base-content/80">
              In-Person Safe
            </span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-accent flex-shrink-0" />
            <span className="text-xs font-semibold text-base-content/80">
              Direct WhatsApp
            </span>
          </div>
        </div>
      </div>

      {/* Right Column: Form Container */}
      <div className="w-full md:col-span-7 lg:col-span-6 flex flex-col justify-between p-6 sm:p-10 lg:p-16 relative">
        {/* Mobile Header (Brand + Navigation) */}
        <div className="flex items-center justify-between pb-6 md:pb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-base-content/70 hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Marketplace</span>
          </Link>

          {/* Visible on Mobile only */}
          <Link to="/" className="flex items-center gap-1.5 md:hidden">
            <span className="w-7 h-7 rounded-lg bg-primary text-primary-content flex items-center justify-center font-black text-xs">
              S
            </span>
            <span className="font-black text-base text-base-content">
              swappy
            </span>
          </Link>
        </div>

        {/* Form Main Area (Spacious on PC and iPad) */}
        <div className="w-full max-w-lg mx-auto my-auto space-y-6">
          <div className="space-y-1.5">
            <h1 className="text-2xl sm:text-3xl font-black text-base-content tracking-tight">
              {title}
            </h1>
            <p className="text-sm text-base-content/70 leading-relaxed">
              {subtitle}
            </p>
          </div>

          <div className="bg-base-100 md:border md:border-base-300 md:rounded-3xl md:p-8 md:shadow-lg">
            {children}
          </div>
        </div>

        {/* Footer Note */}
        <div className="pt-6 text-center text-xs text-base-content/50">
          <span>Protected by Swappy verified physical trade guidelines.</span>
        </div>
      </div>
    </div>
  );
}
