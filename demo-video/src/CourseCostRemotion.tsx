import { useCurrentFrame } from "remotion";
import { MaterialCard } from "../../components/course/MaterialCard";
import { Card } from "../../components/ui/card";
import { DEMO_BIO_COURSE_PLAN } from "../../lib/demo-data";
import { formatCurrency } from "../../lib/utils";
import {
  IconBook,
  IconDocument,
  IconUpload,
  IconScale,
  IconAi,
} from "../../components/ui/icons";
import type { CoursePlan } from "../../lib/types";
import { FilePickerMock } from "./FilePickerMock";

export type CourseCostFlowState =
  | "upload"
  | "file-picker"
  | "upload-ready"
  | "extracting"
  | "results";

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

function SkeletonCard() {
  return (
    <div className="w-full rounded-3xl bg-card border border-border/60 p-4 space-y-3">
      <div className="flex gap-3">
        <div className="w-8 h-8 rounded-lg bg-gray-100" />
        <div className="flex-1 space-y-2">
          <div className="h-3 bg-gray-100 rounded-full w-3/4" />
          <div className="h-2 bg-gray-100 rounded-full w-1/2" />
        </div>
      </div>
      <div className="h-10 bg-gray-50 rounded-xl" />
    </div>
  );
}

const SpinnerRing: React.FC<{ color: string }> = ({ color }) => {
  const frame = useCurrentFrame();
  const rotation = (frame * 12) % 360;
  return (
    <div
      className="absolute inset-0 rounded-full border-4 border-t-transparent"
      style={{ borderColor: color, borderTopColor: "transparent", rotate: `${rotation}deg` }}
    />
  );
};

const UploadScreen: React.FC<{
  fileName: string;
  analyzeReady: boolean;
}> = ({ fileName, analyzeReady }) => (
  <div className="min-h-full flex flex-col bg-background">
    <PageHeader title="Course Cost Optimizer" />

    <div className="flex-1 px-4 pt-2 pb-8 space-y-5">
      <div className="text-center">
        <h1 className="font-display text-2xl font-bold text-foreground">
          Stop overpaying for textbooks
        </h1>
        <p className="text-muted-foreground text-sm mt-2">
          Upload your syllabus and we&apos;ll find the cheapest legal way to get everything.
        </p>
      </div>

      <div
        className={`w-full border-2 border-dashed rounded-2xl p-8 flex flex-col items-center gap-3 ${
          fileName
            ? "border-primary-400 bg-primary-50/50"
            : "border-primary-200"
        }`}
      >
        <span className="w-14 h-14 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center">
          {fileName ? <IconDocument className="w-7 h-7" /> : <IconUpload className="w-7 h-7" />}
        </span>
        <div className="text-center">
          <p className="font-semibold text-foreground text-sm">
            {fileName || "Upload syllabus"}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {fileName ? "Ready to analyze · tap to change" : "PDF, DOCX, or TXT · or paste below"}
          </p>
        </div>
      </div>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
          <span className="text-muted-foreground text-xs font-medium">or</span>
        </div>
        <div className="w-full rounded-2xl border border-border px-4 py-3 text-sm text-muted-foreground min-h-[120px] pl-12 bg-card">
          Paste course materials list or syllabus text...
        </div>
      </div>

      <div
        className={`w-full h-14 text-base font-bold inline-flex items-center justify-center rounded-full bg-primary-600 text-primary-foreground shadow-card ${
          analyzeReady ? "shadow-fab" : ""
        }`}
        style={{ opacity: fileName ? 1 : 0.45 }}
      >
        Analyze materials
      </div>

      <p className="text-xs text-muted-foreground text-center leading-relaxed">
        StudySaver finds legal options only: library, OER, rentals, used copies, campus resources.
      </p>
    </div>
  </div>
);

const ExtractingScreen: React.FC = () => (
  <div className="min-h-full flex flex-col bg-background">
    <PageHeader title="Course Cost Optimizer" />
    <div className="flex-1 flex flex-col items-center justify-center px-5 gap-6">
      <div className="relative">
        <div className="w-20 h-20 rounded-full bg-primary-50 flex items-center justify-center text-primary-600">
          <IconBook className="w-9 h-9" />
        </div>
        <SpinnerRing color="#1A4331" />
      </div>
      <div className="text-center">
        <p className="font-semibold text-foreground">Reading your syllabus...</p>
        <p className="text-sm text-muted-foreground mt-1">Extracting course materials</p>
      </div>
      <SkeletonCard />
      <SkeletonCard />
    </div>
  </div>
);

const ResultsScreen: React.FC<{ coursePlan: CoursePlan }> = ({ coursePlan }) => (
  <div className="min-h-full bg-background">
    <PageHeader title={coursePlan.course_name} />

    <div className="px-4 pb-32 space-y-4">
      <div className="bg-gradient-to-br from-success/10 to-primary-50 rounded-2xl p-4 border border-success/20">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
              Total savings
            </p>
            <p className="text-3xl font-display font-bold text-success">
              {formatCurrency(coursePlan.total_savings)}
            </p>
            <p className="text-xs text-muted-foreground">
              vs. {formatCurrency(coursePlan.total_bookstore_price)} at bookstore
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">You pay</p>
            <p className="text-xl font-bold text-foreground">
              {formatCurrency(coursePlan.total_recommended_price)}
            </p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground italic leading-relaxed flex items-start gap-1.5">
          <IconScale className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>Legal options only: library, OER, rentals, used copies, campus resources.</span>
        </p>
      </div>

      {coursePlan.summary && (
        <Card>
          <div className="flex gap-3">
            <span className="flex-shrink-0 w-9 h-9 rounded-full bg-muted text-muted-foreground flex items-center justify-center">
              <IconAi />
            </span>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                Cheapest Safe Plan
              </p>
              <p className="text-sm text-foreground leading-relaxed">{coursePlan.summary}</p>
            </div>
          </div>
        </Card>
      )}

      <div>
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 px-1">
          {coursePlan.materials.length} Materials Analyzed
        </h2>
        <div className="space-y-3">
          {coursePlan.materials.map((material, i) => (
            <MaterialCard key={material.id} material={material} index={i} />
          ))}
        </div>
      </div>

      <div className="pt-2">
        <div className="w-full h-14 text-base font-bold inline-flex items-center justify-center rounded-full bg-primary-600 text-primary-foreground shadow-fab">
          Apply {formatCurrency(coursePlan.total_savings)} savings to budget →
        </div>
      </div>
    </div>
  </div>
);

export const CourseCostRemotion: React.FC<{
  flowState: CourseCostFlowState;
  fileName: string;
  filePickerProgress: number;
}> = ({ flowState, fileName, filePickerProgress }) => {
  const coursePlan = DEMO_BIO_COURSE_PLAN;

  return (
    <div className="relative min-h-full bg-background">
      {(flowState === "upload" ||
        flowState === "file-picker" ||
        flowState === "upload-ready") && (
        <UploadScreen fileName={fileName} analyzeReady={flowState === "upload-ready"} />
      )}
      {flowState === "extracting" && <ExtractingScreen />}
      {flowState === "results" && <ResultsScreen coursePlan={coursePlan} />}
      {flowState === "file-picker" && (
        <FilePickerMock openProgress={filePickerProgress} />
      )}
    </div>
  );
};
