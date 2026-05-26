// Logo marks for Freshup Labs.
// Each is a self-contained SVG component that can render at any size.
// Designed in pairs: a mark + a wordmark + a horizontal lockup.

// =====================================================
// A — DROP/UP (playful, friendly, soft)
// Concept: an upward droplet — "fresh" + the "up" movement.
// Letterform: rounded geometric sans, lowercase.
// =====================================================
function MarkDropUp({ size = 64, color = "#0A0A0A", accent = "#B6F36A" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <rect x="2" y="2" width="60" height="60" rx="16" fill={accent} stroke={color} strokeWidth="2.5" />
      {/* Droplet: teardrop pointing up */}
      <path
        d="M32 14 C 22 26, 18 34, 18 40 C 18 47.7 24.3 54, 32 54 C 39.7 54, 46 47.7, 46 40 C 46 34, 42 26, 32 14 Z"
        fill={color}
      />
      {/* tiny highlight bubble */}
      <circle cx="27" cy="38" r="3" fill={accent} />
    </svg>
  );
}

function WordmarkA({ color = "#0A0A0A", height = 28 }) {
  return (
    <span
      style={{
        fontFamily: "'General Sans', system-ui, sans-serif",
        fontSize: height,
        fontWeight: 600,
        letterSpacing: "-0.03em",
        color,
        lineHeight: 1,
      }}
    >
      freshup<span style={{ color, opacity: 0.45, marginLeft: "0.2em" }}>labs</span>
    </span>
  );
}

// =====================================================
// B — FIZZ (effervescent bubbles, playful tech)
// Concept: three rising bubbles, decreasing size.
// Letterform: tight geometric, mixed case.
// =====================================================
function MarkFizz({ size = 64, color = "#0A0A0A", accent = "#B6F36A", surface = "#FAFAF7" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <rect x="2" y="2" width="60" height="60" rx="32" fill={surface} stroke={color} strokeWidth="2.5" />
      <circle cx="22" cy="42" r="11" fill={accent} stroke={color} strokeWidth="2.5" />
      <circle cx="40" cy="30" r="8" fill={color} />
      <circle cx="46" cy="18" r="4.5" fill={accent} stroke={color} strokeWidth="2" />
    </svg>
  );
}

function WordmarkB({ color = "#0A0A0A", height = 28 }) {
  return (
    <span
      style={{
        fontFamily: "'General Sans', system-ui, sans-serif",
        fontSize: height,
        fontWeight: 700,
        letterSpacing: "-0.025em",
        color,
        lineHeight: 1,
      }}
    >
      Freshup<span style={{ fontWeight: 400, marginLeft: "0.18em" }}>Labs</span>
    </span>
  );
}

// =====================================================
// C — FLASK/BEAKER (experimental, lab, structural)
// Concept: stylized flask seen from front, abstract shape.
// =====================================================
function MarkFlask({ size = 64, color = "#0A0A0A", accent = "#B6F36A", surface = "#FAFAF7" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <rect x="2" y="2" width="60" height="60" rx="14" fill={surface} stroke={color} strokeWidth="2.5" />
      {/* flask neck (narrow rectangle top) */}
      <rect x="26" y="14" width="12" height="10" fill={color} />
      {/* flask body (triangle/wedge widening) */}
      <path
        d="M22 24 L42 24 L52 50 C 52 52 50 54 48 54 L16 54 C 14 54 12 52 12 50 Z"
        fill={color}
      />
      {/* liquid (lime fill at bottom 60%) */}
      <path
        d="M17 38 L47 38 L52 50 C 52 52 50 54 48 54 L16 54 C 14 54 12 52 12 50 Z"
        fill={accent}
      />
      {/* bubble */}
      <circle cx="38" cy="32" r="2" fill={accent} />
    </svg>
  );
}

function WordmarkC({ color = "#0A0A0A", height = 28 }) {
  return (
    <span
      style={{
        fontFamily: "'General Sans', system-ui, sans-serif",
        fontSize: height,
        fontWeight: 500,
        letterSpacing: "-0.02em",
        color,
        lineHeight: 1,
        textTransform: "uppercase",
      }}
    >
      Freshup&nbsp;Labs
    </span>
  );
}

// =====================================================
// D — MONOGRAM FL (bold, geometric, app-icon ready)
// Concept: F + L overlaid in a square, lime accent.
// =====================================================
function MarkMonogram({ size = 64, color = "#0A0A0A", accent = "#B6F36A" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <rect x="2" y="2" width="60" height="60" rx="10" fill={color} stroke={color} strokeWidth="2.5" />
      {/* F */}
      <rect x="14" y="14" width="6" height="36" fill={accent} />
      <rect x="14" y="14" width="22" height="6" fill={accent} />
      <rect x="14" y="28" width="16" height="6" fill={accent} />
      {/* L tucked on the right */}
      <rect x="40" y="14" width="6" height="36" fill="#FAFAF7" />
      <rect x="40" y="44" width="14" height="6" fill="#FAFAF7" />
    </svg>
  );
}

function WordmarkD({ color = "#0A0A0A", height = 28 }) {
  return (
    <span
      style={{
        fontFamily: "'General Sans', system-ui, sans-serif",
        fontSize: height,
        fontWeight: 600,
        letterSpacing: "-0.035em",
        color,
        lineHeight: 1,
      }}
    >
      Freshup Labs
    </span>
  );
}

// =====================================================
// E — UPSURGE (arrow + spark, brutal — matches Trellis style)
// Concept: a chevron pointing up, with a spark/highlight.
// =====================================================
function MarkUpsurge({ size = 64, color = "#0A0A0A", accent = "#B6F36A" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <rect x="2" y="2" width="60" height="60" rx="6" fill={accent} stroke={color} strokeWidth="2.5" />
      {/* Chevron pointing up — built from two rectangles */}
      <path
        d="M32 14 L52 36 L44 36 L32 24 L20 36 L12 36 Z"
        fill={color}
      />
      {/* Solid block under */}
      <rect x="26" y="34" width="12" height="18" fill={color} />
      {/* Accent dot (spark) */}
      <circle cx="50" cy="14" r="4" fill={color} />
    </svg>
  );
}

function WordmarkE({ color = "#0A0A0A", height = 28 }) {
  return (
    <span
      style={{
        fontFamily: "'General Sans', system-ui, sans-serif",
        fontSize: height,
        fontWeight: 700,
        letterSpacing: "-0.04em",
        color,
        lineHeight: 1,
        textTransform: "lowercase",
      }}
    >
      freshup<span style={{ color: "#5E8E2A", marginLeft: "0.05em" }}>.</span><span style={{ marginLeft: "0.15em" }}>labs</span>
    </span>
  );
}

// =====================================================
// F — STAMP (editorial, sophisticated — circular badge)
// Concept: circle frame with "FRESHUP" arcing top + "LABS" centered.
// =====================================================
function MarkStamp({ size = 64, color = "#0A0A0A", accent = "#B6F36A", surface = "#FAFAF7" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <circle cx="32" cy="32" r="29" fill={surface} stroke={color} strokeWidth="2.5" />
      <circle cx="32" cy="32" r="24" fill="none" stroke={color} strokeWidth="1" />
      {/* center mark — small lime circle with a "+" inside */}
      <circle cx="32" cy="32" r="11" fill={accent} stroke={color} strokeWidth="2" />
      <rect x="30.5" y="26" width="3" height="12" fill={color} />
      <rect x="26" y="30.5" width="12" height="3" fill={color} />
    </svg>
  );
}

function WordmarkF({ color = "#0A0A0A", height = 28 }) {
  return (
    <span
      style={{
        fontFamily: "'General Sans', system-ui, sans-serif",
        fontSize: height,
        fontWeight: 600,
        letterSpacing: "0.02em",
        color,
        lineHeight: 1,
        textTransform: "uppercase",
      }}
    >
      Freshup<span style={{ opacity: 0.5 }}>·</span>Labs
    </span>
  );
}

// =====================================================
// FIZZ EVOLUTIONS — software DNA on the bubble metaphor
// All share the same wordmark for consistency.
// =====================================================

// Shared wordmark for Fizz family: monospace "Labs" subtle nod to code.
function WordmarkFizz({ color = "#0A0A0A", height = 28 }) {
  return (
    <span
      style={{
        fontFamily: "'General Sans', system-ui, sans-serif",
        fontSize: height,
        fontWeight: 700,
        letterSpacing: "-0.025em",
        color,
        lineHeight: 1,
        display: "inline-flex",
        alignItems: "baseline",
        gap: "0.18em",
      }}
    >
      Freshup
      <span
        style={{
          fontFamily: "ui-monospace, 'JetBrains Mono', Menlo, monospace",
          fontWeight: 500,
          fontSize: height * 0.78,
          letterSpacing: "-0.02em",
        }}
      >
        /labs
      </span>
    </span>
  );
}

// G — FIZZ/BRACKET: bubbles framed by < >, reads as code + fizz
function MarkFizzBracket({ size = 64, color = "#0A0A0A", accent = "#B6F36A", surface = "#FAFAF7" }) {
  const s = size / 64;
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <rect x="2" y="2" width="60" height="60" rx="14" fill={surface} stroke={color} strokeWidth="2.5" />
      {/* Left bracket "<" */}
      <path d="M22 18 L12 32 L22 46" stroke={color} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      {/* Right bracket ">" */}
      <path d="M42 18 L52 32 L42 46" stroke={color} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      {/* Two rising bubbles between brackets */}
      <circle cx="32" cy="40" r="6" fill={accent} stroke={color} strokeWidth="2.5" />
      <circle cx="32" cy="24" r="3.5" fill={color} />
    </svg>
  );
}

// H — FIZZ/TERMINAL: rounded terminal frame with bubbles inside
function MarkFizzTerminal({ size = 64, color = "#0A0A0A", accent = "#B6F36A", surface = "#FAFAF7" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <rect x="2" y="2" width="60" height="60" rx="12" fill={color} stroke={color} strokeWidth="2.5" />
      {/* Inner terminal area */}
      <rect x="10" y="18" width="44" height="36" rx="6" fill={surface} stroke={surface} strokeWidth="1" />
      {/* Three "traffic light" dots top */}
      <circle cx="14" cy="12" r="2" fill={surface} opacity="0.45" />
      <circle cx="22" cy="12" r="2" fill={surface} opacity="0.45" />
      <circle cx="30" cy="12" r="2" fill={surface} opacity="0.45" />
      {/* Bubbles rising inside */}
      <circle cx="22" cy="44" r="6" fill={accent} stroke={color} strokeWidth="2" />
      <circle cx="36" cy="36" r="4.5" fill={color} />
      <circle cx="44" cy="26" r="3" fill={accent} stroke={color} strokeWidth="1.5" />
    </svg>
  );
}

// I — FIZZ/NODES: bubbles as connected graph nodes (microservices, API, components)
function MarkFizzNodes({ size = 64, color = "#0A0A0A", accent = "#B6F36A", surface = "#FAFAF7" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <rect x="2" y="2" width="60" height="60" rx="14" fill={surface} stroke={color} strokeWidth="2.5" />
      {/* Connecting lines (drawn first so circles sit on top) */}
      <path d="M20 44 L42 22 M20 44 L46 42 M42 22 L46 42" stroke={color} strokeWidth="2" strokeLinecap="round" />
      {/* Three nodes — sized like rising fizz bubbles */}
      <circle cx="20" cy="44" r="8" fill={accent} stroke={color} strokeWidth="2.5" />
      <circle cx="42" cy="22" r="6" fill={color} />
      <circle cx="46" cy="42" r="4.5" fill={accent} stroke={color} strokeWidth="2" />
    </svg>
  );
}

// I' — FIZZ/NODES REFINED: simpler, cleaner triangle, all nodes uniform-stroke,
// hero node bigger and lime. Better favicon scaling. This is the production mark.
function MarkFizzNodesFinal({
  size = 64,
  color = "#0A0A0A",
  accent = "#B6F36A",
  surface = "#FAFAF7",
  // Allow rendering the mark WITHOUT a frame (used in stacked / wordmark contexts)
  frame = true,
  strokeWidth = 2.5,
}) {
  // Geometry within a 64-unit viewBox
  // Node A: bottom-left, big, lime — the "primary" / origin
  // Node B: top, medium, black — the "branch"
  // Node C: bottom-right, small, lime — the "edge"
  const A = { cx: 20, cy: 44, r: 9 };
  const B = { cx: 44, cy: 20, r: 6 };
  const C = { cx: 48, cy: 44, r: 4 };
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      {frame ? (
        <rect x="2" y="2" width="60" height="60" rx="14" fill={surface} stroke={color} strokeWidth={strokeWidth} />
      ) : null}
      {/* Connecting lines */}
      <path
        d={`M${A.cx} ${A.cy} L${B.cx} ${B.cy} M${A.cx} ${A.cy} L${C.cx} ${C.cy} M${B.cx} ${B.cy} L${C.cx} ${C.cy}`}
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx={A.cx} cy={A.cy} r={A.r} fill={accent} stroke={color} strokeWidth="2.5" />
      <circle cx={B.cx} cy={B.cy} r={B.r} fill={color} />
      <circle cx={C.cx} cy={C.cy} r={C.r} fill={accent} stroke={color} strokeWidth="2" />
    </svg>
  );
}

// J — FIZZ/CURSOR: bubbles next to a code-editor cursor block
function MarkFizzCursor({ size = 64, color = "#0A0A0A", accent = "#B6F36A", surface = "#FAFAF7" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <rect x="2" y="2" width="60" height="60" rx="14" fill={surface} stroke={color} strokeWidth="2.5" />
      {/* Cursor: vertical I-beam */}
      <rect x="14" y="20" width="6" height="24" fill={color} />
      <rect x="10" y="20" width="14" height="3" fill={color} />
      <rect x="10" y="41" width="14" height="3" fill={color} />
      {/* Bubbles rising to the right of cursor */}
      <circle cx="38" cy="46" r="8" fill={accent} stroke={color} strokeWidth="2.5" />
      <circle cx="50" cy="30" r="5" fill={color} />
      <circle cx="44" cy="18" r="3" fill={accent} stroke={color} strokeWidth="1.5" />
    </svg>
  );
}

Object.assign(window, {
  MarkDropUp, WordmarkA,
  MarkFizz, WordmarkB,
  MarkFlask, WordmarkC,
  MarkMonogram, WordmarkD,
  MarkUpsurge, WordmarkE,
  MarkStamp, WordmarkF,
  MarkFizzBracket, MarkFizzTerminal, MarkFizzNodes, MarkFizzCursor,
  MarkFizzNodesFinal,
  WordmarkFizz,
});
