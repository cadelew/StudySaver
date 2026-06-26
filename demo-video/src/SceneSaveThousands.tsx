import {
  SAVE_HOLD,
  SAVE_SWIPE_IN,
  SAVE_SWIPE_OUT,
  SAVE_THOUSANDS_DURATION,
  SAVE_THOUSANDS_TEXT,
} from "./demo-constants";
import { SceneTextSwipe } from "./SceneTextSwipe";

export const SceneSaveThousands: React.FC<{ saveLocal: number }> = ({ saveLocal }) => (
  <SceneTextSwipe
    local={saveLocal}
    text={SAVE_THOUSANDS_TEXT}
    swipeIn={SAVE_SWIPE_IN}
    hold={SAVE_HOLD}
    swipeOut={SAVE_SWIPE_OUT}
    duration={SAVE_THOUSANDS_DURATION}
  />
);
