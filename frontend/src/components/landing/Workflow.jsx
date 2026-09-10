import React from "react";

const STEPS = [
  {
    label: "Project requirement",
    detail: "A creator describes the project — format, style, deadline and any references.",
  },
  {
    label: "Intelligent matching",
    detail: "Collabo reads the requirement and shortlists editors whose skills and style fit.",
  },
  {
    label: "Editor selection",
    detail: "The creator compares match scores and portfolios, then chooses an editor.",
  },
  {
    label: "Collaboration workspace",
    detail: "Files, timeline versions and messages live in one shared project space.",
  },
  {
    label: "Feedback & revisions",
    detail: "Comments are tied to exact timestamps, so revision requests stay specific.",
  },
  {
    label: "Final delivery",
    detail: "The finished export is delivered and archived inside the same project.",
  },
];

export default function Workflow() {
  return (
    <ol className="relative">
      {STEPS.map((step, i) => (
        <li key={step.label} className="relative flex gap-4 sm:gap-6 pb-8 last:pb-0">
          <div className="flex flex-col items-center">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-purple-200 bg-purple-50/80 font-display text-[13px] font-bold text-purple-600 shadow-sm">
              {String(i + 1).padStart(2, "0")}
            </div>
            {i !== STEPS.length - 1 && (
              <div className="w-px flex-1 bg-purple-200/80 mt-2" aria-hidden="true" />
            )}
          </div>
          <div className="pt-1">
            <h3 className="font-display text-[16.5px] font-bold text-slate-900 tracking-tight">
              {step.label}
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-slate-500 max-w-md">
              {step.detail}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}
