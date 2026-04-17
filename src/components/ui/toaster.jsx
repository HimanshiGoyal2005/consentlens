"use client";

export function Toaster() {
  return (
    <div
      id="toaster-container"
      aria-live="polite"
      aria-label="Notifications"
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2"
    />
  );
}
