import { Button } from "@/components/ui/button";
import ShinyButton from "@/components/ui/shiny-button";
import { GITHUB_REPO_URL } from "@/constants";
import { Skeleton } from "@/components/ui/skeleton";
import { t } from "@/lib/i18n";
import { resolveClientLocale } from "@/lib/locale";

export function Hero() {
  const locale = resolveClientLocale();
  const m = t(locale);

  return (
    <div className="relative isolate pt-14 bg-secondary">
      <div className="pt-20 pb-24 sm:pt-20 sm:pb-32 lg:pb-40">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-10 flex justify-center gap-4 flex-wrap">
              <ShinyButton className="rounded-full bg-primary/10 text-primary ring-1 ring-inset ring-primary/20">
                {m.landing.badgeFree}
              </ShinyButton>
              <TotalUsersButtonSkeleton />
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl bg-gradient-to-r from-primary to-chart-1 bg-clip-text text-transparent">
              {m.landing.title}
            </h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              {m.landing.description}
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-4 md:gap-x-6">
              <Button size="lg" className="rounded-full" asChild>
                <a href={GITHUB_REPO_URL} target="_blank">
                  {m.landing.viewGithub}
                </a>
              </Button>
              <a href="/sign-in">
                <Button variant="outline" size="lg" className="rounded-full">
                  {m.landing.tryDemo}
                </Button>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TotalUsersButtonSkeleton() {
  return (
    <div className="rounded-full bg-chart-1/10 ring-1 ring-inset ring-chart-1/20 px-4 py-1.5 text-sm font-medium">
      <Skeleton className="w-32 h-5" />
    </div>
  );
}
