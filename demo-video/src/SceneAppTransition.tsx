import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useVideoConfig,
} from "remotion";
import {
  APP_SCENE_START,
  AID_PHASE_FRAMES,
  BG,
  DASHBOARD_CONTENT_W,
  DASHBOARD_DISPLAY_SCALE,
  DASHBOARD_EXIT_DISTANCE,
  DASHBOARD_EXIT_START,
  DASHBOARD_HERO_RISE,
  DASHBOARD_HERO_START,
  DASHBOARD_HERO_TEXT,
  DASHBOARD_LAYOUT_OFFSET_Y,
  DASHBOARD_PANEL_H,
  DASHBOARD_PANEL_W,
  DASHBOARD_PHASE_FRAMES,
  DASHBOARD_ROTATE_Y_END,
  DASHBOARD_ROTATE_Y_START,
  DASHBOARD_SCALE_END,
  DASHBOARD_SCALE_START,
  DASHBOARD_SCROLL_DISTANCE,
  DASHBOARD_SCROLL_DURATION,
  DASHBOARD_SCROLL_START,
  DASHBOARD_SLIDE_DURATION,
  DASHBOARD_VIEWPORT_H,
  DEALS_SCENE_DURATION,
  DEALS_PHASE_FRAMES,
  GREEN,
  ONBOARD_END_HOLD,
  ONBOARD_SEQUENCE,
  ONBOARDING_TOTAL_FRAMES,
  PHONE_ROTATE_X,
  PILL_FULL_WIDTH,
  PILL_HEIGHT,
  SCREEN_H,
  SCREEN_W,
  STEP_TRANSITION,
  SYLLABUS_EXTRACTING_START,
  SYLLABUS_FILE_PICKER_END,
  SYLLABUS_FILE_PICKER_START,
  SYLLABUS_HERO_TEXT,
  SYLLABUS_PHASE_FRAMES,
  SYLLABUS_RESULTS_SCROLL_DISTANCE,
  SYLLABUS_RESULTS_SCROLL_DURATION,
  SYLLABUS_RESULTS_SCROLL_START,
  SYLLABUS_RESULTS_START,
  SCENE_ENTRY_DISTANCE,
  SCENE_EXIT_DURATION,
  SCENE_HERO_FADE,
  SCENE_TRANSITION_SPRING,
  CHECK_PHASE_FRAMES,
  GOALS_PHASE_FRAMES,
  MAKE_GOALS_TEXT,
  PURCHASE_PLANS_DURATION,
  PURCHASE_PLANS_TEXT,
  SAVE_THOUSANDS_DURATION,
  SCHOOL_SAVINGS_DURATION,
  STUDENT_MISSION_DURATION,
  TEXT_SWIPE_DURATION,
  TEXT_SWIPE_HOLD,
  TEXT_SWIPE_IN,
  TEXT_SWIPE_OUT,
  SYLLABUS_EXIT_START,
  SYLLABUS_TAP_ANALYZE,
  SYLLABUS_TAP_UPLOAD,
  VOICE_PHASE_FRAMES,
  WARP_DURATION,
  WARP_START,
} from "./demo-constants";
import { CourseCostRemotion, type CourseCostFlowState } from "./CourseCostRemotion";
import { DashboardRemotion } from "./DashboardRemotion";
import { SceneDealsSplit } from "./SceneDealsSplit";
import { SceneAidPhone } from "./SceneAidPhone";
import { SceneSaveThousands } from "./SceneSaveThousands";
import { SceneSchoolSavings } from "./SceneSchoolSavings";
import { SceneTextSwipe } from "./SceneTextSwipe";
import { SceneTextTypewriter } from "./SceneTextTypewriter";
import { SceneGoalsDemo } from "./SceneGoalsDemo";
import { SceneCheckDemo } from "./SceneCheckDemo";
import { SceneStudentMission } from "./SceneStudentMission";
import { SceneEnding } from "./SceneEnding";
import { SceneVoiceLog } from "./SceneVoiceLog";
import {
  DashboardPanel,
  OnboardingScreen,
  PHONE_W,
  PhoneMockup,
  STEP_CALLOUTS,
  StepCallout,
  TapCursor,
} from "./onboarding-mockups";

const EXPO_OUT = Easing.bezier(0.22, 1, 0.36, 1);
const CALLOUT_W = 300;
const GROUP_GAP = 48;
const SPRING = SCENE_TRANSITION_SPRING;

type StepConfig = (typeof ONBOARD_SEQUENCE)[number];
type ScenePhase =
  | "onboarding"
  | "onboard-hold"
  | "dashboard"
  | "syllabus"
  | "deals"
  | "aid"
  | "save-thousands"
  | "school-savings"
  | "make-goals"
  | "goals-demo"
  | "purchase-plans"
  | "check-demo"
  | "student-mission"
  | "voice-log"
  | "ending";

type OnboardState = {
  step: StepConfig;
  stepIndex: number;
  stepLocal: number;
  inTransition: boolean;
  transitionLocal: number;
  prevStep?: StepConfig;
};

function getOnboardState(appLocal: number): OnboardState {
  let cursor = 0;
  for (let i = 0; i < ONBOARD_SEQUENCE.length; i++) {
    const step = ONBOARD_SEQUENCE[i];
    const block =
      step.duration + (i < ONBOARD_SEQUENCE.length - 1 ? STEP_TRANSITION : 0);
    if (appLocal < cursor + block) {
      const stepLocal = appLocal - cursor;
      if (stepLocal < step.duration) {
        return {
          step,
          stepIndex: i,
          stepLocal,
          inTransition: false,
          transitionLocal: 0,
        };
      }
      return {
        step: ONBOARD_SEQUENCE[i + 1],
        stepIndex: i + 1,
        stepLocal: 0,
        inTransition: true,
        transitionLocal: stepLocal - step.duration,
        prevStep: step,
      };
    }
    cursor += block;
  }
  const last = ONBOARD_SEQUENCE[ONBOARD_SEQUENCE.length - 1];
  return {
    step: last,
    stepIndex: ONBOARD_SEQUENCE.length - 1,
    stepLocal: last.duration - 1,
    inTransition: false,
    transitionLocal: 0,
  };
}

function getScenePhase(appLocal: number): ScenePhase {
  const dashStart = ONBOARDING_TOTAL_FRAMES + ONBOARD_END_HOLD;
  const syllabusStart = dashStart + DASHBOARD_PHASE_FRAMES;
  const dealsStart = syllabusStart + SYLLABUS_PHASE_FRAMES;
  const saveStart = dealsStart + DEALS_PHASE_FRAMES;
  const aidStart = saveStart + SAVE_THOUSANDS_DURATION;
  const schoolStart = aidStart + AID_PHASE_FRAMES;
  const makeGoalsStart = schoolStart + SCHOOL_SAVINGS_DURATION;
  const goalsDemoStart = makeGoalsStart + TEXT_SWIPE_DURATION;
  const purchasePlansStart = goalsDemoStart + GOALS_PHASE_FRAMES;
  const checkStart = purchasePlansStart + PURCHASE_PLANS_DURATION;
  const studentStart = checkStart + CHECK_PHASE_FRAMES;
  const voiceStart = studentStart + STUDENT_MISSION_DURATION;
  const endingStart = voiceStart + VOICE_PHASE_FRAMES;
  if (appLocal < ONBOARDING_TOTAL_FRAMES) return "onboarding";
  if (appLocal < dashStart) return "onboard-hold";
  if (appLocal < syllabusStart) return "dashboard";
  if (appLocal < dealsStart) return "syllabus";
  if (appLocal < saveStart) return "deals";
  if (appLocal < aidStart) return "save-thousands";
  if (appLocal < schoolStart) return "aid";
  if (appLocal < makeGoalsStart) return "school-savings";
  if (appLocal < goalsDemoStart) return "make-goals";
  if (appLocal < purchasePlansStart) return "goals-demo";
  if (appLocal < checkStart) return "purchase-plans";
  if (appLocal < studentStart) return "check-demo";
  if (appLocal < voiceStart) return "student-mission";
  if (appLocal < endingStart) return "voice-log";
  return "ending";
}

const lastBudgetStep = ONBOARD_SEQUENCE[ONBOARD_SEQUENCE.length - 1];

const OnboardingPhoneContent: React.FC<{
  onboard: OnboardState;
  tapProgress: number;
}> = ({ onboard, tapProgress }) => {
  if (onboard.inTransition && onboard.prevStep) {
    const t = interpolate(
      onboard.transitionLocal,
      [0, STEP_TRANSITION],
      [0, 1],
      {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: EXPO_OUT,
      },
    );

    const exitX = interpolate(t, [0, 1], [0, -44]);
    const enterX = interpolate(t, [0, 1], [44, 0]);
    const exitOpacity = interpolate(t, [0, 0.85], [1, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    const enterOpacity = interpolate(t, [0.15, 1], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });

    return (
      <>
        <div
          style={{
            position: "absolute",
            inset: 0,
            translate: `${exitX}px 0`,
            opacity: exitOpacity,
          }}
        >
          <OnboardingScreen
            step={onboard.prevStep.id}
            stepLocal={onboard.prevStep.duration - 1}
            tapAt={onboard.prevStep.tapAt}
          />
        </div>
        <div
          style={{
            position: "absolute",
            inset: 0,
            translate: `${enterX}px 0`,
            opacity: enterOpacity,
          }}
        >
          <OnboardingScreen
            step={onboard.step.id}
            stepLocal={0}
            tapAt={onboard.step.tapAt}
          />
        </div>
      </>
    );
  }

  const tapX = onboard.step.tapX * SCREEN_W;
  const tapY = onboard.step.tapY * SCREEN_H;

  return (
    <>
      <OnboardingScreen
        step={onboard.step.id}
        stepLocal={onboard.stepLocal}
        tapAt={onboard.step.tapAt}
      />
      <TapCursor x={tapX} y={tapY} tapProgress={tapProgress} />
    </>
  );
};

const DashboardPhoneContent: React.FC<{
  dashLocal: number;
  contentScrollY: number;
  viewportHeight: number;
}> = ({ dashLocal, contentScrollY, viewportHeight }) => {
  const slideT = interpolate(
    dashLocal,
    [0, DASHBOARD_SLIDE_DURATION],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: EXPO_OUT,
    },
  );

  const budgetOpacity = interpolate(slideT, [0, 0.45], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const dashboardOpacity = interpolate(slideT, [0.1, 0.65], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <>
      {dashLocal < DASHBOARD_SLIDE_DURATION + 4 && (
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: 0,
            width: SCREEN_W,
            height: viewportHeight,
            translate: "-50% 0",
            opacity: budgetOpacity,
            overflow: "hidden",
          }}
        >
          <OnboardingScreen
            step="budget"
            stepLocal={lastBudgetStep.duration - 1}
            tapAt={lastBudgetStep.tapAt}
          />
        </div>
      )}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          translate: `0 ${contentScrollY}px`,
          opacity: dashboardOpacity,
        }}
      >
        <DashboardRemotion />
      </div>
    </>
  );
};

const OnboardCallout: React.FC<{
  onboard: OnboardState;
  calloutFade: number;
}> = ({ onboard, calloutFade }) => {
  if (onboard.inTransition && onboard.prevStep) {
    const t = interpolate(
      onboard.transitionLocal,
      [0, STEP_TRANSITION],
      [0, 1],
      {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: EXPO_OUT,
      },
    );
    const prevOpacity = interpolate(t, [0, 0.5], [1, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    const nextOpacity = interpolate(t, [0.35, 1], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });

    return (
      <>
        <div style={{ position: "absolute", inset: 0 }}>
          <StepCallout
            text={STEP_CALLOUTS[onboard.prevStep.id]}
            stepLocal={onboard.prevStep.duration - 1}
            duration={onboard.prevStep.duration}
            opacityOverride={prevOpacity * calloutFade}
          />
        </div>
        <div style={{ position: "absolute", inset: 0 }}>
          <StepCallout
            text={STEP_CALLOUTS[onboard.step.id]}
            stepLocal={0}
            duration={onboard.step.duration}
            opacityOverride={nextOpacity * calloutFade}
          />
        </div>
      </>
    );
  }

  return (
    <StepCallout
      text={STEP_CALLOUTS[onboard.step.id]}
      stepLocal={onboard.stepLocal}
      duration={onboard.step.duration}
      opacityOverride={calloutFade}
    />
  );
};

const SyllabusPanelContent: React.FC<{
  syllabusLocal: number;
}> = ({ syllabusLocal }) => {
  const fileName =
    syllabusLocal >= SYLLABUS_FILE_PICKER_END
      ? "BIOL_1A_Syllabus_Fall2026.pdf"
      : "";

  let flowState: CourseCostFlowState = "upload";
  if (
    syllabusLocal >= SYLLABUS_FILE_PICKER_START &&
    syllabusLocal < SYLLABUS_FILE_PICKER_END
  ) {
    flowState = "file-picker";
  } else if (
    syllabusLocal >= SYLLABUS_FILE_PICKER_END &&
    syllabusLocal < SYLLABUS_EXTRACTING_START
  ) {
    flowState = "upload-ready";
  } else if (
    syllabusLocal >= SYLLABUS_EXTRACTING_START &&
    syllabusLocal < SYLLABUS_RESULTS_START
  ) {
    flowState = "extracting";
  } else if (syllabusLocal >= SYLLABUS_RESULTS_START) {
    flowState = "results";
  }

  const filePickerProgress = interpolate(
    syllabusLocal,
    [SYLLABUS_FILE_PICKER_START, SYLLABUS_FILE_PICKER_START + 10],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EXPO_OUT },
  );

  const uploadTap = interpolate(
    syllabusLocal,
    [SYLLABUS_TAP_UPLOAD - 1, SYLLABUS_TAP_UPLOAD, SYLLABUS_TAP_UPLOAD + 10],
    [0, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const analyzeTap = interpolate(
    syllabusLocal,
    [SYLLABUS_TAP_ANALYZE - 1, SYLLABUS_TAP_ANALYZE, SYLLABUS_TAP_ANALYZE + 10],
    [0, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const resultsScrollT = interpolate(
    syllabusLocal,
    [
      SYLLABUS_RESULTS_SCROLL_START,
      SYLLABUS_RESULTS_SCROLL_START + SYLLABUS_RESULTS_SCROLL_DURATION,
    ],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const resultsScrollY =
    syllabusLocal >= SYLLABUS_RESULTS_START
      ? -resultsScrollT * SYLLABUS_RESULTS_SCROLL_DISTANCE
      : 0;

  return (
    <>
      <div style={{ translate: `0 ${resultsScrollY}px` }}>
        <CourseCostRemotion
          flowState={flowState}
          fileName={fileName}
          filePickerProgress={filePickerProgress}
        />
      </div>
      <TapCursor x={280} y={220} tapProgress={uploadTap} />
      <TapCursor x={280} y={500} tapProgress={analyzeTap} />
    </>
  );
};

const SceneHeroText: React.FC<{
  local: number;
  text: string;
  start: number;
  rise: number;
  opacity?: number;
}> = ({ local, text, start, rise, opacity = 1 }) => {
  const { fps } = useVideoConfig();

  const heroT = interpolate(local, [start, start + rise], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EXPO_OUT,
  });

  const scale = interpolate(local, [start, start + fps * 0.5], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  return (
    <div
      style={{
        textAlign: "center",
        opacity: heroT * opacity,
        scale,
        pointerEvents: "none",
        marginBottom: 28,
      }}
    >
      <p
        className="font-display font-bold leading-tight tracking-tight"
        style={{ fontSize: 44, letterSpacing: -1, color: GREEN }}
      >
        {text}
      </p>
    </div>
  );
};

export const SceneAppTransition: React.FC<{ frame: number }> = ({ frame }) => {
  const { height, fps } = useVideoConfig();

  if (frame < WARP_START) return null;

  const appLocal = frame - APP_SCENE_START;
  const phase = getScenePhase(appLocal);
  const isStackedPanel = phase === "dashboard" || phase === "syllabus";
  const dashStart = ONBOARDING_TOTAL_FRAMES + ONBOARD_END_HOLD;
  const syllabusStart = dashStart + DASHBOARD_PHASE_FRAMES;
  const dealsStart = syllabusStart + SYLLABUS_PHASE_FRAMES;
  const saveStart = dealsStart + DEALS_PHASE_FRAMES;
  const aidStart = saveStart + SAVE_THOUSANDS_DURATION;
  const schoolStart = aidStart + AID_PHASE_FRAMES;
  const makeGoalsStart = schoolStart + SCHOOL_SAVINGS_DURATION;
  const goalsDemoStart = makeGoalsStart + TEXT_SWIPE_DURATION;
  const purchasePlansStart = goalsDemoStart + GOALS_PHASE_FRAMES;
  const checkStart = purchasePlansStart + PURCHASE_PLANS_DURATION;
  const studentStart = checkStart + CHECK_PHASE_FRAMES;
  const voiceStart = studentStart + STUDENT_MISSION_DURATION;
  const endingStart = voiceStart + VOICE_PHASE_FRAMES;
  const onboard = getOnboardState(
    Math.min(appLocal, ONBOARDING_TOTAL_FRAMES - 1),
  );
  const dashLocal =
    phase === "dashboard" ? appLocal - dashStart : 0;
  const syllabusLocal = phase === "syllabus" ? appLocal - syllabusStart : 0;
  const dealsLocal = phase === "deals" ? appLocal - dealsStart : 0;
  const saveLocal = phase === "save-thousands" ? appLocal - saveStart : 0;
  const aidLocal = phase === "aid" ? appLocal - aidStart : 0;
  const schoolLocal = phase === "school-savings" ? appLocal - schoolStart : 0;
  const makeGoalsLocal = phase === "make-goals" ? appLocal - makeGoalsStart : 0;
  const goalsLocal = phase === "goals-demo" ? appLocal - goalsDemoStart : 0;
  const purchasePlansLocal =
    phase === "purchase-plans" ? appLocal - purchasePlansStart : 0;
  const checkLocal = phase === "check-demo" ? appLocal - checkStart : 0;
  const studentLocal = phase === "student-mission" ? appLocal - studentStart : 0;
  const voiceLocal = phase === "voice-log" ? appLocal - voiceStart : 0;
  const endingLocal = phase === "ending" ? appLocal - endingStart : 0;

  const panelLocal =
    phase === "dashboard"
      ? dashLocal
      : phase === "syllabus"
        ? syllabusLocal
        : phase === "deals"
          ? dealsLocal
          : 0;
  const panelSceneLength =
    phase === "dashboard"
      ? DASHBOARD_PHASE_FRAMES
      : phase === "syllabus"
        ? SYLLABUS_PHASE_FRAMES
        : phase === "deals"
          ? DEALS_SCENE_DURATION
          : 1;

  const warpIn = interpolate(appLocal, [0, WARP_DURATION], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EXPO_OUT,
  });

  const pillCenterY = height * 0.34 + 70 + 28 + PILL_HEIGHT / 2;
  const phoneCenterY = height / 2;
  const startTranslateY = pillCenterY - phoneCenterY;
  const startScale = PILL_FULL_WIDTH / PHONE_W;

  const warpPhoneOpacity = interpolate(warpIn, [0, 0.35, 1], [0, 0.85, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EXPO_OUT,
  });
  const warpPhoneScale = interpolate(warpIn, [0, 1], [startScale, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EXPO_OUT,
  });
  const warpPhoneTranslateY = interpolate(warpIn, [0, 1], [startTranslateY, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EXPO_OUT,
  });
  const onboardCalloutFade = interpolate(warpIn, [0.55, 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EXPO_OUT,
  });

  const slideIn = spring({
    frame: panelLocal,
    fps,
    config: SPRING,
  });
  const entryY = interpolate(slideIn, [0, 1], [SCENE_ENTRY_DISTANCE, 0]);

  const slideOut = spring({
    frame: dashLocal - DASHBOARD_EXIT_START,
    fps,
    config: SPRING,
  });
  const exitY =
    phase === "dashboard" && dashLocal >= DASHBOARD_EXIT_START
      ? interpolate(slideOut, [0, 1], [0, DASHBOARD_EXIT_DISTANCE])
      : 0;

  const exitOpacity =
    phase === "dashboard" && dashLocal >= DASHBOARD_EXIT_START
      ? interpolate(
          dashLocal,
          [DASHBOARD_EXIT_START, DASHBOARD_EXIT_START + SCENE_EXIT_DURATION],
          [1, 0],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
        )
      : 1;

  const syllabusSlideOut = spring({
    frame: syllabusLocal - SYLLABUS_EXIT_START,
    fps,
    config: SPRING,
  });
  const syllabusExitY =
    phase === "syllabus" && syllabusLocal >= SYLLABUS_EXIT_START
      ? interpolate(syllabusSlideOut, [0, 1], [0, DASHBOARD_EXIT_DISTANCE])
      : 0;
  const syllabusExitOpacity =
    phase === "syllabus" && syllabusLocal >= SYLLABUS_EXIT_START
      ? interpolate(
          syllabusLocal,
          [SYLLABUS_EXIT_START, SYLLABUS_EXIT_START + SCENE_EXIT_DURATION],
          [1, 0],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
        )
      : 1;
  const syllabusHeroFade = interpolate(
    syllabusLocal,
    [SYLLABUS_EXIT_START, SYLLABUS_EXIT_START + SCENE_HERO_FADE],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const rotateY = isStackedPanel
    ? interpolate(
        panelLocal,
        [0, panelSceneLength],
        [DASHBOARD_ROTATE_Y_START, DASHBOARD_ROTATE_Y_END],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
      )
    : 0;
  const panelScale = isStackedPanel
    ? interpolate(
        panelLocal,
        [0, panelSceneLength],
        [DASHBOARD_SCALE_START, DASHBOARD_SCALE_END],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
      )
    : 1;

  const scrollT = interpolate(
    dashLocal,
    [DASHBOARD_SCROLL_START, DASHBOARD_SCROLL_START + DASHBOARD_SCROLL_DURATION],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const contentScrollY = -scrollT * DASHBOARD_SCROLL_DISTANCE;

  const heroFadeOut = interpolate(
    dashLocal,
    [DASHBOARD_EXIT_START, DASHBOARD_EXIT_START + SCENE_HERO_FADE],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const phoneOpacity = isStackedPanel ? 1 : warpPhoneOpacity;
  const phoneScale = isStackedPanel ? panelScale : warpPhoneScale;
  const phoneTranslateY = isStackedPanel
    ? entryY +
      (phase === "dashboard" ? exitY : 0) +
      (phase === "syllabus" ? syllabusExitY : 0)
    : warpPhoneTranslateY;

  const panel3dTransform = `rotateX(${PHONE_ROTATE_X}deg) rotateY(${rotateY}deg) scale(${phoneScale})`;

  const tapProgress =
    phase === "onboarding" &&
    !onboard.inTransition &&
    appLocal >= WARP_DURATION * 0.5
      ? interpolate(
          onboard.stepLocal,
          [
            onboard.step.tapAt - 1,
            onboard.step.tapAt,
            onboard.step.tapAt + 10,
          ],
          [0, 1, 0],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
        )
      : 0;

  return (
    <AbsoluteFill
      style={{ pointerEvents: "none", background: BG, overflow: "hidden" }}
    >
      {phase === "deals" ? (
        <SceneDealsSplit dealsLocal={dealsLocal} />
      ) : phase === "save-thousands" ? (
        <SceneSaveThousands saveLocal={saveLocal} />
      ) : phase === "aid" ? (
        <SceneAidPhone aidLocal={aidLocal} />
      ) : phase === "school-savings" ? (
        <SceneSchoolSavings schoolLocal={schoolLocal} />
      ) : phase === "make-goals" ? (
        <SceneTextSwipe
          local={makeGoalsLocal}
          text={MAKE_GOALS_TEXT}
          swipeIn={TEXT_SWIPE_IN}
          hold={TEXT_SWIPE_HOLD}
          swipeOut={TEXT_SWIPE_OUT}
          duration={TEXT_SWIPE_DURATION}
          fontSize={120}
        />
      ) : phase === "goals-demo" ? (
        <SceneGoalsDemo goalsLocal={goalsLocal} />
      ) : phase === "purchase-plans" ? (
        <SceneTextTypewriter
          local={purchasePlansLocal}
          text={PURCHASE_PLANS_TEXT}
          duration={PURCHASE_PLANS_DURATION}
        />
      ) : phase === "check-demo" ? (
        <SceneCheckDemo checkLocal={checkLocal} />
      ) : phase === "student-mission" ? (
        <SceneStudentMission missionLocal={studentLocal} />
      ) : phase === "voice-log" ? (
        <SceneVoiceLog voiceLocal={voiceLocal} />
      ) : phase === "ending" ? (
        <SceneEnding endingLocal={endingLocal} />
      ) : (
      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: isStackedPanel ? "column" : undefined,
          alignItems: "center",
          justifyContent: isStackedPanel ? "flex-start" : "center",
          paddingTop: isStackedPanel ? 40 : undefined,
          perspective: isStackedPanel ? 1000 : 1800,
          overflow: "hidden",
          translate: isStackedPanel
            ? `0 ${phoneTranslateY + DASHBOARD_LAYOUT_OFFSET_Y}px`
            : undefined,
        }}
      >
        {phase === "dashboard" && (
          <>
            <SceneHeroText
              local={dashLocal}
              text={DASHBOARD_HERO_TEXT}
              start={DASHBOARD_HERO_START}
              rise={DASHBOARD_HERO_RISE}
              opacity={heroFadeOut}
            />
            <div
              style={{
                transform: panel3dTransform,
                transformStyle: "preserve-3d",
                opacity: phoneOpacity * exitOpacity,
              }}
            >
              <DashboardPanel
                contentWidth={DASHBOARD_CONTENT_W}
                viewportHeight={DASHBOARD_VIEWPORT_H}
                scale={DASHBOARD_DISPLAY_SCALE}
                width={DASHBOARD_PANEL_W}
                height={DASHBOARD_PANEL_H}
              >
                <div
                  style={{
                    position: "relative",
                    width: DASHBOARD_CONTENT_W,
                    height: DASHBOARD_VIEWPORT_H,
                    overflow: "hidden",
                  }}
                >
                  <DashboardPhoneContent
                    dashLocal={dashLocal}
                    contentScrollY={contentScrollY}
                    viewportHeight={DASHBOARD_VIEWPORT_H}
                  />
                </div>
              </DashboardPanel>
            </div>
          </>
        )}
        {phase === "syllabus" && (
          <>
            <SceneHeroText
              local={syllabusLocal}
              text={SYLLABUS_HERO_TEXT}
              start={18}
              rise={24}
              opacity={syllabusHeroFade}
            />
            <div
              style={{
                transform: panel3dTransform,
                transformStyle: "preserve-3d",
                opacity: phoneOpacity * syllabusExitOpacity,
              }}
            >
              <DashboardPanel
                contentWidth={DASHBOARD_CONTENT_W}
                viewportHeight={DASHBOARD_VIEWPORT_H}
                scale={DASHBOARD_DISPLAY_SCALE}
                width={DASHBOARD_PANEL_W}
                height={DASHBOARD_PANEL_H}
              >
                <div
                  style={{
                    position: "relative",
                    width: DASHBOARD_CONTENT_W,
                    height: DASHBOARD_VIEWPORT_H,
                    overflow: "hidden",
                  }}
                >
                  <SyllabusPanelContent syllabusLocal={syllabusLocal} />
                </div>
              </DashboardPanel>
            </div>
          </>
        )}
        {phase !== "dashboard" && phase !== "syllabus" && (
          <div
            style={{
              position: "relative",
              opacity: phoneOpacity,
              scale: phoneScale,
              translate: `0 ${phoneTranslateY}px`,
            }}
          >
            <PhoneMockup>
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  height: "100%",
                }}
              >
                <OnboardingPhoneContent
                  onboard={
                    phase === "onboard-hold"
                      ? {
                          ...onboard,
                          step: lastBudgetStep,
                          stepLocal: lastBudgetStep.duration - 1,
                          inTransition: false,
                        }
                      : onboard
                  }
                  tapProgress={tapProgress}
                />
              </div>
            </PhoneMockup>

            <div
              style={{
                position: "absolute",
                left: PHONE_W + GROUP_GAP,
                top: "50%",
                translate: "0 -50%",
                width: CALLOUT_W,
                minHeight: 120,
                opacity: onboardCalloutFade,
              }}
            >
              <OnboardCallout
                onboard={
                  phase === "onboard-hold"
                    ? {
                        ...onboard,
                        step: lastBudgetStep,
                        stepLocal: lastBudgetStep.duration - 1,
                        inTransition: false,
                      }
                    : onboard
                }
                calloutFade={1}
              />
            </div>
          </div>
        )}
      </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
