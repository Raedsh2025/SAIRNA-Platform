import { Link, useNavigate } from "react-router-dom";
import { useMyBookings } from "@/hooks";
import { Icon } from "@/components/ui/Icon";
import { EmptyState } from "@/components/ui/States";
import { useAuth } from "@/lib/auth";

export function AccountPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const bookingsQuery = useMyBookings();

  if (!user) {
    return (
      <main className="container account-guest">
        <EmptyState
          icon="user"
          title="أهلاً فيك!"
          description="سجّل دخول لحتى تشوف معلومات حسابك."
          action={
            <Link to="/login" className="btn btn-primary">
              تسجيل الدخول
            </Link>
          }
        />
      </main>
    );
  }

  const bookingsCount = bookingsQuery.data?.length ?? 0;

  return (
    <main className="inner-main">
      <section className="page-banner">
        <div className="container">
          <span className="eyebrow">
            <span className="mini-star">
              <Icon name="sparkle" size={13} />
            </span>{" "}
            ملفك الشخصي
          </span>
          <h1 className="page-title">
            أهلاً {user.name.split(/\s+/)[0]}{" "}
            <span>
              <Icon name="hand" size={28} />
            </span>
          </h1>
          <p>هون كل التفاصيل المتعلقة بحسابك.</p>
        </div>
      </section>

      <section className="container section">
        <div className="account-layout">
          <div className="account-profile">
            <div className="account-avatar">
              {(user.name.trim()[0] ?? "م").toUpperCase()}
            </div>
            <h2>{user.name}</h2>
            <span dir="ltr">{user.email}</span>
            <div className="account-stat">
              <Icon name="ticket" size={19} /> <b>{bookingsCount}</b> حجوزات
              محفوظة
            </div>
            <button
              className="btn btn-outline full"
              type="button"
              onClick={() => {
                signOut();
                navigate("/");
              }}
            >
              <Icon name="logout" size={17} /> تسجيل الخروج
            </button>
          </div>

          <div className="account-details">
            <h2>معلومات الحساب</h2>

            <div className="account-item">
              <span>الاسم الكامل</span>
              <b>{user.name}</b>
            </div>
            <div className="account-item">
              <span>البريد الإلكتروني</span>
              <b dir="ltr">{user.email}</b>
            </div>
            <div className="account-item">
              <span>الهاتف</span>
              <b dir="ltr">{user.phone || "غير مسجّل"}</b>
            </div>
            <div className="account-item">
              <span>نوع الحساب</span>
              <b>{user.role === "ADMIN" ? "مدير" : "مسافر"}</b>
            </div>

            <Link to="/trips" className="btn btn-primary">
              انتقل لحجوزاتي <Icon name="arrow-left" size={17} />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
