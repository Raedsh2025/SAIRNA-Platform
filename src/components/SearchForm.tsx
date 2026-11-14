import { useMemo, useState, type FormEvent } from "react";
import type { City } from "@/api/types";
import { Icon } from "@/components/ui/Icon";
import { addDaysIso, todayIso } from "@/lib/format";

export interface SearchValues {
  originId: number;
  destinationId: number;
  date: string;
  people: number;
}

interface SearchFormProps {
  cities: City[];
  value: SearchValues;
  onChange: (next: SearchValues) => void;
  onSubmit: (values: SearchValues) => void;
  variant?: "home" | "results";
  submitting?: boolean;
}

export function SearchForm({
  cities,
  value,
  onChange,
  onSubmit,
  variant = "home",
  submitting = false,
}: SearchFormProps) {
  const [error, setError] = useState<string | null>(null);

  const minDate = useMemo(() => todayIso(), []);
  const maxDate = useMemo(() => addDaysIso(120), []);

  function update(patch: Partial<SearchValues>) {
    setError(null);
    onChange({ ...value, ...patch });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!cities.length) {
      setError("تعذّر تحميل قائمة المحافظات من الخادم.");
      return;
    }

    if (value.originId === value.destinationId) {
      setError("اختر محافظة وصول مختلفة عن محافظة الانطلاق.");
      return;
    }

    setError(null);
    onSubmit(value);
  }

  function swapCities() {
    update({ originId: value.destinationId, destinationId: value.originId });
  }

  return (
    <form
      className={`search-form${variant === "home" ? " home-search" : ""}`}
      onSubmit={handleSubmit}
      noValidate
    >
      <label className="search-field from-field">
        <Icon name="pin" size={19} />
        <span className="field-label">من وين؟</span>
        <select
          name="origin"
          aria-label="محافظة الانطلاق"
          value={value.originId || ""}
          onChange={(event) => update({ originId: Number(event.target.value) })}
        >
          {cities.length === 0 ? (
            <option value="">جارِ تحميل المحافظات…</option>
          ) : null}
          {cities.map((city) => (
            <option key={city.id} value={city.id}>
              {city.name}
            </option>
          ))}
        </select>
      </label>

      <button
        className="swap-button"
        type="button"
        onClick={swapCities}
        aria-label="تبديل المحافظات"
      >
        <Icon name="swap" size={19} />
      </button>

      <label className="search-field to-field">
        <Icon name="pin" size={19} />
        <span className="field-label">لوين؟</span>
        <select
          name="destination"
          aria-label="محافظة الوصول"
          value={value.destinationId || ""}
          onChange={(event) =>
            update({ destinationId: Number(event.target.value) })
          }
        >
          {cities.length === 0 ? (
            <option value="">جارِ تحميل المحافظات…</option>
          ) : null}
          {cities.map((city) => (
            <option key={city.id} value={city.id}>
              {city.name}
            </option>
          ))}
        </select>
      </label>

      <label className="search-field date-field">
        <Icon name="calendar" size={19} />
        <span className="field-label">تاريخ الرحلة</span>
        <input
          name="date"
          type="date"
          value={value.date}
          min={minDate}
          max={maxDate}
          onChange={(event) => update({ date: event.target.value })}
          required
        />
      </label>

      <label className="search-field people-field">
        <Icon name="users" size={19} />
        <span className="field-label">المسافرين</span>
        <select
          name="people"
          aria-label="عدد المسافرين"
          value={value.people}
          onChange={(event) => update({ people: Number(event.target.value) })}
        >
          {[1, 2, 3, 4].map((count) => (
            <option key={count} value={count}>
              {count} {count === 1 ? "مسافر" : "مسافرين"}
            </option>
          ))}
        </select>
      </label>

      <button
        type="submit"
        className="btn btn-primary search-submit"
        disabled={submitting}
      >
        <Icon name="search" size={19} />{" "}
        {submitting ? "جارِ البحث…" : "ابحث عن رحلات"}
      </button>

      {error ? (
        <span
          className="field-error"
          role="alert"
          style={{ gridColumn: "1 / -1" }}
        >
          {error}
        </span>
      ) : null}
    </form>
  );
}
