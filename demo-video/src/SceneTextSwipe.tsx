import { AbsoluteFill, Easing, interpolate } from "remotion";
import { BG, GREEN } from "./demo-constants";

const SWIPE_EASE = Easing.bezier(0.22, 1, 0.36, 1);
const DRIFT_EASE = Easing.bezier(0.45, 0, 0.55, 1);

export const SceneTextSwipe: React.FC<{
  local: number;
  text: string;
  swipeIn?: number;
  hold?: number;
  swipeOut?: number;
  fontSize?: number;
  duration?: number;
}> = ({
  local,
  text,
  swipeIn = 10,
  hold = 26,
  swipeOut = 10,
  fontSize = 132,
  duration,
}) => {
  const holdEnd = swipeIn + hold;
  const outEnd = holdEnd + swipeOut;
  const totalDuration = duration ?? outEnd + 4;

  const xSmooth =
    local <= swipeIn
      ? interpolate(local, [0, swipeIn], [-1280, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: SWIPE_EASE,
        })
      : local <= holdEnd
        ? interpolate(local, [swipeIn, holdEnd], [0, 52], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: DRIFT_EASE,
          })
        : interpolate(local, [holdEnd, outEnd], [52, 1360], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: SWIPE_EASE,
          });

  const scale =
    local <= swipeIn
      ? interpolate(local, [0, swipeIn], [1.1, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: SWIPE_EASE,
        })
      : local <= holdEnd
        ? interpolate(local, [swipeIn, holdEnd], [1, 1.03], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: DRIFT_EASE,
          })
        : interpolate(local, [holdEnd, outEnd], [1.03, 0.94], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: SWIPE_EASE,
          });

  const opacity = interpolate(
    local,
    [0, 5, totalDuration - 4, totalDuration],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <AbsoluteFill
      style={{
        background: BG,
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        className="font-display font-extrabold leading-none tracking-tight whitespace-nowrap"
        style={{
          fontSize,
          letterSpacing: -3,
          color: GREEN,
          opacity,
          scale,
          translate: `${xSmooth}px 0`,
        }}
      >
        {text}
      </div>
    </AbsoluteFill>
  );
};
