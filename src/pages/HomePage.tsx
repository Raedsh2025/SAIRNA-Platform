import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCities, useCompanies } from "@/hooks";
import { RouteMap } from "@/components/RouteMap";
import { SearchForm, type SearchValues } from "@/components/SearchForm";
import { Icon } from "@/components/ui/Icon";
import { Photo } from "@/components/ui/Photo";
import { addDaysIso } from "@/lib/format";

const DESTINATIONS = [
  { name: "دمشق", desc: "مدينة الياسمين", asset: "/assets/city-damascus.svg" },
  { name: "حلب", desc: "عاصمة الشهباء", asset: "/assets/city-aleppo.svg" },
  {
    name: "اللاذقية",
    desc: "نسمة من البحر",
    asset: "/assets/city-latakia.svg",
  },
  { name: "حمص", desc: "قلب سوريا", asset: "/assets/city-homs.svg" },
];

const PROCESS_STEPS = [
  {
    icon: "search",
    number: "01",
    title: "اختار وجهتك",
    text: "حدّد من وين لوين وتاريخ الرحلة المناسب إلك.",
  },
  {
    icon: "bus",
    number: "02",
    title: "لاقي رحلتك",
    text: "قارن الشركات والمواعيد والأسعار واختر الأفضل.",
  },
  {
    icon: "ticket",
    number: "03",
    title: "احجز مقعدك",
    text: "اختار مقعدك وأكّد الحجز، وتذكرتك بتصير جاهزة.",
  },
];

const FALLBACK_ORIGIN = { name: "حلب", latitude: 36.2021, longitude: 37.1343 };
const FALLBACK_DESTINATION = {
  name: "دمشق",
  latitude: 33.5138,
  longitude: 36.2765,
};

export function HomePage() {
  const navigate = useNavigate();
  const citiesQuery = useCities();
  const companiesQuery = useCompanies();

  const cities = citiesQuery.data ?? [];

  const [search, setSearch] = useState<SearchValues>({
    originId: 0,
    destinationId: 0,
    date: addDaysIso(1),
    people: 1,
  });

  // اختيار مدن افتراضية عند وصول القائمة (حلب ← دمشق إن وُجدتا).
  const citiesKey = cities.map((city) => city.id).join(",");
  const effective = useMemo<SearchValues>(() => {
    if (!cities.length) return search;
    if (search.originId && search.destinationId) return search;

    const aleppo = cities.find((city) => city.name.includes("حلب"));
    const damascus = cities.find((city) => city.name.includes("دمشق"));
    return {
      ...search,
      originId: search.originId || aleppo?.id || cities[0].id,
      destinationId:
        search.destinationId || damascus?.id || cities[1]?.id || cities[0].id,
    };
  }, [cities, search, citiesKey]);

  const origin =
    cities.find((city) => city.id === effective.originId) ?? FALLBACK_ORIGIN;
  const destination =
    cities.find((city) => city.id === effective.destinationId) ??
    FALLBACK_DESTINATION;

  function goToResults(values: SearchValues) {
    const params = new URLSearchParams({
      originId: String(values.originId),
      destinationId: String(values.destinationId),
      date: values.date,
      people: String(values.people),
    });
    navigate(`/results?${params.toString()}`);
  }

  function pickDestination(name: string) {
    const city = cities.find((item) => item.name.includes(name));
    if (city) {
      setSearch((current) => ({ ...current, destinationId: city.id }));
      document
        .getElementById("search-shell")
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    goToResults({ ...effective, destinationId: effective.destinationId });
  }

  return (
    <main>
      <section className="hero-section">
        <div className="container">
          <div className="hero-grid">
            <div className="hero-copy">
              <span className="eyebrow">
                <span className="mini-star">
                  <Icon name="sparkle" size={13} />
                </span>{" "}
                أهلاً فيك بسيرنا
              </span>
              <h1>
                المحطة الجاية؟
                <br />
                <span className="gradient-text">على كيفك.</span>
              </h1>
              <p>
                من حلب لدمشق، ومن الساحل للجزيرة. لاقي الرحلة اللي بتناسبك،
                اختار مقعدك، وخلّي الطريق علينا.
              </p>
              <div className="hero-points">
                <span>
                  <Icon name="check-circle" size={17} /> حجز سهل
                </span>
                <span>
                  <Icon name="check-circle" size={17} /> خيارات متنوعة
                </span>
                <span>
                  <Icon name="check-circle" size={17} /> متابعة رحلتك
                </span>
              </div>
              <div className="hero-social-proof">
                <div className="proof-avatars">
                  <span>م</span>
                  <span>س</span>
                  <span>ع</span>
                  <span>ر</span>
                </div>
                <div>
                  <div className="proof-stars">
                    {Array.from({ length: 5 }, (_, index) => (
                      <Icon key={index} name="star" size={14} />
                    ))}{" "}
                    <b>4.9/5</b>
                  </div>
                  <small>تجربة سفر بتستاهل تجرّبها</small>
                </div>
              </div>
            </div>

            <div className="hero-visual">
              <div className="hero-image-wrap">
                <Photo
                  src="/assets/hero.svg"
                  alt="مشهد من دمشق"
                  className="hero-photo"
                  loading="eager"
                  fetchPriority="high"
                />
                <span className="hero-photo-caption">وجهات سورية بتجمعنا</span>

                <div className="floating-stat stat-top">
                  <Icon name="pin" size={18} />
                  <div>
                    <b>{cities.length || 14} محافظة</b>
                    <small>وجهات بتجمعنا</small>
                  </div>
                </div>

                <div className="floating-stat stat-bottom">
                  <span className="floating-circle">
                    <Icon name="shield" size={20} />
                  </span>
                  <div>
                    <b>سافر براحة</b>
                    <small>من أول حجز لآخر محطة</small>
                  </div>
                </div>
              </div>
              <div className="hero-orbit orbit-a" />
              <div className="hero-orbit orbit-b" />
            </div>
          </div>

          <div className="search-shell" id="search-shell">
            <div className="search-shell-heading">
              <div>
                <span className="search-small-dot" />{" "}
                <strong>وين رحلتك الجاية؟</strong>
                <span>اختار وجهتك وباقي التفاصيل علينا</span>
              </div>
              <div className="steps-tag">
                <Icon name="sparkle" size={16} /> الحجز بـ 3 خطوات
              </div>
            </div>

            <SearchForm
              cities={cities}
              value={effective}
              onChange={setSearch}
              onSubmit={goToResults}
              variant="home"
            />
          </div>
        </div>
      </section>

      <section className="metrics-strip">
        <div className="container metrics-inner">
          <div>
            <strong>{cities.length || 14}</strong>
            <span>محافظة سورية</span>
          </div>
          <span className="metrics-divider" />
          <div>
            <strong>{companiesQuery.data?.length ?? 4}</strong>
            <span>شركات نقل</span>
          </div>
          <span className="metrics-divider" />
          <div>
            <strong>+30</strong>
            <span>خيار رحلة باليوم</span>
          </div>
          <span className="metrics-divider" />
          <div>
            <strong>24/7</strong>
            <span>سهولة الوصول للموقع</span>
          </div>
        </div>
      </section>

      <section className="section destinations">
        <div className="container">
          <div className="section-title-row">
            <div>
              <span className="eyebrow">
                <span className="mini-star">
                  <Icon name="sparkle" size={13} />
                </span>{" "}
                اكتشف سوريا
              </span>
              <h2>
                على وين حابب <span>تسافر؟</span>
              </h2>
              <p>وجهات مختلفة، ونفس الشعور الحلو لما تكون بالطريق.</p>
            </div>
            <Link to="/results" className="text-link">
              استكشف الرحلات <Icon name="arrow-left" size={18} />
            </Link>
          </div>

          <div className="destination-grid">
            {DESTINATIONS.map((item, index) => (
              <button
                key={item.name}
                type="button"
                className={`destination-card destination-${index}`}
                onClick={() => pickDestination(item.name)}
              >
                <Photo src={item.asset} alt={`صورة من ${item.name}`} />
                <span className="destination-overlay">
                  <span>
                    <strong>{item.name}</strong>
                    <small>{item.desc}</small>
                  </span>
                  <span className="destination-arrow">
                    <Icon name="arrow-left" size={18} />
                  </span>
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="section process-section">
        <div className="container">
          <div className="section-centered">
            <span className="eyebrow">
              <span className="mini-star">
                <Icon name="sparkle" size={13} />
              </span>{" "}
              السفر صار أبسط
            </span>
            <h2>
              3 خطوات... <span>وتكون بالطريق</span>
            </h2>
            <p>ما في داعي للتعقيد. كل شي مرتب بواجهة وحدة.</p>
          </div>

          <div className="process-grid">
            {PROCESS_STEPS.map((step) => (
              <div className="process-card" key={step.number}>
                <span className="process-number">{step.number}</span>
                <div className="process-icon">
                  <Icon name={step.icon} size={28} />
                </div>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="split-feature">
            <div className="feature-content">
              <span className="eyebrow">
                <span className="mini-star">
                  <Icon name="sparkle" size={13} />
                </span>{" "}
                وين وصلت الرحلة؟
              </span>
              <h2>
                الطريق قدامك.
                <br />
                <span>لحظة بلحظة؟</span>
              </h2>
              <p>
                بصفحة التتبّع بتشوف خط سير الرحلة ومحطاتها وحالتها ضمن نموذج
                تفاعلي سهل وواضح.
              </p>
              <div className="feature-check">
                <Icon name="check-circle" size={18} /> عرض المسار على الخريطة
              </div>
              <div className="feature-check">
                <Icon name="check-circle" size={18} /> وقت وصول تقديري ومحطات
                الطريق
              </div>
              <Link to="/tracking" className="btn btn-primary">
                جرّب تتبّع رحلة <Icon name="arrow-left" size={18} />
              </Link>
              <small className="demo-note">
                * حركة الحافلة على الخريطة توضيحية وليست تتبّع GPS مباشر.
              </small>
            </div>

            <div className="feature-map-preview">
              <div className="map-preview-top">
                <span className="live-indicator" /> معاينة مسار رحلة{" "}
                <b>
                  {origin.name} ← {destination.name}
                </b>
              </div>
              <div className="home-route-map">
                <RouteMap
                  origin={origin}
                  destination={destination}
                  progress={0.55}
                />
              </div>
              <div className="map-preview-footer">
                <span>
                  <Icon name="pin" size={15} /> {origin.name}
                </span>
                <div className="preview-line">
                  <span />
                </div>
                <span>
                  <Icon name="pin" size={15} /> {destination.name}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-wrap">
        <div className="container">
          <div className="cta-banner">
            <div>
              <span className="eyebrow">
                <span className="mini-star">
                  <Icon name="sparkle" size={13} />
                </span>{" "}
                جاهز تغير جو؟
              </span>
              <h2>الطريق الجاي بيناديك.</h2>
              <p>دوّر على رحلة، واحجز أول مقعد إلك.</p>
            </div>
            <Link to="/results" className="btn btn-white">
              يلا نلاقي رحلة <Icon name="arrow-left" size={18} />
            </Link>
            <div className="cta-decor d1" />
            <div className="cta-decor d2" />
          </div>
        </div>
      </section>
    </main>
  );
}
