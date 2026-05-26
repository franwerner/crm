// Logo exploration app for Freshup Labs.
// Six directions, each rendered in 4 contexts:
//   1. Primary lockup (horizontal: mark + wordmark)
//   2. Stacked lockup (mark on top, wordmark below)
//   3. Icon only (app-icon shape)
//   4. Wordmark only (no mark)
// On three surfaces: light cream, forest dark, lime.

const { useState: useStateLogo } = React;

const SURFACE = {
  light:  { bg: "#FAFAF7", fg: "#0A0A0A", accent: "#B6F36A" },
  dark:   { bg: "#143D2B", fg: "#FAFAF7", accent: "#B6F36A" },
  lime:   { bg: "#B6F36A", fg: "#0A0A0A", accent: "#FAFAF7" },
};

const DIRECTIONS = [
  {
    id: "fizz-bracket",
    name: "Fizz / Bracket",
    pitch: "Burbujas entre < / >. Lectura: código + efervescencia. Mi favorito para software.",
    Mark: window.MarkFizzBracket,
    Wordmark: window.WordmarkFizz,
    featured: true,
  },
  {
    id: "fizz-terminal",
    name: "Fizz / Terminal",
    pitch: "Ventana de terminal con burbujas adentro. Directo: ‘algo está corriendo y vivo’.",
    Mark: window.MarkFizzTerminal,
    Wordmark: window.WordmarkFizz,
    featured: true,
  },
  {
    id: "fizz-nodes",
    name: "Fizz / Nodes",
    pitch: "Burbujas como nodos conectados. APIs, microservicios, sistemas distribuidos.",
    Mark: window.MarkFizzNodes,
    Wordmark: window.WordmarkFizz,
    featured: true,
  },
  {
    id: "fizz-cursor",
    name: "Fizz / Cursor",
    pitch: "I-beam de editor + burbujas saliendo. Vibe craft, escribir código.",
    Mark: window.MarkFizzCursor,
    Wordmark: window.WordmarkFizz,
    featured: true,
  },
  {
    id: "drop-up",
    name: "Drop/Up",
    pitch: "Friendly, soft. Una gota que sube — fresh + lift.",
    Mark: window.MarkDropUp,
    Wordmark: window.WordmarkA,
  },
  {
    id: "fizz",
    name: "Fizz (original)",
    pitch: "Burbujas que suben. La versión base sin DNA de software.",
    Mark: window.MarkFizz,
    Wordmark: window.WordmarkB,
  },
  {
    id: "flask",
    name: "Flask",
    pitch: "Matraz estilizado. Directo, lab, sin sutilezas.",
    Mark: window.MarkFlask,
    Wordmark: window.WordmarkC,
  },
  {
    id: "monogram",
    name: "Monogram FL",
    pitch: "Bloque tipográfico FL. App-icon-ready, sólido, geométrico.",
    Mark: window.MarkMonogram,
    Wordmark: window.WordmarkD,
  },
  {
    id: "upsurge",
    name: "Upsurge",
    pitch: "Chevron + spark. Brutal, gráfico, energía hacia arriba.",
    Mark: window.MarkUpsurge,
    Wordmark: window.WordmarkE,
  },
  {
    id: "stamp",
    name: "Stamp",
    pitch: "Sello editorial. Sobrio, formal, vibe craft/lab.",
    Mark: window.MarkStamp,
    Wordmark: window.WordmarkF,
  },
];

// --- Lockup renderers ---
function PrimaryLockup({ Mark, Wordmark, surface }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, justifyContent: "center" }}>
      <Mark size={56} color={surface.fg} accent={surface.accent} surface={surface.bg} />
      <Wordmark color={surface.fg} height={28} />
    </div>
  );
}

function StackedLockup({ Mark, Wordmark, surface }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, justifyContent: "center" }}>
      <Mark size={88} color={surface.fg} accent={surface.accent} surface={surface.bg} />
      <Wordmark color={surface.fg} height={20} />
    </div>
  );
}

function IconLockup({ Mark, surface }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Mark size={108} color={surface.fg} accent={surface.accent} surface={surface.bg} />
    </div>
  );
}

function WordmarkLockup({ Wordmark, surface }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Wordmark color={surface.fg} height={32} />
    </div>
  );
}

// --- Tile (a single artboard rendering one lockup on one surface) ---
function Tile({ surface, children, width = 320, height = 160, note }) {
  return (
    <div
      style={{
        width,
        height,
        background: surface.bg,
        border: "1.5px solid #0A0A0A",
        borderRadius: 12,
        boxShadow: "4px 4px 0 #0A0A0A",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {children}
      {note ? (
        <div
          style={{
            position: "absolute",
            top: 8, left: 10,
            fontFamily: "ui-monospace, Menlo, monospace",
            fontSize: 10,
            letterSpacing: "0.06em",
            color: surface.fg,
            opacity: 0.45,
            textTransform: "uppercase",
          }}
        >
          {note}
        </div>
      ) : null}
    </div>
  );
}

function DirectionRow({ dir }) {
  const { Mark, Wordmark } = dir;
  return (
    <DCSection id={dir.id} title={`${dir.name}`} subtitle={dir.pitch}>
      <DCArtboard id={`${dir.id}-primary-light`} label="Primary · light" width={360} height={180}>
        <Tile surface={SURFACE.light} width={360} height={180} note="Primary · light">
          <PrimaryLockup Mark={Mark} Wordmark={Wordmark} surface={SURFACE.light} />
        </Tile>
      </DCArtboard>
      <DCArtboard id={`${dir.id}-primary-dark`} label="Primary · dark" width={360} height={180}>
        <Tile surface={SURFACE.dark} width={360} height={180} note="Primary · dark">
          <PrimaryLockup Mark={Mark} Wordmark={Wordmark} surface={SURFACE.dark} />
        </Tile>
      </DCArtboard>
      <DCArtboard id={`${dir.id}-primary-lime`} label="Primary · lime" width={360} height={180}>
        <Tile surface={SURFACE.lime} width={360} height={180} note="Primary · lime">
          <PrimaryLockup Mark={Mark} Wordmark={Wordmark} surface={SURFACE.lime} />
        </Tile>
      </DCArtboard>
      <DCArtboard id={`${dir.id}-stacked`} label="Stacked" width={260} height={240}>
        <Tile surface={SURFACE.light} width={260} height={240} note="Stacked">
          <StackedLockup Mark={Mark} Wordmark={Wordmark} surface={SURFACE.light} />
        </Tile>
      </DCArtboard>
      <DCArtboard id={`${dir.id}-icon`} label="Icon" width={200} height={200}>
        <Tile surface={SURFACE.light} width={200} height={200} note="Icon">
          <IconLockup Mark={Mark} surface={SURFACE.light} />
        </Tile>
      </DCArtboard>
      <DCArtboard id={`${dir.id}-wordmark`} label="Wordmark only" width={320} height={120}>
        <Tile surface={SURFACE.light} width={320} height={120} note="Wordmark">
          <WordmarkLockup Wordmark={Wordmark} surface={SURFACE.light} />
        </Tile>
      </DCArtboard>
    </DCSection>
  );
}

function App() {
  return (
    <DesignCanvas title="Freshup Labs — exploración de logos" subtitle="6 direcciones · primary, stacked, icon, wordmark · sobre 3 fondos">
      {DIRECTIONS.map((d) => <DirectionRow key={d.id} dir={d} />)}
    </DesignCanvas>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
