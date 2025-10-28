import { redirect } from "next/navigation";
import { getUserRole } from "@/lib/auth";

export default async function Dashboard() {
  const role = await getUserRole();

  // Redirect based on user role
  if (role === "admin") {
    redirect("/admin");
  } else if (role === "employee") {
    redirect("/dashboard/employee");
  } else {
    redirect("/dashboard/subscriber");
  }
}
