export default function NavbarLogo() {
  return (
    <a
      href="/"
      className="
        text-[1.75rem]
        font-normal
        font-urbanist

        bg-[linear-gradient(to_right,_#000000_0%,_#7241BB_100%)]
        dark:bg-[linear-gradient(to_right,_#FFFFFF_0%,_#A78BFA_100%)]
        bg-clip-text
        text-transparent

        drop-shadow-[0_0_2px_rgba(114,65,187,0.25)]
        dark:drop-shadow-[0_0_10px_rgba(167,139,250,0.5)]
        transition-all duration-300
      "
    >
      Sabrvalues
    </a>
  );
}
