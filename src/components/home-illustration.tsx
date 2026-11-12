export function HomeIllustration() {
  return (
    <div className="bench-visual" aria-hidden="true">
      <div className="visual-glow" />
      <div className="visual-label label-top">SIGNAL / 001</div>
      <svg className="circuit-board" viewBox="0 0 520 420" fill="none">
        <defs>
          <linearGradient id="boardFill" x1="86" y1="55" x2="423" y2="371" gradientUnits="userSpaceOnUse"><stop stopColor="#273d43"/><stop offset="1" stopColor="#101e25"/></linearGradient>
          <linearGradient id="chipFill" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#f0a36b"/><stop offset="1" stopColor="#ca5a3f"/></linearGradient>
          <pattern id="boardDots" width="22" height="22" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.2" fill="#7ba6a4" opacity=".28"/></pattern>
        </defs>
        <path d="M102 46h280l78 78v224H122l-55-55V101l35-55Z" fill="url(#boardFill)" stroke="#52716e" strokeWidth="2"/>
        <path d="M102 46h280l78 78v224H122l-55-55V101l35-55Z" fill="url(#boardDots)"/>
        <path d="M128 76h99v27h54V76h128M91 150h94v39h62M91 278h85v-38h88m-2 114v-55h90v-42h126" stroke="#80b0a2" strokeWidth="3" strokeLinecap="round" opacity=".75"/>
        <path d="M284 101v-24h44M176 150v-33h-56M262 352v-28h-65v-47" stroke="#d08b5d" strokeWidth="3" strokeLinecap="round"/>
        <rect x="205" y="126" width="150" height="146" rx="9" fill="#0d171c" stroke="#78958d" strokeWidth="2"/>
        <rect x="221" y="142" width="118" height="114" rx="4" fill="url(#chipFill)"/>
        <path d="M235 132v-12m20 12v-12m20 12v-12m20 12v-12m20 12v-12m20 12v-12M235 272v12m20-12v12m20-12v12m20-12v12m20-12v12m20-12v12M211 154h-12m12 20h-12m12 20h-12m12 20h-12m12 20h-12m12 20h-12M355 154h12m-12 20h12m-12 20h12m-12 20h12m-12 20h12m-12 20h12" stroke="#a8b8ad" strokeWidth="3" strokeLinecap="round"/>
        <path d="M256 175h47m-47 17h47m-47 17h31" stroke="#543b32" strokeWidth="5" strokeLinecap="round" opacity=".7"/>
        <circle cx="112" cy="112" r="8" fill="#e99a61"/><circle cx="112" cy="112" r="3" fill="#fff2df"/>
        <circle cx="402" cy="300" r="8" fill="#e99a61"/><circle cx="402" cy="300" r="3" fill="#fff2df"/>
        <rect x="111" y="216" width="62" height="22" rx="4" fill="#b9cbc0"/><path d="M117 227h49" stroke="#526c66" strokeWidth="3" strokeDasharray="5 4"/>
        <rect x="365" y="151" width="56" height="24" rx="4" fill="#d3d6c8"/><path d="M372 163h42" stroke="#526c66" strokeWidth="3" strokeDasharray="5 4"/>
        <path d="M150 308h54v34h-54z" fill="#d2e1d1"/><path d="M160 320h34m-34 9h23" stroke="#4e716a" strokeWidth="3" strokeLinecap="round"/>
        <circle cx="90" cy="335" r="12" stroke="#d7e5d7" strokeWidth="3"/><circle cx="90" cy="335" r="4" fill="#d7e5d7"/>
        <path d="M380 92h34v34h-34z" stroke="#d7e5d7" strokeWidth="2"/><path d="M388 100h18v18h-18z" fill="#d7e5d7"/>
      </svg>
      <div className="visual-label label-bottom">K.E. / PROTOTYPE SERIES</div>
      <div className="floating-chip chip-a"><span /> <span /> <span /></div>
      <div className="floating-chip chip-b"><i /> <i /> <i /> <i /></div>
    </div>
  );
}
