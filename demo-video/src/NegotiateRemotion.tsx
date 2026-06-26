import { useCurrentFrame } from "remotion";
import { DEMO_SNAPSHOT } from "../../lib/demo-data";
import { Input } from "./components/ui/input";
import { IconDocument, IconUpload } from "../../components/ui/icons";

export type NegotiateFlowState =
  | "initial"
  | "file-picker"
  | "parsing"
  | "form-filled"
  | "offer-added"
  | "generating"
  | "script";

const DEMO_SCRIPT = `Subject: Request for Financial Aid Review — UC Berkeley

Dear Financial Aid Office,

Thank you for my admission to UC Berkeley. I am thrilled at the opportunity to attend, but I am writing to respectfully request a review of my financial aid package.

I have received a competing offer from Stanford University with $18,000 in grant aid, bringing my estimated annual cost to $40,000. Given my strong interest in Berkeley, I wanted to share this information in case there is any flexibility to improve my aid package.

I would greatly appreciate your consideration. Thank you for your time.

Sincerely,
Maya`;

const SpinnerRing: React.FC<{ color: string; size?: number }> = ({
  color,
  size = 20,
}) => {
  const frame = useCurrentFrame();
  const rotation = (frame * 12) % 360;
  return (
    <div
      className="rounded-full border-2 border-t-transparent"
      style={{
        width: size,
        height: size,
        borderColor: color,
        borderTopColor: "transparent",
        rotate: `${rotation}deg`,
      }}
    />
  );
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
      <h1 className="font-semibold text-base text-foreground line-clamp-1">{title}</h1>
    </div>
  );
}

export const NegotiateRemotion: React.FC<{
  flowState: NegotiateFlowState;
}> = ({ flowState }) => {
  const primarySchool = DEMO_SNAPSHOT.user.school;
  const showParsedFields =
    flowState === "form-filled" ||
    flowState === "offer-added" ||
    flowState === "generating" ||
    flowState === "script";
  const showOfferCard =
    flowState === "offer-added" ||
    flowState === "generating" ||
    flowState === "script";
  const showScript = flowState === "script";
  const parsing = flowState === "parsing";
  const generating = flowState === "generating";
  const letterFileName =
    flowState === "file-picker" ||
    parsing ||
    showParsedFields ||
    showOfferCard ||
    showScript
      ? "Stanford_AidLetter_Fall2026.pdf"
      : "";

  return (
    <div className="relative min-h-full bg-background">
      <PageHeader title="Aid Negotiation" />

      <div className="px-4 pb-32 space-y-5">
        <div className="bg-primary-50 border border-primary-100 rounded-2xl p-4">
          <p className="text-sm text-primary-700 leading-relaxed">
            Got accepted to multiple schools? You can often negotiate a better financial aid
            package from your top choice by showing them competing offers. We&apos;ll write the
            script for you.
          </p>
        </div>

        <section className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Your top-choice school
          </p>
          <Input placeholder="e.g. UCLA" value={primarySchool} readOnly />
        </section>

        <section className="space-y-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Competing offers
          </p>

          {showOfferCard ? (
            <div className="bg-card border border-border/60 rounded-2xl px-4 py-3">
              <p className="text-sm font-semibold text-foreground">Stanford University</p>
              <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-0.5">
                <p className="text-xs text-muted-foreground">Est. cost: $58,000/yr</p>
                <p className="text-xs text-primary-700">Aid: $18,000/yr</p>
                <p className="text-xs text-success">Letter attached</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">No competing offers added yet.</p>
          )}

          <div className="bg-muted rounded-2xl p-3 space-y-2">
            <div
              className={`w-full border-2 border-dashed rounded-2xl p-4 flex items-center gap-3 overflow-hidden ${
                letterFileName ? "border-primary-400 bg-primary-50/50" : "border-primary-200"
              }`}
            >
              <span className="w-10 h-10 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
                {parsing ? (
                  <SpinnerRing color="#1A4331" />
                ) : letterFileName ? (
                  <IconDocument className="w-5 h-5" />
                ) : (
                  <IconUpload className="w-5 h-5" />
                )}
              </span>
              <div className="text-left min-w-0 flex-1 overflow-hidden">
                <p className="font-semibold text-foreground text-sm truncate">
                  {parsing ? "Reading aid letter..." : letterFileName || "Upload aid letter"}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">
                  PDF or DOCX — we&apos;ll pull school name and amounts
                </p>
              </div>
            </div>

            <Input
              placeholder="School name"
              value={showParsedFields ? "Stanford University" : ""}
              readOnly
            />
            <Input
              label="Estimated annual cost"
              placeholder="e.g. 55000"
              value={showParsedFields ? "58000" : ""}
              readOnly
            />
            <Input
              label="Annual financial aid offer (optional)"
              placeholder="e.g. 15000"
              value={showParsedFields ? "18000" : ""}
              readOnly
            />
            <div
              className={`w-full h-11 inline-flex items-center justify-center rounded-full text-sm font-medium ${
                showParsedFields && !showOfferCard
                  ? "bg-primary-600 text-primary-foreground shadow-card"
                  : "bg-muted text-foreground opacity-45"
              }`}
            >
              + Add school
            </div>
          </div>
        </section>

        <section className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Script type
          </p>
          <div className="flex rounded-2xl bg-muted p-1 gap-1">
            <div className="flex-1 rounded-xl py-2.5 text-sm font-medium bg-white shadow-sm text-foreground text-center">
              Email
            </div>
            <div className="flex-1 rounded-xl py-2.5 text-sm font-medium text-muted-foreground text-center">
              Phone script
            </div>
          </div>
        </section>

        {generating && (
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="relative w-14 h-14">
              <div className="absolute inset-0 rounded-full border-4 border-primary-200" />
              <SpinnerRing color="#1A4331" size={56} />
            </div>
            <p className="text-sm text-muted-foreground">Writing your script...</p>
          </div>
        )}

        {showScript && (
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Your script
              </p>
              <span className="text-xs font-medium text-primary-600">Copy</span>
            </div>
            <div className="bg-card border border-border/60 rounded-2xl p-4">
              <pre className="text-sm text-foreground whitespace-pre-wrap font-sans leading-relaxed">
                {DEMO_SCRIPT}
              </pre>
            </div>
          </section>
        )}
      </div>

      {!showScript && !generating && (
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-4 pt-6 bg-gradient-to-t from-background via-background/95 to-transparent">
          <div
            className={`w-full h-14 text-base font-bold inline-flex items-center justify-center rounded-full bg-primary-600 text-primary-foreground shadow-card ${
              showOfferCard ? "shadow-fab" : ""
            }`}
            style={{ opacity: showOfferCard ? 1 : 0.45 }}
          >
            Write my email
          </div>
        </div>
      )}

    </div>
  );
};
