import { Link } from "@tanstack/react-router";
import { ArrowLeftRight, Calculator, Search, ShieldCheck } from "lucide-react";

export function TradeFeatureSection() {
  const steps = [
    {
      step: "Step 1",
      title: "Find a Swap-Eligible iPhone",
      description:
        "Browse listings marked with the Swap badge across Lagos, Abuja, and other states.",
      icon: Search,
    },
    {
      step: "Step 2",
      title: "Submit Your Device Specs",
      description:
        "Enter your model, storage, battery percentage, cosmetic condition, and real photos.",
      icon: Calculator,
    },
    {
      step: "Step 3",
      title: "Calculate Cash Adjustment",
      description:
        "Choose whether you add cash for an upgrade or receive cash for a downgrade.",
      icon: ArrowLeftRight,
    },
    {
      step: "Step 4",
      title: "Meet and Verify in Person",
      description:
        "Test Face ID, cameras, battery settings, and iCloud sign-out before closing the deal.",
      icon: ShieldCheck,
    },
  ];

  return (
    <section className="py-14 sm:py-16 bg-base-200/50 border-y border-base-200">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-2xl mx-auto text-center space-y-3 mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-base-content">
            How Device Swapping Works
          </h2>
          <p className="text-base sm:text-lg text-base-content/75 leading-relaxed">
            Transparent peer-to-peer trade-ins designed specifically for iPhone
            upgrades and downgrades without middlemen fees.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {steps.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="bg-base-100 p-6 rounded-3xl border border-base-300 shadow-xs flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="w-11 h-11 rounded-2xl bg-primary/20 text-base-content flex items-center justify-center font-black">
                      <Icon className="w-5 h-5 text-base-content" />
                    </span>
                    <span className="badge badge-neutral badge-sm font-mono font-bold text-xs px-2.5 py-1">
                      {item.step}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-base sm:text-lg text-base-content">
                    {item.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-base-content/75 font-medium">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-10 text-center">
          <Link
            to={"/explore" as string}
            className="btn btn-primary btn-md rounded-2xl font-bold px-8 shadow-sm text-sm sm:text-base"
          >
            Find Swap Opportunities
          </Link>
        </div>
      </div>
    </section>
  );
}
