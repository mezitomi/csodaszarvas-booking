export function useDatePickerLocale() {
  const { locale } = useI18n();

  const firstWeekday = computed(() => (locale.value === "hu" ? "Monday" : "Sunday"));
  const weekdayNames = computed(() => (locale.value === "hu" ? ["V", "H", "K", "SZ", "CS", "P", "SZ"] : ["SU", "MO", "TU", "WE", "TH", "FR", "SA"]));
  const monthNames = computed(() => (locale.value === "hu" ? ["Január", "Február", "Március", "Április", "Május", "Június", "Július", "Augusztus", "Szeptember", "Október", "November", "December"] : ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]));
  return {
    firstWeekday,
    weekdayNames,
    monthNames,
  };
}
