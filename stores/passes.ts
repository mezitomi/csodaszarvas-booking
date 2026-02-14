import { defineStore } from "pinia";

import { ROUTE_USER_PASSES } from "~/utils/booking";

export const usePassesStore = defineStore("usePassesStore", () => {
  const {
    data: passes,
    status: passesStatus,
    refresh: refreshPasses,
  } = useFetch(ROUTE_USER_PASSES, {
    lazy: true,
  });

  return {
    passes,
    passesStatus,
    refreshPasses,
  };
});
