import { Link } from "react-router-dom";
import type { Trip } from "@/api/types";
import { CompanyLogo } from "@/components/CompanyLogo";
import { Icon } from "@/components/ui/Icon";
import { companyLabel } from "@/lib/company";
import {
  distanceKm,
  durationMinutes,
  durationText,
  money,
  timeText,
} from "@/lib/format";

export function TripCard({
  trip,
  people = 1,
}: {
  trip: Trip;
  people?: number;
}) {
  const duration = durationMinutes(trip.departureAt, trip.arrivalAt);
  const distance = distanceKm(trip.origin, trip.destination);
  const soldOut = trip.availableSeats <= 0;
  const companyName = companyLabel(trip.company);

  return (
    <article className="trip-card">
      <div className="trip-card-header">
        <div className="trip-company">
          <CompanyLogo company={trip.company} />
          <div>
            <strong>{companyName}</strong>
            <span className="rating">
              <Icon name="route" size={14} /> <i>·</i> رحلة مباشرة <i>·</i>{" "}
              {trip.code}
            </span>
          </div>
        </div>
        <span className="trip-type">
          <Icon name="bus" size={16} /> حافلة سياحية
        </span>
      </div>

      <div className="trip-card-body">
        <div className="trip-timing">
          <div className="timing-point">
            <b>{timeText(trip.departureAt)}</b>
            <span>{trip.origin.name}</span>
          </div>

          <div className="timing-route">
            <span>{durationText(duration)}</span>
            <div className="route-line">
              <i />
              <Icon name="bus" size={18} />
              <i />
            </div>
            <small>مباشرة</small>
          </div>

          <div className="timing-point">
            <b>{timeText(trip.arrivalAt)}</b>
            <span>{trip.destination.name}</span>
          </div>
        </div>

        <div className="trip-booking">
          <small>السعر للشخص</small>
          <b>{money(trip.price)}</b>
          <span className={`seats-left${soldOut ? " is-full" : ""}`}>
            <Icon name="seat" size={15} />{" "}
            {soldOut ? "لا مقاعد متاحة" : `${trip.availableSeats} مقعد متاح`}
          </span>

          {soldOut ? (
            <button className="btn btn-subtle" type="button" disabled>
              مكتملة العدد
            </button>
          ) : (
            <Link
              className="btn btn-primary"
              to={`/booking/${trip.id}?people=${people}`}
            >
              اختيار المقاعد <Icon name="arrow-left" size={16} />
            </Link>
          )}
        </div>
      </div>

      <div className="trip-card-footer">
        <span className="service-pill">
          <Icon name="seat" size={13} /> {trip.totalSeats} مقعدًا
        </span>
        <span className="service-pill">
          <Icon name="bus" size={13} /> {companyName}
        </span>
        <span className="trip-distance">
          <Icon name="route" size={15} /> ~{distance} كم
        </span>
      </div>
    </article>
  );
}
