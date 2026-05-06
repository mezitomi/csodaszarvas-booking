import type { AsyncDataRequestStatus } from "#app";
import type { OpeningType } from "~~/lib/db/schema";

import { to } from "await-to-js";
import { defineStore } from "pinia";

import { ROUTE_ADMIN_OPENINGS } from "~/utils/constants";

type AdminOpeningsStore = {
  openings: Ref<OpeningType[] | undefined>;
  openingsStatus: Ref<AsyncDataRequestStatus>;
  updatingId: Ref<number | null>;
  refreshOpenings: () => void;
  updateOpeningLanes: (id: number, availableLanes: number) => Promise<void>;
  createOpening: (dayOfWeek: number, startHour: number, availableLanes: number) => Promise<void>;
};

export const useAdminOpeningsStore = defineStore("useAdminOpeningsStore", (): AdminOpeningsStore => {
  const { $csrfFetch } = useNuxtApp();

  const {
    data: openings,
    status: openingsStatus,
    refresh: refreshOpenings,
  } = useFetch<OpeningType[]>(ROUTE_ADMIN_OPENINGS, {
    lazy: true,
  });

  const updatingId = ref<number | null>(null);

  const updateOpeningLanes = async (id: number, availableLanes: number) => {
    if (!openings.value)
      return;

    const original = openings.value.find(o => o.id === id);
    if (!original)
      return;

    // Optimistic update
    const originalLanes = original.availableLanes;
    openings.value = openings.value.map(o => o.id === id ? { ...o, availableLanes } : o);
    updatingId.value = id;

    const [error] = await to($csrfFetch<{ opening: OpeningType; regeneratedCount: number }>(
      `${ROUTE_ADMIN_OPENINGS}/${id}`,
      {
        method: "PUT",
        body: { availableLanes },
      },
    ));

    updatingId.value = null;

    if (error) {
      // Rollback
      openings.value = openings.value.map(o => o.id === id ? { ...o, availableLanes: originalLanes } : o);
      throw error;
    }

    // Refresh from server to ensure grid is in sync
    await refreshOpenings();
  };

  const createOpening = async (dayOfWeek: number, startHour: number, availableLanes: number) => {
    updatingId.value = -1;

    const [error] = await to($csrfFetch<{ opening: OpeningType }>(
      ROUTE_ADMIN_OPENINGS,
      {
        method: "POST",
        body: { dayOfWeek, startHour, endHour: startHour + 1, availableLanes },
      },
    ));

    updatingId.value = null;

    if (error)
      throw error;

    await refreshOpenings();
  };

  return {
    openings,
    openingsStatus,
    updatingId,
    refreshOpenings,
    updateOpeningLanes,
    createOpening,
  };
});
