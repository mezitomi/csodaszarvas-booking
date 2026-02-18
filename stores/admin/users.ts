import { defineStore } from "pinia";

import { ROUTE_ADMIN_USERS } from "~/utils/constants";

export const useAdminUsersStore = defineStore("useAdminUsersStore", () => {
  const {
    data: users,
    status: usersStatus,
    refresh: refreshUsers,
  } = useFetch(ROUTE_ADMIN_USERS, {
    lazy: true,
  });

  return {
    users,
    usersStatus,
    refreshUsers,
  };
});
