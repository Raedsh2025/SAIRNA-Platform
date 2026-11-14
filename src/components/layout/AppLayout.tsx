import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Header } from "./Header";
import { Footer } from "./Footer";

/** يعيد التمرير لأعلى الصفحة عند تغيير المسار. */
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname]);

  return null;
}

export function AppLayout() {
  return (
    <div className="app-root">
      <ScrollToTop />
      <Header />
      <Outlet />
      <Footer />
    </div>
  );
}
