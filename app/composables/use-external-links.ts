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

    // Main site locale routing uses path prefixes instead of query params.
    target.pathname = localeValue === "en" ? "/en" : "/";
    target.searchParams.delete("lang");

    return target.toString();
  }

  return {
    getHomeUrl,
  };
}
