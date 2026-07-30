import { requireParent } from "@/lib/session";
import { ParentShell } from "@/components/parent/ParentShell";

export default async function ParentLayout({ children }: { children: React.ReactNode }) {
  const session = await requireParent();

  return <ParentShell userName={session.user.name}>{children}</ParentShell>;
}
