import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  staticFile,
} from "remotion";
import { loadFont as loadOutfit } from "@remotion/google-fonts/Outfit";
import { loadFont as loadWorkSans } from "@remotion/google-fonts/WorkSans";
import {
  BG,
  CLICK_DURATION,
  CLICK_START,
  GREEN,
  PILL_HEIGHT,
  PILL_FULL_WIDTH,
  SS_MOVE_DURATION,
  SS_SHRINK_DURATION,
  SS_START,
  SS_SWIPE_DURATION,
  WARP_DURATION,
  WARP_START,
} from "./demo-constants";
import { SceneAppTransition } from "./SceneAppTransition";
import { Audio } from "@remotion/media";

const { fontFamily: outfitFamily } = loadOutfit("normal", {
  weights: ["800"],
  subsets: ["latin"],
});

const { fontFamily: workSansFamily } = loadWorkSans("normal", {
  weights: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

// Single easing curve for everything
const EXPO_OUT = Easing.bezier(0.22, 1, 0.36, 1);

// ─── Film Grain ───────────────────────────────────────────────────────────────
const FilmGrain: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg
        width="100%"
        height="100%"
        style={{ position: "absolute", inset: 0 }}
      >
        <defs>
          <filter id="grain">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.80"
              numOctaves="4"
              seed={frame}
              stitchTiles="stitch"
            />
            <feColorMatrix type="saturate" values="0" />
          </filter>
        </defs>
        <rect width="100%" height="100%" filter="url(#grain)" opacity="0.038" />
      </svg>
    </AbsoluteFill>
  );
};

// ─── Vignette ─────────────────────────────────────────────────────────────────
const Vignette: React.FC = () => (
  <AbsoluteFill
    style={{
      pointerEvents: "none",
      background:
        "radial-gradient(ellipse 85% 85% at 50% 50%, transparent 38%, rgba(0,0,0,0.38) 100%)",
    }}
  />
);

// ─── Invoice Card ─────────────────────────────────────────────────────────────
const InvoiceCard: React.FC<{ width: number }> = ({ width }) => (
  <div
    style={{
      width,
      background: "#fff",
      border: "1px solid #000",
      fontFamily: workSansFamily,
      fontSize: 9,
      color: "#111",
      boxSizing: "border-box",
      padding: "10px 12px",
      lineHeight: 1.5,
    }}
  >
    <div
      style={{
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: 1.5,
        marginBottom: 6,
        textTransform: "uppercase",
      }}
    >
      Invoice #2025-0847
    </div>
    <div
      style={{
        borderTop: "1px solid #000",
        borderBottom: "1px solid #000",
        padding: "5px 0",
        marginBottom: 5,
        color: "#444",
      }}
    >
      <div>From: University Bursar Office</div>
      <div>Due: August 15, 2025</div>
    </div>
    {(
      [
        ["Tuition Fee", "$18,500.00"],
        ["Housing", "$7,200.00"],
        ["Meal Plan", "$3,800.00"],
        ["Activity Fee", "$450.00"],
      ] as const
    ).map(([label, amount]) => (
      <div
        key={label}
        style={{ display: "flex", justifyContent: "space-between" }}
      >
        <span>{label}</span>
        <span>{amount}</span>
      </div>
    ))}
    <div
      style={{
        borderTop: "1px solid #000",
        marginTop: 5,
        paddingTop: 5,
        display: "flex",
        justifyContent: "space-between",
        fontWeight: 700,
        fontSize: 10,
      }}
    >
      <span>TOTAL DUE</span>
      <span>$29,950.00</span>
    </div>
  </div>
);

// ─── Payment Schedule Card ────────────────────────────────────────────────────
const PaymentScheduleCard: React.FC<{ width: number }> = ({ width }) => (
  <div
    style={{
      width,
      background: "#fff",
      border: "1px solid #000",
      fontFamily: workSansFamily,
      fontSize: 9,
      color: "#111",
      boxSizing: "border-box",
      padding: "10px 12px",
    }}
  >
    <div
      style={{
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: 1.5,
        textTransform: "uppercase",
        borderBottom: "1px solid #000",
        paddingBottom: 5,
        marginBottom: 6,
      }}
    >
      Payment Schedule
    </div>
    {(
      [
        ["Aug 1, 2025", "$7,487.50"],
        ["Sep 1, 2025", "$7,487.50"],
        ["Oct 1, 2025", "$7,487.50"],
        ["Nov 1, 2025", "$7,487.50"],
      ] as const
    ).map(([date, amount]) => (
      <div
        key={date}
        style={{
          display: "flex",
          justifyContent: "space-between",
          padding: "3px 0",
          borderBottom: "1px solid #ddd",
          lineHeight: 1.4,
        }}
      >
        <span style={{ color: "#555" }}>{date}</span>
        <span style={{ fontWeight: 600 }}>{amount}</span>
      </div>
    ))}
    <div
      style={{
        marginTop: 6,
        display: "flex",
        justifyContent: "space-between",
        fontWeight: 700,
        fontSize: 10,
        borderTop: "1px solid #000",
        paddingTop: 5,
      }}
    >
      <span>Total</span>
      <span>$29,950.00</span>
    </div>
  </div>
);

// ─── CNN Article Card ─────────────────────────────────────────────────────────
const CNNArticleCard: React.FC<{ width: number }> = ({ width }) => (
  <div
    style={{
      width,
      background: "#fff",
      border: "1px solid #000",
      boxSizing: "border-box",
      overflow: "hidden",
      fontFamily: workSansFamily,
    }}
  >
    <div
      style={{
        background: "#cc0000",
        padding: "5px 10px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <div
          style={{
            background: "#fff",
            color: "#cc0000",
            fontWeight: 900,
            fontSize: 12,
            padding: "0 3px",
            letterSpacing: -0.5,
            lineHeight: 1.4,
          }}
        >
          CNN
        </div>
        <span style={{ color: "#fff", fontSize: 10, fontWeight: 500 }}>
          Business
        </span>
      </div>
      <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
        <div
          style={{
            color: "#fff",
            fontSize: 8,
            border: "1px solid rgba(255,255,255,0.7)",
            padding: "1px 5px",
            borderRadius: 2,
          }}
        >
          ● Watch
        </div>
        <div
          style={{
            background: "#fff",
            color: "#cc0000",
            fontSize: 8,
            padding: "1px 5px",
            borderRadius: 2,
            fontWeight: 700,
          }}
        >
          Subscribe
        </div>
      </div>
    </div>
    <div
      style={{
        padding: "5px 10px 2px",
        fontSize: 8,
        color: "#666",
        fontWeight: 500,
        letterSpacing: 0.3,
      }}
    >
      BUSINESS › INVESTING · 6 MIN READ
    </div>
    <div
      style={{
        padding: "4px 10px 5px",
        fontSize: 12,
        fontWeight: 700,
        color: "#000",
        lineHeight: 1.3,
      }}
    >
      Some colleges cost $95,000 per year, and they&apos;re only getting more
      expensive. Here&apos;s why.
    </div>
    <div style={{ padding: "0 10px 8px", fontSize: 9, color: "#555" }}>
      By Nicole Goodkind · Updated Jul 16, 2023
    </div>
  </div>
);

// ─── Forbes Article Card ──────────────────────────────────────────────────────
const ForbesArticleCard: React.FC<{ width: number }> = ({ width }) => (
  <div
    style={{
      width,
      background: "#fff",
      border: "1px solid #000",
      boxSizing: "border-box",
      overflow: "hidden",
      fontFamily: workSansFamily,
    }}
  >
    <div
      style={{
        background: "#000",
        padding: "6px 10px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <span
        style={{
          color: "#fff",
          fontWeight: 900,
          fontSize: 14,
          fontStyle: "italic",
          fontFamily: "Georgia, serif",
          letterSpacing: -0.5,
        }}
      >
        Forbes
      </span>
      <div
        style={{
          background: "#cc0000",
          color: "#fff",
          fontSize: 7,
          padding: "2px 5px",
          borderRadius: 1,
          fontWeight: 600,
        }}
      >
        Subscribe: Less than $2/wk
      </div>
    </div>
    <div
      style={{
        padding: "5px 10px 2px",
        fontSize: 8,
        color: "#666",
        fontWeight: 500,
      }}
    >
      LEADERSHIP › EDUCATION
    </div>
    <div
      style={{
        padding: "3px 10px 6px",
        fontSize: 12,
        fontWeight: 700,
        color: "#000",
        lineHeight: 1.3,
      }}
    >
      Why College Tuition Keeps Climbing—And Who&apos;s Really Driving It
    </div>
    <div style={{ padding: "0 10px 8px", fontSize: 9, color: "#555" }}>
      By Matthew Scogin · Jul 14, 2025
    </div>
  </div>
);

// ─── NYT Article Card ─────────────────────────────────────────────────────────
const NYTArticleCard: React.FC<{ width: number }> = ({ width }) => (
  <div
    style={{
      width,
      background: "#fff",
      border: "1px solid #000",
      boxSizing: "border-box",
      overflow: "hidden",
      fontFamily: workSansFamily,
    }}
  >
    <div
      style={{
        borderBottom: "2px solid #000",
        padding: "7px 10px 5px",
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontSize: 13,
          fontWeight: 900,
          fontFamily: "Georgia, serif",
          letterSpacing: -0.5,
          color: "#000",
        }}
      >
        The New York Times
      </div>
    </div>
    <div
      style={{
        padding: "4px 10px 2px",
        fontSize: 8,
        color: "#666",
        textTransform: "uppercase",
        letterSpacing: 0.8,
      }}
    >
      Education
    </div>
    <div
      style={{
        padding: "2px 10px 6px",
        fontSize: 12,
        fontWeight: 700,
        color: "#000",
        lineHeight: 1.35,
        fontFamily: "Georgia, serif",
      }}
    >
      Average student loan debt reaches record high of $37,787
    </div>
    <div style={{ padding: "0 10px 8px", fontSize: 9, color: "#555" }}>
      By Sarah Kim · June 2025
    </div>
  </div>
);

// ─── USA Today Article Card ───────────────────────────────────────────────────
const USATodayArticleCard: React.FC<{ width: number }> = ({ width }) => (
  <div
    style={{
      width,
      background: "#fff",
      border: "1px solid #000",
      boxSizing: "border-box",
      overflow: "hidden",
      fontFamily: workSansFamily,
    }}
  >
    <div
      style={{
        background: "#009bde",
        padding: "5px 10px",
        display: "flex",
        alignItems: "center",
        gap: 7,
      }}
    >
      <div
        style={{
          width: 22,
          height: 22,
          borderRadius: "50%",
          background: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          fontSize: 6,
          fontWeight: 900,
          color: "#009bde",
          letterSpacing: -0.5,
        }}
      >
        USA
      </div>
      <span
        style={{
          color: "#fff",
          fontWeight: 800,
          fontSize: 11,
          letterSpacing: -0.3,
        }}
      >
        USA Today
      </span>
    </div>
    <div
      style={{
        padding: "4px 10px 2px",
        fontSize: 8,
        color: "#666",
        textTransform: "uppercase",
        letterSpacing: 0.8,
      }}
    >
      Education
    </div>
    <div
      style={{
        padding: "2px 10px 6px",
        fontSize: 12,
        fontWeight: 700,
        color: "#000",
        lineHeight: 1.35,
      }}
    >
      Tuition rising 4× faster than inflation, report finds. Students struggle
      to keep up.
    </div>
    <div style={{ padding: "0 10px 8px", fontSize: 9, color: "#555" }}>
      May 2025
    </div>
  </div>
);

// ─── Background element — Z-drift + swift exit ────────────────────────────────
type CardType = "invoice" | "schedule" | "cnn" | "forbes" | "nyt" | "usatoday";

interface BGConfig {
  cardType: CardType;
  width: number;
  x: number;
  y: number;
  rotate: number;
  appear: number;
  driftFrames: number;
  finalScale: number;
  exitStart: number;
}

const BG_ELEMENTS: BGConfig[] = [
  {
    cardType: "invoice",
    width: 220,
    x: 30,
    y: 40,
    rotate: -3,
    appear: 0,
    driftFrames: 60,
    finalScale: 1.15,
    exitStart: 62,
  },
  {
    cardType: "usatoday",
    width: 280,
    x: 342,
    y: 582,
    rotate: -1,
    appear: 5,
    driftFrames: 55,
    finalScale: 1.18,
    exitStart: 65,
  },
  {
    cardType: "cnn",
    width: 280,
    x: 952,
    y: 10,
    rotate: 1,
    appear: 10,
    driftFrames: 58,
    finalScale: 1.12,
    exitStart: 63,
  },
  {
    cardType: "schedule",
    width: 220,
    x: 46,
    y: 452,
    rotate: 1.5,
    appear: 14,
    driftFrames: 60,
    finalScale: 1.15,
    exitStart: 66,
  },
  {
    cardType: "forbes",
    width: 280,
    x: 10,
    y: 240,
    rotate: -2.5,
    appear: 20,
    driftFrames: 58,
    finalScale: 1.12,
    exitStart: 64,
  },
  {
    cardType: "schedule",
    width: 220,
    x: 1022,
    y: 442,
    rotate: -2,
    appear: 24,
    driftFrames: 58,
    finalScale: 1.12,
    exitStart: 67,
  },
  {
    cardType: "invoice",
    width: 220,
    x: 1012,
    y: 80,
    rotate: 2.5,
    appear: 30,
    driftFrames: 58,
    finalScale: 1.1,
    exitStart: 63,
  },
  {
    cardType: "nyt",
    width: 280,
    x: 962,
    y: 252,
    rotate: 2,
    appear: 36,
    driftFrames: 58,
    finalScale: 1.1,
    exitStart: 68,
  },
];

const SCREEN_CX = 640;
const SCREEN_CY = 360;

const BGElement: React.FC<BGConfig & { frame: number }> = ({
  cardType,
  width,
  x,
  y,
  rotate,
  appear,
  driftFrames,
  finalScale,
  exitStart,
  frame,
}) => {
  const local = frame - appear;
  if (local < 0) return null;

  const exitLocal = frame - exitStart;
  const isExiting = exitLocal > 0;

  // Entry: drift in from background
  const entryScale = interpolate(local, [0, driftFrames], [0.22, finalScale], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EXPO_OUT,
  });
  const entryOpacity = interpolate(local, [0, 5], [0, 0.62], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const cx = x + width / 2;
  const cy = y + 80;
  const entryTX = interpolate(
    local,
    [0, driftFrames],
    [(cx - SCREEN_CX) * -0.18, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: EXPO_OUT,
    },
  );
  const entryTY = interpolate(
    local,
    [0, driftFrames],
    [(cy - SCREEN_CY) * -0.18, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: EXPO_OUT,
    },
  );

  // Exit: fly toward nearest corner + shrink
  const flyX = (cx < SCREEN_CX ? -1 : 1) * 440;
  const flyY = (cy < SCREEN_CY ? -1 : 1) * 340;
  const exitScaleMult = isExiting
    ? interpolate(exitLocal, [0, 13], [1, 0.2], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: EXPO_OUT,
      })
    : 1;
  const exitOpacityMult = isExiting
    ? interpolate(exitLocal, [0, 11], [1, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: EXPO_OUT,
      })
    : 1;
  const exitTX = isExiting
    ? interpolate(exitLocal, [0, 13], [0, flyX], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: EXPO_OUT,
      })
    : 0;
  const exitTY = isExiting
    ? interpolate(exitLocal, [0, 13], [0, flyY], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: EXPO_OUT,
      })
    : 0;

  const card = (() => {
    switch (cardType) {
      case "invoice":
        return <InvoiceCard width={width} />;
      case "schedule":
        return <PaymentScheduleCard width={width} />;
      case "cnn":
        return <CNNArticleCard width={width} />;
      case "forbes":
        return <ForbesArticleCard width={width} />;
      case "nyt":
        return <NYTArticleCard width={width} />;
      case "usatoday":
        return <USATodayArticleCard width={width} />;
    }
  })();

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width,
        opacity: entryOpacity * exitOpacityMult,
        scale: entryScale * exitScaleMult,
        translate: `${entryTX + exitTX}px ${entryTY + exitTY}px`,
        rotate: `${rotate}deg`,
      }}
    >
      {card}
    </div>
  );
};

// Scene 1 shared fade-out: everything exits frame 68–80
const useScene1Opacity = (frame: number) =>
  interpolate(frame, [68, 80], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EXPO_OUT,
  });

// ─── Text: "College" ─────────────────────────────────────────────────────────
const CollegeWord: React.FC<{ frame: number }> = ({ frame }) => {
  const fadeIn = interpolate(frame, [0, 5], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const ty = interpolate(frame, [0, 18], [64, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EXPO_OUT,
  });
  return (
    <div
      style={{
        fontFamily: outfitFamily,
        fontSize: 96,
        fontWeight: 800,
        color: GREEN,
        lineHeight: 1.15,
        opacity: fadeIn * useScene1Opacity(frame),
        translate: `0px ${ty}px`,
      }}
    >
      College
    </div>
  );
};

// ─── Text: "is" ──────────────────────────────────────────────────────────────
const IsWord: React.FC<{ frame: number }> = ({ frame }) => {
  const local = frame - 10;
  const fadeIn = interpolate(local, [0, 5], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const ty = interpolate(local, [0, 16], [-60, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EXPO_OUT,
  });
  return (
    <div
      style={{
        fontFamily: outfitFamily,
        fontSize: 96,
        fontWeight: 800,
        color: GREEN,
        lineHeight: 1.15,
        opacity: Math.max(0, fadeIn) * useScene1Opacity(frame),
        translate: `0px ${ty}px`,
      }}
    >
      is
    </div>
  );
};

// ─── Text: "expensive" — accelerating typewriter ──────────────────────────────
const TYPING_TEXT = "expensive";
const TYPING_START = 22;
const T_IN = [0, 3, 6, 9, 12, 14, 16, 17, 18, 19];
const T_OUT = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

const ExpensiveTyped: React.FC<{ frame: number }> = ({ frame }) => {
  const local = frame - TYPING_START;
  const chars =
    local >= 0
      ? Math.floor(
          interpolate(local, T_IN, T_OUT, {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        )
      : 0;
  const showCursor = frame >= TYPING_START - 4;
  const cursorOpacity = showCursor
    ? interpolate(frame % 20, [0, 10, 20], [1, 0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 0;
  return (
    <div
      style={{
        fontFamily: outfitFamily,
        fontSize: 96,
        fontWeight: 800,
        color: GREEN,
        lineHeight: 1.15,
        opacity: useScene1Opacity(frame),
      }}
    >
      <span>{TYPING_TEXT.slice(0, chars)}</span>
      <span style={{ opacity: cursorOpacity }}>|</span>
    </div>
  );
};

// ─── Scene 2: "Meet" zoom wipe + swipe exit ──────────────────────────────────
const MEET_START = 78;
const MEET_SETTLE = MEET_START + 18;
const MEET_EXIT = 105;
const MEET_EXIT_DURATION = 18;

const MeetWord: React.FC<{ frame: number }> = ({ frame }) => {
  if (frame < MEET_START) return null;
  const local = frame - MEET_START;
  const exitLocal = frame - MEET_EXIT;
  const isExiting = exitLocal > 0;

  const meetScale = interpolate(local, [0, 18], [14, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EXPO_OUT,
  });
  const meetOpacity = interpolate(local, [0, 2], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const settleFade = interpolate(
    frame,
    [MEET_SETTLE, MEET_SETTLE + 6],
    [0.88, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );

  // Swipe right exit
  const exitTX = isExiting
    ? interpolate(exitLocal, [0, MEET_EXIT_DURATION], [0, 1500], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: EXPO_OUT,
      })
    : 0;
  const exitOpacity = isExiting
    ? interpolate(
        exitLocal,
        [MEET_EXIT_DURATION * 0.5, MEET_EXIT_DURATION],
        [1, 0],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
      )
    : 1;

  return (
    <div
      style={{
        fontFamily: outfitFamily,
        fontSize: 180,
        fontWeight: 800,
        color: GREEN,
        opacity: meetOpacity * settleFade * exitOpacity,
        scale: meetScale,
        translate: `${exitTX}px 0px`,
        letterSpacing: -4,
        lineHeight: 1,
      }}
    >
      Meet
    </div>
  );
};

// ─── Scene 2b: "StudySaver" swipes in from left, zooms out ───────────────────
const TAGLINE = "AI savings copilot for students";

const SparkleIcon: React.FC = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 18 18"
    fill="none"
    style={{ flexShrink: 0 }}
  >
    <path
      d="M9 1L10.2 6.8L16 8L10.2 9.2L9 15L7.8 9.2L2 8L7.8 6.8L9 1Z"
      fill="#FFFFFF"
    />
    <path
      d="M14 2L14.6 4.4L17 5L14.6 5.6L14 8L13.4 5.6L11 5L13.4 4.4L14 2Z"
      fill="#FFFFFF"
      opacity={0.85}
    />
  </svg>
);

const StudySaverWord: React.FC<{ frame: number }> = ({ frame }) => {
  const { height } = useVideoConfig();
  if (frame < SS_START) return null;
  const local = frame - SS_START;
  const shrinkStart = SS_SWIPE_DURATION;
  const moveStart = shrinkStart + SS_SHRINK_DURATION;
  const moveEnd = moveStart + SS_MOVE_DURATION;
  // 34% from top (66% from bottom) — moves up after swipe settles
  const targetY = height * 0.34 - height * 0.5;

  const tx = interpolate(local, [0, SS_SWIPE_DURATION], [-320, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EXPO_OUT,
  });
  const ty = interpolate(local, [moveStart, moveEnd], [0, targetY], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EXPO_OUT,
  });
  const scale = interpolate(
    local,
    [0, SS_SWIPE_DURATION, moveStart],
    [1.28, 1, 0.92],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: EXPO_OUT,
    },
  );
  const opacity = interpolate(local, [0, 7], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const showPill = local >= moveStart;
  const warpLocal = local - moveStart;
  const warpProgress = interpolate(warpLocal, [0, SS_MOVE_DURATION], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EXPO_OUT,
  });
  const titleWarpX = showPill ? interpolate(warpProgress, [0, 1], [0.1, 1]) : 1;
  const titleWarpY = showPill
    ? interpolate(warpProgress, [0, 1], [0.45, 1])
    : 1;
  const pillWarpX = interpolate(
    warpProgress,
    [0, 1],
    [PILL_HEIGHT / PILL_FULL_WIDTH, 1],
  );
  const pillTextOpacity = interpolate(warpProgress, [0.5, 0.85], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EXPO_OUT,
  });

  const clickLocal = frame - CLICK_START;
  const pillClickScale =
    frame >= CLICK_START && frame < CLICK_START + CLICK_DURATION
      ? interpolate(clickLocal, [0, 5, 10, CLICK_DURATION], [1, 0.9, 0.96, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: EXPO_OUT,
        })
      : 1;
  const pillClickGlow =
    frame >= CLICK_START && frame < CLICK_START + CLICK_DURATION
      ? interpolate(clickLocal, [0, 4, CLICK_DURATION], [0, 0.35, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })
      : 0;

  const brandWarpLocal = frame - WARP_START;
  const brandFade =
    frame >= WARP_START
      ? interpolate(brandWarpLocal, [0, WARP_DURATION], [1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: EXPO_OUT,
        })
      : 1;

  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        opacity: opacity * brandFade,
        scale,
        translate: `${tx}px ${ty}px`,
      }}
    >
      <div
        style={{
          fontFamily: outfitFamily,
          fontSize: 140,
          fontWeight: 800,
          color: GREEN,
          letterSpacing: -3,
          lineHeight: 1,
          scale: `${titleWarpX} ${titleWarpY}`,
        }}
      >
        StudySaver
      </div>

      {showPill && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            marginTop: 28,
            left: "50%",
            translate: "-50% 0",
            width: PILL_FULL_WIDTH,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: PILL_FULL_WIDTH,
              height: PILL_HEIGHT,
              borderRadius: 9999,
              background: GREEN,
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              scale: `${pillWarpX * pillClickScale} 1`,
              boxShadow:
                pillClickGlow > 0
                  ? `0 0 0 ${8 * pillClickGlow}px rgba(26, 67, 49, ${0.25 * pillClickGlow})`
                  : undefined,
            }}
          >
            <div
              style={{
                opacity: pillTextOpacity,
                display: "flex",
                alignItems: "center",
                gap: 12,
                paddingInline: 28,
                whiteSpace: "nowrap",
                fontFamily: workSansFamily,
                fontSize: 17,
                fontWeight: 600,
                color: "#FFFFFF",
              }}
            >
              <SparkleIcon />
              {TAGLINE}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Main Composition ─────────────────────────────────────────────────────────
export const MyComposition: React.FC = () => {
  const frame = useCurrentFrame();

  const introFade =
    frame >= WARP_START
      ? interpolate(frame - WARP_START, [0, WARP_DURATION], [1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: EXPO_OUT,
        })
      : 1;

  return (
    <AbsoluteFill style={{ background: BG }}>
      {/* Background: drifting cards with exit */}
      <AbsoluteFill style={{ opacity: introFade }}>
        {BG_ELEMENTS.map((el, i) => (
          <BGElement key={i} {...el} frame={frame} />
        ))}
      </AbsoluteFill>
      {/* Scene 1: stacked word animations */}
      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          opacity: introFade,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            overflow: "visible",
          }}
        >
          <CollegeWord frame={frame} />
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            overflow: "visible",
          }}
        >
          <IsWord frame={frame} />
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            overflow: "visible",
          }}
        >
          <ExpensiveTyped frame={frame} />
        </div>
      </AbsoluteFill>
      {/* Scene 2: "Meet" zoom wipe → swipes right, "StudySaver" swipes in from left */}
      <AbsoluteFill
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: introFade,
        }}
      >
        <div
          style={{
            display: "grid",
            placeItems: "center",
            gridTemplateAreas: '"word"',
          }}
        >
          <div style={{ gridArea: "word" }}>
            <MeetWord frame={frame} />
          </div>
          <div style={{ gridArea: "word" }}>
            <StudySaverWord frame={frame} />
          </div>
        </div>
      </AbsoluteFill>
      <SceneAppTransition frame={frame} />
      {/* Always-on top layer: vignette + grain */}
      <Vignette />
      <FilmGrain />

      <Audio
        src={staticFile("Prospa & Murda Beatz - Baby.mp3")}
        from={-1389}
        volume={0.8}
      />
    </AbsoluteFill>
  );
};
