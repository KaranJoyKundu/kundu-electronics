type ProductArtworkProps = { name: string; sku?: string | null; category?: string | null };
type ArtworkKind = "resistor" | "resistor-box" | "ic" | "led" | "display" | "battery" | "motor" | "breadboard" | "power" | "sensor" | "relay" | "meter" | "wheel" | "board";

function getArtworkKind(name: string, category?: string | null): ArtworkKind {
  const value = (name + " " + (category ?? "")).toLowerCase();
  if (/resistor box|resistor kit|resistor assortment/.test(value)) return "resistor-box";
  if (/resistor|ohm|ω/.test(value)) return "resistor";
  if (/\bled\b|light emitting diode/.test(value)) return "led";
  if (/breadboard|vero board|prototyping board/.test(value)) return "breadboard";
  if (/multimeter|voltmeter|ammeter|tester/.test(value)) return "meter";
  if (/relay/.test(value)) return "relay";
  if (/display|oled|lcd|matrix|tft|seven.segment/.test(value)) return "display";
  if (/battery|18650|power source|cell/.test(value)) return "battery";
  if (/stepper|servo|motor|wheel|caster/.test(value)) return /wheel|caster/.test(value) ? "wheel" : "motor";
  if (/buck|boost|converter|charger|charging|tp4056|power management/.test(value)) return "power";
  if (/sensor|ultrasonic|infrared|humidity|temperature|rtc|joystick/.test(value)) return "sensor";
  if (/\bic\b|integrated circuit|nand|counter|74\d{2}|stm32|atmega/.test(value)) return "ic";
  return "board";
}

export function ProductArtwork({ name, sku, category }: ProductArtworkProps) {
  const kind = getArtworkKind(name, category);
  const highPower = /\b[2-9]\s?w\b|power resistor/i.test(name);
  const ledColor = /green/i.test(name) ? "#238453" : /blue/i.test(name) ? "#2876c7" : /white/i.test(name) ? "#e7edf1" : "#cf443d";

  return (
    <div className={"product-artwork product-artwork-" + kind} role="img"
      aria-label={"Illustration of " + name + ". This is not a product photograph."}>
      <svg viewBox="0 0 320 240" aria-hidden="true" focusable="false">
        <rect x="16" y="12" width="288" height="190" rx="18" fill="#edf2ee" stroke="#9aafa0" strokeWidth="2.5" />
        <path d="M34 34h22M264 34h22M34 182h22M264 182h22" stroke="#8ea797" strokeWidth="3" strokeLinecap="round" />
        {kind === "resistor" ? (
          <g>
            <path d="M34 111h78M208 111h78" stroke="#8b6747" strokeWidth="6" strokeLinecap="round" />
            {highPower ? (
              <g>
                <rect x="104" y="72" width="112" height="78" rx="11" fill="#f8f4e8" stroke="#52665a" strokeWidth="5" />
                <path d="M128 76v70M151 76v70M176 76v70" strokeWidth="9" strokeLinecap="round" stroke="#a45c39" />
                <path d="M151 76v70" stroke="#d0a63e" strokeWidth="8" />
              </g>
            ) : (
              <g>
                <rect x="104" y="91" width="112" height="40" rx="20" fill="#d8c39b" stroke="#5f513d" strokeWidth="4" />
                <path d="M128 93v36M151 93v36M176 93v36M196 93v36" strokeWidth="8" strokeLinecap="round" stroke="#a15b3d" />
                <path d="M151 93v36" stroke="#d3ab43" strokeWidth="8" />
                <path d="M176 93v36" stroke="#535c57" strokeWidth="8" />
              </g>
            )}
            <text x="160" y="174" textAnchor="middle" fontSize="15" fontWeight="800" fill="#304b3a">AXIAL RESISTOR</text>
          </g>
        ) : kind === "resistor-box" ? (
          <g>
            <rect x="71" y="57" width="178" height="109" rx="11" fill="#3c684d" stroke="#23452f" strokeWidth="5" />
            <rect x="84" y="70" width="152" height="80" rx="5" fill="#f3eee1" stroke="#bcb39e" strokeWidth="3" />
            {Array.from({length:5},(_,r)=>Array.from({length:7},(_,c)=><rect key={r+"-"+c} x={95+c*19} y={80+r*12} width="12" height="5" rx="2.5" fill={["#a55b3d","#d1a43d","#555e59"][ (r+c)%3 ]}/>))}
            <text x="160" y="190" textAnchor="middle" fontSize="14" fontWeight="800" fill="#304b3a">RESISTOR ASSORTMENT</text>
          </g>
        ) : kind === "ic" ? (
          <g>
            <rect x="101" y="50" width="118" height="116" rx="9" fill="#263b35" stroke="#172720" strokeWidth="5" />
            {Array.from({length:8},(_,i)=><g key={i} stroke="#778c80" strokeWidth="5" strokeLinecap="round"><path d={"M"+(111+i*14)+" 50v-13M"+(111+i*14)+" 166v13"}/></g>)}
            <path d="M132 75h56M132 95h42M132 115h56M132 135h30" stroke="#b1cbb9" strokeWidth="5" strokeLinecap="round" />
            <circle cx="114" cy="64" r="4" fill="#dfc18a" />
            <text x="160" y="190" textAnchor="middle" fontSize="13" fontWeight="800" fill="#304b3a">INTEGRATED CIRCUIT</text>
          </g>
        ) : kind === "led" ? (
          <g>
            <path d="M143 137v46M177 137v46" stroke="#727e77" strokeWidth="6" strokeLinecap="round" />
            <path d="M120 113c0-33 18-55 40-55s40 22 40 55c0 22-18 35-40 35s-40-13-40-35" fill={ledColor} stroke="#405b4b" strokeWidth="5" />
            <path d="M135 98c5-17 15-25 25-25" stroke="#fff" strokeWidth="7" strokeLinecap="round" opacity=".8" />
            <text x="160" y="190" textAnchor="middle" fontSize="13" fontWeight="800" fill="#304b3a">LED DIODE</text>
          </g>
        ) : kind === "display" ? (
          <g>
            <rect x="62" y="43" width="196" height="119" rx="12" fill="#c2d4c8" stroke="#476b55" strokeWidth="6" />
            <rect x="78" y="59" width="164" height="86" rx="5" fill="#1f3634" />
            {sku === "P031" ? <g fill="#8ee0ae">{Array.from({length:8},(_,r)=>Array.from({length:8},(_,c)=><circle key={r+"-"+c} cx={99+c*19} cy={77+r*9} r="3.8"/>))}</g> : <g stroke="#9ce0b7" strokeWidth="5" strokeLinecap="round"><path d="M99 86h81M99 104h115M99 122h62"/></g>}
            <path d="M94 169v17M226 169v17M94 186h132" stroke="#547963" strokeWidth="4" strokeLinecap="round" />
            <text x="160" y="190" textAnchor="middle" fontSize="12" fontWeight="800" fill="#304b3a">DISPLAY MODULE</text>
          </g>
        ) : kind === "battery" ? (
          <g>
            <rect x="115" y="43" width="90" height="128" rx="19" fill="#293b32" stroke="#172920" strokeWidth="5" />
            <rect x="143" y="30" width="34" height="15" rx="4" fill="#a6b3ac" />
            <rect x="127" y="65" width="66" height="89" rx="8" fill="#e7eee8" />
            <path d="M144 83h32M160 99v24M144 111h32" stroke="#3a7653" strokeWidth="5" strokeLinecap="round" />
            <text x="160" y="190" textAnchor="middle" fontSize="13" fontWeight="800" fill="#304b3a">BATTERY CELL</text>
          </g>
        ) : kind === "motor" ? (
          <g>
            <rect x="83" y="63" width="142" height="88" rx="25" fill="#c4d1c7" stroke="#465e4d" strokeWidth="6" />
            <rect x="101" y="76" width="108" height="62" rx="15" fill="#e9eee9" stroke="#7d9786" strokeWidth="3" />
            <path d="M224 107h50" stroke="#9b7959" strokeWidth="7" strokeLinecap="round" />
            <circle cx="133" cy="107" r="13" fill="#8ca99a" />
            <path d="M115 62v-13M194 62v-13" stroke="#52695a" strokeWidth="6" strokeLinecap="round" />
            <text x="160" y="190" textAnchor="middle" fontSize="13" fontWeight="800" fill="#304b3a">DC / SERVO MOTOR</text>
          </g>
        ) : kind === "wheel" ? (
          <g>
            <circle cx="160" cy="100" r="67" fill="#2d3631" stroke="#17221c" strokeWidth="6" />
            <circle cx="160" cy="100" r="42" fill="#c9d4cc" stroke="#697e70" strokeWidth="7" />
            <circle cx="160" cy="100" r="14" fill="#849a8c" stroke="#3f5647" strokeWidth="5" />
            <path d="M160 28v18M160 154v18M88 100h18M214 100h18M109 49l13 13M198 138l13 13M211 49l-13 13M122 138l-13 13" stroke="#c0cfc4" strokeWidth="7" strokeLinecap="round" />
            <text x="160" y="190" textAnchor="middle" fontSize="13" fontWeight="800" fill="#304b3a">WHEEL / CASTER</text>
          </g>
        ) : kind === "breadboard" ? (
          <g>
            <rect x="55" y="41" width="210" height="128" rx="12" fill="#fff" stroke="#526a59" strokeWidth="5" />
            {Array.from({length:8},(_,r)=>Array.from({length:18},(_,c)=><circle key={r+"-"+c} cx={72+c*10} cy={62+r*12} r="2.3" fill={r===0||r===7?"#c65d57":"#536b5d"}/>))}
            <path d="M64 54h191M64 157h191" stroke="#d27d76" strokeWidth="2"/>
            <text x="160" y="190" textAnchor="middle" fontSize="13" fontWeight="800" fill="#304b3a">SOLDERLESS BREADBOARD</text>
          </g>
        ) : kind === "relay" ? (
          <g>
            <rect x="74" y="51" width="172" height="104" rx="10" fill="#246c9d" stroke="#184762" strokeWidth="5" />
            <rect x="118" y="70" width="78" height="64" rx="5" fill="#344a43" stroke="#a8bdb0" strokeWidth="4" />
            <path d="M87 72h22M87 90h22M87 108h22M87 126h22M211 72h22M211 90h22M211 108h22M211 126h22" stroke="#e0c982" strokeWidth="4" strokeLinecap="round" />
            <text x="160" y="190" textAnchor="middle" fontSize="13" fontWeight="800" fill="#304b3a">RELAY MODULE</text>
          </g>
        ) : kind === "power" ? (
          <g>
            <rect x="69" y="47" width="182" height="111" rx="10" fill="#246a56" stroke="#174839" strokeWidth="5" />
            <rect x="91" y="67" width="49" height="42" rx="5" fill="#263932" stroke="#aabeb1" strokeWidth="3"/>
            <rect x="158" y="66" width="40" height="45" rx="6" fill="#bdc8c0" stroke="#455f4e" strokeWidth="4"/>
            <circle cx="218" cy="81" r="14" fill="#b9a46b" stroke="#604f31" strokeWidth="3"/>
            <path d="M90 128h140M105 138h110" stroke="#b8d2c2" strokeWidth="3"/>
            <text x="160" y="190" textAnchor="middle" fontSize="13" fontWeight="800" fill="#304b3a">POWER MODULE</text>
          </g>
        ) : kind === "sensor" ? (
          <g>
            <rect x="65" y="57" width="190" height="98" rx="10" fill="#347b9b" stroke="#234d62" strokeWidth="5"/>
            <circle cx="116" cy="96" r="26" fill="#d8e1dd" stroke="#526a61" strokeWidth="5"/>
            <circle cx="204" cy="96" r="26" fill="#d8e1dd" stroke="#526a61" strokeWidth="5"/>
            <circle cx="116" cy="96" r="13" fill="#758b82"/><circle cx="204" cy="96" r="13" fill="#758b82"/>
            <path d="M82 139h156" stroke="#d4b96c" strokeWidth="5" strokeLinecap="round"/>
            <text x="160" y="190" textAnchor="middle" fontSize="13" fontWeight="800" fill="#304b3a">SENSOR MODULE</text>
          </g>
        ) : kind === "meter" ? (
          <g>
            <rect x="105" y="37" width="110" height="136" rx="16" fill="#e2a72f" stroke="#65502b" strokeWidth="5"/>
            <rect x="121" y="54" width="78" height="35" rx="5" fill="#d6e4db" stroke="#405a4a" strokeWidth="3"/>
            <path d="M135 69h50" stroke="#2a4536" strokeWidth="5" strokeLinecap="round"/>
            <circle cx="160" cy="128" r="23" fill="#53685d" stroke="#273c31" strokeWidth="4"/><circle cx="160" cy="128" r="6" fill="#d8e4dc"/>
            <path d="M132 163h-19M188 163h19" stroke="#b4453d" strokeWidth="4"/>
            <text x="160" y="190" textAnchor="middle" fontSize="13" fontWeight="800" fill="#304b3a">TEST METER</text>
          </g>
        ) : (
          <g>
            <rect x="74" y="48" width="172" height="119" rx="13" fill="#2f795c" stroke="#1f4c3a" strokeWidth="5"/>
            <rect x="125" y="81" width="70" height="54" rx="7" fill="#273a32" stroke="#a1bca8" strokeWidth="4"/>
            <path d="M88 70h19M88 87h19M88 104h19M88 121h19M213 70h19M213 87h19M213 104h19M213 121h19" stroke="#d6c47c" strokeWidth="4" strokeLinecap="round"/>
            <path d="M142 98h36M142 115h24" stroke="#b7d9c1" strokeWidth="4" strokeLinecap="round"/>
            <circle cx="107" cy="148" r="7" fill="#dfbd68"/><circle cx="213" cy="148" r="7" fill="#dfbd68"/>
            <text x="160" y="190" textAnchor="middle" fontSize="13" fontWeight="800" fill="#304b3a">ELECTRONIC BOARD</text>
          </g>
        )}
      </svg>
      <div className="product-artwork-caption">ILLUSTRATION · NOT A PHOTO</div>
    </div>
  );
}
