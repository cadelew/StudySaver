import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useVideoConfig,
} from "remotion";
import {
  BG,
  CHECK_HERO_RISE,
  CHECK_HERO_START,
  CHECK_HERO_SUBTEXT,
  CHECK_HERO_TEXT,
  CHECK_LOADING_END,
  CHECK_PHASE_FRAMES,
  CHECK_PHONE_H,
  CHECK_PHONE_W,
  CHECK_RESULT_START,
  CHECK_TAP_QUICK,
  CHECK_TRANSITION_SPRING,
  GREEN,
  SCENE_ENTRY_DISTANCE,
} from "./demo-constants";
import { CheckRemotion, type CheckFlowState } from "./CheckRemotion";
import { PhoneMockup, TapCursor } from "./onboarding-mockups";

const EXPO_OUT = Easing.bezier(0.22, 1, 0.36, 1);
const SPRING = CHECK_TRANSITION_SPRING;

function getCheckFlowState(checkLocal: number): CheckFlowState {
  if (checkLocal >= CHECK_RESULT_START) return "result";
  if (checkLocal >= CHECK_TAP_QUICK && checkLocal < CHECK_LOADING_END) return "loading";
  return "form";
}

export const SceneCheckDemo: React.FC<{ checkLocal: number }> = ({ checkLocal }) => {
  const { fps } = useVideoConfig();

  const slideIn = spring({ frame: checkLocal, fps, config: SPRING });
  const entryY = interpolate(slideIn, [0, 1], [SCENE_ENTRY_DISTANCE, 0]);
  const fadeOut = interpolate(checkLocal, [CHECK_PHASE_FRAMES - 14, CHECK_PHASE_FRAMES], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const heroT = interpolate(
    checkLocal,
    [CHECK_HERO_START, CHECK_HERO_START + CHECK_HERO_RISE],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: EXPO_OUT,
    },
  );

  const flowState = getCheckFlowState(checkLocal);
  const quickTap = interpolate(
    checkLocal,
    [CHECK_TAP_QUICK - 1, CHECK_TAP_QUICK, CHECK_TAP_QUICK + 10],
    [0, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <AbsoluteFill style={{ background: BG, overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
          paddingTop: 32,
          translate: `0 ${entryY}px`,
          opacity: fadeOut,
        }}
      >
        <div
          style={{
            textAlign: "center",
            opacity: heroT,
            pointerEvents: "none",
            marginBottom: 18,
          }}
        >
          <p
            className="font-display font-bold leading-tight tracking-tight"
            style={{ fontSize: 44, letterSpacing: -1, color: GREEN }}
          >
            {CHECK_HERO_TEXT}
          </p>
          <p
            className="font-medium leading-snug mt-2"
            style={{ fontSize: 18, color: GREEN, opacity: 0.72 }}
          >
            {CHECK_HERO_SUBTEXT}
          </p>
        </div>

        <PhoneMockup width={CHECK_PHONE_W} height={CHECK_PHONE_H}>
          <div
            style={{
              position: "relative",
              width: CHECK_PHONE_W,
              height: CHECK_PHONE_H,
              overflow: "hidden",
            }}
          >
            <CheckRemotion flowState={flowState} />
            {flowState === "form" && (
              <TapCursor x={CHECK_PHONE_W * 0.35} y={440} tapProgress={quickTap} />
            )}
          </div>
        </PhoneMockup>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
