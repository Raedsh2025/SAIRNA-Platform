import type { ReactNode } from "react";
import { ApiError } from "@/api/client";
import { Icon } from "./Icon";

export function Spinner({ size = 22 }: { size?: number }) {
  return (
    <span
      className="spinner"
      style={{ width: size, height: size }}
      aria-hidden="true"
    />
  );
}

export function LoadingState({ label = "جارِ التحميل…" }: { label?: string }) {
  return (
    <div className="state-box" role="status" aria-live="polite">
      <Spinner size={26} />
      <p>{label}</p>
    </div>
  );
}

export function ErrorState({
  error,
  onRetry,
  title = "صار في مشكلة",
}: {
  error: unknown;
  onRetry?: () => void;
  title?: string;
}) {
  const message =
    error instanceof ApiError
      ? error.message
      : error instanceof Error
        ? error.message
        : "تعذّر إكمال الطلب.";

  return (
    <div className="state-box state-error" role="alert">
      <span className="state-icon">
        <Icon name="info" size={26} />
      </span>
      <h3>{title}</h3>
      <p>{message}</p>
      {onRetry ? (
        <button
          type="button"
          className="btn btn-outline btn-sm"
          onClick={onRetry}
        >
          <Icon name="refresh" size={16} /> إعادة المحاولة
        </button>
      ) : null}
    </div>
  );
}

export function EmptyState({
  icon = "search",
  title,
  description,
  action,
}: {
  icon?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="empty-state">
      <Icon name={icon} size={42} />
      <h3>{title}</h3>
      {description ? <p>{description}</p> : null}
      {action}
    </div>
  );
}

export function Notice({
  children,
  tone = "info",
}: {
  children: ReactNode;
  tone?: "info" | "warn";
}) {
  return (
    <div className={`notice${tone === "warn" ? " notice-warn" : ""}`}>
      <Icon name={tone === "warn" ? "info" : "check-circle"} size={18} />
      <span>{children}</span>
    </div>
  );
}
