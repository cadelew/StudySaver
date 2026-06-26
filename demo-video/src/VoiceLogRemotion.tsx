import { useCurrentFrame } from "remotion";
import { DEMO_SNAPSHOT } from "../../lib/demo-data";
import { formatCurrency, pct } from "../../lib/utils";
import { Badge } from "../../components/ui/badge";
import { Card } from "../../components/ui/card";
import { Progress } from "../../components/ui/progress";
import { CategoryIcon } from "../../components/budget/CategoryIcon";
import { IconLightbulb } from "../../components/ui/icons";

export type VoiceLogFlowState =
  | "idle"
  | "recording"
  | "processing"
  | "confirm"
  | "done";

const DEMO_PARSED = {
  amount: 14,
  merchant: "Chipotle",
  category: "Eating Out",
  confidence: 0.94,
  transcript: "$14 at Chipotle",
};

function PageHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-3 px-4 pt-14 pb-4">
      <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
        <svg
          className="w-4 h-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </div>
      <h1 className="font-semibold text-base text-foreground">{title}</h1>
    </div>
  );
}

const VoiceMicUI: React.FC<{
  flowState: VoiceLogFlowState;
  micPressed?: boolean;
}> = ({ flowState, micPressed = false }) => {
  const frame = useCurrentFrame();
  const isRecording = flowState === "recording";
  const isProcessing = flowState === "processing";

  const bars = Array.from({ length: 20 }, (_, i) => {
    if (!isRecording) return 0.28;
    return 0.25 + 0.75 * Math.abs(Math.sin((frame + i * 3) / 5));
  });

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex items-center gap-1 h-16 w-full max-w-xs">
        {bars.map((height, i) => (
          <div
            key={i}
            className={`flex-1 rounded-full ${isRecording ? "bg-primary-600" : "bg-gray-200"}`}
            style={{ height: `${height * 100}%` }}
          />
        ))}
      </div>

      <div className="min-h-[48px] text-center">
        {flowState === "idle" && (
          <p className="text-muted-foreground text-sm">Tap to log an expense by voice</p>
        )}
        {isRecording && (
          <p className="text-primary-700 font-medium text-sm">Listening...</p>
        )}
        {isProcessing && (
          <p className="text-muted-foreground text-sm">Transcribing...</p>
        )}
      </div>

      <div className="relative">
        {isRecording && (
          <span
            className="absolute inset-0 rounded-full bg-primary-600/25"
            style={{ scale: 1 + 0.08 * Math.sin(frame / 4) }}
          />
        )}
        <div
          className={`relative w-24 h-24 rounded-full flex items-center justify-center shadow-fab ${
            isRecording || micPressed
              ? "bg-red-500 scale-110"
              : isProcessing
                ? "bg-muted"
                : "bg-primary-600"
          }`}
        >
          {isProcessing ? (
            <div
              className="w-8 h-8 rounded-full border-3 border-primary-600 border-t-transparent"
              style={{ rotate: `${(frame * 12) % 360}deg`, borderWidth: 3 }}
            />
          ) : (
            <svg
              className="w-8 h-8 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
              />
            </svg>
          )}
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        {isRecording ? "Release to stop" : isProcessing ? "Processing..." : "Hold to speak"}
      </p>
    </div>
  );
};

export const VoiceLogRemotion: React.FC<{
  flowState: VoiceLogFlowState;
  micPressed?: boolean;
}> = ({ flowState, micPressed }) => {
  const cat = DEMO_SNAPSHOT.categories.find((c) => c.name === DEMO_PARSED.category);
  const spent = (cat?.spent ?? 0) + DEMO_PARSED.amount;
  const limit = cat?.monthly_limit ?? 120;
  const progressPct = pct(spent, limit);

  if (flowState === "done") {
    return (
      <div className="min-h-full bg-background">
        <PageHeader title="Expense Logged" />
        <div className="flex flex-col items-center px-5 py-6 gap-6">
          <div className="w-20 h-20 rounded-full bg-success-50 flex items-center justify-center">
            <svg
              className="w-10 h-10 text-success"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <Card className="w-full text-center">
            <p className="text-3xl font-display font-bold text-foreground">
              -{formatCurrency(DEMO_PARSED.amount)}
            </p>
            <p className="text-lg font-semibold text-foreground mt-1">{DEMO_PARSED.merchant}</p>
            <Badge variant="default" className="mt-2">
              {DEMO_PARSED.category}
            </Badge>
            {cat && (
              <div className="mt-4">
                <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                  <span>{cat.name}</span>
                  <span>
                    {formatCurrency(spent)} / {formatCurrency(limit)}
                  </span>
                </div>
                <Progress value={progressPct} color={cat.color} />
              </div>
            )}
          </Card>

          <div className="bg-primary-50 border border-primary-100 rounded-2xl px-4 py-3 w-full">
            <div className="flex gap-2">
              <span className="flex-shrink-0 text-primary-600">
                <IconLightbulb />
              </span>
              <p className="text-sm text-foreground">
                {formatCurrency(limit - spent)} left in {DEMO_PARSED.category} this month.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (flowState === "confirm") {
    return (
      <div className="min-h-full bg-background">
        <PageHeader title="Confirm Expense" />
        <div className="flex flex-col px-5 pt-6 pb-6 gap-4">
          <p className="text-sm text-muted-foreground text-center">Does this look right?</p>

          <Card className="text-center">
            <p className="text-4xl font-display font-bold text-foreground">
              {formatCurrency(DEMO_PARSED.amount)}
            </p>
            <p className="text-lg font-semibold mt-1">{DEMO_PARSED.merchant}</p>
            <div className="flex items-center justify-center gap-2 mt-2">
              <Badge variant="default">{DEMO_PARSED.category}</Badge>
              {cat && <CategoryIcon category={cat.name} size={28} />}
            </div>
            <div className="mt-1">
              <Badge variant="success">
                {Math.round(DEMO_PARSED.confidence * 100)}% confident
              </Badge>
            </div>
          </Card>

          <div
            className="w-full h-14 text-base font-bold inline-flex items-center justify-center rounded-full bg-primary-600 text-primary-foreground shadow-fab"
          >
            Confirm and log {formatCurrency(DEMO_PARSED.amount)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-background">
      <PageHeader title="Log Expense" />
      <div className="flex flex-col items-center px-5 py-8 gap-8">
        <div className="text-center">
          <h1 className="font-display text-2xl font-bold text-foreground">What did you spend?</h1>
          <p className="text-muted-foreground text-sm mt-1">Hold the mic and say it naturally.</p>
        </div>

        <VoiceMicUI flowState={flowState} micPressed={micPressed} />

        <div className="w-full">
          <p className="text-xs text-muted-foreground text-center mb-3">Try saying...</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {['"$14 at Chipotle"', '"$6.75 coffee"', '"$32 groceries"'].map((ex) => (
              <span
                key={ex}
                className="text-xs bg-muted rounded-full px-3 py-1.5 text-foreground"
              >
                {ex}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
