import React, { useEffect, useState, useRef } from "react";

export default function CustomCursor() {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [trailingPos, setTrailingPos] = useState({ x: -100, y: -100 });
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const requestRef = useRef(null);

  useEffect(() => {
    const onMouseMove = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);

      // Check if hovering over clickable/interactive elements
      const target = e.target;
      const isInteractive =
        target.closest("button") ||
        target.closest("a") ||
        target.closest("input") ||
        target.closest("select") ||
        target.closest(".interactive-card") ||
        target.closest("[role='button']");

      setIsHovered(!!isInteractive);
    };

    const onMouseDown = () => setIsPressed(true);
    const onMouseUp = () => setIsPressed(false);
    const onMouseLeave = () => setIsVisible(false);
    const onMouseEnter = () => setIsVisible(true);

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mouseup", onMouseUp);
    document.addEventListener("mouseleave", onMouseLeave);
    document.addEventListener("mouseenter", onMouseEnter);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("mouseleave", onMouseLeave);
      document.removeEventListener("mouseenter", onMouseEnter);
    };
  }, [isVisible]);

  // Smooth lerp trailing loop for Apple Vision Pro feel
  useEffect(() => {
    const animate = () => {
      setTrailingPos((prev) => ({
        x: prev.x + (position.x - prev.x) * 0.18,
        y: prev.y + (position.y - prev.y) * 0.18,
      }));
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, [position]);

  // Disable on touch devices
  if (typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches) {
    return null;
  }

  if (!isVisible) return null;

  return (
    <>
      {/* Outer ambient blur aura */}
      <div
        className="fixed pointer-events-none z-[9998] transition-opacity duration-300 -translate-x-1/2 -translate-y-1/2"
        style={{
          left: `${trailingPos.x}px`,
          top: `${trailingPos.y}px`,
          width: isHovered ? "64px" : "36px",
          height: isHovered ? "64px" : "36px",
          background: "radial-gradient(circle, rgba(168, 85, 247, 0.3) 0%, rgba(56, 189, 248, 0.25) 40%, transparent 70%)",
          filter: "blur(8px)",
        }}
      />

      {/* Main Glass Lens */}
      <div
        className="fixed pointer-events-none z-[9999] rounded-full -translate-x-1/2 -translate-y-1/2 transition-[width,height,transform,background] duration-200 ease-out"
        style={{
          left: `${trailingPos.x}px`,
          top: `${trailingPos.y}px`,
          width: isPressed ? "22px" : isHovered ? "42px" : "28px",
          height: isPressed ? "22px" : isHovered ? "42px" : "28px",
          backgroundColor: isHovered ? "rgba(255, 255, 255, 0.2)" : "rgba(255, 255, 255, 0.25)",
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
          border: isHovered
            ? "1px solid rgba(168, 85, 247, 0.7)"
            : "1px solid rgba(255, 255, 255, 0.7)",
          boxShadow: isHovered
            ? "0 0 20px rgba(168, 85, 247, 0.5), inset 0 0 10px rgba(255, 255, 255, 0.4)"
            : "0 4px 15px rgba(0, 0, 0, 0.1), inset 0 0 6px rgba(255, 255, 255, 0.6)",
        }}
      >
        {/* Center Iris dot */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full transition-transform duration-150"
          style={{
            width: isHovered ? "4px" : "5px",
            height: isHovered ? "4px" : "5px",
            background: "linear-gradient(135deg, #38bdf8, #a855f7)",
          }}
        />
      </div>
    </>
  );
}
