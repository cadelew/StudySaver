import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useVideoConfig,
} from "remotion";
import {
  BG,
  DEALS_PANEL_ROTATE_X,
  DEALS_PHONE_SCALE,
  DEALS_SCENE_DURATION,
  DEALS_SIDE_GAP,
  DEALS_TEXT_RISE,
  DEALS_TEXT_SIZE,
  DEALS_TEXT_START,
  DEALS_TEXT_W,
  DASHBOARD_ROTATE_Y_END,
  DASHBOARD_ROTATE_Y_START,
  DASHBOARD_SCALE_END,
  DASHBOARD_SCALE_START,
  GREEN,
  SCENE_ENTRY_DISTANCE,
  SCENE_TRANSITION_SPRING,
} from "./demo-constants";
import { DealsRemotion } from "./DealsRemotion";
import { PhoneMockup } from "./onboarding-mockups";

const EXPO_OUT = Easing.bezier(0.22, 1, 0.36, 1);
const SPRING = SCENE_TRANSITION_SPRING;

export const SceneDealsSplit: React.FC<{ dealsLocal: number }> = ({ dealsLocal }) => {
  const { fps } = useVideoConfig();

  const panelIn = spring({
    frame: dealsLocal,
    fps,
    config: SPRING,
  });
  const entryY = interpolate(panelIn, [0, 1], [SCENE_ENTRY_DISTANCE, 0]);
  const panelOpacity = interpolate(dealsLocal, [0, 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const textT = interpolate(
    dealsLocal,
    [DEALS_TEXT_START, DEALS_TEXT_START + DEALS_TEXT_RISE],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: EXPO_OUT,
    },
  );
  const leftX = interpolate(textT, [0, 1], [-48, 0]);
  const rightX = interpolate(textT, [0, 1], [48, 0]);

  const rotateY = interpolate(
    dealsLocal,
    [0, DEALS_SCENE_DURATION],
    [DASHBOARD_ROTATE_Y_START, DASHBOARD_ROTATE_Y_END],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const driftScale = interpolate(
    dealsLocal,
    [0, DEALS_SCENE_DURATION],
    [DASHBOARD_SCALE_START, DASHBOARD_SCALE_END],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const phoneScale = DEALS_PHONE_SCALE * driftScale;

  const glowOpacity = interpolate(dealsLocal, [10, 44], [0, 0.35], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const phoneTransform = `rotateX(${DEALS_PANEL_ROTATE_X}deg) rotateY(${rotateY}deg) scale(${phoneScale})`;

  return (
    <AbsoluteFill style={{ background: BG, overflow: "hidden", perspective: 1400 }}>
      <AbsoluteFill
        style={{
          opacity: glowOpacity,
          background:
            "radial-gradient(ellipse 50% 42% at 50% 58%, rgba(26,67,49,0.18) 0%, transparent 70%)",
        }}
      />

      <AbsoluteFill
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          translate: `0 ${entryY}px`,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: DEALS_SIDE_GAP,
          }}
        >
          <p
            className="font-display font-bold leading-tight tracking-tight"
            style={{
              width: DEALS_TEXT_W,
              textAlign: "right",
              fontSize: DEALS_TEXT_SIZE,
              letterSpacing: -0.5,
              color: GREEN,
              opacity: textT,
              translate: `${leftX}px 0`,
              flexShrink: 0,
              whiteSpace: "nowrap",
            }}
          >
            Find local
          </p>

          <div
            style={{
              transform: phoneTransform,
              transformStyle: "preserve-3d",
              opacity: panelOpacity,
              flexShrink: 0,
            }}
          >
            <PhoneMockup>
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  height: "100%",
                  overflow: "hidden",
                }}
              >
                <DealsRemotion />
              </div>
            </PhoneMockup>
          </div>

          <p
            className="font-display font-bold leading-tight tracking-tight"
            style={{
              width: DEALS_TEXT_W,
              textAlign: "left",
              fontSize: DEALS_TEXT_SIZE,
              letterSpacing: -0.5,
              color: GREEN,
              opacity: textT,
              translate: `${rightX}px 0`,
              flexShrink: 0,
            }}
          >
            student deals
          </p>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
