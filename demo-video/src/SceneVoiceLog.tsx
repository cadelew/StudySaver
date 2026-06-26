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
  SCENE_ENTRY_DISTANCE,
  SCENE_TRANSITION_SPRING,
  SCREEN_H,
  SCREEN_W,
  VOICE_CONFIRM_START,
  VOICE_DONE_START,
  VOICE_HERO_RISE,
  VOICE_HERO_START,
  VOICE_HERO_SUBTEXT,
  VOICE_HERO_TEXT,
  VOICE_PHASE_FRAMES,
  VOICE_PROCESSING_END,
  VOICE_RECORDING_END,
  VOICE_TAP_CONFIRM,
  VOICE_TAP_MIC,
} from "./demo-constants";
import { VoiceLogRemotion, type VoiceLogFlowState } from "./VoiceLogRemotion";
import { PhoneMockup, TapCursor } from "./onboarding-mockups";

const EXPO_OUT = Easing.bezier(0.22, 1, 0.36, 1);
const SPRING = SCENE_TRANSITION_SPRING;

function getVoiceFlowState(voiceLocal: number): VoiceLogFlowState {
  if (voiceLocal >= VOICE_TAP_MIC && voiceLocal < VOICE_RECORDING_END) {
    return "recording";
  }
  if (voiceLocal >= VOICE_RECORDING_END && voiceLocal < VOICE_PROCESSING_END) {
    return "processing";
  }
  if (voiceLocal >= VOICE_CONFIRM_START && voiceLocal < VOICE_DONE_START) {
    return "confirm";
  }
  if (voiceLocal >= VOICE_DONE_START) {
    return "done";
  }
  return "idle";
}

export const SceneVoiceLog: React.FC<{ voiceLocal: number }> = ({ voiceLocal }) => {
  const { fps } = useVideoConfig();

  const slideIn = spring({
    frame: voiceLocal,
    fps,
    config: SPRING,
  });
  const entryY = interpolate(slideIn, [0, 1], [SCENE_ENTRY_DISTANCE, 0]);
  const panelOpacity = interpolate(voiceLocal, [0, 14], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const heroT = interpolate(
    voiceLocal,
    [VOICE_HERO_START, VOICE_HERO_START + VOICE_HERO_RISE],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: EXPO_OUT,
    },
  );

  const flowState = getVoiceFlowState(voiceLocal);
  const micPressed = interpolate(
    voiceLocal,
    [VOICE_TAP_MIC - 1, VOICE_TAP_MIC, VOICE_RECORDING_END - 2, VOICE_RECORDING_END],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const micTap = interpolate(
    voiceLocal,
    [VOICE_TAP_MIC - 1, VOICE_TAP_MIC, VOICE_TAP_MIC + 10],
    [0, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const confirmTap = interpolate(
    voiceLocal,
    [VOICE_TAP_CONFIRM - 1, VOICE_TAP_CONFIRM, VOICE_TAP_CONFIRM + 10],
    [0, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const fadeOut = interpolate(
    voiceLocal,
    [VOICE_PHASE_FRAMES - 14, VOICE_PHASE_FRAMES],
    [1, 0],
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
          paddingTop: 36,
          translate: `0 ${entryY}px`,
          opacity: fadeOut,
        }}
      >
        <div
          style={{
            textAlign: "center",
            opacity: heroT,
            pointerEvents: "none",
            marginBottom: 20,
          }}
        >
          <p
            className="font-display font-bold leading-tight tracking-tight"
            style={{ fontSize: 44, letterSpacing: -1, color: GREEN }}
          >
            {VOICE_HERO_TEXT}
          </p>
          <p
            className="font-medium leading-snug mt-2"
            style={{ fontSize: 18, color: GREEN, opacity: 0.72 }}
          >
            {VOICE_HERO_SUBTEXT}
          </p>
        </div>

        <div style={{ opacity: panelOpacity }}>
          <PhoneMockup>
            <div
              style={{
                position: "relative",
                width: SCREEN_W,
                height: SCREEN_H,
                overflow: "hidden",
              }}
            >
              <VoiceLogRemotion flowState={flowState} micPressed={micPressed > 0.5} />
              {(flowState === "idle" || flowState === "recording" || flowState === "processing") && (
                <TapCursor x={SCREEN_W * 0.5} y={430} tapProgress={micTap} />
              )}
              {flowState === "confirm" && (
                <TapCursor x={SCREEN_W * 0.5} y={520} tapProgress={confirmTap} />
              )}
            </div>
          </PhoneMockup>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
