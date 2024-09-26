"use client";

import { useEffect } from "react";
import { useAuth } from "../components/AuthProvider";
import { useRouter } from "next/navigation";

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      switch (user.role) {
        case "admin":
          router.push("/admin/add-route");
          break;
        case "staff":
          router.push("/staff");
          break;
        default:
          router.push("/user");
      }
    } else {
      router.push("/login");
    }
  }, [user, router]);

  return null;
}
