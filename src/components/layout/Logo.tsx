import { Link } from "react-router-dom";

export function Logo() {
  return (
    <Link to="/" className="brand" aria-label="سيرنا — الرئيسية">
      <span className="brand-icon">
        <img src="/assets/logo.svg" alt="" width={48} height={48} />
      </span>
      <span className="brand-text">
        <strong>
          سيرنا<span className="brand-dot">.</span>
        </strong>
        <small>الرحلة بتبلّش من هون</small>
      </span>
    </Link>
  );
}
