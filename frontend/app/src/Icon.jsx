import React from "react";
const paths = {
  external:
    "M15 3h6v6M10 14 21 3M11 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-6",
  settings:
    "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8ZM9 3h6l1 3 3 1 2 5-2 5-3 1-1 3H9l-1-3-3-1-2-5 2-5 3-1Z",
  logout: "M9 3H4v18h5M10 12h11m-4-4 4 4-4 4",
  key: "M15 3a6 6 0 1 0 0 12 6 6 0 0 0 0-12ZM11 13l-8 8v-4l3-3M17 7h.01",
  shield: "m12 2 9 4v6c0 5-9 10-9 10S3 17 3 12V6l9-4Zm-4 10 3 3 5-5",
  trash: "M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7",
  support:
    "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20ZM12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10ZM5 5l3 3m8 8 3 3M5 19l3-3m8-8 3-3",
  spark:
    "m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z",
  bell: "M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M10 21h4",
  user: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0",
  clipboard:
    "M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2M9 2h6a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1ZM9 14l2 2 4-4",
  message: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z",
  bag: "M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4ZM3 6h18M16 10a4 4 0 0 1-8 0",
  arrow: "M5 12h14m-6-6 6 6-6 6",
  back: "m15 18-6-6 6-6",
  close: "m6 6 12 12M6 18 18 6",
  warning: "M12 3 2 21h20L12 3ZM12 9v5M12 17v.01",
  phone: "M5 3h4l2 5-3 2a14 14 0 0 0 6 6l2-3 5 2v4c-9 3-19-7-16-16Z",
  send: "m5 12 14-7-7 14-2-5-5-2Z",
  check: "m5 12 4 4 10-10",
  mic: "M9 4a3 3 0 0 1 6 0v7a3 3 0 0 1-6 0ZM5 10v1a7 7 0 0 0 14 0v-1M12 18v4m-4 0h8",
  eye: "M2 12s3-7 10-7 10 7 10 7-3 7-10 7S2 12 2 12ZM15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0",
  eyeOff:
    "M2 12s3-7 10-7 10 7 10 7-3 7-10 7S2 12 2 12ZM15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0M3 3l18 18",
};
export default function Icon({ name, size = 22 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={name === "send" ? "2.5" : "1.8"}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[name] || paths.spark} />
    </svg>
  );
}
