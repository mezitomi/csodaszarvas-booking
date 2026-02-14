import { defineStore } from "pinia";

export const useAvailableSlotsStore = defineStore("useAvailableSlotsStore", () => {
  const { $csrfFetch } = useNuxtApp();

  const availableSlots = ref<string[]>([]);

  async function refreshAvailableSlots(lanes: number, duration: number) {
    const response = await $csrfFetch<string[]>(ROUTE_AVAILABLE_SLOTS, {
      method: "POST",
      body: JSON.stringify({
        lanes,
        duration,
      }),
    });

    if (response) {
      availableSlots.value = response.filter(slot => new Date(slot) > new Date());
    }
    else {
      availableSlots.value = [];
    }
  }

  return {
    availableSlots,
    refreshAvailableSlots,
  };
});
