import { useEffect, useMemo, useState } from "react";
import { Coins, Sparkles, Zap } from "lucide-react";
import {
  confirmPaymentIntent,
  createPaymentIntent,
  fetchBillingSummary,
  fetchBillingTransactions,
  type BillingSummary,
  type BillingTransaction,
} from "@/features/billing/api/billing";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { t, type Locale } from "@/lib/i18n";

type CreditPackage = {
  id: string;
  credits: number;
  price: number;
};

const CREDIT_PACKAGES: CreditPackage[] = [
  { id: "starter", credits: 100, price: 9 },
  { id: "growth", credits: 500, price: 39 },
  { id: "scale", credits: 1200, price: 79 },
];

function getPackageIcon(index: number) {
  if (index === 2) return <Zap className="h-6 w-6 text-yellow-500" />;
  if (index === 1) return <Sparkles className="h-6 w-6 text-blue-500" />;
  return <Coins className="h-6 w-6 text-green-500" />;
}

function calculateSavings(pkg: CreditPackage) {
  const base = CREDIT_PACKAGES[0];
  const baseUnitPrice = base.price / base.credits;
  const currentUnitPrice = pkg.price / pkg.credits;
  const savings = ((baseUnitPrice - currentUnitPrice) / baseUnitPrice) * 100;
  return Math.max(0, Math.round(savings));
}

interface BillingFeatureProps {
  initialSummary: BillingSummary | null;
  initialTransactions: BillingTransaction[];
  locale: Locale;
}

export function BillingFeature({ initialSummary, initialTransactions, locale }: BillingFeatureProps) {
  const m = t(locale).dashboard;
  const [summary, setSummary] = useState<BillingSummary | null>(initialSummary);
  const [transactions, setTransactions] = useState<BillingTransaction[]>(initialTransactions);
  const [message, setMessage] = useState("");
  const [loadingPackageID, setLoadingPackageID] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [pendingIntentID, setPendingIntentID] = useState("");
  const [selectedPackage, setSelectedPackage] = useState<CreditPackage | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);

  async function reload() {
    try {
      const [nextSummary, nextTransactions] = await Promise.all([
        fetchBillingSummary(),
        fetchBillingTransactions(20),
      ]);
      setSummary(nextSummary);
      setTransactions(nextTransactions);
    } catch {
      setMessage(m.billing.failedLoad);
    }
  }

  useEffect(() => {
    if (!initialSummary) {
      void reload();
    }
  }, [initialSummary]);

  const balance = useMemo(() => summary?.balance ?? 0, [summary]);

  async function handlePurchase(pkg: CreditPackage) {
    if (loadingPackageID) return;
    setMessage("");
    setLoadingPackageID(pkg.id);
    try {
      const response = await createPaymentIntent(pkg.credits);
      setPendingIntentID(response.data.payment_intent.payment_intent_id);
      setSelectedPackage(pkg);
      setIsDialogOpen(true);
    } catch {
      setMessage(m.billing.failedCreateIntent);
    } finally {
      setLoadingPackageID("");
    }
  }

  async function handleConfirmPayment() {
    if (!pendingIntentID || !selectedPackage) return;
    setIsConfirming(true);
    setMessage("");
    try {
      const response = await confirmPaymentIntent(pendingIntentID);
      setMessage(
        `${m.billing.paymentSuccessful} +${response.data.result.credited_amount} ${m.billing.creditsUnit} (${m.billing.balance}: ${response.data.result.current_balance})`,
      );
      setIsDialogOpen(false);
      setPendingIntentID("");
      setSelectedPackage(null);
      await reload();
    } catch {
      setMessage(m.billing.paymentConfirmFailed);
    } finally {
      setIsConfirming(false);
    }
  }

  function closeDialog() {
    if (isConfirming) return;
    setIsDialogOpen(false);
    setPendingIntentID("");
    setSelectedPackage(null);
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{m.billing.credits}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="space-y-2">
            <div className="text-3xl font-bold">{balance.toLocaleString()} {m.billing.creditsUnit}</div>
            <div className="text-sm text-muted-foreground">{m.billing.useCreditsDescription}</div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold sm:text-2xl">{m.billing.topupTitle}</h2>
              <p className="mt-2 text-sm text-muted-foreground sm:mt-3">
                {m.billing.topupDescription}
              </p>
            </div>

            <div className="grid gap-4 xl:grid-cols-3">
              {CREDIT_PACKAGES.map((pkg, index) => (
                <Card key={pkg.id} className="relative overflow-hidden bg-muted dark:bg-background">
                  <CardContent className="flex h-full flex-col gap-6 pt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getPackageIcon(index)}
                        <div>
                          <div className="text-xl font-bold sm:text-2xl">{pkg.credits.toLocaleString()}</div>
                          <div className="text-xs text-muted-foreground sm:text-sm">{m.billing.creditsUnit}</div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <div className="text-xl font-bold text-primary sm:text-2xl">${pkg.price}</div>
                        <div className="text-xs text-muted-foreground sm:text-sm">{m.billing.oneTimePayment}</div>
                        {index > 0 ? (
                          <span className="mt-1 inline-flex h-6 items-center rounded-md bg-green-100 px-2 text-xs font-medium text-green-700 dark:bg-green-900 dark:text-green-300">
                            {m.billing.save} {calculateSavings(pkg)}%
                          </span>
                        ) : (
                          <span className="h-6" />
                        )}
                      </div>
                    </div>

                    <div className="flex-grow" />

                    <Button
                      className="w-full text-sm sm:text-base"
                      onClick={() => void handlePurchase(pkg)}
                      disabled={Boolean(loadingPackageID)}
                    >
                      {loadingPackageID === pkg.id ? m.billing.preparing : m.billing.purchaseNow}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{m.billing.transactionHistory}</CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length ? (
            <>
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-muted-foreground">
                      <th className="px-3 py-2 font-medium">{m.billing.date}</th>
                      <th className="px-3 py-2 font-medium">{m.billing.provider}</th>
                      <th className="px-3 py-2 font-medium">{m.billing.paymentIntent}</th>
                      <th className="px-3 py-2 font-medium">{m.billing.amount}</th>
                      <th className="px-3 py-2 font-medium">{m.billing.status}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((item) => (
                      <tr key={item.id} className="border-b border-border/60 last:border-0">
                        <td className="px-3 py-2">{new Date(item.created_at).toLocaleString()}</td>
                        <td className="px-3 py-2">{item.provider}</td>
                        <td className="px-3 py-2 font-mono text-xs">{item.payment_intent_id || "-"}</td>
                        <td className="px-3 py-2">{item.amount}</td>
                        <td className="px-3 py-2">
                          <span
                            className={`inline-flex rounded-md px-2 py-0.5 text-xs font-medium ${
                              item.status === "succeeded"
                                ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                                : "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300"
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="space-y-3 md:hidden">
                {transactions.map((item) => (
                  <div key={item.id} className="rounded-lg border border-border p-4">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{new Date(item.created_at).toLocaleDateString()}</span>
                      <span>{item.provider}</span>
                    </div>
                    <div className="mt-2 text-sm text-foreground">{item.amount} {m.billing.creditsUnit}</div>
                    <div className="mt-1 font-mono text-xs text-muted-foreground">{item.payment_intent_id || "-"}</div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="rounded-lg border border-border bg-muted/30 px-4 py-6 text-center text-sm text-muted-foreground">
              {m.billing.noTransactions}
            </div>
          )}
        </CardContent>
      </Card>

      {isDialogOpen && selectedPackage ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 px-4">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <CardTitle>{m.billing.purchaseCredits}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-lg border border-primary/20 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">{selectedPackage.credits.toLocaleString()} {m.billing.creditsUnit}</p>
                    <p className="text-sm text-muted-foreground">{m.billing.oneTimeTopupPackage}</p>
                  </div>
                  <p className="text-2xl font-bold text-primary">${selectedPackage.price}</p>
                </div>
                <p className="mt-4 text-xs text-muted-foreground">
                  {m.billing.devNotice}
                </p>
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={closeDialog} disabled={isConfirming}>
                  {m.billing.cancel}
                </Button>
                <Button onClick={() => void handleConfirmPayment()} disabled={isConfirming}>
                  {isConfirming ? m.billing.processing : m.billing.payNow}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {message ? (
        <div className="rounded-md border border-border bg-muted/30 px-4 py-3 text-sm text-foreground">{message}</div>
      ) : null}
    </div>
  );
}
