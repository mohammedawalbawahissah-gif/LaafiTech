// Single source of truth for role -> home route, so Login, Signup, and
// App's HomeRedirect don't each carry their own copy of this logic that
// can drift out of sync as roles are added.
export function roleHome(role) {
  if (role === "admin" || role === "superadmin") return "/admin";
  if (role === "agent") return "/agent";
  if (role === "community_user") return "/community";
  return "/funder";
}
