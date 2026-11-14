import { useState } from "react";

interface PhotoProps {
  src: string;
  fallback?: string;
  alt: string;
  className?: string;
  loading?: "lazy" | "eager";
  /**
   * React 18 يتعامل مع السمة بصيغة HTML الصغيرة (fetchpriority).
   * نمرّرها ككائن منفصل لتفادي تحذير React عن الخاصية camelCase.
   */
  fetchPriority?: "high" | "low" | "auto";
}

/**
 * صورة مع مصدر بديل محلي عند فشل التحميل
 * (صور خارجية قد تُحجب أو تحتاج اتصالًا بالإنترنت).
 */
export function Photo({
  src,
  fallback,
  alt,
  className,
  loading = "lazy",
  fetchPriority,
}: PhotoProps) {
  const [current, setCurrent] = useState(src);

  return (
    <img
      src={current}
      alt={alt}
      className={className}
      loading={loading}
      decoding="async"
      referrerPolicy="no-referrer"
      {...(fetchPriority ? { fetchpriority: fetchPriority } : {})}
      onError={() => {
        if (fallback && current !== fallback) setCurrent(fallback);
      }}
    />
  );
}
