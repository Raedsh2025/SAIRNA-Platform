import type { CSSProperties } from 'react'

/**
 * أيقونات SVG مضمّنة (بدل CDN خارجي) — تعمل دون إنترنت وبنفس مظهر Lucide.
 * تُرسَم كعنصر <svg> مباشرة حتى تُطابق محددات CSS الأصلية مثل .search-field>svg
 */
const PATHS: Record<string, string> = {
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
  pin: '<path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.7"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4m10-4v4M3 10h18"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  'arrow-right': '<path d="M5 12h14m-6-6 6 6-6 6"/>',
  'arrow-left': '<path d="M19 12H5m6-6-6 6 6 6"/>',
  'chevron-down': '<path d="m6 9 6 6 6-6"/>',
  'chevron-left': '<path d="m14 6-6 6 6 6"/>',
  'chevron-right': '<path d="m10 6 6 6-6 6"/>',
  swap: '<path d="M4 7h16m-5-4 5 4-5 4M20 17H4m5-4-5 4 5 4"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/>',
  users: '<path d="M16 20v-1a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v1m17-12a4 4 0 0 1 0 8m3 4v-1a4 4 0 0 0-3-3.9"/><circle cx="9" cy="7" r="4"/>',
  ticket: '<path d="M3 9V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4a3 3 0 0 0 0 6v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4a3 3 0 0 0 0-6Z"/><path d="M13 3v3m0 3v2m0 3v2m0 3v2"/>',
  bus: '<rect x="4" y="3" width="16" height="16" rx="3"/><path d="M4 11h16M8 19v2m8-2v2M8 15h.01M16 15h.01"/>',
  route: '<circle cx="5" cy="6" r="2"/><circle cx="19" cy="18" r="2"/><path d="M7 6h8a4 4 0 0 1 0 8H9a4 4 0 0 0 0 8h8"/>',
  shield: '<path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z"/><path d="m9 12 2 2 4-4"/>',
  headphones: '<path d="M4 14v-3a8 8 0 0 1 16 0v3m-16 0h3v6H4a2 2 0 0 1-2-2v-2a2 2 0 0 1 2-2Zm16 0h-3v6h3a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2Z"/>',
  check: '<path d="m5 12 5 5L20 7"/>',
  'check-circle': '<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>',
  star: '<path d="m12 2 3.2 6.5 7.2 1-5.2 5.1 1.2 7.1L12 18.4l-6.4 3.3 1.2-7.1L1.6 9.5l7.2-1Z"/>',
  heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/>',
  hand: '<path d="M8 13V5a2 2 0 0 1 4 0v6-8a2 2 0 1 1 4 0v8-6a2 2 0 1 1 4 0v9a8 8 0 0 1-8 8h-1a8 8 0 0 1-6.5-3.4L2.5 16a2 2 0 0 1 3-2.6L8 16"/>',
  steering: '<path d="M12 3a9 9 0 1 0 9 9 9 9 0 0 0-9-9Zm0 0v7m-9 2 6 2m12-2-6 2m-6 0 3 7m3-7-3 7"/>',
  wifi: '<path d="M3 9a14 14 0 0 1 18 0M6 12a9 9 0 0 1 12 0m-9 4a4 4 0 0 1 6 0M12 20h.01"/>',
  snow: '<path d="M12 2v20M4 6l16 12M20 6 4 18M8 4l4 4 4-4M8 20l4-4 4 4"/>',
  plug: '<path d="M7 3v5m10-5v5M6 8h12v4a6 6 0 0 1-12 0V8Zm6 10v4"/>',
  filter: '<path d="M4 5h16M7 12h10m-7 7h4"/>',
  seat: '<path d="M7 11V6a4 4 0 0 1 8 0v5M5 11h12a2 2 0 0 1 2 2v4H3v-4a2 2 0 0 1 2-2Zm-1 6v4m14-4v4"/>',
  wallet: '<rect x="3" y="5" width="18" height="15" rx="3"/><path d="M3 9h18m-5 5h3"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10h.01"/>',
  navigation: '<path d="m3 11 18-8-8 18-2-8-8-2Z"/>',
  phone: '<path d="M6 3h4l1 5-2 2a15 15 0 0 0 5 5l2-2 5 1v4c0 2-2 3-4 3A16 16 0 0 1 3 7c0-2 1-4 3-4Z"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
  lock: '<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 1 1 8 0v3"/>',
  eye: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
  'eye-off': '<path d="m3 3 18 18M10 5.3a10 10 0 0 1 2-.3c6 0 10 7 10 7a17 17 0 0 1-3 3.6M6 6C3.6 8 2 12 2 12s4 7 10 7c1.5 0 3-.4 4.2-1.1"/>',
  card: '<rect x="2" y="5" width="20" height="14" rx="3"/><path d="M2 10h20"/>',
  logout: '<path d="M10 17l5-5-5-5m5 5H3m9-9h7a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-7"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  x: '<path d="M5 5 19 19M19 5 5 19"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  moon: '<path d="M20.4 15.1A9 9 0 0 1 8.9 3.6 9 9 0 1 0 20.4 15.1Z"/>',
  sparkle: '<path d="m12 2 2.4 7.6L22 12l-7.6 2.4L12 22l-2.4-7.6L2 12l7.6-2.4L12 2Z"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c5 5 5 13 0 18M12 3c-5 5-5 13 0 18"/>',
  briefcase: '<rect x="3" y="7" width="18" height="14" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 13h18"/>',
  help: '<circle cx="12" cy="12" r="9"/><path d="M9 9a3 3 0 1 1 5 2c-1.5 1-2 1.5-2 3m0 3h.01"/>',
  refresh: '<path d="M20 11a8 8 0 0 0-14-5L3 9m0-6v6h6M4 13a8 8 0 0 0 14 5l3-3m0 6v-6h-6"/>',
  copy: '<rect x="8" y="8" width="12" height="13" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/>',
  play: '<path d="m8 5 11 7-11 7V5Z"/>',
  pause: '<path d="M8 5v14m8-14v14"/>',
  minus: '<path d="M5 12h14"/>',
  plus: '<path d="M5 12h14M12 5v14"/>',
}

export type IconName = keyof typeof PATHS

interface IconProps {
  name: IconName | string
  size?: number
  className?: string
  style?: CSSProperties
}

export function Icon({ name, size = 20, className, style }: IconProps) {
  const path = PATHS[name] ?? PATHS.info

  return (
    <svg
      className={`sairna-icon${className ? ` ${className}` : ''}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.85}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={style}
      dangerouslySetInnerHTML={{ __html: path }}
    />
  )
}
