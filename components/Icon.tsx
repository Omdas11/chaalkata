interface IconProps {
  name: "sound-on" | "sound-off" | "restart" | "undo" | "close" | "play" | "users";
  size?: number;
}

/** Original hand-drawn SVG icons for Chaal-Kaata. No emoji, no borrowed sets. */
export default function Icon({ name, size = 20 }: IconProps) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  switch (name) {
    case "sound-on":
      return (
        <svg {...common}>
          <path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor" stroke="none" />
          <path d="M16.5 8.5a5 5 0 0 1 0 7" />
          <path d="M19 6a8.5 8.5 0 0 1 0 12" />
        </svg>
      );
    case "sound-off":
      return (
        <svg {...common}>
          <path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor" stroke="none" />
          <path d="M16 9l6 6" />
          <path d="M22 9l-6 6" />
        </svg>
      );
    case "restart":
      return (
        <svg {...common}>
          <path d="M3 12a9 9 0 1 0 3-6.7" />
          <path d="M3 4v5h5" />
        </svg>
      );
    case "undo":
      return (
        <svg {...common}>
          <path d="M8 5L3 10l5 5" />
          <path d="M3 10h11a6 6 0 0 1 0 12h-3" />
        </svg>
      );
    case "close":
      return (
        <svg {...common}>
          <path d="M6 6l12 12" />
          <path d="M18 6L6 18" />
        </svg>
      );
    case "play":
      return (
        <svg {...common}>
          <path d="M7 4l13 8-13 8z" fill="currentColor" stroke="none" />
        </svg>
      );
    case "users":
      return (
        <svg {...common}>
          <circle cx="9" cy="8" r="3.5" />
          <path d="M2.5 20a6.5 6.5 0 0 1 13 0" />
          <path d="M16 5a3.5 3.5 0 0 1 0 6.8" />
          <path d="M17.5 14.5a6.5 6.5 0 0 1 4 5.5" />
        </svg>
      );
  }
}
