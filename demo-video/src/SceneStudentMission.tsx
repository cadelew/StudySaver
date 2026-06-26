import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useVideoConfig,
} from "remotion";
import {
  BG,
  GREEN,
  STUDENT_LEFT_START,
  STUDENT_MISSION_DURATION,
  STUDENT_MISSION_LEFT,
  STUDENT_MISSION_TOP,
  STUDENT_TOP_START,
  STUDENT_TRANSITION_SPRING,
} from "./demo-constants";

const EXPO_OUT = Easing.bezier(0.22, 1, 0.36, 1);

export const SceneStudentMission: React.FC<{ missionLocal: number }> = ({ missionLocal }) => {
  const { fps } = useVideoConfig();

  const topIn = spring({
    frame: missionLocal - STUDENT_TOP_START,
    fps,
    config: STUDENT_TRANSITION_SPRING,
  });
  const leftIn = spring({
    frame: missionLocal - STUDENT_LEFT_START,
    fps,
    config: STUDENT_TRANSITION_SPRING,
  });

  const topY = interpolate(topIn, [0, 1], [-360, 0]);
  const leftX = interpolate(leftIn, [0, 1], [-720, 0]);

  const fadeIn = interpolate(missionLocal, [0, 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EXPO_OUT,
  });
  const fadeOut = interpolate(
    missionLocal,
    [STUDENT_MISSION_DURATION - 14, STUDENT_MISSION_DURATION],
    [1, 0],
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
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          gap: 8,
          opacity: fadeIn * fadeOut,
        }}
      >
        <p
          className="font-display font-extrabold leading-none tracking-tight"
          style={{
            fontSize: 88,
            letterSpacing: -2,
            color: GREEN,
            translate: `0 ${topY}px`,
            opacity: interpolate(topIn, [0, 0.4], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          {STUDENT_MISSION_TOP}
        </p>
        <p
          className="font-display font-extrabold leading-none tracking-tight"
          style={{
            fontSize: 88,
            letterSpacing: -2,
            color: GREEN,
            paddingLeft: 48,
            translate: `${leftX}px 0`,
            opacity: interpolate(leftIn, [0, 0.4], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          {STUDENT_MISSION_LEFT}
        </p>
      </div>
    </AbsoluteFill>
  );
};
