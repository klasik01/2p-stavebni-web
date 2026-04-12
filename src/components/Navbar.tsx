import { useEffect, useState } from "react";
import type { NavItem } from "../types/content";
import { Icon } from "./Icon";

type NavbarProps = {
  companyName: string;
  logo: string;
  navigation: NavItem[];
};

export function Navbar({ companyName, logo, navigation }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 60);
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`navbar ${isScrolled ? "scrolled" : ""}`} id="navbar">
      <div className="container">
        <div className="navbar-inner">
          <a href="#uvod" className="navbar-logo" onClick={() => setIsOpen(false)}>
            <img
              src={logo}
              alt={companyName}
              onError={(event) => {
                (event.currentTarget as HTMLImageElement).style.display = "none";
                const fallback = event.currentTarget.nextElementSibling as HTMLElement | null;
                if (fallback) fallback.style.display = "block";
              }}
            />
            <span className="logo-fallback">
              2P <span>STAVEBNÍ</span>
            </span>
          </a>
          <ul className={`navbar-nav ${isOpen ? "open" : ""}`} id="nav-menu">
            {navigation.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className={item.isButton ? "navbar-cta" : undefined}
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
          <button
            className="hamburger"
            type="button"
            aria-label="Menu"
            aria-expanded={isOpen}
            onClick={() => setIsOpen((current) => !current)}
          >
            <Icon name="menu" />
          </button>
        </div>
      </div>
    </nav>
  );
}
