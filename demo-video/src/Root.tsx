import "./index.css";
import { Composition } from "remotion";
import { MyComposition } from "./Composition";
import { TOTAL_DURATION } from "./demo-constants";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="MyComp"
        component={MyComposition}
        durationInFrames={TOTAL_DURATION}
        fps={30}
        width={1280}
        height={720}
      />
    </>
  );
};
