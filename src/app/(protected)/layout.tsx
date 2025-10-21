import { auth } from "@/lib/auth";
import { Suspense } from "react";
import { redirect } from "next/navigation";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) {
    redirect("/auth/signin");
  }
  return <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>;
}
