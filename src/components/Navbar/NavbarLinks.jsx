export const navLinks = [
  { href: "/calculator", label: "Calculator" },
  { href: "/values", label: "Value List" },
  { href: "/value-updates", label: "Value Updates" },
  { href: "/trades", label: "Trades" },
  { href: "/guides", label: "Guides" },
  { href: "/credits", label: "Credits" },
  { href: "/faq", label: "FAQ" },
];

export default function NavbarLinks() {
  return (
    <ul className="flex items-center gap-6 list-none">
      {navLinks.map((link) => (
        <li key={link.href}>
          <a
            href={link.href}
            className="relative text-base font-normal transition-colors hover:text-opacity-80 after:absolute after:bottom-[-6px] after:left-0 after:h-[2px] after:w-0 after:bg-[#4F46E5] dark:after:bg-[#A78BFA] after:transition-all after:duration-300 after:ease-in-out hover:after:w-full font-urbanist text-[#020617] dark:text-gray-200"
          >
            {link.label}
          </a>
        </li>
      ))}
    </ul>
  );
}

