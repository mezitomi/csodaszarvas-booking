type BookingUrlOptions = {
  locale?: string;
  returnTo?: string;
};

export function useExternalLinks() {
  const { locale } = useI18n();
  const runtimeConfig = useRuntimeConfig();
  const home = runtimeConfig.public.homePageUrl;

  function getHomeUrl(options?: BookingUrlOptions) {
    const target = new URL(home);
    const localeValue = options?.locale ?? locale.value;

    target.searchParams.set("lang", localeValue);

    return target.toString();
  }

  return {
    getHomeUrl,
  };
}
