export const TECHNICIAN_SUBSCRIPTION_ROUTES = {
  GET_TECHNICIAN_SUBSCRIPTIONS: `/admin/technician-subscriptions`,
  GET_SUBSCRIPTION_STATS: "/admin/technician-subscriptions/stats",
  GET_SUBSCRIPTION_BY_ID: (subscriptionId: string) =>
    `/admin/technician-subscriptions/${subscriptionId}`,
  GET_SUBSCRIPTION_BY_TECHNICIAN: (technicianId: string) =>
    `/admin/technicians/${technicianId}/subscriptions`,
  UPDATE_SUBSCRIPTION_STATUS: (subscriptionId: string) =>
    `/admin/technicians/technician-subscriptions/${subscriptionId}/status`,
  GET_TECHNICIAN_CURRENT_SUBSCRIPTION: (technicianId: string) =>
    `/admin/technicians/${technicianId}/subscriptions/current`,
} as const;
