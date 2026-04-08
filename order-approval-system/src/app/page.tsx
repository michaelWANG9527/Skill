"use client";

import { useState } from "react";
import { User } from "@/types";
import LoginPage from "@/components/LoginPage";
import ApprovalPage from "@/components/ApprovalPage";

export default function Home() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  if (!currentUser) {
    return <LoginPage onLogin={setCurrentUser} />;
  }

  return (
    <ApprovalPage
      currentUser={currentUser}
      onLogout={() => setCurrentUser(null)}
    />
  );
}
