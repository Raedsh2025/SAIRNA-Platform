import { Link, useParams } from "react-router-dom";
import { useBooking } from "@/hooks";
import { Icon } from "@/components/ui/Icon";
import { ErrorState, LoadingState } from "@/components/ui/States";
import { useAuth } from "@/lib/auth";
import { bookingCode, dateText, money, timeText } from "@/lib/format";

export function SuccessPage() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const { isAuthenticated } = useAuth();
  const bookingQuery = useBooking(bookingId ?? null);

  const booking = bookingQuery.data;

  return (
    <main className="success-page container">
      {bookingQuery.isLoading ? (
        <LoadingState label="جارِ تحميل التذكرة…" />
      ) : null}

      {!bookingQuery.isLoading && bookingQuery.error ? (
        <ErrorState
          error={bookingQuery.error}
          onRetry={() => void bookingQuery.refetch()}
        />
      ) : null}

      {!bookingQuery.isLoading && !bookingQuery.error ? (
        booking ? (
          <div className="success-card">
            <div className="success-icon">
              <Icon name="check" size={43} />
            </div>

            <span className="eyebrow">
              <span className="mini-star">
                <Icon name="sparkle" size={13} />
              </span>{" "}
              صار الحجز جاهز
            </span>

            <h1>
              يا سلام! <span>تم تأكيد حجزك.</span>
            </h1>
            <p>
              انضافت التذكرة إلى «حجوزاتي». هلق بتقدر تراجعها وتتابع الرحلة.
            </p>

            <div className="confirmation-ticket">
              <div>
                <span>رقم الحجز</span>
                <strong dir="ltr">{bookingCode(booking)}</strong>
              </div>
              <span className="ticket-dashes" />
              <div>
                <span>الوجهة</span>
                <strong>
                  {booking.trip
                    ? `${booking.trip.origin.name} ← ${booking.trip.destination.name}`
                    : "—"}
                </strong>
              </div>
              <span className="ticket-dashes" />
              <div>
                <span>المقاعد</span>
                <strong>
                  {Array.isArray(booking.seats) && booking.seats.length
                    ? booking.seats.map((seat) => seat.seatNumber).join("، ")
                    : "—"}
                </strong>
              </div>
            </div>

            {booking.trip ? (
              <div
                className="summary-details"
                style={{ marginTop: 18, textAlign: "start" }}
              >
                <div>
                  <span>تاريخ الرحلة</span>
                  <strong>{dateText(booking.trip.departureAt)}</strong>
                </div>
                <div>
                  <span>الانطلاق</span>
                  <strong>{timeText(booking.trip.departureAt)}</strong>
                </div>
                <div>
                  <span>الوصول</span>
                  <strong>{timeText(booking.trip.arrivalAt)}</strong>
                </div>
                <div>
                  <span>الإجمالي</span>
                  <strong>
                    {money(booking.totalPrice ?? booking.trip.price)}
                  </strong>
                </div>
              </div>
            ) : null}

            <div className="success-actions">
              <Link to="/trips" className="btn btn-primary">
                عرض تذكرتي <Icon name="ticket" size={17} />
              </Link>
              <Link to={`/tracking/${booking.id}`} className="btn btn-outline">
                تتبّع الرحلة <Icon name="route" size={17} />
              </Link>
            </div>
          </div>
        ) : (
          <div className="success-card">
            <div className="success-icon">
              <Icon name="ticket" size={43} />
            </div>
            <h1>
              ما في حجز جديد <span>حاليًا</span>
            </h1>
            <p>
              {isAuthenticated
                ? "ما لقينا هذا الحجز على حسابك. جرّب من صفحة حجوزاتي."
                : "سجّل دخولك لعرض تفاصيل الحجز."}
            </p>
            <div className="success-actions">
              <Link to="/trips" className="btn btn-primary">
                حجوزاتي
              </Link>
              <Link to="/results" className="btn btn-outline">
                احجز رحلة
              </Link>
            </div>
          </div>
        )
      ) : null}
    </main>
  );
}
