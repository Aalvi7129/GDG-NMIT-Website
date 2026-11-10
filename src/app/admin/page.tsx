import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AdminDashboard from "@/components/admin/AdminDashboard";
import { ADMIN_COOKIE, verifySessionToken } from "@/lib/admin/session";
import { getSiteContent } from "@/lib/content/store";

// Always render fresh: this page shows the latest saved content.
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  // Middleware already guards this route; check again here so the page never
  // renders for someone without a valid session.
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!(await verifySessionToken(token))) redirect("/admin/login");

  return <AdminDashboard initial={await getSiteContent()} />;
}
