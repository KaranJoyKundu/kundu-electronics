type ProductArtworkProps = {
  name: string;
  sku?: string | null;
  category?: string | null;
};

type ArtworkKind = "display" | "battery" | "mechanical" | "board";

function getArtworkKind(name: string, category?: string | null): ArtworkKind {
  const value = (name + " " + (category ?? "")).toLowerCase();
  if (/display|oled|lcd|matrix|tft/.test(value)) return "display";
  if (/battery|power source|cell/.test(value)) return "battery";
  if (/motor|wheel|robot|mechanical/.test(value)) return "mechanical";
  return "board";
}

/**
 * Transparent, category-based artwork for products without an approved photo.
 * This is labelled as an illustration and is never presented as a real product photo.
 */
export function ProductArtwork({ name, sku, category }: ProductArtworkProps) {
  const kind = getArtworkKind(name, category);
  const matrix = sku === "P031";

  return (
    <div className={"product-artwork product-artwork-" + kind} role="img"
      aria-label={"Illustration for " + name + ". A product photograph is not available yet."}>
      <svg viewBox="0 0 320 240" aria-hidden="true" focusable="false">
        <rect x="24" y="18" width="272" height="204" rx="22" fill="#f7faf7" stroke="#dbe5de" strokeWidth="2" />
        <path d="M48 52h26M246 52h26M48 188h26M246 188h26" stroke="#c5d5cb" strokeWidth="3" strokeLinecap="round" />
        {kind === "display" ? (
          <g>
            <rect x="70" y="55" width="180" height="118" rx="12" fill="#d5e4dc" stroke="#5b7a69" strokeWidth="5" />
            <rect x="84" y="69" width="152" height="90" rx="6" fill="#263c40" />
            {matrix ? (
              <g fill="#8ed0b0">
                {Array.from({ length: 8 }, (_, row) =>
                  Array.from({ length: 8 }, (_, column) => (
                    <circle key={row + "-" + column} cx={105 + column * 16} cy={88 + row * 9} r="3.2" opacity={(row + column) % 3 === 0 ? 0.45 : 0.95} />
                  ))
                )}
              </g>
            ) : (
              <g stroke="#91c7aa" strokeWidth="5" strokeLinecap="round">
                <path d="M102 96h84M102 112h106M102 128h71" />
              </g>
            )}
            <path d="M101 181v16M219 181v16M101 197h118" stroke="#5b7a69" strokeWidth="4" strokeLinecap="round" />
            <circle cx="160" cy="185" r="4" fill="#c9a66b" />
          </g>
        ) : kind === "battery" ? (
          <g>
            <rect x="112" y="55" width="96" height="132" rx="18" fill="#d9e7dc" stroke="#557864" strokeWidth="5" />
            <rect x="143" y="42" width="34" height="16" rx="4" fill="#9aa9a0" />
            <rect x="127" y="77" width="66" height="92" rx="8" fill="#f9fcf9" stroke="#b6c9bd" strokeWidth="2" />
            <path d="M148 96h24M160 111v25M148 123h24" stroke="#5b8a70" strokeWidth="5" strokeLinecap="round" />
            <path d="M87 120h20M213 120h20" stroke="#a8beb0" strokeWidth="4" strokeLinecap="round" />
          </g>
        ) : kind === "mechanical" ? (
          <g>
            <circle cx="160" cy="118" r="67" fill="#e0e9e2" stroke="#557864" strokeWidth="7" />
            <circle cx="160" cy="118" r="42" fill="#f9fbf8" stroke="#8da99a" strokeWidth="6" />
            <circle cx="160" cy="118" r="16" fill="#9bb5a6" stroke="#557864" strokeWidth="5" />
            <path d="M160 42v19M160 175v19M84 118h19M217 118h19M106 64l14 14M200 158l14 14M214 64l-14 14M120 158l-14 14" stroke="#557864" strokeWidth="8" strokeLinecap="round" />
          </g>
        ) : (
          <g>
            <rect x="75" y="56" width="170" height="128" rx="14" fill="#d5e6dc" stroke="#547a62" strokeWidth="5" />
            <rect x="123" y="91" width="74" height="58" rx="8" fill="#3a5850" stroke="#8eae9b" strokeWidth="4" />
            <path d="M88 79h18M88 94h18M88 109h18M88 124h18M88 139h18M214 79h18M214 94h18M214 109h18M214 124h18M214 139h18" stroke="#6c987d" strokeWidth="4" strokeLinecap="round" />
            <path d="M143 108h34M143 122h20M143 136h30" stroke="#b5d5c0" strokeWidth="4" strokeLinecap="round" />
            <circle cx="106" cy="164" r="7" fill="#c6a56d" />
            <circle cx="214" cy="164" r="7" fill="#c6a56d" />
          </g>
        )}
      </svg>
      <div className="product-artwork-caption">
        <span>Illustration</span>
        <span>Real product photo coming soon</span>
      </div>
    </div>
  );
}
