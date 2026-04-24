export function AppLogo() {
  return (
    <svg
      width="512"
      height="512"
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient
          id="vaultBody"
          x1="90"
          y1="70"
          x2="420"
          y2="430"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stop-color="#9DB9F4" />
          <stop offset="0.55" stop-color="#5D82D8" />
          <stop offset="1" stop-color="#233F8F" />
        </linearGradient>
        <linearGradient
          id="vaultInner"
          x1="140"
          y1="120"
          x2="380"
          y2="360"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stop-color="#B8C9F7" />
          <stop offset="1" stop-color="#6F90DF" />
        </linearGradient>
        <linearGradient
          id="coin"
          x1="340"
          y1="80"
          x2="430"
          y2="170"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stop-color="#71F2B0" />
          <stop offset="1" stop-color="#11B96A" />
        </linearGradient>
        <filter
          id="shadow"
          x="0"
          y="0"
          width="512"
          height="512"
          filterUnits="userSpaceOnUse"
        >
          <feDropShadow
            dx="0"
            dy="10"
            stdDeviation="10"
            flood-color="#233F8F"
            flood-opacity="0.15"
          />
        </filter>
      </defs>

      <ellipse cx="256" cy="418" rx="150" ry="22" fill="#CFE3F9" />

      <g filter="url(#shadow)">
        <rect
          x="96"
          y="108"
          width="288"
          height="288"
          rx="56"
          fill="url(#vaultBody)"
        />
        <rect
          x="136"
          y="148"
          width="208"
          height="208"
          rx="36"
          fill="url(#vaultInner)"
          stroke="#2C4C9D"
          stroke-width="10"
        />

        <rect
          x="126"
          y="195"
          width="26"
          height="48"
          rx="8"
          fill="#F4F8FF"
          opacity="0.9"
        />
        <rect
          x="126"
          y="284"
          width="26"
          height="48"
          rx="8"
          fill="#F4F8FF"
          opacity="0.9"
        />
        <rect
          x="330"
          y="250"
          width="18"
          height="54"
          rx="8"
          fill="#F4F8FF"
          opacity="0.95"
        />

        <circle cx="240" cy="252" r="70" fill="#F4F8FF" opacity="0.96" />
        <circle cx="240" cy="252" r="51" fill="#3860B8" />
        <circle cx="240" cy="252" r="18" fill="#F4F8FF" />

        <circle cx="240" cy="201" r="6" fill="#F4F8FF" />
        <circle cx="276" cy="214" r="6" fill="#F4F8FF" />
        <circle cx="291" cy="252" r="6" fill="#F4F8FF" />
        <circle cx="276" cy="289" r="6" fill="#F4F8FF" />
        <circle cx="240" cy="303" r="6" fill="#F4F8FF" />
        <circle cx="204" cy="289" r="6" fill="#F4F8FF" />
        <circle cx="189" cy="252" r="6" fill="#F4F8FF" />
        <circle cx="204" cy="214" r="6" fill="#F4F8FF" />

        <rect x="236" y="185" width="8" height="20" rx="4" fill="#2C4C9D" />
        <rect x="236" y="299" width="8" height="20" rx="4" fill="#2C4C9D" />
        <rect x="298" y="248" width="20" height="8" rx="4" fill="#2C4C9D" />
        <rect x="162" y="248" width="20" height="8" rx="4" fill="#2C4C9D" />

        <rect
          x="202"
          y="199"
          width="8"
          height="18"
          rx="4"
          transform="rotate(-45 202 199)"
          fill="#2C4C9D"
        />
        <rect
          x="280"
          y="277"
          width="8"
          height="18"
          rx="4"
          transform="rotate(-45 280 277)"
          fill="#2C4C9D"
        />
        <rect
          x="277"
          y="205"
          width="8"
          height="18"
          rx="4"
          transform="rotate(45 277 205)"
          fill="#2C4C9D"
        />
        <rect
          x="199"
          y="283"
          width="8"
          height="18"
          rx="4"
          transform="rotate(45 199 283)"
          fill="#2C4C9D"
        />

        <circle cx="368" cy="128" r="52" fill="#F4F8FF" />
        <circle cx="368" cy="128" r="43" fill="url(#coin)" />
        <path
          d="M369.8 96.8C360.3 96.8 352.7 102.2 350.5 110.6C348 120.1 353.4 127.3 365.7 131.3C374.7 134.3 377 136.4 376.1 140.7C375.3 144.4 371.2 147 365.8 147C360.4 147 355.5 144.8 351.5 140.8L343.6 149.1C348.7 154.8 355.8 158.2 363.8 159V167.2H373.2V158.5C383.6 156.6 390.7 149.4 390.7 139.6C390.7 129.3 384.8 123.3 371.5 119.1C362.5 116.3 360.7 114.1 361.5 109.9C362.3 106.3 365.7 104 370.4 104C375 104 379.4 105.8 383.4 109.3L390.3 100.4C385.9 96.5 379.9 94 373.2 93.4V84.8H363.8V93.9C355.1 95.4 348.6 101.1 348.6 109.9C348.6 120.3 354.9 126.1 367 130C375.7 132.9 378.2 135.2 377.4 139.4C376.5 143.6 372.7 146 367 146C360.9 146 355.4 143.5 350.5 138.8L342.9 147.4C348.5 153.9 355.5 157.8 363.8 159V167.2H373.2V158.4C384.2 156.2 391.8 148.9 391.8 138.8C391.8 128.8 386 122.5 372.7 118.2C363.7 115.3 362 113.2 362.7 109.6C363.4 105.9 366.2 103.8 370.6 103.8C374.8 103.8 378.6 105.4 382.4 108.6L389.7 99.4C384.5 95.1 378 92.4 370.6 91.9V84.8H361.2V92.6C351.5 94.3 344.8 100.7 344.8 110.1C344.8 120.6 350.9 126.2 364.2 130.7C373.2 133.8 375.6 136 374.8 139.7C374 143.7 370.6 146.1 365.6 146.1C360.1 146.1 355 143.7 350.6 139.2L343 147.8C348.1 153.8 355.1 157.5 363.8 158.8V167.2H373.2V158.1C384.5 155.9 392.2 148.6 392.2 138.2C392.2 128.1 386.1 122 372.8 117.7C363.7 114.8 361.8 112.8 362.6 109C363.3 105.4 366 103 369.8 103C373.8 103 377.5 104.4 381.1 107.4L388.2 98.3C383.4 94.3 377.2 91.9 369.8 91.5V84.8H360.5V93.6C350.2 95.8 343 103.1 343 112.9C343 123.2 348.9 129.4 362.2 133.7C371.2 136.7 373.1 138.9 372.3 142.8C371.5 146.5 367.9 148.8 362.9 148.8C357.7 148.8 352.9 146.7 348.7 142.6L340.9 151C346.2 156.9 353.6 160.5 362 161.3V170H371.4V160.9C382 159.2 389.8 151.9 389.8 141.7C389.8 131.4 383.9 125.2 370.6 120.9C361.6 117.9 359.8 115.9 360.6 111.9C361.2 108.6 364.1 96.8 369.8 96.8Z"
          fill="#F4F8FF"
        />

        <path
          d="M290 88L296 102L310 108L296 114L290 128L284 114L270 108L284 102L290 88Z"
          fill="#9DB9F4"
        />
        <path
          d="M314 62L318 72L328 76L318 80L314 90L310 80L300 76L310 72L314 62Z"
          fill="#9DB9F4"
        />

        <path
          d="M132 136C150 127 178 124 203 130"
          stroke="#F4F8FF"
          stroke-opacity="0.35"
          stroke-width="12"
          stroke-linecap="round"
        />
      </g>
    </svg>
  );
}
