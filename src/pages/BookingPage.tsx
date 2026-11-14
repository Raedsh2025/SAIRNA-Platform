import { Fragment, useMemo, useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { useCreateBooking, useSeatMap, useTrip } from "@/hooks";
import type { PassengerSeat } from "@/api/types";
import { CompanyLogo } from "@/components/CompanyLogo";
import { Icon } from "@/components/ui/Icon";
import { ErrorState, LoadingState } from "@/components/ui/States";
import { useAuth } from "@/lib/auth";
import { companyLabel } from "@/lib/company";
import {
  dateText,
  durationMinutes,
  durationText,
  money,
  timeText,
} from "@/lib/format";

type Step = "seats" | "passengers" | "review";

const STEPS: Array<{ key: Step; label: string }> = [
  { key: "seats", label: "اختيار المقاعد" },
  { key: "passengers", label: "بيانات المسافرين" },
  { key: "review", label: "المراجعة والتأكيد" },
];

export function BookingPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const id = Number(tripId);
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  const { user, isAuthenticated } = useAuth();
  const tripQuery = useTrip(Number.isFinite(id) ? id : null);
  const seatMapQuery = useSeatMap(Number.isFinite(id) ? id : null);
  const createBooking = useCreateBooking();

  const people = Math.min(4, Math.max(1, Number(params.get("people")) || 1));

  const [step, setStep] = useState<Step>("seats");
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const [passengers, setPassengers] = useState<PassengerSeat[]>([]);
  const [payment, setPayment] = useState<"office" | "demo">("office");
  const [formError, setFormError] = useState<string | null>(null);

  const trip = tripQuery.data;
  const seatMap = seatMapQuery.data;

  const occupied = useMemo(
    () => new Set(seatMap?.occupiedSeats ?? []),
    [seatMap],
  );

  const totalSeats = trip?.totalSeats ?? seatMap?.totalSeats ?? 40;
  const rows = useMemo(() => {
    const result: number[][] = [];
    for (let start = 1; start <= totalSeats; start += 4) {
      result.push(
        Array.from(
          { length: Math.min(4, totalSeats - start + 1) },
          (_, index) => start + index,
        ),
      );
    }
    return result;
  }, [totalSeats]);

  function toggleSeat(seatNumber: number) {
    if (occupied.has(seatNumber)) return;
    setFormError(null);

    setSelectedSeats((current) => {
      if (current.includes(seatNumber)) {
        return current.filter((seat) => seat !== seatNumber);
      }
      if (current.length >= people) {
        // نستبدل آخر اختيار بدل رفض النقر — تجربة أنعم.
        return [...current.slice(1), seatNumber];
      }
      return [...current, seatNumber];
    });
  }

  function goNext() {
    if (step === "seats") {
      if (selectedSeats.length !== people) {
        setFormError(
          `اختار ${people} مقعد${people === 1 ? "" : "ين"} للمتابعة.`,
        );
        return;
      }

      setPassengers((current) =>
        selectedSeats.map((seatNumber, index) => ({
          seatNumber,
          passengerName:
            current[index]?.passengerName ??
            (index === 0 ? (user?.name ?? "") : ""),
          passengerPhone: current[index]?.passengerPhone ?? "",
        })),
      );
      setFormError(null);
      setStep("passengers");
      return;
    }

    if (step === "passengers") {
      const invalid = passengers.find(
        (passenger) =>
          passenger.passengerName.trim().length < 3 ||
          passenger.passengerPhone.trim().length < 9,
      );

      if (invalid) {
        setFormError(
          "أكمل اسم كل مسافر (3 أحرف على الأقل) ورقم موبايل صحيح (9 أرقام على الأقل).",
        );
        return;
      }

      setFormError(null);
      setStep("review");
    }
  }

  function goBack() {
    setFormError(null);
    if (step === "review") setStep("passengers");
    else if (step === "passengers") setStep("seats");
  }

  function confirmBooking() {
    if (!trip) return;

    if (!isAuthenticated) {
      navigate("/login", {
        state: { from: location.pathname + location.search },
      });
      return;
    }

    setFormError(null);
    createBooking.mutate(
      { tripId: trip.id, seats: passengers },
      {
        onSuccess: (booking) => {
          navigate(`/success/${booking.id}`, { replace: true });
        },
        onError: (error) => {
          setFormError(
            error instanceof Error ? error.message : "تعذّر تأكيد الحجز.",
          );
        },
      },
    );
  }

  if (tripQuery.isLoading || seatMapQuery.isLoading) {
    return (
      <main className="inner-main">
        <div className="container">
          <LoadingState label="جارِ تحميل تفاصيل الرحلة والمقاعد…" />
        </div>
      </main>
    );
  }

  if (tripQuery.error || !trip) {
    return (
      <main className="inner-main">
        <div className="container">
          <ErrorState
            error={tripQuery.error}
            title="ما قدرنا نجيب تفاصيل الرحلة"
            onRetry={() => void tripQuery.refetch()}
          />
        </div>
      </main>
    );
  }

  const stepIndex = STEPS.findIndex((item) => item.key === step);
  const total = trip.price * people;

  return (
    <main className="inner-main booking-page">
      <section className="container booking-head">
        <div className="breadcrumb">
          <Link to="/">الرئيسية</Link>
          <Icon name="chevron-left" size={14} />
          <Link to="/results">الرحلات</Link>
          <Icon name="chevron-left" size={14} />
          <span>إتمام الحجز</span>
        </div>

        <div className="booking-title-row">
          <div>
            <span className="eyebrow">
              <span className="mini-star">
                <Icon name="sparkle" size={13} />
              </span>{" "}
              باقي شوي وتوصل
            </span>
            <h1>
              كمّل حجز <span>رحلتك.</span>
            </h1>
          </div>
          <Link to="/results" className="quiet-back">
            <Icon name="arrow-right" size={17} /> تغيير الرحلة
          </Link>
        </div>

        <div className="stepper">
          {STEPS.map((item, index) => (
            <Fragment key={item.key}>
              <div
                className={`step${index === stepIndex ? " current" : ""}${index < stepIndex ? " done" : ""}`}
              >
                <span>
                  {index < stepIndex ? (
                    <Icon name="check" size={17} />
                  ) : (
                    index + 1
                  )}
                </span>
                <b>{item.label}</b>
              </div>
              {index < STEPS.length - 1 ? (
                <div className="step-connector" />
              ) : null}
            </Fragment>
          ))}
        </div>
      </section>

      <section className="container booking-layout">
        <div className="booking-main-card">
          {step === "seats" ? (
            <>
              <div className="stage-head">
                <h2>
                  اختار مكانك المفضّل <Icon name="seat" size={23} />
                </h2>
                <p>
                  اختار {people} {people === 1 ? "مقعد" : "مقاعد"} من المخطط.
                  المقاعد الرمادية محجوزة مسبقاً.
                </p>
              </div>

              <div className="seat-stage">
                <div className="seat-map-card">
                  <div className="bus-driver">
                    <span>
                      <Icon name="bus" size={20} /> مقدمة الحافلة
                    </span>
                    <span className="steering-wheel">
                      <Icon name="steering" size={27} />
                    </span>
                  </div>

                  <div className="bus-cabin">
                    {rows.map((row, rowIndex) => {
                      const half = Math.ceil(row.length / 2);
                      return (
                        <div className="seat-row" key={rowIndex}>
                          <span className="seat-row-index">
                            {String(rowIndex + 1).padStart(2, "0")}
                          </span>

                          {row.slice(0, half).map((seatNumber) => (
                            <SeatButton
                              key={seatNumber}
                              number={seatNumber}
                              busy={occupied.has(seatNumber)}
                              selected={selectedSeats.includes(seatNumber)}
                              onToggle={toggleSeat}
                            />
                          ))}

                          <span className="seat-aisle" />

                          {row.slice(half).map((seatNumber) => (
                            <SeatButton
                              key={seatNumber}
                              number={seatNumber}
                              busy={occupied.has(seatNumber)}
                              selected={selectedSeats.includes(seatNumber)}
                              onToggle={toggleSeat}
                            />
                          ))}
                        </div>
                      );
                    })}
                  </div>

                  <div className="seat-legend">
                    <span>
                      <i className="legend-available" /> متاح
                    </span>
                    <span>
                      <i className="legend-selected" /> مختار
                    </span>
                    <span>
                      <i className="legend-busy" /> محجوز
                    </span>
                  </div>
                </div>

                <div className="seat-stage-aside">
                  <div className="seat-hint-card">
                    <span className="hint-icon">
                      <Icon name="seat" size={24} />
                    </span>
                    <h3>مكانك، راحتك.</h3>
                    <p>
                      اختار مقعدك حسب تفضيلك. المكان عند الشباك أو بالممر،
                      الخيار إلك.
                    </p>

                    <div className="seat-counter">
                      <span>المقاعد المختارة</span>
                      <strong dir="ltr">
                        {selectedSeats.length} / {people}
                      </strong>
                    </div>

                    <div className="seat-selection-tags">
                      {selectedSeats.length ? (
                        selectedSeats.map((seatNumber) => (
                          <span key={seatNumber}>مقعد {seatNumber}</span>
                        ))
                      ) : (
                        <span className="muted">لسا ما اخترت مقعد</span>
                      )}
                    </div>
                  </div>

                  <div className="soft-info">
                    <Icon name="info" size={19} />{" "}
                    <span>لتكمل، اختار عدد مقاعد مساوي لعدد المسافرين.</span>
                  </div>
                </div>
              </div>
            </>
          ) : null}

          {step === "passengers" ? (
            <>
              <div className="stage-head">
                <h2>
                  مين مسافر معنا؟ <Icon name="users" size={23} />
                </h2>
                <p>دخل بيانات المسافرين حسب عدد المقاعد المختارة.</p>
              </div>

              <div className="passengers-list">
                {passengers.map((passenger, index) => (
                  <div className="passenger-card" key={passenger.seatNumber}>
                    <div className="passenger-heading">
                      <span className="passenger-index">{index + 1}</span>
                      <b>المسافر {index + 1}</b>
                      <small>مقعد رقم {passenger.seatNumber}</small>
                    </div>

                    <div className="input-grid">
                      <label className="form-group">
                        <span>
                          الاسم الكامل <em>*</em>
                        </span>
                        <div className="field-control">
                          <Icon name="user" size={18} />
                          <input
                            name="name"
                            value={passenger.passengerName}
                            placeholder="مثال: أحمد خالد"
                            minLength={3}
                            required
                            autoComplete="name"
                            onChange={(event) => {
                              const value = event.target.value;
                              setPassengers((current) =>
                                current.map((item, itemIndex) =>
                                  itemIndex === index
                                    ? { ...item, passengerName: value }
                                    : item,
                                ),
                              );
                            }}
                          />
                        </div>
                      </label>

                      <label className="form-group">
                        <span>
                          رقم الموبايل <em>*</em>
                        </span>
                        <div className="field-control">
                          <Icon name="phone" size={18} />
                          <input
                            name="phone"
                            type="tel"
                            inputMode="tel"
                            dir="ltr"
                            placeholder="09xxxxxxxx"
                            value={passenger.passengerPhone}
                            minLength={9}
                            required
                            autoComplete="tel"
                            onChange={(event) => {
                              const value = event.target.value;
                              setPassengers((current) =>
                                current.map((item, itemIndex) =>
                                  itemIndex === index
                                    ? { ...item, passengerPhone: value }
                                    : item,
                                ),
                              );
                            }}
                          />
                        </div>
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : null}

          {step === "review" ? (
            <>
              <div className="stage-head">
                <h2>
                  كل شي جاهز؟ <Icon name="check-circle" size={24} />
                </h2>
                <p>راجع معلومات الرحلة قبل ما تثبّت الحجز.</p>
              </div>

              <div className="review-panel">
                <h3>تفاصيل المسافرين</h3>
                {passengers.map((passenger) => (
                  <div className="review-passenger" key={passenger.seatNumber}>
                    <span className="review-avatar">
                      <Icon name="user" size={19} />
                    </span>
                    <div>
                      <b>{passenger.passengerName}</b>
                      <span dir="ltr">{passenger.passengerPhone}</span>
                    </div>
                    <small>المقعد {passenger.seatNumber}</small>
                  </div>
                ))}
              </div>

              <div className="review-panel">
                <h3>طريقة تأكيد الحجز</h3>

                <label className="payment-choice">
                  <input
                    type="radio"
                    name="payment"
                    value="office"
                    checked={payment === "office"}
                    onChange={() => setPayment("office")}
                  />
                  <span className="payment-icon">
                    <Icon name="wallet" size={22} />
                  </span>
                  <span>
                    <b>الدفع في مكتب الشركة</b>
                    <small>ادفع عند الحضور لمكتب الشركة قبل الرحلة.</small>
                  </span>
                </label>

                <label className="payment-choice">
                  <input
                    type="radio"
                    name="payment"
                    value="demo"
                    checked={payment === "demo"}
                    onChange={() => setPayment("demo")}
                  />
                  <span className="payment-icon">
                    <Icon name="card" size={22} />
                  </span>
                  <span>
                    <b>دفع إلكتروني (تجريبي)</b>
                    <small>
                      محاكاة لواجهة الدفع فقط؛ لن يتم تحصيل أي مبلغ.
                    </small>
                  </span>
                </label>
              </div>

              <p className="review-alert">
                <Icon name="shield" size={18} /> بتأكيد الحجز، رح تنضاف تذكرة
                إلى قائمة «حجوزاتي» المرتبطة بحسابك.
              </p>
            </>
          ) : null}

          {formError ? (
            <p className="form-error" role="alert">
              <Icon name="info" size={17} /> {formError}
            </p>
          ) : null}

          <div className="booking-controls">
            {step === "seats" ? (
              <Link to="/results" className="btn btn-subtle">
                <Icon name="arrow-right" size={17} /> رجوع للرحلات
              </Link>
            ) : (
              <button className="btn btn-subtle" type="button" onClick={goBack}>
                <Icon name="arrow-right" size={17} /> السابق
              </button>
            )}

            {step === "review" ? (
              <button
                className="btn btn-primary"
                type="button"
                onClick={confirmBooking}
                disabled={createBooking.isPending}
              >
                {createBooking.isPending ? "جارِ التأكيد…" : "تأكيد الحجز"}
                <Icon name="arrow-left" size={17} />
              </button>
            ) : (
              <button
                className="btn btn-primary"
                type="button"
                onClick={goNext}
              >
                متابعة الحجز <Icon name="arrow-left" size={17} />
              </button>
            )}
          </div>
        </div>

        <aside className="summary-card">
          <div className="summary-title">
            <Icon name="ticket" size={21} />
            <h3>ملخص الحجز</h3>
          </div>

          <div className="summary-company">
            <CompanyLogo company={trip.company} />
            <div>
              <strong>{companyLabel(trip.company)}</strong>
              <small>رحلة مباشرة · {trip.code}</small>
            </div>
          </div>

          <div className="summary-route">
            <div>
              <small>الانطلاق</small>
              <b>{trip.origin.name}</b>
              <span>{timeText(trip.departureAt)}</span>
            </div>
            <span className="summary-arrow">
              <Icon name="arrow-left" size={21} />
            </span>
            <div>
              <small>الوصول</small>
              <b>{trip.destination.name}</b>
              <span>{timeText(trip.arrivalAt)}</span>
            </div>
          </div>

          <div className="summary-details">
            <div>
              <span>تاريخ الرحلة</span>
              <strong>{dateText(trip.departureAt)}</strong>
            </div>
            <div>
              <span>المدة</span>
              <strong>
                {durationText(
                  durationMinutes(trip.departureAt, trip.arrivalAt),
                )}
              </strong>
            </div>
            <div>
              <span>المسافرين</span>
              <strong>{people}</strong>
            </div>
            <div>
              <span>المقاعد</span>
              <strong>
                {selectedSeats.length
                  ? [...selectedSeats].sort((a, b) => a - b).join("، ")
                  : "لم تُحدّد بعد"}
              </strong>
            </div>
            <div>
              <span>السعر للمسافر</span>
              <strong>{money(trip.price)}</strong>
            </div>
          </div>

          <div className="summary-total">
            <span>السعر الإجمالي</span>
            <b>{money(total)}</b>
          </div>

          <p className="summary-trust">
            <Icon name="shield" size={17} /> الحجز يتم فعليًا على الخادم ويظهر
            في «حجوزاتي».
          </p>
        </aside>
      </section>
    </main>
  );
}

function SeatButton({
  number,
  busy,
  selected,
  onToggle,
}: {
  number: number;
  busy: boolean;
  selected: boolean;
  onToggle: (seatNumber: number) => void;
}) {
  return (
    <button
      type="button"
      disabled={busy}
      className={`seat-btn${busy ? " busy" : ""}${selected ? " selected" : ""}`}
      aria-label={`مقعد ${number}${busy ? " محجوز" : ""}`}
      aria-pressed={selected}
      onClick={() => onToggle(number)}
    >
      <Icon name="seat" size={24} />
      <small>{number}</small>
    </button>
  );
}
