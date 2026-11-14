import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Icon } from "@/components/ui/Icon";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/lib/theme";
import { Logo } from "./Logo";

const NAV_LINKS = [
  { to: "/", label: "الرئيسية", end: true },
  { to: "/results", label: "احجز رحلة" },
  { to: "/companies", label: "شركات النقل" },
  { to: "/trips", label: "حجوزاتي" },
  { to: "/tracking", label: "تتبّع الرحلة" },
] as const;

export function Header() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname, location.search]);

  const firstName = user?.name?.trim().split(/\s+/)[0] ?? "";
  const avatarLetter = (user?.name?.trim()[0] ?? "م").toUpperCase();

  return (
    <>
      <div className="announcement">
        <span className="announcement-dot" />
        رحلات بين المدن السورية، بخطوات بسيطة وواضحة
        <span className="ann-star">
          <Icon name="sparkle" size={13} />
        </span>
      </div>

      <header className="site-header">
        <div className="container header-inner">
          <Logo />

          <nav className="desktop-nav" aria-label="التنقل الرئيسي">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={"end" in link ? link.end : false}
                className={({ isActive }) =>
                  `nav-link${isActive ? " active" : ""}`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="header-actions">
            <button
              className="icon-button theme-switch"
              type="button"
              onClick={toggleTheme}
              aria-label="تبديل المظهر"
              title="تبديل المظهر"
            >
              <Icon name={theme === "light" ? "moon" : "sun"} size={19} />
            </button>

            {user ? (
              <Link to="/account" className="user-menu">
                <span className="avatar">{avatarLetter}</span>
                <span className="user-name">{firstName}</span>
                <Icon name="chevron-down" size={14} />
              </Link>
            ) : (
              <>
                <Link to="/login" className="login-link">
                  دخول
                </Link>
                <Link to="/register" className="btn btn-dark btn-sm">
                  إنشاء حساب <Icon name="arrow-left" size={16} />
                </Link>
              </>
            )}

            <button
              type="button"
              className="mobile-toggle icon-button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-label={menuOpen ? "إغلاق القائمة" : "فتح القائمة"}
              aria-expanded={menuOpen}
            >
              <Icon name={menuOpen ? "x" : "menu"} size={24} />
            </button>
          </div>
        </div>

        <div className={`mobile-panel${menuOpen ? " open" : ""}`}>
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={"end" in link ? link.end : false}
              className={({ isActive }) =>
                `mobile-link${isActive ? " active" : ""}`
              }
            >
              {link.label}
              <Icon name="chevron-left" size={16} />
            </NavLink>
          ))}

          {user ? (
            <Link to="/account" className="mobile-link">
              حسابي
            </Link>
          ) : (
            <>
              <Link to="/login" className="mobile-link">
                تسجيل الدخول
              </Link>
              <Link to="/register" className="mobile-link">
                إنشاء حساب
              </Link>
            </>
          )}
        </div>
      </header>
    </>
  );
}
