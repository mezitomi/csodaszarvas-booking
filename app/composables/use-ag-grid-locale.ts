import type { GridOptions } from "ag-grid-community";

export function useAgGridLocale() {
  const { t } = useI18n();

  const localeText = computed<GridOptions["localeText"]>(() => ({
    // Pagination
    page: t("ag_grid.page"),
    of: t("ag_grid.of"),
    to: t("ag_grid.to"),
    more: t("ag_grid.more"),
    next: t("ag_grid.next"),
    last: t("ag_grid.last"),
    first: t("ag_grid.first"),
    previous: t("ag_grid.previous"),

    // Filter
    filterOoo: t("ag_grid.filter"),
    contains: t("ag_grid.contains"),
    notContains: t("ag_grid.notContains"),
    equals: t("ag_grid.equals"),
    notEqual: t("ag_grid.notEqual"),
    startsWith: t("ag_grid.startsWith"),
    endsWith: t("ag_grid.endsWith"),
    blank: t("ag_grid.blank"),
    notBlank: t("ag_grid.notBlank"),
    andCondition: t("ag_grid.and"),
    orCondition: t("ag_grid.or"),
    applyFilter: t("ag_grid.applyFilter"),
    resetFilter: t("ag_grid.resetFilter"),
    clearFilter: t("ag_grid.clearFilter"),

    // Column menu
    pinColumn: t("ag_grid.pinColumn"),
    autosizeThisColumn: t("ag_grid.autosizeThisColumn"),
    autosizeAllColumns: t("ag_grid.autosizeAllColumns"),

    // Other
    noRowsToShow: t("ag_grid.noRowsToShow"),
    loadingOoo: t("ag_grid.loading"),

    // Selection
    selectAll: t("ag_grid.selectAll"),
    searchOoo: t("ag_grid.search"),
  }));

  return {
    localeText,
  };
}
