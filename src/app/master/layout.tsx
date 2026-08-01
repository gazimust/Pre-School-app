import { requirePlatformAdmin } from "@/lib/session";
import { MasterShell } from "@/components/master/MasterShell";

export default async function MasterLayout({ children }: { children: React.ReactNode }) {
  const session = await requirePlatformAdmin();

  return <MasterShell userName={session.user.name}>{children}</MasterShell>;
}
