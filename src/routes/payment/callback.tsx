import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Copy,
  HelpCircle,
  RefreshCw,
  ShieldCheck,
  Smartphone,
  Store,
} from "lucide-react";
import { useEffect, useState } from "react";
import { pb } from "../../client/pb";
import { Footer } from "../../components/layout/Footer";
import { PublicNavbar } from "../../components/layout/PublicNavbar";
import { extract_message } from "../../helpers/api";

interface PaymentCallbackSearchParams {
  reference?: string;
  trxref?: string;
}

export const Route = createFileRoute("/payment/callback")({
  ssr: false,
  validateSearch: (
    search: Record<string, unknown>,
  ): PaymentCallbackSearchParams => {
    return {
      reference: search.reference ? String(search.reference) : undefined,
      trxref: search.trxref ? String(search.trxref) : undefined,
    };
  },
  component: PaymentCallbackPage,
});

function PaymentCallbackPage() {
  const { reference: queryRef, trxref } = Route.useSearch();
  const paymentReference = queryRef || trxref;
  const queryClient = useQueryClient();

  const [verifyState, setVerifyState] = useState<
    "verifying" | "success" | "failed" | "no_ref"
  >("verifying");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [verificationData, setVerificationData] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const verifyTransaction = async (ref: string) => {
    setVerifyState("verifying");
    setErrorMessage(null);

    try {
      // Handshake with backend verify endpoint
      const res = await fetch(`${pb.baseUrl}/api/payments/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(pb.authStore.token
            ? { Authorization: `Bearer ${pb.authStore.token}` }
            : {}),
        },
        body: JSON.stringify({ reference: ref }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            `Verification failed with status ${res.status}`,
        );
      }

      setVerificationData(data?.data || data);
      setVerifyState("success");

      // Invalidate relevant caches to refresh pro status and promoted items
      queryClient.invalidateQueries({ queryKey: ["my-store"] });
      queryClient.invalidateQueries({ queryKey: ["my-phones"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-data"] });
      queryClient.invalidateQueries({ queryKey: ["catalog-items"] });
    } catch (err: any) {
      console.error("Verification error:", err);
      setErrorMessage(extract_message(err));
      setVerifyState("failed");
    }
  };

  useEffect(() => {
    if (!paymentReference) {
      setVerifyState("no_ref");
      return;
    }

    verifyTransaction(paymentReference);
  }, [paymentReference]);

  const handleCopyReference = () => {
    if (paymentReference) {
      navigator.clipboard.writeText(paymentReference);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-base-200/50">
      <PublicNavbar />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 py-12">
        <div className="bg-base-100 rounded-3xl border border-base-300 p-6 sm:p-10 max-w-lg w-full space-y-6 shadow-xl text-center">
          {/* VERIFYING STATE */}
          {verifyState === "verifying" && (
            <div className="space-y-6 py-8">
              <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                <span className="loading loading-spinner loading-lg text-primary" />
              </div>

              <div className="space-y-2">
                <h1 className="text-xl sm:text-2xl font-black text-base-content tracking-tight">
                  Verifying Transaction
                </h1>
                <p className="text-xs sm:text-sm text-base-content/70 max-w-sm mx-auto">
                  Communicating with Paystack to confirm your payment
                  reference...
                </p>
              </div>

              {paymentReference && (
                <div className="p-3 rounded-2xl bg-base-200/60 border border-base-300 text-xs font-mono text-base-content/60 break-all max-w-xs mx-auto">
                  Ref: {paymentReference}
                </div>
              )}
            </div>
          )}

          {/* SUCCESS STATE */}
          {verifyState === "success" && (
            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
              <div className="w-20 h-20 rounded-3xl bg-success/15 text-success flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-success/10 text-success text-xs font-bold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Transaction Confirmed</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-base-content tracking-tight">
                  Payment Successful!
                </h1>
                <p className="text-xs sm:text-sm text-base-content/70 max-w-sm mx-auto">
                  Your payment has been successfully recorded and your service
                  has been activated on Swappy.
                </p>
              </div>

              {/* Transaction Summary Card */}
              <div className="p-4 rounded-2xl bg-base-200/50 border border-base-300/60 text-left space-y-2.5">
                <div className="flex items-center justify-between text-xs pb-2 border-b border-base-300/40">
                  <span className="text-base-content/60">Reference</span>
                  <div className="flex items-center gap-1.5 font-mono font-bold text-base-content">
                    <span className="truncate max-w-[150px] sm:max-w-[200px]">
                      {paymentReference}
                    </span>
                    <button
                      onClick={handleCopyReference}
                      className="btn btn-ghost btn-xs btn-square"
                      title="Copy reference"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                    {copied && (
                      <span className="text-[10px] text-success font-sans">
                        Copied!
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pb-2 border-b border-base-300/40">
                  <span className="text-base-content/60">Status</span>
                  <span className="badge badge-success badge-sm font-bold text-success-content">
                    Active & Verified
                  </span>
                </div>

                {verificationData?.amount && (
                  <div className="flex items-center justify-between text-xs pb-2 border-b border-base-300/40">
                    <span className="text-base-content/60">Amount Paid</span>
                    <span className="font-mono font-bold text-primary">
                      ₦{(verificationData.amount / 100).toLocaleString()}
                    </span>
                  </div>
                )}

                {verificationData?.plan && (
                  <div className="flex items-center justify-between text-xs pb-2 border-b border-base-300/40">
                    <span className="text-base-content/60">Plan</span>
                    <span className="font-bold text-base-content capitalize">
                      {String(verificationData.plan).replace(/_/g, " ")}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between text-xs">
                  <span className="text-base-content/60">Gateway</span>
                  <span className="font-semibold text-base-content">
                    Paystack Nigeria (NGN)
                  </span>
                </div>
              </div>

              {/* Navigation Options */}
              <div className="space-y-2.5 pt-2">
                <Link
                  to="/dashboard"
                  className="btn btn-primary rounded-2xl font-black w-full shadow-md text-sm inline-flex items-center justify-center gap-2"
                >
                  <Store className="w-4 h-4" />
                  <span>Go to Dashboard</span>
                </Link>

                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to="/dashboard/phones"
                    className="btn btn-outline btn-sm rounded-xl font-bold text-xs"
                  >
                    <Smartphone className="w-3.5 h-3.5 mr-1" />
                    <span>My Inventory</span>
                  </Link>

                  <Link
                    to="/explore"
                    className="btn btn-ghost btn-sm rounded-xl font-bold text-xs"
                  >
                    <span>Marketplace</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* FAILED STATE */}
          {verifyState === "failed" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="w-20 h-20 rounded-3xl bg-error/15 text-error flex items-center justify-center mx-auto shadow-sm">
                <AlertCircle className="w-10 h-10" />
              </div>

              <div className="space-y-2">
                <h1 className="text-xl sm:text-2xl font-black text-base-content tracking-tight">
                  Verification Incomplete
                </h1>
                <p className="text-xs sm:text-sm text-base-content/70 max-w-sm mx-auto">
                  {errorMessage ||
                    "We were unable to confirm this transaction with Paystack. If you were debited, your service will activate automatically once webhook confirmation arrives."}
                </p>
              </div>

              {paymentReference && (
                <div className="p-3 rounded-2xl bg-base-200/60 border border-base-300 text-xs font-mono text-base-content/60 break-all max-w-xs mx-auto">
                  Ref: {paymentReference}
                </div>
              )}

              <div className="space-y-2.5 pt-2">
                {paymentReference && (
                  <button
                    onClick={() => verifyTransaction(paymentReference)}
                    className="btn btn-primary rounded-2xl font-black w-full shadow-md text-sm inline-flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Retry Verification</span>
                  </button>
                )}

                <Link
                  to="/dashboard"
                  className="btn btn-ghost rounded-2xl font-bold w-full text-xs text-base-content/70"
                >
                  Return to Dashboard
                </Link>
              </div>
            </div>
          )}

          {/* NO REFERENCE PROVIDED */}
          {verifyState === "no_ref" && (
            <div className="space-y-6">
              <div className="w-16 h-16 rounded-3xl bg-base-200 text-base-content/50 flex items-center justify-center mx-auto">
                <HelpCircle className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h1 className="text-xl sm:text-2xl font-black text-base-content tracking-tight">
                  No Payment Reference
                </h1>
                <p className="text-xs sm:text-sm text-base-content/70 max-w-sm mx-auto">
                  No Paystack transaction reference was found in the URL. If you
                  completed a payment, please check your email receipt.
                </p>
              </div>

              <div className="pt-2">
                <Link
                  to="/dashboard"
                  className="btn btn-primary rounded-2xl font-bold w-full text-sm"
                >
                  Go to Dashboard
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
