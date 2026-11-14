import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useMyBookings } from "@/hooks";
import { CompanyLogo } from "@/components/CompanyLogo";
import { RouteMap } from "@/components/RouteMap";
import { Icon } from "@/components/ui/Icon";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/States";
import { useAuth } from "@/lib/auth";
import { companyLabel } from "@/lib/company";
import { dateText, distanceKm, timeText } from "@/lib/format";

function formatRemaining(minutes: number): string {
  if (minutes <= 0) return "وصلت";
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (!hours) return `${rest} دقيقة`;
  return `${hours} س ${rest} د`;
}

export function TrackingPage() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const { isAuthenticated } = useAuth();
  const bookingsQuery = useMyBookings();
  const [progress, setProgress] = useState(0.48);
  const [playing, setPlaying] = useState(true);

  const bookings = bookingsQuery.data ?? [];
  const booking = useMemo(() => {
    if (!bookings.length) return null;
    if (bookingId) {
      return (
        bookings.find((item) => String(item.id) === bookingId) ?? bookings[0]
      );
    }
    return bookings[0];
  }, [bookings, bookingId]);

  useEffect(() => {
    if (!playing) return;

    const timer = window.setInterval(() => {
      setProgress((current) => {
        if (current >= 1) return 0;
        return Math.min(1, current + 0.004);
      });
    }, 120);

    return () => window.clearInterval(timer);
  }, [playing]);

  if (!isAuthenticated) {
    return (
      <main className="tracking-main">
        <div className="container">
          <EmptyState
            icon="lock"
            title="تتبّع الرحلة يحتاج تسجيل الدخول"
            description="الحجوزات مرتبطة بحسابك، سجّل الدخول لتشاهد مسار رحلتك."
            action={
              <Link to="/login" className="btn btn-primary">
                تسجيل الدخول
              </Link>
            }
          />
        </div>
      </main>
    );
  }

  if (bookingsQuery.isLoading) {
    return (
      <main className="tracking-main">
        <div className="container">
          <LoadingState label="جارِ تحميل حجوزاتك…" />
        </div>
      </main>
    );
  }

  if (bookingsQuery.error) {
    return (
      <main className="tracking-main">
        <div className="container">
          <ErrorState
            error={bookingsQuery.error}
            onRetry={() => void bookingsQuery.refetch()}
          />
        </div>
      </main>
    );
  }

  if (!booking) {
    return (
      <main className="tracking-main">
        <div className="container">
          <EmptyState
            icon="route"
            title="ما في رحلة لتتبّعها"
            description="احجز رحلة أولًا، وبعدها بتقدر تشوف مسارها هون."
            action={
              <Link to="/results" className="btn btn-primary">
                ابحث عن رحلة
              </Link>
            }
          />
        </div>
      </main>
    );
  }

  const trip = booking.trip ?? null;
  const originName = trip?.origin?.name ?? "محطة الانطلاق";
  const destinationName = trip?.destination?.name ?? "محطة الوصول";
  const distance = trip ? distanceKm(trip.origin, trip.destination) : 0;
  const remainingMinutes = Math.round((((1 - progress) * distance) / 63) * 60);

  return (
    <main className="tracking-main">
      <section className="container tracking-title">
        <div>
          <div className="breadcrumb">
            <Link to="/">الرئيسية</Link>
            <Icon name="chevron-left" size={14} />
            <Link to="/trips">حجوزاتي</Link>
            <Icon name="chevron-left" size={14} />
            <span>تتبّع الرحلة</span>
          </div>
          <span className="eyebrow">
            <span className="mini-star">
              <Icon name="sparkle" size={13} />
            </span>{" "}
            تابع الطريق
          </span>
          <h1>
            رحلتك قدام عيونك{" "}
            <span className="tracking-live">
              <Icon name="navigation" size={15} /> محاكاة تفاعلية
            </span>
          </h1>
          <p>خط السير على الخريطة مع محطات ووقت وصول تقديري.</p>
        </div>

        <div className="tracking-actions">
          <Link to="/trips" className="btn btn-outline">
            <Icon name="arrow-right" size={17} /> كل الحجوزات
          </Link>
        </div>
      </section>

      <section className="container tracking-layout">
        <aside className="tracking-sidebar">
          <div className="tracking-status">
            <span className="status-dot" /> على الطريق{" "}
            <small>{String(booking.id)}</small>
          </div>

          <div className="track-route-heading">
            <div>
              <small>من</small>
              <h2>{originName}</h2>
            </div>
            <span>
              <Icon name="arrow-left" size={21} />
            </span>
            <div>
              <small>إلى</small>
              <h2>{destinationName}</h2>
            </div>
          </div>

          {trip ? (
            <div className="track-company">
              <CompanyLogo company={trip.company} />
              <div>
                <b>{companyLabel(trip.company)}</b>
                <small>موعد الانطلاق {timeText(trip.departureAt)}</small>
              </div>
            </div>
          ) : null}

          <div className="track-divider" />

          <div className="track-progress-head">
            <h3>تقدّم الرحلة</h3>
            <strong>{Math.round(progress * 100)}%</strong>
          </div>

          <div className="progress-bar">
            <span style={{ width: `${Math.round(progress * 100)}%` }} />
          </div>

          <div className="track-timeline">
            <div className="timeline-stop">
              <span className="stop-indicator completed">
                <Icon name="check" size={13} />
              </span>
              <div>
                <b>{originName}</b>
                <small>محطة الانطلاق</small>
              </div>
              <time>{trip ? timeText(trip.departureAt) : "—"}</time>
            </div>

            <div className="timeline-stop active">
              <span className="stop-indicator">
                <Icon name="bus" size={14} />
              </span>
              <div>
                <b>على الطريق</b>
                <small>الحافلة تتحرك نحو الوجهة</small>
              </div>
              <time>الآن*</time>
            </div>

            <div className="timeline-stop">
              <span className="stop-indicator last">
                <Icon name="pin" size={13} />
              </span>
              <div>
                <b>{destinationName}</b>
                <small>محطة الوصول</small>
              </div>
              <time>{trip ? timeText(trip.arrivalAt) : "—"}</time>
            </div>
          </div>

          <div className="track-quick-stats">
            <div>
              <span>
                <Icon name="route" size={16} /> المسافة الكلية
              </span>
              <b>~{distance} كم</b>
            </div>
            <div>
              <span>
                <Icon name="clock" size={16} /> المتبقي التقديري
              </span>
              <b>{formatRemaining(remainingMinutes)}</b>
            </div>
          </div>

          <div className="track-controls">
            <button
              className="btn btn-primary"
              type="button"
              onClick={() => setPlaying((value) => !value)}
            >
              <Icon name={playing ? "pause" : "play"} size={17} />{" "}
              {playing ? "إيقاف الحركة" : "تشغيل الحركة"}
            </button>
            <button
              className="btn btn-outline small-square"
              type="button"
              onClick={() => setProgress(0)}
              aria-label="إعادة المحاكاة"
            >
              <Icon name="refresh" size={18} />
            </button>
          </div>

          <p className="tracking-warning">
            <Icon name="info" size={17} /> هذه محاكاة تعليمية فوق خريطة توضيحية،
            وليست تتبّع GPS.
          </p>
        </aside>

        <div className="tracking-map-panel">
          <div className="map-toolbar">
            <div>
              <span className="map-green-dot" /> خريطة مسار الرحلة
            </div>
            <div className="map-toggle">
              <span>
                <Icon name="globe" size={16} /> عرض الخريطة
              </span>
            </div>
          </div>

          <RouteMap
            origin={trip?.origin}
            destination={trip?.destination}
            progress={progress}
          />

          <div className="map-bottom-overlay">
            <span>
              <Icon name="pin" size={17} /> {originName} ← {destinationName}
            </span>
            <span className="map-caption">
              {trip ? dateText(trip.departureAt) : "—"} · المسار تقريبي
            </span>
          </div>
        </div>
      </section>
    </main>
  );
}
