import { Link } from "@tanstack/react-router";
import { ArrowLeftRight, ShieldCheck } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-base-200 border-t border-base-300 text-base-content py-12">
      <div className="container mx-auto px-4 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="space-y-3">
            <Link to="/" className="flex items-center gap-2 text-xl font-black">
              <span className="w-8 h-8 rounded-lg bg-primary text-primary-content flex items-center justify-center font-bold">
                <ArrowLeftRight className="w-4 h-4 stroke-[2.5]" />
              </span>
              <span>
                swappy<span className="text-primary font-black">.</span>
              </span>
            </Link>
            <p className="text-xs text-base-content/70 leading-relaxed">
              Nigeria's specialized peer-to-peer marketplace for buying,
              selling, and swapping iPhones with verified battery health and
              cosmetic conditions.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-base-content/80">
              Marketplace
            </span>
            <ul className="space-y-1 text-xs text-base-content/70">
              <li>
                <Link
                  to={"/explore" as string}
                  className="hover:text-primary transition-colors"
                >
                  All iPhones
                </Link>
              </li>
              <li>
                <Link
                  to={"/explore" as string}
                  className="hover:text-primary transition-colors"
                >
                  Swap Eligible Deals
                </Link>
              </li>
              <li>
                <Link
                  to={"/app/store" as string}
                  className="hover:text-primary transition-colors"
                >
                  Verified Phone Stores
                </Link>
              </li>
              <li>
                <Link
                  to={"/dashboard" as string}
                  className="hover:text-primary transition-colors"
                >
                  Post Your Listing
                </Link>
              </li>
            </ul>
          </div>

          {/* Locations */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-base-content/80">
              Active Regions
            </span>
            <ul className="space-y-1 text-xs text-base-content/70">
              <li>Lagos (Ikeja, Lekki, Yaba, Surulere)</li>
              <li>Abuja (Wuse, Garki, Maitama, Gwarinpa)</li>
              <li>Rivers (Port Harcourt, GRA, Trans Amadi)</li>
              <li>Oyo (Ibadan, Bodija, Dugbe)</li>
            </ul>
          </div>

          {/* Trust and Safety */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-base-content/80 flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-accent" />
              Safety First
            </span>
            <p className="text-xs text-base-content/70 leading-relaxed">
              Always inspect devices in public locations before making payment
              or completing swaps. Check iCloud status and hardware diagnostics
              in person.
            </p>
          </div>
        </div>

        <div className="pt-6 border-t border-base-300/80 flex flex-col sm:flex-row items-center justify-between text-xs text-base-content/60 gap-4">
          <p>
            © {new Date().getFullYear()} Swappy Marketplace. All rights
            reserved.
          </p>
          <div className="flex items-center gap-4">
            <span>Terms of Service</span>
            <span>Privacy Policy</span>
            <span>Safety Guidelines</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
