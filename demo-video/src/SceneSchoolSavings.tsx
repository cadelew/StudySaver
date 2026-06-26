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
  SCHOOL_ENTRY_DISTANCE,
  SCHOOL_LEFT_START,
  SCHOOL_PHONE_SCALE,
  SCHOOL_RIGHT_START,
  SCHOOL_SAVINGS_DURATION,
  SCHOOL_SAVINGS_TEXT,
  SCHOOL_SIDE_GAP,
  SCHOOL_TEXT_RISE,
  SCHOOL_TEXT_START,
  SCHOOL_TEXT_W,
  SCENE_TRANSITION_SPRING,
  SCREEN_W,
} from "./demo-constants";
import { MealPlanRemotion } from "./MealPlanRemotion";
import { RefundsRemotion } from "./RefundsRemotion";
import { PHONE_H, PhoneMockup } from "./onboarding-mockups";

const EXPO_OUT = Easing.bezier(0.22, 1, 0.36, 1);
const SPRING = SCENE_TRANSITION_SPRING;

const PHONE_SLOT_W = Math.round(SCREEN_W * SCHOOL_PHONE_SCALE);
const PHONE_SLOT_H = Math.round(PHONE_H * SCHOOL_PHONE_SCALE);

export const SceneSchoolSavings: React.FC<{ schoolLocal: number }> = ({ schoolLocal }) => {
  const { fps } = useVideoConfig();

  const leftIn = spring({
    frame: schoolLocal - SCHOOL_LEFT_START,
    fps,
    config: SPRING,
  });
  const rightIn = spring({
    frame: schoolLocal - SCHOOL_RIGHT_START,
    fps,
    config: SPRING,
  });
  const leftX = interpolate(leftIn, [0, 1], [-SCHOOL_ENTRY_DISTANCE, 0]);
  const rightX = interpolate(rightIn, [0, 1], [SCHOOL_ENTRY_DISTANCE, 0]);

  const textT = interpolate(
    schoolLocal,
    [SCHOOL_TEXT_START, SCHOOL_TEXT_START + SCHOOL_TEXT_RISE],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: EXPO_OUT,
    },
  );

  const fadeIn = interpolate(schoolLocal, [0, 14], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const fadeOut = interpolate(
    schoolLocal,
    [SCHOOL_SAVINGS_DURATION - 14, SCHOOL_SAVINGS_DURATION],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <AbsoluteFill style={{ background: BG, overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "row",
          flexWrap: "nowrap",
          alignItems: "center",
          justifyContent: "center",
          gap: SCHOOL_SIDE_GAP,
          opacity: fadeIn * fadeOut,
        }}
      >
        <div
          style={{
            width: PHONE_SLOT_W,
            height: PHONE_SLOT_H,
            flexShrink: 0,
            translate: `${leftX}px 0`,
            opacity: interpolate(leftIn, [0, 0.35], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          <div style={{ scale: SCHOOL_PHONE_SCALE, transformOrigin: "top left" }}>
            <PhoneMockup>
              <div style={{ width: "100%", height: "100%", overflow: "hidden" }}>
                <MealPlanRemotion />
              </div>
            </PhoneMockup>
          </div>
        </div>

        <div
          style={{
            width: SCHOOL_TEXT_W,
            textAlign: "center",
            flexShrink: 0,
            opacity: textT,
            scale: interpolate(textT, [0, 1], [0.92, 1]),
          }}
        >
          <p
            className="font-display font-bold leading-tight tracking-tight"
            style={{ fontSize: 34, letterSpacing: -0.5, color: GREEN }}
          >
            {SCHOOL_SAVINGS_TEXT}
          </p>
        </div>

        <div
          style={{
            width: PHONE_SLOT_W,
            height: PHONE_SLOT_H,
            flexShrink: 0,
            translate: `${rightX}px 0`,
            opacity: interpolate(rightIn, [0, 0.35], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          <div style={{ scale: SCHOOL_PHONE_SCALE, transformOrigin: "top left" }}>
            <PhoneMockup>
              <div style={{ width: "100%", height: "100%", overflow: "hidden" }}>
                <RefundsRemotion />
              </div>
            </PhoneMockup>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
