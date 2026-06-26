import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useVideoConfig,
} from "remotion";
import {
  AID_EXIT_START,
  AID_FILE_PICKER_END,
  AID_FILE_PICKER_START,
  AID_HERO_RISE,
  AID_HERO_START,
  AID_HERO_TEXT,
  AID_OFFER_VISIBLE,
  AID_PARSING_END,
  AID_PHONE_H,
  AID_PHONE_W,
  AID_SCRIPT_SCROLL_DISTANCE,
  AID_SCRIPT_SCROLL_DURATION,
  AID_SCRIPT_SCROLL_START,
  AID_SCRIPT_START,
  AID_TAP_ADD,
  AID_TAP_GENERATE,
  AID_TAP_UPLOAD,
  BG,
  GREEN,
  SCENE_ENTRY_DISTANCE,
  SCENE_EXIT_DURATION,
  SCENE_TRANSITION_SPRING,
} from "./demo-constants";
import { FilePickerMock } from "./FilePickerMock";
import { NegotiateRemotion, type NegotiateFlowState } from "./NegotiateRemotion";
import { PhoneMockup, TapCursor } from "./onboarding-mockups";

const EXPO_OUT = Easing.bezier(0.22, 1, 0.36, 1);
const SPRING = SCENE_TRANSITION_SPRING;

function getNegotiateFlowState(aidLocal: number): NegotiateFlowState {
  if (aidLocal >= AID_FILE_PICKER_START && aidLocal < AID_FILE_PICKER_END) {
    return "file-picker";
  }
  if (aidLocal >= AID_FILE_PICKER_END && aidLocal < AID_PARSING_END) {
    return "parsing";
  }
  if (aidLocal >= AID_PARSING_END && aidLocal < AID_OFFER_VISIBLE) {
    return "form-filled";
  }
  if (aidLocal >= AID_OFFER_VISIBLE && aidLocal < AID_TAP_GENERATE) {
    return "offer-added";
  }
  if (aidLocal >= AID_TAP_GENERATE && aidLocal < AID_SCRIPT_START) {
    return "generating";
  }
  if (aidLocal >= AID_SCRIPT_START) {
    return "script";
  }
  return "initial";
}

export const SceneAidPhone: React.FC<{ aidLocal: number }> = ({ aidLocal }) => {
  const { fps } = useVideoConfig();

  const slideIn = spring({
    frame: aidLocal,
    fps,
    config: SPRING,
  });
  const entryY = interpolate(slideIn, [0, 1], [SCENE_ENTRY_DISTANCE, 0]);
  const panelOpacity = interpolate(aidLocal, [0, 14], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const slideOut = spring({
    frame: aidLocal - AID_EXIT_START,
    fps,
    config: SPRING,
  });
  const exitY =
    aidLocal >= AID_EXIT_START
      ? interpolate(slideOut, [0, 1], [0, 960])
      : 0;
  const exitOpacity =
    aidLocal >= AID_EXIT_START
      ? interpolate(
          aidLocal,
          [AID_EXIT_START, AID_EXIT_START + SCENE_EXIT_DURATION],
          [1, 0],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
        )
      : 1;

  const heroT = interpolate(
    aidLocal,
    [AID_HERO_START, AID_HERO_START + AID_HERO_RISE],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: EXPO_OUT,
    },
  );
  const heroFade = interpolate(
    aidLocal,
    [AID_EXIT_START, AID_EXIT_START + 8],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const flowState = getNegotiateFlowState(aidLocal);
  const filePickerProgress = interpolate(
    aidLocal,
    [AID_FILE_PICKER_START, AID_FILE_PICKER_START + 8],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EXPO_OUT },
  );

  const uploadTap = interpolate(
    aidLocal,
    [AID_TAP_UPLOAD - 1, AID_TAP_UPLOAD, AID_TAP_UPLOAD + 10],
    [0, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const addTap = interpolate(
    aidLocal,
    [AID_TAP_ADD - 1, AID_TAP_ADD, AID_TAP_ADD + 10],
    [0, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const generateTap = interpolate(
    aidLocal,
    [AID_TAP_GENERATE - 1, AID_TAP_GENERATE, AID_TAP_GENERATE + 10],
    [0, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const scriptScrollT = interpolate(
    aidLocal,
    [AID_SCRIPT_SCROLL_START, AID_SCRIPT_SCROLL_START + AID_SCRIPT_SCROLL_DURATION],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const scriptScrollY =
    aidLocal >= AID_SCRIPT_START ? -scriptScrollT * AID_SCRIPT_SCROLL_DISTANCE : 0;

  const showFilePicker = flowState === "file-picker";

  return (
    <AbsoluteFill style={{ background: BG, overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
          paddingTop: 36,
          translate: `0 ${entryY + exitY}px`,
        }}
      >
        <div
          style={{
            textAlign: "center",
            opacity: heroT * heroFade,
            pointerEvents: "none",
            marginBottom: 24,
          }}
        >
          <p
            className="font-display font-bold leading-tight tracking-tight"
            style={{ fontSize: 44, letterSpacing: -1, color: GREEN }}
          >
            {AID_HERO_TEXT}
          </p>
        </div>

        <div
          style={{
            position: "relative",
            opacity: panelOpacity * exitOpacity,
          }}
        >
          <PhoneMockup width={AID_PHONE_W} height={AID_PHONE_H} clipContent={false}>
            <div
              style={{
                position: "relative",
                width: AID_PHONE_W,
                height: AID_PHONE_H,
                overflow: "hidden",
              }}
            >
              <div style={{ translate: `0 ${scriptScrollY}px` }}>
                <NegotiateRemotion flowState={flowState} />
              </div>
              <TapCursor x={AID_PHONE_W * 0.5} y={390} tapProgress={uploadTap} />
              <TapCursor x={AID_PHONE_W * 0.5} y={560} tapProgress={addTap} />
              <TapCursor x={AID_PHONE_W * 0.5} y={AID_PHONE_H - 72} tapProgress={generateTap} />
            </div>
          </PhoneMockup>

          {showFilePicker && (
            <div
              style={{
                position: "absolute",
                left: "50%",
                top: "46%",
                translate: "-50% -50%",
                width: AID_PHONE_W * 1.42,
                zIndex: 50,
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: -AID_PHONE_H * 0.55,
                  background: "rgba(0,0,0,0.22)",
                  borderRadius: 24,
                  opacity: filePickerProgress,
                }}
              />
              <FilePickerMock
                floating
                openProgress={filePickerProgress}
                files={[
                  { name: "Stanford_AidLetter_Fall2026.pdf", size: "612 KB", kind: "PDF" },
                  { name: "Berkeley_AidPackage.pdf", size: "540 KB", kind: "PDF" },
                  { name: "FAFSA_Summary.pdf", size: "288 KB", kind: "PDF" },
                ]}
                selectedIndex={0}
              />
            </div>
          )}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
