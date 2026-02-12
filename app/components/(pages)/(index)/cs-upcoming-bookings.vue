<script setup lang="ts">
const upcomingBookings = ref([
  {
    id: 1,
    date: "2026-02-18",
    time: "18:00",
    guests: 4,
    status: "confirmed",
  },
  {
    id: 2,
    date: "2026-03-15",
    time: "20:00",
    guests: 2,
    status: "pending",
  },
]);
</script>

<template>
  <div class="container">
    <h4>{{ $t("pages.index.upcoming_bookings") }}</h4>
    <ul>
      <li v-for="booking in upcomingBookings" :key="booking.id">
        {{ booking.date }} {{ booking.time }} - {{ booking.guests }} {{ $t("pages.index.persons") }} - {{ booking.status }}
      </li>
    </ul>
  </div>
</template>
