import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { HomeAuthGate } from "./home-auth-gate";

export default async function Home() {
  const { userId } = await auth();

  if (userId) {
    redirect("/dashboard");
  }

  return <HomeAuthGate />;
}
