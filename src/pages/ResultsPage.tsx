import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useCities, useCompanies, useTrips } from "@/hooks";
import { SearchForm, type SearchValues } from "@/components/SearchForm";
import { TripCard } from "@/components/TripCard";
import { CompanyLogo } from "@/components/CompanyLogo";
import { Icon } from "@/components/ui/Icon";
import {
  EmptyState,
  ErrorState,
  LoadingState,
  Notice,
} from "@/components/ui/States";
import { companyLabel } from "@/lib/company";
import {
  addDaysIso,
  dateText,
  departureHour,
  durationMinutes,
} from "@/lib/format";

type TimeFilter = "all" | "morning" | "afternoon" | "evening";
type SortKey = "earliest" | "cheap" | "quick";

const TIME_FILTERS: Array<{ value: TimeFilter; label: string }> = [
  { value: "all", label: "كل الأوقات" },
  { value: "morning", label: "صباحاً (قبل 12)" },
  { value: "afternoon", label: "ظهراً (12–17)" },
  { value: "evening", label: "مساءً (بعد 17)" },
];

const SORT_OPTIONS: Array<{ value: SortKey; label: string }> = [
  { value: "earliest", label: "وقت الانطلاق" },
  { value: "cheap", label: "أقل سعر" },
  { value: "quick", label: "أقصر مدة" },
];

function matchesTime(hour: number, filter: TimeFilter): boolean {
  if (filter === "morning") return hour < 12;
  if (filter === "afternoon") return hour >= 12 && hour < 17;
  if (filter === "evening") return hour >= 17;
  return true;
}

export function ResultsPage() {
  const [params, setParams] = useSearchParams();
  const citiesQuery = useCities();
  const companiesQuery = useCompanies();

  const cities = citiesQuery.data ?? [];
  const companies = companiesQuery.data ?? [];

  const urlCompanyId = Number(params.get("companyId")) || null;
  const [companyFilter, setCompanyFilter] = useState<number | null>(
    urlCompanyId,
  );
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");
  const [sort, setSort] = useState<SortKey>("earliest");

  const search = useMemo<SearchValues>(() => {
    const aleppo = cities.find((city) => city.name.includes("حلب"));
    const damascus = cities.find((city) => city.name.includes("دمشق"));

    return {
      originId:
        Number(params.get("originId")) || aleppo?.id || cities[0]?.id || 0,
      destinationId:
        Number(params.get("destinationId")) ||
        damascus?.id ||
        cities[1]?.id ||
        0,
      date: params.get("date") || addDaysIso(1),
      people: Math.min(4, Math.max(1, Number(params.get("people")) || 1)),
    };
  }, [params, cities]);

  const [draft, setDraft] = useState<SearchValues>(search);

  useEffect(() => {
    setDraft(search);
  }, [search]);

  useEffect(() => {
    setCompanyFilter(urlCompanyId);
  }, [urlCompanyId]);

  const baseFilters = {
    originId: search.originId || undefined,
    destinationId: search.destinationId || undefined,
    companyId: companyFilter ?? undefined,
  };

  const tripsQuery = useTrips({ ...baseFilters, date: search.date });

  /** نستبعد الرحلات التي انطلقت فعليًا حتى لا تظهر ضمن نتائج الحجز. */
  const upcomingOnly = useMemo(() => {
    const threshold = Date.now() - 30 * 60 * 1000;
    return (trips: typeof tripsQuery.data) =>
      (trips ?? []).filter(
        (trip) => new Date(trip.departureAt).getTime() > threshold,
      );
  }, [tripsQuery.data]);

  const primaryTrips = useMemo(
    () => upcomingOnly(tripsQuery.data),
    [upcomingOnly, tripsQuery.data],
  );

  // الخادم التجريبي قد لا يملك رحلات في التاريخ المحدد — نعرض كل المتاح كبديل.
  const needsFallback =
    tripsQuery.isSuccess && primaryTrips.length === 0 && Boolean(search.date);

  const fallbackQuery = useTrips(baseFilters, { enabled: needsFallback });

  const rawTrips = useMemo(
    () =>
      primaryTrips.length > 0 ? primaryTrips : upcomingOnly(fallbackQuery.data),
    [primaryTrips, upcomingOnly, fallbackQuery.data],
  );

  const filtered = useMemo(() => {
    const list = rawTrips.filter((trip) =>
      matchesTime(departureHour(trip.departureAt), timeFilter),
    );

    return [...list].sort((a, b) => {
      if (sort === "cheap") return a.price - b.price;
      if (sort === "quick") {
        return (
          durationMinutes(a.departureAt, a.arrivalAt) -
          durationMinutes(b.departureAt, b.arrivalAt)
        );
      }
      return (
        new Date(a.departureAt).getTime() - new Date(b.departureAt).getTime()
      );
    });
  }, [rawTrips, timeFilter, sort]);

  const loading =
    citiesQuery.isLoading ||
    tripsQuery.isLoading ||
    (needsFallback && fallbackQuery.isLoading);
  const error =
    citiesQuery.error ??
    tripsQuery.error ??
    (needsFallback ? fallbackQuery.error : null);

  const originName =
    cities.find((city) => city.id === search.originId)?.name ?? "—";
  const destinationName =
    cities.find((city) => city.id === search.destinationId)?.name ?? "—";

  function applySearch(values: SearchValues) {
    const next = new URLSearchParams(params);
    next.set("originId", String(values.originId));
    next.set("destinationId", String(values.destinationId));
    next.set("date", values.date);
    next.set("people", String(values.people));
    setParams(next);
  }

  function resetFilters() {
    setCompanyFilter(null);
    setTimeFilter("all");
    setSort("earliest");

    const next = new URLSearchParams(params);
    next.delete("companyId");
    setParams(next);
  }

  function chooseCompany(companyId: number | null) {
    setCompanyFilter(companyId);
    const next = new URLSearchParams(params);
    if (companyId) next.set("companyId", String(companyId));
    else next.delete("companyId");
    setParams(next, { replace: true });
  }

  function clearDate() {
    const next = new URLSearchParams(params);
    next.delete("date");
    setParams(next);
  }

  return (
    <main className="inner-main">
      <section className="page-banner">
        <div className="container">
          <div className="breadcrumb">
            <Link to="/">الرئيسية</Link>
            <Icon name="chevron-left" size={14} /> <span>نتائج البحث</span>
          </div>
          <div className="banner-heading">
            <div>
              <span className="eyebrow">
                <span className="mini-star">
                  <Icon name="sparkle" size={13} />
                </span>{" "}
                لنكمل الطريق
              </span>
              <h1>
                اختار الرحلة <span>اللي بتشبهك.</span>
              </h1>
              <p>قارن بين الشركات والأوقات، واحجز مقعدك بكل سهولة.</p>
            </div>
            <div className="banner-art">
              <Icon name="bus" size={70} />
            </div>
          </div>
        </div>
      </section>

      <section className="container results-content">
        <div className="compact-search">
          <SearchForm
            cities={cities}
            value={draft}
            onChange={setDraft}
            onSubmit={applySearch}
            variant="results"
            submitting={tripsQuery.isFetching}
          />
        </div>

        <div className="company-pick-section">
          <div className="pick-heading">
            <div>
              <span className="pick-step">01</span>
              <div>
                <h3>اختار شركة النقل</h3>
                <p>حدد الشركة اللي بتفضّلها، ومنعرضلك مواعيدها المتاحة.</p>
              </div>
            </div>
            <span className="pick-next">
              02 <Icon name="arrow-left" size={15} /> اختار الوقت والمقعد
            </span>
          </div>

          <div className="company-pick-grid">
            <button
              type="button"
              className={`company-pick${companyFilter === null ? " active" : ""}`}
              onClick={() => chooseCompany(null)}
            >
              <span className="company-pick-all">
                <Icon name="bus" size={24} />
              </span>
              <span>كل الشركات</span>
              <small>قارن الخيارات</small>
            </button>

            {companies.map((company) => (
              <button
                key={company.id}
                type="button"
                className={`company-pick${companyFilter === company.id ? " active" : ""}`}
                onClick={() => chooseCompany(company.id)}
              >
                <CompanyLogo company={company} size="tiny" />
                <span>{companyLabel(company)}</span>
                <small className="company-pick-rating">
                  <Icon name="star" size={12} />{" "}
                  <span>{company.isActive === false ? "متوقفة" : "نشطة"}</span>
                </small>
              </button>
            ))}
          </div>
        </div>

        <div className="results-heading">
          <div>
            <h2>
              {filtered.length} رحلات متاحة{" "}
              <span className="result-counter">
                {originName} <Icon name="arrow-left" size={17} />{" "}
                {destinationName}
              </span>
            </h2>
            <p>
              <Icon name="calendar" size={15} />{" "}
              {dateText(`${search.date}T12:00:00`)} · {search.people}{" "}
              {search.people === 1 ? "مسافر" : "مسافرين"}
            </p>
          </div>

          <div className="sort-box">
            <label htmlFor="sort-select">ترتيب حسب</label>
            <select
              id="sort-select"
              value={sort}
              onChange={(event) => setSort(event.target.value as SortKey)}
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="results-layout">
          <aside className="filters-panel">
            <div className="filters-top">
              <h3>
                <Icon name="filter" size={19} /> تصفية النتائج
              </h3>
              <button
                className="quiet-button"
                type="button"
                onClick={resetFilters}
              >
                إعادة ضبط
              </button>
            </div>

            <div className="filter-group">
              <h4>شركة النقل</h4>
              <div className="radio-list">
                <label>
                  <input
                    type="radio"
                    name="company-filter"
                    value="all"
                    checked={companyFilter === null}
                    onChange={() => chooseCompany(null)}
                  />{" "}
                  كل الشركات <span>{companies.length}</span>
                </label>

                {companies.map((company) => (
                  <label key={company.id}>
                    <input
                      type="radio"
                      name="company-filter"
                      value={company.id}
                      checked={companyFilter === company.id}
                      onChange={() => chooseCompany(company.id)}
                    />{" "}
                    {companyLabel(company)}
                  </label>
                ))}
              </div>
            </div>

            <div className="filter-group">
              <h4>وقت الانطلاق</h4>
              <div className="radio-list">
                {TIME_FILTERS.map((option) => (
                  <label key={option.value}>
                    <input
                      type="radio"
                      name="time-filter"
                      value={option.value}
                      checked={timeFilter === option.value}
                      onChange={() => setTimeFilter(option.value)}
                    />{" "}
                    {option.label}
                  </label>
                ))}
              </div>
            </div>

            <div className="filter-info">
              <Icon name="shield" size={22} />
              <p>
                <b>الحجز بشكل واضح</b>
                <br />
                كل تفاصيل الرحلة قدامك قبل التأكيد.
              </p>
            </div>
          </aside>

          <div className="trip-list">
            {needsFallback && rawTrips.length > 0 ? (
              <Notice tone="warn">
                لا توجد رحلات في التاريخ المحدد، لذلك نعرض كل الرحلات المتاحة من
                الخادم.{" "}
                <button
                  type="button"
                  className="quiet-button"
                  onClick={clearDate}
                >
                  البحث في كل التواريخ
                </button>
              </Notice>
            ) : null}

            {loading ? (
              <LoadingState label="عم ندوّر على أفضل الرحلات…" />
            ) : null}

            {!loading && error ? (
              <ErrorState
                error={error}
                onRetry={() => void tripsQuery.refetch()}
              />
            ) : null}

            {!loading && !error && filtered.length === 0 ? (
              <EmptyState
                icon="bus"
                title="ما في رحلات مطابقة"
                description="جرّب تغيّر الشركة أو وقت الانطلاق أو تاريخ الرحلة."
                action={
                  <button
                    className="btn btn-primary"
                    type="button"
                    onClick={resetFilters}
                  >
                    عرض كل الرحلات
                  </button>
                }
              />
            ) : null}

            {!loading && !error
              ? filtered.map((trip) => (
                  <TripCard key={trip.id} trip={trip} people={search.people} />
                ))
              : null}
          </div>
        </div>
      </section>
    </main>
  );
}
