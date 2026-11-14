import { Link } from "react-router-dom";
import type { Booking } from "@/api/types";
import { useCancelBooking, useMyBookings } from "@/hooks";
import { CompanyLogo } from "@/components/CompanyLogo";
import { Icon } from "@/components/ui/Icon";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/States";
import { useAuth } from "@/lib/auth";
import { companyLabel } from "@/lib/company";
import { bookingCode, dateText, money, timeText } from "@/lib/format";

export function TripsPage() {
  const { isAuthenticated } = useAuth();
  const bookingsQuery = useMyBookings();
  const cancelBooking = useCancelBooking();

  const bookings = bookingsQuery.data ?? [];

  return (
    <main className="inner-main">
      <section className="page-banner">
        <div className="container">
          <div className="breadcrumb">
            <Link to="/">الرئيسية</Link>
            <Icon name="chevron-left" size={14} /> <span>حجوزاتي</span>
          </div>
          <span className="eyebrow">
            <span className="mini-star">
              <Icon name="sparkle" size={13} />
            </span>{" "}
            كل رحلاتك بمكان واحد
          </span>
          <h1 className="page-title">
            تذاكرك <span>دايماً معك.</span>
          </h1>
          <p>راقب حجوزاتك، وارجع لتفاصيل الرحلة وقت ما تحتاج.</p>
        </div>
      </section>

      <section className="container section">
        {!isAuthenticated ? (
          <EmptyState
            icon="lock"
            title="سجّل دخول لعرض حجوزاتك"
            description="الحجوزات مرتبطة بحسابك على الخادم، لذا تحتاج تسجيل الدخول أولًا."
            action={
              <div className="inline-actions">
                <Link to="/login" className="btn btn-primary">
                  تسجيل الدخول
                </Link>
                <Link to="/register" className="btn btn-outline">
                  إنشاء حساب
                </Link>
              </div>
            }
          />
        ) : (
          <>
            <div className="trips-top">
              <div>
                <h2>رحلاتي القادمة</h2>
                <p>
                  {bookings.length
                    ? "كل الحجوزات المسجّلة على حسابك."
                    : "ما في حجوزات بعد — ابدأ بأول رحلة إلك."}
                </p>
              </div>
              <Link to="/results" className="btn btn-primary btn-sm">
                <Icon name="plus" size={17} /> حجز جديد
              </Link>
            </div>

            {bookingsQuery.isLoading ? (
              <LoadingState label="جارِ تحميل حجوزاتك…" />
            ) : null}

            {!bookingsQuery.isLoading && bookingsQuery.error ? (
              <ErrorState
                error={bookingsQuery.error}
                onRetry={() => void bookingsQuery.refetch()}
                title="ما قدرنا نجيب حجوزاتك"
              />
            ) : null}

            {!bookingsQuery.isLoading && !bookingsQuery.error ? (
              <div className="my-trips-list">
                {bookings.length === 0 ? (
                  <EmptyState
                    icon="ticket"
                    title="ما في حجوزات بعد"
                    description="اختار رحلة وابدأ الحجز، وبتظهر تذكرتك هون."
                    action={
                      <Link to="/results" className="btn btn-primary">
                        ابحث عن رحلة
                      </Link>
                    }
                  />
                ) : (
                  bookings.map((booking) => (
                    <BookingCard
                      key={bookingCode(booking)}
                      booking={booking}
                      cancelling={cancelBooking.isPending}
                      onCancel={() => {
                        if (
                          window.confirm(`إلغاء الحجز ${bookingCode(booking)}؟`)
                        ) {
                          cancelBooking.mutate(booking.id);
                        }
                      }}
                    />
                  ))
                )}
              </div>
            ) : null}

            {cancelBooking.error ? (
              <p className="form-error" role="alert">
                <Icon name="info" size={17} />{" "}
                {cancelBooking.error instanceof Error
                  ? cancelBooking.error.message
                  : "تعذّر إلغاء الحجز."}
              </p>
            ) : null}
          </>
        )}
      </section>
    </main>
  );
}

function BookingCard({
  booking,
  onCancel,
  cancelling,
}: {
  booking: Booking;
  onCancel: () => void;
  cancelling: boolean;
}) {
  const trip = booking.trip ?? null;
  const cancelled = booking.status?.toUpperCase().includes("CANCEL");
  const seats = Array.isArray(booking.seats)
    ? booking.seats
        .map((seat) => seat.seatNumber)
        .filter((seat) => typeof seat === "number")
    : [];

  return (
    <article className="my-trip-card">
      <div className="mytrip-head">
        <div className="mytrip-head-main">
          <span className="ticket-icon">
            <Icon name="ticket" size={20} />
          </span>
          <div>
            <span className="small-muted">رقم الحجز</span>
            <b dir="ltr">{bookingCode(booking)}</b>
          </div>
        </div>

        <span className={`tag ${cancelled ? "tag-demo" : "tag-success"}`}>
          <Icon name={cancelled ? "info" : "check-circle"} size={15} />
          {cancelled ? "ملغى" : "مؤكّد"}
        </span>
      </div>

      <div className="mytrip-center">
        <div className="mytrip-route">
          <div>
            <small>من</small>
            <h3>{trip?.origin?.name ?? "—"}</h3>
            <b>{trip ? timeText(trip.departureAt) : "—"}</b>
          </div>

          <div className="mytrip-route-graphic">
            <span>
              <Icon name="bus" size={20} />
            </span>
            <div />
            <small>{trip ? dateText(trip.departureAt) : "—"}</small>
          </div>

          <div>
            <small>إلى</small>
            <h3>{trip?.destination?.name ?? "—"}</h3>
            <b>{trip ? timeText(trip.arrivalAt) : "—"}</b>
          </div>
        </div>

        <div className="mytrip-detail">
          {trip?.company ? (
            <span>
              <CompanyLogo company={trip.company} size="tiny" />{" "}
              {companyLabel(trip.company)}
            </span>
          ) : null}
          <span>
            <Icon name="seat" size={16} /> المقاعد:{" "}
            {seats.length ? seats.join("، ") : "—"}
          </span>
          <span>
            <Icon name="wallet" size={16} />{" "}
            {money(
              booking.totalPrice ??
                (trip ? trip.price * Math.max(seats.length, 1) : undefined),
            )}
          </span>
        </div>
      </div>

      <div className="mytrip-actions">
        <Link className="btn btn-outline" to={`/tracking/${booking.id}`}>
          <Icon name="route" size={17} /> تتبّع الرحلة
        </Link>
        <Link className="btn btn-subtle" to={`/success/${booking.id}`}>
          <Icon name="ticket" size={17} /> عرض التذكرة
        </Link>
        {!cancelled ? (
          <button
            className="btn btn-subtle"
            type="button"
            onClick={onCancel}
            disabled={cancelling}
          >
            <Icon name="x" size={16} /> إلغاء
          </button>
        ) : null}
      </div>
    </article>
  );
}
