import React from "react";

export default function SectionHeading({
  index,
  title,
  description,
  align = "left",
  size = "md",
}) {
  const titleSize =
    size === "lg"
      ? "text-3xl sm:text-4xl md:text-[42px]"
      : "text-2xl sm:text-3xl md:text-[34px]";

  return (
    <div className={align === "center" ? "text-center mx-auto max-w-2xl" : "max-w-2xl"}>
      {index && (
        <span className="inline-block text-xs uppercase tracking-widest font-bold text-purple-600 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-100 mb-3">
          {index}
        </span>
      )}
      <h2 className={`font-display font-extrabold tracking-tight leading-[1.15] text-slate-900 ${titleSize}`}>
        {title}
      </h2>
      {description && (
        <p className="mt-3 text-sm sm:text-base leading-relaxed text-slate-500">
          {description}
        </p>
      )}
    </div>
  );
}
