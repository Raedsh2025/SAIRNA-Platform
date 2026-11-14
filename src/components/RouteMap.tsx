import type { City } from "@/api/types";

interface RouteMapProps {
  origin?: Pick<City, "name" | "latitude" | "longitude"> | null;
  destination?: Pick<City, "name" | "latitude" | "longitude"> | null;
  /** نسبة التقدّم 0..1 */
  progress?: number;
  className?: string;
}

const START = { x: 120, y: 300 };
const END = { x: 690, y: 112 };
const CONTROL = { x: 430, y: 30 };

function pointAt(t: number) {
  const inv = 1 - t;
  return {
    x: inv * inv * START.x + 2 * inv * t * CONTROL.x + t * t * END.x,
    y: inv * inv * START.y + 2 * inv * t * CONTROL.y + t * t * END.y,
  };
}

/**
 * خريطة مسار SVG محلية (بدل Leaflet/Google Maps) — بلا طلبات خارجية،
 * تعمل دون إنترنت وتُستخدم في الرئيسية وصفحة التتبّع.
 */
export function RouteMap({
  origin,
  destination,
  progress = 0.5,
  className,
}: RouteMapProps) {
  const clamped = Math.min(1, Math.max(0, progress));
  const bus = pointAt(clamped);
  const path = `M ${START.x} ${START.y} Q ${CONTROL.x} ${CONTROL.y} ${END.x} ${END.y}`;

  return (
    <div className={className ?? "map-canvas"}>
      <svg viewBox="0 0 800 400" role="img" aria-label="خريطة مسار الرحلة">
        <defs>
          <pattern
            id="sairna-grid"
            width="46"
            height="46"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M46 0H0v46"
              fill="none"
              stroke="rgba(14,86,99,.09)"
              strokeWidth="1"
            />
          </pattern>
          <linearGradient id="sairna-line" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#0aa99b" />
            <stop offset="100%" stopColor="#0d7f93" />
          </linearGradient>
        </defs>

        <rect width="800" height="400" fill="url(#sairna-grid)" />

        {/* خط المسار الكامل */}
        <path
          d={path}
          fill="none"
          stroke="rgba(14,86,99,.22)"
          strokeWidth="6"
          strokeLinecap="round"
        />

        {/* الجزء المقطوع */}
        <path
          d={path}
          fill="none"
          stroke="url(#sairna-line)"
          strokeWidth="6"
          strokeLinecap="round"
          pathLength={100}
          strokeDasharray={`${clamped * 100} 100`}
        />

        {/* محطة الانطلاق */}
        <g>
          <circle
            cx={START.x}
            cy={START.y}
            r="16"
            fill="#0aa99b"
            opacity="0.16"
          />
          <circle
            cx={START.x}
            cy={START.y}
            r="7"
            fill="#0aa99b"
            stroke="#fff"
            strokeWidth="3"
          />
          <text
            x={START.x}
            y={START.y + 34}
            textAnchor="middle"
            className="map-city-label"
          >
            {origin?.name ?? "حلب"}
          </text>
        </g>

        {/* محطة الوصول */}
        <g>
          <circle cx={END.x} cy={END.y} r="16" fill="#0d7f93" opacity="0.16" />
          <circle
            cx={END.x}
            cy={END.y}
            r="7"
            fill="#0d7f93"
            stroke="#fff"
            strokeWidth="3"
          />
          <text
            x={END.x}
            y={END.y - 24}
            textAnchor="middle"
            className="map-city-label"
          >
            {destination?.name ?? "دمشق"}
          </text>
        </g>

        {/* الحافلة */}
        <g transform={`translate(${bus.x} ${bus.y})`}>
          <circle r="19" fill="#e8fbf6" stroke="#0aa99b" strokeWidth="2" />
          <path
            d="M-8 -4h16v7h-16zM-8 3h16"
            fill="none"
            stroke="#0d7f93"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <circle cx="-5" cy="6.5" r="1.8" fill="#0d7f93" />
          <circle cx="5" cy="6.5" r="1.8" fill="#0d7f93" />
        </g>
      </svg>
    </div>
  );
}
