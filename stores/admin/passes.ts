import { defineStore } from "pinia";

import { ROUTE_ADMIN_PASSES } from "~/utils/constants";

export const useAdminPassesStore = defineStore("useAdminPassesStore", () => {
  const {
    data: passes,
    status: passesStatus,
    refresh: refreshPasses,
  } = useFetch(ROUTE_ADMIN_PASSES, {
    lazy: true,
  });

  return {
    passes,
    passesStatus,
    refreshPasses,
  };
});
