import React from "react";
const paths = {
  spark: "m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5Z",
  bell: "M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M10 21h4",
  user: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0",
  clipboard: "M9 4H6v17h12V4h-3M9 2h6v4H9ZM9 11h6M9 15h6",
  message: "M21 15a3 3 0 0 1-3 3H8l-5 4V6a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3Z",
  bag: "M5 7h14l2 14H3ZM9 8V5a3 3 0 0 1 6 0v3",
  arrow: "M5 12h14m-6-6 6 6-6 6",
  back: "m15 18-6-6 6-6",
  close: "m6 6 12 12M6 18 18 6",
  phone: "M5 3h4l2 5-3 2a14 14 0 0 0 6 6l2-3 5 2v4c-9 3-19-7-16-16Z",
  send: "m3 3 18 9-18 9 4-9ZM7 12h14",
  check: "m5 12 4 4 10-10",
  mic: "M9 4a3 3 0 0 1 6 0v7a3 3 0 0 1-6 0ZM5 10v1a7 7 0 0 0 14 0v-1M12 18v4m-4 0h8",
};
export default function Icon({ name, size = 22 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[name] || paths.spark} />
    </svg>
  );
}
