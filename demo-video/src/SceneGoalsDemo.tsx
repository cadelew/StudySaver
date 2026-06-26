import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useVideoConfig,
} from "remotion";
import {
  BG,
  GOALS_DASHBOARD_START,
  GOALS_PHASE_FRAMES,
  GOALS_SHEET_START,
  GOALS_TAP_ADD,
  GOALS_TAP_BUILD,
  GOALS_TAP_NEW,
  GOALS_TRANSITION_SPRING,
  GOALS_TYPE_END,
  GOALS_LOADING_END,
  GOALS_PLAN_START,
  SCENE_ENTRY_DISTANCE,
  SCREEN_H,
  SCREEN_W,
} from "./demo-constants";
import { DashboardGoalRemotion } from "./DashboardGoalRemotion";
import {
  DEMO_GOAL_TEXT,
  GoalsRemotion,
  type GoalsFlowState,
} from "./GoalsRemotion";
import { PhoneMockup, TapCursor } from "./onboarding-mockups";

const SPRING = GOALS_TRANSITION_SPRING;

function getGoalsFlowState(goalsLocal: number): GoalsFlowState {
  if (goalsLocal >= GOALS_DASHBOARD_START) return "list";
  if (goalsLocal >= GOALS_PLAN_START) return "plan";
  if (goalsLocal >= GOALS_TAP_BUILD && goalsLocal < GOALS_LOADING_END) return "loading";
  if (goalsLocal >= GOALS_SHEET_START) return "typing";
  return "empty";
}

export const SceneGoalsDemo: React.FC<{ goalsLocal: number }> = ({ goalsLocal }) => {
  const { fps } = useVideoConfig();

  const slideIn = spring({ frame: goalsLocal, fps, config: SPRING });
  const entryY = interpolate(slideIn, [0, 1], [SCENE_ENTRY_DISTANCE, 0]);
  const fadeOut = interpolate(goalsLocal, [158, GOALS_PHASE_FRAMES], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const flowState = getGoalsFlowState(goalsLocal);
  const showDashboard = goalsLocal >= GOALS_DASHBOARD_START;

  const typeProgress = interpolate(
    goalsLocal,
    [GOALS_SHEET_START + 4, GOALS_TYPE_END],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) },
  );
  const typedText = DEMO_GOAL_TEXT.slice(0, Math.floor(typeProgress * DEMO_GOAL_TEXT.length));

  const newTap = interpolate(
    goalsLocal,
    [GOALS_TAP_NEW - 1, GOALS_TAP_NEW, GOALS_TAP_NEW + 10],
    [0, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const buildTap = interpolate(
    goalsLocal,
    [GOALS_TAP_BUILD - 1, GOALS_TAP_BUILD, GOALS_TAP_BUILD + 10],
    [0, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const addTap = interpolate(
    goalsLocal,
    [GOALS_TAP_ADD - 1, GOALS_TAP_ADD, GOALS_TAP_ADD + 10],
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
          justifyContent: "center",
          translate: `0 ${entryY}px`,
          opacity: fadeOut,
        }}
      >
        <PhoneMockup>
          <div
            style={{
              position: "relative",
              width: SCREEN_W,
              height: SCREEN_H,
              overflow: "hidden",
            }}
          >
            {showDashboard ? (
              <DashboardGoalRemotion />
            ) : (
              <GoalsRemotion flowState={flowState} typedText={typedText} />
            )}
            {!showDashboard && flowState === "empty" && (
              <TapCursor x={SCREEN_W * 0.5} y={520} tapProgress={newTap} />
            )}
            {!showDashboard && flowState === "typing" && (
              <TapCursor x={SCREEN_W * 0.5} y={560} tapProgress={buildTap} />
            )}
            {!showDashboard && flowState === "plan" && (
              <TapCursor x={SCREEN_W * 0.5} y={540} tapProgress={addTap} />
            )}
          </div>
        </PhoneMockup>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
