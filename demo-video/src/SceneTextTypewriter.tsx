import { AbsoluteFill, interpolate } from "remotion";
import { BG, GREEN } from "./demo-constants";

function buildTypewriterKeyframes(text: string) {
  const n = text.length;
  const inFrames = Array.from({ length: n + 1 }, (_, i) => Math.round((i / n) * (n + 6)));
  const outFrames = Array.from({ length: n + 1 }, (_, i) => i);
  return { inFrames, outFrames };
}

export const SceneTextTypewriter: React.FC<{
  local: number;
  text: string;
  typeStart?: number;
  holdEnd?: number;
  duration?: number;
  fontSize?: number;
}> = ({
  local,
  text,
  typeStart = 8,
  holdEnd,
  duration = 58,
  fontSize = 72,
}) => {
  const hold = holdEnd ?? typeStart + text.length + 10;
  const { inFrames, outFrames } = buildTypewriterKeyframes(text);

  const typeLocal = local - typeStart;
  const chars =
    typeLocal >= 0
      ? Math.floor(
          interpolate(typeLocal, inFrames, outFrames, {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        )
      : 0;

  const cursorOpacity =
    local >= typeStart - 2 && local < hold
      ? interpolate(local % 20, [0, 10, 20], [1, 0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })
      : 0;

  const fadeIn = interpolate(local, [0, 6], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const fadeOut = interpolate(local, [duration - 8, duration], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background: BG,
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 48px",
      }}
    >
      <div
        className="font-display font-extrabold leading-tight tracking-tight text-center"
        style={{
          fontSize,
          letterSpacing: -2,
          color: GREEN,
          opacity: fadeIn * fadeOut,
          maxWidth: 960,
        }}
      >
        <span>{text.slice(0, chars)}</span>
        <span style={{ opacity: cursorOpacity }}>|</span>
      </div>
    </AbsoluteFill>
  );
};
