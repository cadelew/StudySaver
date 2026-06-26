export const BG = "#DEDCD3";
export const GREEN = "#1A4331";
export const APP_BG = "#F8F7F2";
export const MUTED = "#EEEDE6";
export const MUTED_FG = "#5B6660";
export const PRIMARY_50 = "#EEF3EF";
export const ACCENT = "#DDBA76";

export const SS_START = 108;
export const SS_SWIPE_DURATION = 24;
export const SS_SHRINK_DURATION = 10;
export const SS_MOVE_DURATION = 14;

export const SCENE2_SETTLE_END =
  SS_START + SS_SWIPE_DURATION + SS_SHRINK_DURATION + SS_MOVE_DURATION;

export const PAUSE_DURATION = 36;
export const CLICK_START = SCENE2_SETTLE_END + PAUSE_DURATION;
export const CLICK_DURATION = 14;
export const WARP_START = CLICK_START + CLICK_DURATION;
export const WARP_DURATION = 42;

export const PILL_HEIGHT = 54;
export const PILL_FULL_WIDTH = 520;
// Onboarding begins as the warp starts — phone and welcome crossfade in together
export const APP_SCENE_START = WARP_START;

export const SCREEN_W = 296;
export const SCREEN_H = 612;

export const STEP_TRANSITION = 14;

export const ONBOARD_SEQUENCE = [
  { id: "welcome" as const, duration: 100, tapAt: 84, tapX: 0.5, tapY: 0.845 },
  { id: "name" as const, duration: 84, tapAt: 66, tapX: 0.72, tapY: 0.905 },
  { id: "year" as const, duration: 86, tapAt: 68, tapX: 0.72, tapY: 0.905 },
  { id: "school" as const, duration: 86, tapAt: 68, tapX: 0.72, tapY: 0.905 },
  { id: "budget" as const, duration: 88, tapAt: 70, tapX: 0.72, tapY: 0.905 },
];

export const ONBOARDING_TOTAL_FRAMES = ONBOARD_SEQUENCE.reduce(
  (sum, step, i) =>
    sum + step.duration + (i < ONBOARD_SEQUENCE.length - 1 ? STEP_TRANSITION : 0),
  0,
);

export const ONBOARD_END_HOLD = 14;
export const DASHBOARD_SLIDE_DURATION = 24;
export const DASHBOARD_LIFT_DURATION = 36;
export const DASHBOARD_TRANSITION =
  DASHBOARD_SLIDE_DURATION + DASHBOARD_LIFT_DURATION;
export const DASHBOARD_SCROLL_START = 32;
export const DASHBOARD_SCROLL_DURATION = 40;
export const DASHBOARD_SCROLL_HOLD = 4;
export const SCENE_EXIT_DURATION = 16;
export const SCENE_EXIT_HOLD = 4;
export const SCENE_ENTRY_DISTANCE = 440;
export const SCENE_HERO_FADE = 8;
export const SCENE_TRANSITION_SPRING = { damping: 200, stiffness: 165 };
export const DASHBOARD_EXIT_START =
  DASHBOARD_SCROLL_START + DASHBOARD_SCROLL_DURATION + DASHBOARD_SCROLL_HOLD;
export const DASHBOARD_EXIT_DISTANCE = 960;
export const DASHBOARD_ENTRY_DISTANCE = SCENE_ENTRY_DISTANCE;
export const DASHBOARD_PHASE_FRAMES =
  DASHBOARD_EXIT_START + SCENE_EXIT_DURATION + 2;

export const DASHBOARD_SCENE_START =
  APP_SCENE_START + ONBOARDING_TOTAL_FRAMES + ONBOARD_END_HOLD;

/** Skills-style 3D (see remotion skills announcement) */
export const PHONE_ROTATE_X = 20;
/** Wider logical width so dashboard cards match the web layout (single-line stats). */
export const DASHBOARD_CONTENT_W = 560;
export const DASHBOARD_VIEWPORT_H = 500;
export const DASHBOARD_DISPLAY_SCALE = 1.32;
export const DASHBOARD_PANEL_W = Math.round(
  DASHBOARD_CONTENT_W * DASHBOARD_DISPLAY_SCALE,
);
export const DASHBOARD_PANEL_H = Math.round(
  DASHBOARD_VIEWPORT_H * DASHBOARD_DISPLAY_SCALE,
);
export const DASHBOARD_ROTATE_Y_START = 10;
export const DASHBOARD_ROTATE_Y_END = -10;
export const DASHBOARD_SCALE_START = 0.92;
export const DASHBOARD_SCALE_END = 1;
export const DASHBOARD_SCROLL_DISTANCE = 920;
/** Push dashboard block down so the panel bottom clips off-frame. */
export const DASHBOARD_LAYOUT_OFFSET_Y = 36;

export const DASHBOARD_HERO_TEXT = "All your tools in one dashboard";
export const DASHBOARD_HERO_START = 18;
export const DASHBOARD_HERO_RISE = 28;

export const SYLLABUS_HERO_TEXT = "Stop overpaying for textbooks";
export const SYLLABUS_SCENE_DURATION = 230;
export const SYLLABUS_TAP_UPLOAD = 26;
export const SYLLABUS_FILE_PICKER_START = 38;
export const SYLLABUS_FILE_PICKER_END = 74;
export const SYLLABUS_TAP_ANALYZE = 92;
export const SYLLABUS_EXTRACTING_START = 106;
export const SYLLABUS_RESULTS_START = 148;
export const SYLLABUS_RESULTS_SCROLL_START = 162;
export const SYLLABUS_RESULTS_SCROLL_DURATION = 44;
export const SYLLABUS_RESULTS_SCROLL_DISTANCE = 680;
export const SYLLABUS_EXIT_START =
  SYLLABUS_RESULTS_SCROLL_START +
  SYLLABUS_RESULTS_SCROLL_DURATION +
  SCENE_EXIT_HOLD;
export const SYLLABUS_PHASE_FRAMES =
  SYLLABUS_EXIT_START + SCENE_EXIT_DURATION + 2;

export const DEALS_SCENE_DURATION = 100;
export const DEALS_TEXT_START = 8;
export const DEALS_TEXT_RISE = 16;
export const DEALS_PANEL_ROTATE_X = 16;
/** Slightly smaller than full-size onboarding phone in the split layout. */
export const DEALS_PHONE_SCALE = 0.96;
export const DEALS_TEXT_W = 300;
export const DEALS_TEXT_SIZE = 42;
export const DEALS_SIDE_GAP = 40;
export const DEALS_PHASE_FRAMES = DEALS_SCENE_DURATION;

export const AID_HERO_TEXT = "Negotiate your financial aid";
/** Wider phone for aid negotiation — file picker overlays beyond the bezel. */
export const AID_PHONE_W = 340;
export const AID_PHONE_H = 640;
export const AID_HERO_START = 12;
export const AID_HERO_RISE = 20;
export const AID_TAP_UPLOAD = 22;
export const AID_FILE_PICKER_START = 32;
export const AID_FILE_PICKER_END = 62;
export const AID_PARSING_END = 76;
export const AID_TAP_ADD = 86;
export const AID_OFFER_VISIBLE = 94;
export const AID_TAP_GENERATE = 108;
export const AID_GENERATING_END = 128;
export const AID_SCRIPT_START = 128;
export const AID_SCRIPT_SCROLL_START = 138;
export const AID_SCRIPT_SCROLL_DURATION = 28;
export const AID_SCRIPT_SCROLL_DISTANCE = 340;
export const AID_EXIT_START =
  AID_SCRIPT_SCROLL_START + AID_SCRIPT_SCROLL_DURATION + SCENE_EXIT_HOLD;
export const AID_PHASE_FRAMES = AID_EXIT_START + SCENE_EXIT_DURATION + 2;

export const SAVE_THOUSANDS_TEXT = "Save thousands";
export const SAVE_SWIPE_IN = 10;
export const SAVE_HOLD = 26;
export const SAVE_SWIPE_OUT = 10;
export const SAVE_THOUSANDS_DURATION =
  SAVE_SWIPE_IN + SAVE_HOLD + SAVE_SWIPE_OUT + 4;

export const SCHOOL_SAVINGS_TEXT = "Save money at your school";
export const SCHOOL_SAVINGS_DURATION = 100;
export const SCHOOL_TEXT_START = 12;
export const SCHOOL_TEXT_RISE = 18;
export const SCHOOL_LEFT_START = 4;
export const SCHOOL_RIGHT_START = 8;
export const SCHOOL_ENTRY_DISTANCE = 420;
export const SCHOOL_PHONE_SCALE = 0.78;
export const SCHOOL_SIDE_GAP = 28;
export const SCHOOL_TEXT_W = 220;

export const TEXT_SWIPE_IN = 10;
export const TEXT_SWIPE_HOLD = 18;
export const TEXT_SWIPE_OUT = 10;
export const TEXT_SWIPE_DURATION = TEXT_SWIPE_IN + TEXT_SWIPE_HOLD + TEXT_SWIPE_OUT + 4;

export const MAKE_GOALS_TEXT = "Make goals";

export const GOALS_TAP_NEW = 22;
export const GOALS_SHEET_START = 34;
export const GOALS_TYPE_END = 64;
export const GOALS_TAP_BUILD = 72;
export const GOALS_LOADING_END = 88;
export const GOALS_PLAN_START = 88;
export const GOALS_TAP_ADD = 116;
export const GOALS_DASHBOARD_START = 132;
export const GOALS_PHASE_FRAMES = 172;
export const GOALS_TRANSITION_SPRING = { damping: 220, stiffness: 110 };

export const PURCHASE_PLANS_TEXT = "Talk through your purchase plans";
export const PURCHASE_PLANS_DURATION = 58;

export const CHECK_HERO_TEXT = "Make smart financial decisions";
export const CHECK_HERO_SUBTEXT = "Check purchases against your budget and goals";
export const CHECK_PHONE_W = 328;
export const CHECK_PHONE_H = 640;
export const CHECK_HERO_START = 14;
export const CHECK_HERO_RISE = 22;
export const CHECK_TAP_QUICK = 28;
export const CHECK_LOADING_END = 50;
export const CHECK_RESULT_START = 50;
export const CHECK_PHASE_FRAMES = 148;
export const CHECK_TRANSITION_SPRING = { damping: 220, stiffness: 115 };

export const STUDENT_MISSION_TOP = "Made by a student";
export const STUDENT_MISSION_LEFT = "for students";
export const STUDENT_TOP_START = 0;
export const STUDENT_LEFT_START = 22;
export const STUDENT_MISSION_DURATION = 88;
export const STUDENT_TRANSITION_SPRING = { damping: 200, stiffness: 95 };

export const ENDING_BRAND = "StudySaver";
export const ENDING_THANKS = "Thank you to YouthCodeFoundation";
export const ENDING_DURATION = 130;
export const ENDING_TITLE_START = 10;
export const ENDING_THANKS_START = 36;

export const VOICE_HERO_TEXT = "Skip manual expense logging";
export const VOICE_HERO_SUBTEXT = "Quick voice actions — just say what you spent";
export const VOICE_HERO_START = 12;
export const VOICE_HERO_RISE = 20;
export const VOICE_TAP_MIC = 26;
export const VOICE_RECORDING_END = 52;
export const VOICE_PROCESSING_END = 60;
export const VOICE_CONFIRM_START = 60;
export const VOICE_TAP_CONFIRM = 84;
export const VOICE_DONE_START = 94;
export const VOICE_PHASE_FRAMES = 148;

export const TOTAL_DURATION =
  DASHBOARD_SCENE_START +
  DASHBOARD_PHASE_FRAMES +
  SYLLABUS_PHASE_FRAMES +
  DEALS_PHASE_FRAMES +
  SAVE_THOUSANDS_DURATION +
  AID_PHASE_FRAMES +
  SCHOOL_SAVINGS_DURATION +
  TEXT_SWIPE_DURATION +
  GOALS_PHASE_FRAMES +
  PURCHASE_PLANS_DURATION +
  CHECK_PHASE_FRAMES +
  STUDENT_MISSION_DURATION +
  VOICE_PHASE_FRAMES +
  ENDING_DURATION;
