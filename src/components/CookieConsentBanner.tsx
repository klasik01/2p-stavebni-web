type CookieConsentBannerProps = {
  onAccept: () => void;
  onReject: () => void;
};

export function CookieConsentBanner({
  onAccept,
  onReject,
}: CookieConsentBannerProps) {
  return (
    <aside className="cookie-banner" aria-label="Nastavení cookies">
      <div className="cookie-banner-copy">
        <strong>Používáme analytické cookies</strong>
        <p>
          Pomáhají nám porozumět návštěvnosti webu a zlepšovat obsah i výkon stránek.
        </p>
      </div>
      <div className="cookie-banner-actions">
        <button type="button" className="btn btn-secondary" onClick={onReject}>
          Odmítnout
        </button>
        <button type="button" className="btn btn-primary" onClick={onAccept}>
          Přijmout
        </button>
      </div>
    </aside>
  );
}
