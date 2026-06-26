import { AbsoluteFill, Easing, interpolate, spring, useVideoConfig } from "remotion";
import {
  BG,
  ENDING_BRAND,
  ENDING_THANKS,
  ENDING_THANKS_START,
  ENDING_TITLE_START,
  GREEN,
  SCENE_TRANSITION_SPRING,
} from "./demo-constants";

const EXPO_OUT = Easing.bezier(0.22, 1, 0.36, 1);

export const SceneEnding: React.FC<{ endingLocal: number }> = ({ endingLocal }) => {
  const { fps } = useVideoConfig();

  const titleIn = spring({
    frame: endingLocal - ENDING_TITLE_START,
    fps,
    config: SCENE_TRANSITION_SPRING,
  });
  const thanksIn = spring({
    frame: endingLocal - ENDING_THANKS_START,
    fps,
    config: { damping: 200, stiffness: 100 },
  });

  const titleScale = interpolate(titleIn, [0, 1], [0.88, 1]);
  const titleOpacity = interpolate(titleIn, [0, 0.35], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const thanksY = interpolate(thanksIn, [0, 1], [24, 0]);
  const thanksOpacity = interpolate(thanksIn, [0, 0.4], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const fadeIn = interpolate(endingLocal, [0, 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EXPO_OUT,
  });

  return (
    <AbsoluteFill
      style={{
        background: BG,
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity: fadeIn,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          gap: 28,
        }}
      >
        <p
          className="font-display font-extrabold leading-none tracking-tight"
          style={{
            fontSize: 148,
            letterSpacing: -4,
            color: GREEN,
            opacity: titleOpacity,
            scale: titleScale,
          }}
        >
          {ENDING_BRAND}
        </p>
        <p
          className="font-medium leading-snug"
          style={{
            fontSize: 26,
            letterSpacing: -0.3,
            color: GREEN,
            opacity: thanksOpacity * 0.78,
            translate: `0 ${thanksY}px`,
          }}
        >
          {ENDING_THANKS}
        </p>
      </div>
    </AbsoluteFill>
  );
};
