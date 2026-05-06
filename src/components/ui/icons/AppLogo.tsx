export function AppLogo() {
  return (
    <svg
      width="200px"
      height="200px"
      viewBox="0 0 1024 1024"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>Vaultra refined vault logo</title>
      <defs>
        <linearGradient
          id="brandBlue"
          x1="210"
          y1="140"
          x2="820"
          y2="880"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#2F83FF" />
          <stop offset="0.52" stopColor="#1D63D8" />
          <stop offset="1" stopColor="#3860B8" />
        </linearGradient>
        <filter
          id="softShadow"
          x="120"
          y="120"
          width="784"
          height="784"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feDropShadow
            dx="0"
            dy="18"
            stdDeviation="22"
            floodColor="#0F2D66"
            floodOpacity="0.12"
          />
        </filter>
      </defs>

      <rect width="1024" height="1024" fill="#FFFFFF" />

      <g filter="url(#softShadow)">
        <path
          d="M258 156H766C823.438 156 870 202.562 870 260V760C870 795.346 841.346 824 806 824H218C182.654 824 154 795.346 154 760V260C154 202.562 200.562 156 258 156Z"
          stroke="url(#brandBlue)"
          strokeWidth="58"
          strokeLinejoin="round"
        />

        <path
          d="M352 260H672C714.526 260 749 294.474 749 337V419"
          stroke="url(#brandBlue)"
          strokeWidth="48"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M749 576V687C749 729.526 714.526 764 672 764H352C309.474 764 275 729.526 275 687V337C275 294.474 309.474 260 352 260Z"
          stroke="url(#brandBlue)"
          strokeWidth="48"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <circle cx="749" cy="455" r="37" fill="url(#brandBlue)" />
        <circle cx="749" cy="558" r="37" fill="url(#brandBlue)" />

        <path
          d="M372 384H469L515 514L548 682H480L372 384Z"
          fill="url(#brandBlue)"
        />
        <path
          d="M555 384H656L548 682H512L515 514L555 384Z"
          fill="url(#brandBlue)"
        />

        <rect
          x="249"
          y="807"
          width="82"
          height="69"
          rx="22"
          fill="url(#brandBlue)"
        />
        <rect
          x="693"
          y="807"
          width="82"
          height="69"
          rx="22"
          fill="url(#brandBlue)"
        />
      </g>
    </svg>
  );
}
