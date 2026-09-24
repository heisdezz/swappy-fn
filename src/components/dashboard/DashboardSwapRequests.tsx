import {
  ArrowLeftRight,
  Check,
  MessageSquare,
  RefreshCw,
  X,
} from "lucide-react";
import { useState } from "react";
import { pb } from "../../client/pb";

export interface SwapRequestItem {
  id: string;
  target_device_id: string;
  target_device_title: string;
  offered_model: string;
  offered_storage: string;
  offered_battery?: number;
  offered_condition?: string;
  cash_adjustment: number;
  buyer_name: string;
  buyer_whatsapp?: string;
  status:
    | "pending"
    | "accepted"
    | "rejected"
    | "countered"
    | "completed"
    | "cancelled";
  message?: string;
  created: string;
}

interface DashboardSwapRequestsProps {
  requests: SwapRequestItem[];
  onRefresh?: () => void;
}

export function DashboardSwapRequests({
  requests,
  onRefresh,
}: DashboardSwapRequestsProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleAction = async (offerId: string, action: "accept" | "reject") => {
    setLoadingId(offerId);
    try {
      const backendUrl =
        import.meta.env.VITE_POCKETBASE_URL || "http://127.0.0.1:8090";
      const token = pb.authStore.token;

      const res = await fetch(`${backendUrl}/api/swap/${offerId}/respond`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action }),
      });

      if (res.ok && onRefresh) {
        onRefresh();
      }
    } catch (err) {
      console.error(`Failed to ${action} swap offer:`, err);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="bg-base-100 rounded-3xl border border-base-300 p-6 sm:p-7 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-4 border-b border-base-200">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-base-content tracking-tight">
              Swap Offers
            </h2>
            <p className="text-xs sm:text-sm text-base-content/65 mt-1">
              Incoming device trade proposals
            </p>
          </div>

          <span className="badge badge-accent badge-sm font-bold text-xs px-2.5 py-1">
            {requests.length} Total
          </span>
        </div>

        {requests.length > 0 ? (
          <div className="mt-5 space-y-3.5">
            {requests.map((req) => {
              const formattedCash =
                req.cash_adjustment !== 0
                  ? new Intl.NumberFormat("en-NG", {
                      style: "currency",
                      currency: "NGN",
                      maximumFractionDigits: 0,
                    }).format(Math.abs(req.cash_adjustment))
                  : "Straight Swap (₦0)";

              const cashPrefix =
                req.cash_adjustment > 0
                  ? "Buyer adds +"
                  : req.cash_adjustment < 0
                    ? "You pay "
                    : "";

              const isLoading = loadingId === req.id;

              return (
                <div
                  key={req.id}
                  className="p-4 rounded-2xl bg-base-200/50 border border-base-300/60 space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-xs font-semibold text-base-content/60">
                        Offered for {req.target_device_title}
                      </div>
                      <div className="font-extrabold text-sm sm:text-base text-base-content mt-1 flex items-center gap-1.5">
                        <ArrowLeftRight className="w-4 h-4 text-primary shrink-0" />
                        <span>
                          {req.offered_model} ({req.offered_storage})
                        </span>
                      </div>
                      {req.offered_battery && (
                        <div className="text-[11px] text-base-content/60 mt-0.5">
                          Battery: {req.offered_battery}% &bull; Condition:{" "}
                          {req.offered_condition || "Good"}
                        </div>
                      )}
                    </div>

                    <span
                      className={`badge badge-sm font-bold text-xs uppercase ${
                        req.status === "pending"
                          ? "badge-warning"
                          : req.status === "accepted"
                            ? "badge-success text-success-content"
                            : req.status === "rejected"
                              ? "badge-error text-error-content"
                              : "badge-neutral"
                      }`}
                    >
                      {req.status}
                    </span>
                  </div>

                  {req.message && (
                    <div className="text-xs text-base-content/75 italic bg-base-100/60 p-2.5 rounded-xl border border-base-300/40">
                      &ldquo;{req.message}&rdquo;
                    </div>
                  )}

                  <div className="p-3 rounded-xl bg-base-100/90 border border-base-300/50 flex items-center justify-between text-xs sm:text-sm font-medium">
                    <span className="text-base-content/75 font-semibold">
                      Cash Difference:
                    </span>
                    <span className="font-black text-primary">
                      {cashPrefix}
                      {formattedCash}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs sm:text-sm text-base-content/70 pt-1">
                    <span>From: {req.buyer_name}</span>
                    {req.buyer_whatsapp && (
                      <a
                        href={`https://wa.me/${req.buyer_whatsapp.replace(/[^0-9]/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-success font-bold hover:underline"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </a>
                    )}
                  </div>

                  {/* Accept / Reject Action Buttons for Pending Offers */}
                  {req.status === "pending" && (
                    <div className="flex items-center gap-2 pt-2 border-t border-base-300/50">
                      <button
                        type="button"
                        disabled={isLoading}
                        onClick={() => handleAction(req.id, "accept")}
                        className="btn btn-xs btn-success rounded-xl font-bold flex-1 inline-flex items-center gap-1 text-success-content"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Accept Offer</span>
                      </button>
                      <button
                        type="button"
                        disabled={isLoading}
                        onClick={() => handleAction(req.id, "reject")}
                        className="btn btn-xs btn-outline btn-error rounded-xl font-bold inline-flex items-center gap-1"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Decline</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-base-200 border border-base-300 flex items-center justify-center mx-auto text-base-content/40">
              <RefreshCw className="w-6 h-6" />
            </div>
            <div className="text-sm font-bold text-base-content/70">
              No swap offers yet
            </div>
            <p className="text-xs text-base-content/50 max-w-xs mx-auto">
              When buyers offer to trade their device for your iPhone with cash
              adjustments, they will appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
