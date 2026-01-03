"use client";

import { useState, useRef, useEffect } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { User, LogOut } from "lucide-react";

function AvatarImage({ robloxId, fallbackImage, alt, isOpen }) {
  const [avatarUrl, setAvatarUrl] = useState(fallbackImage);

  useEffect(() => {
    if (!fallbackImage && robloxId) {
      fetch(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${robloxId}&size=150x150&format=Png&isCircular=false`)
        .then(res => res.json())
        .then(data => {
          if (data.data?.[0]?.imageUrl) {
            setAvatarUrl(data.data[0].imageUrl);
          }
        })
        .catch(() => {});
    }
  }, [robloxId, fallbackImage]);

  if (!avatarUrl) {
    return (
      <div className={`w-10 h-10 rounded-full border-2 bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] flex items-center justify-center transition-all duration-200 hover:scale-105 hover:shadow-[0_4px_12px_rgba(79,70,229,0.3)] ${
        isOpen ? "border-[#6366F1] shadow-[0_4px_12px_rgba(79,70,229,0.3)]" : "border-[#4F46E5]"
      }`}>
        <User size={20} className="text-white" />
      </div>
    );
  }

  return (
    <img
      src={avatarUrl}
      alt={alt}
      className={`w-10 h-10 rounded-full border-2 transition-all duration-200 hover:scale-105 hover:shadow-[0_4px_12px_rgba(79,70,229,0.3)] ${
        isOpen ? "border-[#6366F1] shadow-[0_4px_12px_rgba(79,70,229,0.3)]" : "border-[#4F46E5]"
      }`}
    />
  );
}

export default function ButtonLogin({ className = "" }) {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (session) {
    return (
      <div className="relative z-[10001]" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="block cursor-pointer"
        >
          <AvatarImage 
            robloxId={session.user.robloxId} 
            fallbackImage={session.user.image} 
            alt={session.user.name} 
            isOpen={isOpen} 
          />
        </button>

        {isOpen && (
          <div
            className="
              absolute right-0 top-full mt-3
              w-56 p-2
              bg-white/95 dark:bg-slate-900/95
              backdrop-blur-xl
              rounded-xl
              border border-gray-200/50 dark:border-slate-700/50
              shadow-xl dark:shadow-slate-900/50
              z-[10001]
              animate-in fade-in slide-in-from-top-2 duration-200
            "
          >
            {/* User Info */}
            <div className="px-3 py-3 border-b border-gray-100 dark:border-slate-800">
              <p
                className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate"
                style={{ fontFamily: "var(--font-urbanist)" }}
              >
                {session.user.displayName || session.user.name}
              </p>
              <p
                className="text-xs text-gray-500 dark:text-gray-400 mt-0.5"
                style={{ fontFamily: "var(--font-urbanist)" }}
              >
                ID: {session.user.robloxId}
              </p>
            </div>

            {/* Menu Items */}
            <div className="py-1 mt-1">
              <a
                href="/profile"
                onClick={() => setIsOpen(false)}
                className="
                  flex items-center gap-3 px-3 py-2.5 rounded-lg
                  text-sm font-medium text-gray-700 dark:text-gray-200
                  hover:bg-gray-100 dark:hover:bg-slate-800
                  transition-colors duration-150
                "
                style={{ fontFamily: "var(--font-urbanist)" }}
              >
                <User size={16} className="text-gray-500 dark:text-gray-400" />
                View Profile
              </a>
              <button
                onClick={() => { signOut(); setIsOpen(false); }}
                className="
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                  text-sm font-medium text-red-600 dark:text-red-400
                  hover:bg-red-50 dark:hover:bg-red-900/20
                  transition-colors duration-150
                  cursor-pointer
                "
                style={{ fontFamily: "var(--font-urbanist)" }}
              >
                <LogOut size={16} />
                Sign Out
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => signIn("roblox")}
      className={`px-12 py-[0.5625rem] rounded-[10px] bg-[#4F46E5] text-base font-normal text-white transition-all duration-200 ease-out hover:bg-[#6366F1] hover:scale-[1.02] hover:shadow-[0_4px_12px_rgba(79,70,229,0.4)] active:scale-[0.98] cursor-pointer ${className}`}
      style={{ fontFamily: "var(--font-urbanist)" }}
    >
      Log in
    </button>
  );
}

