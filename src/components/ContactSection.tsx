import { useState } from "react";
import type { ContactContent } from "../types/content";
import { Icon } from "./Icon";
import { SectionHeading } from "./SectionHeading";

function encode(data: Record<string, string>) {
  return new URLSearchParams(data).toString();
}

export function ContactSection({ content }: { content: ContactContent }) {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    message: "",
    gdpr: false,
  });

  const submitLabel =
    status === "success"
      ? "✓ Odesláno! Brzy se ozveme."
      : status === "submitting"
        ? "Odesílám..."
        : status === "error"
          ? "Zkusit znovu"
          : "Odeslat zprávu";

  return (
    <section className="contact" id="kontakt">
      <div className="container">
        <div className="contact-header">
          <SectionHeading
            label={content.label}
            title={content.title}
            titleAccent={content.titleAccent}
            description={content.description}
          />
        </div>
        <div className="contact-grid">
          <div className="contact-info">
            <div className="contact-block reveal">
              <div className="contact-block-title">Firemní údaje</div>
              <div className="contact-line">
                <Icon name="company" size={16} />
                <div>
                  <strong>{content.companyLines[0]}</strong>
                  <br />
                  {content.companyLines[1]}
                  <br />
                  <small>{content.companyLines[2]}</small>
                </div>
              </div>
              <div className="contact-line">
                <Icon name="pin" size={16} />
                <div>
                  {content.officeLines[0]}
                  <br />
                  <small>{content.officeLines[1]}</small>
                </div>
              </div>
              <div className="contact-line">
                <Icon name="building" size={16} />
                <span>{content.registration}</span>
              </div>
              <div className="contact-line">
                <Icon name="phone" size={16} />
                <a href={`tel:${content.phone.replace(/\s+/g, "")}`}>{content.phone}</a>
              </div>
              <div className="contact-line">
                <Icon name="mail" size={16} />
                <a href={`mailto:${content.email}`}>{content.email}</a>
              </div>
            </div>
            <div className="contact-team reveal">
              {content.team.map((member) => (
                <div className="team-card" key={member.email}>
                  <div className="team-avatar">{member.initials}</div>
                  <div className="team-info">
                    <div className="team-name">{member.name}</div>
                    <div className="team-pos">{member.role}</div>
                    <div className="team-contacts">
                      <a
                        href={`tel:${member.phone.replace(/\s+/g, "")}`}
                        className="team-contact-link"
                      >
                        <Icon name="phone" size={13} />
                        {member.phone}
                      </a>
                      <a href={`mailto:${member.email}`} className="team-contact-link">
                        <Icon name="mail" size={13} />
                        {member.email}
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="contact-form-section reveal">
            <h3 className="contact-form-title">Napište nám</h3>
            <p className="contact-form-desc">
              Vyplňte formulář a ozveme se vám co nejdříve. Rádi probereme váš projekt.
            </p>
            <form
              name="contact"
              method="post"
              data-netlify="true"
              data-netlify-honeypot="bot-field"
              onSubmit={async (event) => {
                event.preventDefault();
                setStatus("submitting");

                try {
                  await fetch("/", {
                    method: "POST",
                    headers: { "Content-Type": "application/x-www-form-urlencoded" },
                    body: encode({
                      "form-name": "contact",
                      name: formData.name,
                      phone: formData.phone,
                      email: formData.email,
                      message: formData.message,
                      gdpr: String(formData.gdpr),
                    }),
                  });

                  setStatus("success");
                  setFormData({
                    name: "",
                    phone: "",
                    email: "",
                    message: "",
                    gdpr: false,
                  });
                } catch {
                  setStatus("error");
                }
              }}
            >
              <input type="hidden" name="form-name" value="contact" />
              <div hidden>
                <input name="bot-field" onChange={() => undefined} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Jméno *</label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Vaše jméno"
                    required
                    value={formData.name}
                    onChange={(event) =>
                      setFormData((current) => ({ ...current, name: event.target.value }))
                    }
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="phone">Telefon</label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="+420 ..."
                    value={formData.phone}
                    onChange={(event) =>
                      setFormData((current) => ({ ...current, phone: event.target.value }))
                    }
                  />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="vas@email.cz"
                  required
                  value={formData.email}
                  onChange={(event) =>
                    setFormData((current) => ({ ...current, email: event.target.value }))
                  }
                />
              </div>
              <div className="form-group">
                <label htmlFor="message">Zpráva *</label>
                <textarea
                  id="message"
                  name="message"
                  placeholder="Popište váš projekt nebo dotaz..."
                  required
                  value={formData.message}
                  onChange={(event) =>
                    setFormData((current) => ({ ...current, message: event.target.value }))
                  }
                />
              </div>
              <div className="form-check">
                <input
                  type="checkbox"
                  id="gdpr"
                  name="gdpr"
                  required
                  checked={formData.gdpr}
                  onChange={(event) =>
                    setFormData((current) => ({ ...current, gdpr: event.target.checked }))
                  }
                />
                <label htmlFor="gdpr">Souhlasím se zpracováním osobních údajů dle GDPR.</label>
              </div>
              <button
                type="submit"
                className={`btn btn-primary form-submit ${status === "success" ? "is-success" : ""}`}
                disabled={status === "submitting"}
              >
                {submitLabel}
                {status !== "success" ? <Icon name="send" size={16} /> : null}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
