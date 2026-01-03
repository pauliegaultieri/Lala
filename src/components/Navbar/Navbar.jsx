"use client";

import { useState, useEffect } from "react";
import { Menu, X, Calculator, List, ArrowLeftRight, BookOpen, Users, HelpCircle, LogOut } from "lucide-react";
import { useSession, signIn, signOut } from "next-auth/react";
import NavbarLogo from "./NavbarLogo";
import NavbarLinks, { navLinks } from "./NavbarLinks";
import ButtonLogin from "./ButtonLogin";
import NotificationsBell from "./NotificationsBell";

const navIcons = {
  "/calculator": Calculator,
  "/values": List,
  "/trades": ArrowLeftRight,
  "/guides": BookOpen,
  "/credits": Users,
  "/faq": HelpCircle,
};

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data: session } = useSession();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  return (
    <>
      {/* Mobile Menu Overlay - OUTSIDE of everything, highest z-index */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black/70 lg:hidden"
          style={{ zIndex: 99998 }}
          onClick={closeMenu}
        />
      )}

      {/* Mobile Menu - OUTSIDE of everything, highest z-index */}
      {isMenuOpen && (
        <div
          className="fixed inset-x-4 top-24 lg:hidden bg-white dark:bg-slate-900 rounded-[24px] border border-gray-200 dark:border-slate-700 shadow-2xl overflow-hidden"
          style={{ zIndex: 99999 }}
        >
          {/* Menu Header */}
          <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-500 font-urbanist">
              Navigation
            </p>
            <button
              onClick={closeMenu}
              className="p-1.5 rounded-lg bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              aria-label="Close menu"
            >
              <X size={18} strokeWidth={2} />
            </button>
          </div>

          {/* Mobile Nav Links */}
          <div className="p-3 bg-white dark:bg-slate-900">
            <ul className="flex flex-col gap-1">
              {navLinks.map((link, index) => {
                const Icon = navIcons[link.href];
                return (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      onClick={closeMenu}
                      className="
                        flex items-center gap-4 px-4 py-3.5 rounded-xl
                        text-[15px] font-medium font-urbanist
                        text-gray-700 dark:text-gray-200
                        hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50
                        dark:hover:from-slate-800 dark:hover:to-slate-800
                        hover:text-[#4F46E5] dark:hover:text-indigo-400
                        transition-all duration-200
                        group
                      "
                    >
                      {Icon && (
                        <div className="p-2 rounded-lg bg-gray-100 dark:bg-slate-800 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/30 transition-colors">
                          <Icon size={18} className="text-gray-500 dark:text-gray-400 group-hover:text-[#4F46E5] dark:group-hover:text-indigo-400 transition-colors" />
                        </div>
                      )}
                      <span>{link.label}</span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
          
          {/* Mobile Login Button */}
          <div className="p-4 pt-2 border-t border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-800">
            {session ? (
              <div className="flex flex-col gap-2">
                <a
                  href="/profile"
                  onClick={closeMenu}
                  className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <img
                    src={session.user.image || "/images/temp/roblox.webp"}
                    alt={session.user.name}
                    className="w-10 h-10 rounded-full border-2 border-[#4F46E5]"
                  />
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                      {session.user.displayName || session.user.name}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      View Profile
                    </span>
                  </div>
                </a>

                <button
                  type="button"
                  onClick={() => {
                    closeMenu();
                    signOut({ callbackUrl: "/" });
                  }}
                  className="
                    w-full px-4 py-3 rounded-xl
                    bg-white dark:bg-slate-900
                    border border-gray-200 dark:border-slate-700
                    text-gray-700 dark:text-gray-200 text-[15px] font-semibold font-urbanist
                    hover:bg-gray-100 dark:hover:bg-slate-700
                    transition-colors
                    cursor-pointer
                    flex items-center justify-center gap-2
                  "
                >
                  <LogOut size={18} />
                  Log out
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => { signIn("roblox"); closeMenu(); }}
                className="
                  w-full py-3.5 rounded-xl
                  bg-gradient-to-r from-[#4F46E5] to-[#7C3AED]
                  text-white text-[15px] font-semibold font-urbanist
                  shadow-lg shadow-indigo-500/25
                  hover:shadow-xl hover:shadow-indigo-500/30
                  hover:scale-[1.02]
                  active:scale-[0.98]
                  transition-all duration-200
                  cursor-pointer
                "
              >
                Log in with Roblox
              </button>
            )}
          </div>
        </div>
      )}

      <div className="w-full px-4 sm:px-6 lg:px-[2.1875rem] pt-4 sm:pt-6 lg:pt-[3.125rem] pb-4 relative z-[10000] isolate">
        <nav className="relative flex items-center justify-between w-full rounded-[25px] p-[1px]">
          <div
            className="
              flex items-center justify-between w-full
              rounded-[16px] lg:rounded-[25px]
              px-5 sm:px-6 lg:px-[4.375rem] py-3 lg:py-8

              bg-white/50 dark:bg-slate-900/50
              backdrop-blur-xl
              border border-gray-200/50 dark:border-slate-700/50
              shadow-lg dark:shadow-slate-900/20
              transition-all duration-300
            "
          >
            <NavbarLogo />
            
            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-6">
              <NavbarLinks />
              {session && <NotificationsBell />}
              <ButtonLogin />
            </div>

            {/* Mobile Controls */}
            <div className="flex lg:hidden items-center gap-2">
              <button
                onClick={toggleMenu}
                className={`
                  relative p-2.5 rounded-xl
                  bg-gradient-to-br from-[#4F46E5] to-[#7C3AED]
                  text-white
                  shadow-lg shadow-indigo-500/25
                  hover:shadow-xl hover:shadow-indigo-500/30
                  hover:scale-105
                  active:scale-95
                  transition-all duration-200
                  cursor-pointer
                `}
                aria-label="Toggle menu"
              >
                <div className={`transition-transform duration-300 ${isMenuOpen ? "rotate-180" : ""}`}>
                  {isMenuOpen ? <X size={22} strokeWidth={2.5} /> : <Menu size={22} strokeWidth={2.5} />}
                </div>
              </button>
            </div>
          </div>
        </nav>
      </div>
    </>
  );
}
