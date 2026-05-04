import { getAuthProfile } from "@/lib/dev-auth";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const profile = await getAuthProfile();
  if (!profile.is_admin) redirect("/dashboard");
  return <>{children}</>;
}
