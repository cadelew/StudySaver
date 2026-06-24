"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { useToast } from "@/components/ui/toast";
import { MaterialCard } from "@/components/course/MaterialCard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import {
  IconCheckCircle,
  IconBook,
  IconSearch,
  IconDocument,
  IconUpload,
  IconScale,
  IconAi,
  GoalInitial,
} from "@/components/ui/icons";
import type { CoursePlan, CourseMaterial } from "@/lib/types";

type FlowState = "upload" | "extracting" | "researching" | "results" | "applied";

export default function CourseCostPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const { coursePlan, setCoursePlan, applyCourseSavings, snapshot } = useStore();
  const [flowState, setFlowState] = React.useState<FlowState>("upload");
  const [syllabusText, setSyllabusText] = React.useState("");
  const [uploadedFile, setUploadedFile] = React.useState<File | null>(null);
  const [fileName, setFileName] = React.useState("");
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const prevPathRef = React.useRef<string | null>(null);

  // Reset to upload when navigating here from another page
  React.useEffect(() => {
    if (pathname === "/course-cost" && prevPathRef.current !== null && prevPathRef.current !== "/course-cost") {
      setFlowState("upload");
      setUploadedFile(null);
      setFileName("");
      setSyllabusText("");
    }
    prevPathRef.current = pathname;
  }, [pathname]);

  const handleFileUpload = (file: File) => {
    setUploadedFile(file);
    setFileName(file.name);
    setSyllabusText("");
  };

  const handleAnalyze = async () => {
    if (!uploadedFile && !syllabusText.trim()) {
      toast("Please upload a syllabus or paste text", "error");
      return;
    }

    setFlowState("extracting");
    try {
      const formData = new FormData();
      if (uploadedFile) {
        formData.append("file", uploadedFile);
      } else {
        formData.append("text", syllabusText);
      }

      const extractRes = await fetch("/api/course-cost/extract", {
        method: "POST",
        body: formData,
      });
      const extractData = await extractRes.json();

      if (!extractRes.ok) {
        throw new Error(extractData.error || "Extraction failed");
      }

      setFlowState("researching");

      const researchRes = await fetch("/api/course-cost/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          materials: extractData.materials,
          school: snapshot.user.school,
        }),
      });
      const researchData = await researchRes.json();

      if (!researchRes.ok) throw new Error("Research failed");

      const mergedMaterials = extractData.materials.map((m: CourseMaterial) => {
        const researched = researchData.materials?.find((r: CourseMaterial) => r.id === m.id) || {};
        return { ...m, ...researched };
      });

      const plan: CoursePlan = {
        id: `course-${Date.now()}`,
        course_name: extractData.course_name,
        materials: mergedMaterials,
        total_bookstore_price: researchData.total_bookstore_price || 0,
        total_recommended_price: researchData.total_recommended_price || 0,
        total_savings: researchData.total_savings || 0,
        summary: researchData.summary || "",
        created_at: new Date().toISOString(),
      };

      setCoursePlan(plan);
      setFlowState("results");
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : "Analysis failed";
      toast(message, "error");
      setFlowState("upload");
    }
  };

  const handleApplySavings = () => {
    if (!coursePlan) return;
    applyCourseSavings(coursePlan.total_savings);
    setFlowState("applied");
    toast(`$${coursePlan.total_savings} applied to your budget!`, "success");
  };

  if (flowState === "applied" && coursePlan) {
    const activeGoal = snapshot.goals.find((g) => g.status === "active");
    return (
      <div className="min-h-full flex flex-col">
        <PageHeader title="Savings Applied!" onBack={() => router.push("/")} />
        <div className="flex-1 flex flex-col items-center justify-center px-5 gap-6">
          <div className="w-20 h-20 rounded-full bg-success-50 flex items-center justify-center text-success">
            <IconCheckCircle className="w-10 h-10" />
          </div>

          <Card className="w-full text-center">
            <p className="text-4xl font-display font-bold text-success">
              {formatCurrency(coursePlan.total_savings)}
            </p>
            <p className="text-sm text-muted-foreground mt-1">saved on course materials</p>
          </Card>

          {activeGoal && (
            <div className="bg-primary-50 border border-primary-100 rounded-2xl px-4 py-4 w-full">
              <div className="flex gap-3 items-start">
                <GoalInitial name={activeGoal.name} className="w-10 h-10 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-sm text-foreground">{activeGoal.name}</p>
                  <p className="text-sm text-primary-700 mt-1">
                    Your savings put you{" "}
                    <strong>
                      {Math.round(coursePlan.total_savings / activeGoal.weekly_savings_required)} weeks ahead
                    </strong>{" "}
                    on this goal.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3 w-full">
            <Button onClick={() => router.push("/")} variant="primary" className="w-full">
              View dashboard
            </Button>
            <Button onClick={() => setFlowState("results")} variant="secondary" className="w-full">
              Back to plan
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (flowState === "results" && coursePlan) {
    return (
      <div className="min-h-full">
        <PageHeader title={coursePlan.course_name} onBack={() => setFlowState("upload")} />

        <div className="px-4 pb-32 space-y-4">
          {/* Summary banner */}
          <div className="bg-gradient-to-br from-success/10 to-primary-50 rounded-2xl p-4 border border-success/20">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Total savings</p>
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

          {/* AI plan */}
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

          {/* Materials */}
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
        </div>

        {/* Sticky apply button */}
        <div className="fixed bottom-[72px] left-0 right-0 px-4 pb-4 bg-gradient-to-t from-background via-background/95 to-transparent pt-6">
          <Button
            onClick={handleApplySavings}
            variant="primary"
            className="w-full h-14 text-base font-bold shadow-fab"
          >
            Apply {formatCurrency(coursePlan.total_savings)} savings to budget →
          </Button>
        </div>
      </div>
    );
  }

  if (flowState === "extracting") {
    return (
      <div className="min-h-full flex flex-col">
        <PageHeader title="Course Cost Optimizer" onBack={() => setFlowState("upload")} />
        <div className="flex-1 flex flex-col items-center justify-center px-5 gap-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-primary-50 flex items-center justify-center text-primary-600">
              <IconBook className="w-9 h-9" />
            </div>
            <div className="absolute inset-0 rounded-full border-4 border-primary-600 border-t-transparent animate-spin" />
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
  }

  if (flowState === "researching") {
    return (
      <div className="min-h-full flex flex-col">
        <PageHeader title="Course Cost Optimizer" onBack={() => setFlowState("upload")} />
        <div className="flex-1 flex flex-col items-center justify-center px-5 gap-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-success-50 flex items-center justify-center text-success">
              <IconSearch className="w-9 h-9" />
            </div>
            <div className="absolute inset-0 rounded-full border-4 border-success border-t-transparent animate-spin" />
          </div>
          <div className="text-center">
            <p className="font-semibold text-foreground">Searching the web for options...</p>
            <p className="text-sm text-muted-foreground mt-1">Browserbase · rentals, library, OER, used copies</p>
          </div>
        </div>
      </div>
    );
  }

  // Upload state
  return (
    <div className="min-h-full flex flex-col">
      <PageHeader title="Course Cost Optimizer" onBack={() => router.push("/")} />

      <div className="flex-1 px-4 pt-2 pb-8 space-y-5">
        <div className="text-center">
          <h1 className="font-display text-2xl font-bold text-foreground">
            Stop overpaying for textbooks
          </h1>
          <p className="text-muted-foreground text-sm mt-2">
            Upload your syllabus and we&apos;ll find the cheapest legal way to get everything.
          </p>
        </div>

        {/* Upload area */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full border-2 border-dashed border-primary-200 rounded-2xl p-8 flex flex-col items-center gap-3 hover:border-primary-400 hover:bg-primary-50/50 active:scale-[0.99] transition-all"
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
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.txt,.doc,.docx"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileUpload(file);
          }}
        />

        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
            <span className="text-muted-foreground text-xs font-medium">or</span>
          </div>
          <textarea
            className="w-full rounded-2xl border border-border px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary-600 min-h-[120px] resize-none pl-12"
            placeholder="Paste course materials list or syllabus text..."
            value={syllabusText}
            onChange={(e) => {
              setSyllabusText(e.target.value);
              if (e.target.value.trim()) {
                setUploadedFile(null);
                setFileName("");
              }
            }}
          />
        </div>

        {/* Demo shortcut */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground">or try</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        <button
          onClick={() => {
            setSyllabusText(DEMO_SYLLABUS);
            setUploadedFile(null);
            setFileName("");
          }}
          className="w-full py-3 rounded-2xl border border-primary-200 bg-primary-50 text-primary-700 text-sm font-medium hover:bg-primary-100 active:scale-[0.99] transition-all"
        >
          Load Biology 1A demo syllabus
        </button>

        <Button
          onClick={handleAnalyze}
          disabled={!uploadedFile && !syllabusText.trim()}
          variant="primary"
          className="w-full h-14 text-base font-bold"
        >
          Analyze materials
        </Button>

        <p className="text-xs text-muted-foreground text-center leading-relaxed">
          StudySaver finds legal options only: library, OER, rentals, used copies, campus resources.
        </p>
      </div>
    </div>
  );
}

function PageHeader({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <div className="flex items-center gap-3 px-4 pt-14 pb-4">
      <button
        onClick={onBack}
        className="w-9 h-9 rounded-full bg-muted flex items-center justify-center active:scale-95 transition-transform"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <h1 className="font-semibold text-base text-foreground line-clamp-1">{title}</h1>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="w-full rounded-3xl bg-card border border-border/60 p-4 space-y-3 animate-pulse">
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

const DEMO_SYLLABUS = `BIOLOGY 1A - Molecular Biology and Cell Biology
UC Berkeley - Fall 2026

Required Course Materials:

1. Campbell Biology, 12th Edition
   Authors: Lisa Urry, Michael Cain, et al.
   ISBN: 9780135188743
   Publisher: Pearson
   Available at UC Berkeley Bookstore: $220.00

2. Mastering Biology Access Code (required for homework)
   Publisher: Pearson
   NOTE: Must be purchased new. Used access codes will not work.
   Bookstore price: $120.00

3. Biology 1A Lab Manual (Spring 2026 edition)
   Available at bookstore: $35.00

4. Student Study Guide for Campbell Biology (optional but recommended)
   ISBN: 9780135188767
   Bookstore price: $10.00

Lab equipment: Standard safety goggles and lab coat required for lab sections.
Please check with campus bookstore or lab coordinator for approved suppliers.`;
