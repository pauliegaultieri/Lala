"use client";

import { useSession, signIn, signOut } from "next-auth/react";

export default function AuthButton() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <span className="loading loading-spinner loading-sm"></span>;
  }

  if (session) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <img
            src={session.user.image}
            alt={session.user.name}
            className="w-8 h-8 rounded-full"
          />
          <span className="text-sm font-medium hidden sm:inline">
            {session.user.displayName || session.user.name}
          </span>
        </div>
        <button
          onClick={() => signOut()}
          className="btn btn-sm btn-outline btn-error"
        >
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => signIn("roblox")}
      className="btn btn-sm btn-primary"
    >
      Sign in with Roblox
    </button>
  );
}
