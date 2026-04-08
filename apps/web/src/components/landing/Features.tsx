import { t } from "@/lib/i18n";
import { resolveClientLocale } from "@/lib/locale";

export function Features() {
  const locale = resolveClientLocale();
  const m = t(locale);

  return (
    <div className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-primary">
            {m.landing.featuresEyebrow}
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            {m.landing.featuresTitle}
          </p>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            {m.landing.featuresDescription}
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-4">
            {m.landing.featureItems.map((item, index) => {
              const Icon = m.landing.featureIcons[index % m.landing.featureIcons.length];
              return (
                <div key={`${item}-${index}`} className="flex flex-col">
                  <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-foreground">
                    <Icon className="h-5 w-5 flex-none text-primary" aria-hidden={true} />
                    <span>{m.landing.featureTitles[index] || item}</span>
                  </dt>
                  <dd className="mt-4 flex flex-auto flex-col text-sm leading-7 text-muted-foreground">
                    <p className="flex-auto">{item}</p>
                  </dd>
                </div>
              );
            })}
          </dl>
        </div>
      </div>
    </div>
  );
}
