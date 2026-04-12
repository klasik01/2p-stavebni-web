import type { FooterContent, NavItem } from "../types/content";
import { Icon } from "./Icon";

type FooterProps = {
  content: FooterContent;
  navigation: NavItem[];
  logo: string;
};

export function Footer({ content, navigation, logo }: FooterProps) {
  return (
    <footer>
      <div className="container">
        <div className="footer-top">
          <div className="footer-brand">
            <img
              src={logo}
              alt="2P Stavební"
              onError={(event) => {
                (event.currentTarget as HTMLImageElement).style.display = "none";
              }}
            />
            <p>{content.description}</p>
            <div className="footer-social">
              {content.socials.map((social) => (
                <a
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  className="social-link"
                  aria-label={social.label}
                  key={social.label}
                >
                  <Icon name={social.icon} size={18} filled={social.icon === "facebook"} />
                </a>
              ))}
            </div>
          </div>
          <div className="footer-col">
            <h4>Navigace</h4>
            <ul className="footer-links">
              {navigation.map((item) => (
                <li key={item.href}>
                  <a href={item.href}>{item.label}</a>
                </li>
              ))}
            </ul>
          </div>
          <div className="footer-col">
            <h4>Kontakt</h4>
            <div className="footer-contact-item">
              <Icon name="phone" size={14} />
              <a href={`tel:${content.phone.replace(/\s+/g, "")}`}>{content.phone}</a>
            </div>
            <div className="footer-contact-item">
              <Icon name="mail" size={14} />
              <a href={`mailto:${content.email}`}>{content.email}</a>
            </div>
            <div className="footer-contact-item">
              <Icon name="pin" size={14} />
              <span>{content.address}</span>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span>{content.copyright}</span>
          <span className="footer-legal">{content.legal}</span>
        </div>
      </div>
    </footer>
  );
}
