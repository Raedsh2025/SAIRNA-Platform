import { Link } from "react-router-dom";
import { useCompanies, useTrips } from "@/hooks";
import { CompanyLogo } from "@/components/CompanyLogo";
import { Icon } from "@/components/ui/Icon";
import { ErrorState, LoadingState } from "@/components/ui/States";
import { companyLabel } from "@/lib/company";
import { addDaysIso } from "@/lib/format";

export function CompaniesPage() {
  const companiesQuery = useCompanies();
  const tripsQuery = useTrips({ date: addDaysIso(1) });

  const companies = companiesQuery.data ?? [];
  const trips = tripsQuery.data ?? [];

  function tripCountFor(companyId: number): number {
    return trips.filter((trip) => trip.companyId === companyId).length;
  }

  return (
    <main className="inner-main">
      <section className="page-banner">
        <div className="container">
          <div className="breadcrumb">
            <Link to="/">الرئيسية</Link>
            <Icon name="chevron-left" size={14} /> <span>شركات النقل</span>
          </div>
          <span className="eyebrow">
            <span className="mini-star">
              <Icon name="sparkle" size={13} />
            </span>{" "}
            شركاء الطريق
          </span>
          <h1 className="page-title">
            شركات بتوصلك <span>لوين ما بدك.</span>
          </h1>
          <p>تعرّف على شركات النقل المسجّلة في النظام واختار الأنسب إلك.</p>
        </div>
      </section>

      <section className="container section">
        {companiesQuery.isLoading ? (
          <LoadingState label="جارِ تحميل شركات النقل…" />
        ) : null}

        {!companiesQuery.isLoading && companiesQuery.error ? (
          <ErrorState
            error={companiesQuery.error}
            onRetry={() => void companiesQuery.refetch()}
          />
        ) : null}

        {!companiesQuery.isLoading && !companiesQuery.error ? (
          <div className="companies-grid">
            {companies.map((company) => (
              <article className="company-card" key={company.id}>
                <div className="company-card-head">
                  <CompanyLogo company={company} size="large" />
                  <span
                    className={`tag ${company.isActive === false ? "tag-demo" : "teal-tag"}`}
                  >
                    <Icon
                      name={
                        company.isActive === false ? "info" : "check-circle"
                      }
                      size={14}
                    />
                    {company.isActive === false ? "غير نشطة" : "نشطة"}
                  </span>
                </div>

                <h2>{companyLabel(company)}</h2>
                <p>
                  شركة نقل برية تعمل على خطوط بين المحافظات السورية ضمن منصة
                  سيرنا، مع مواعيد وأسعار تظهر مباشرة عند البحث.
                </p>

                <div className="company-amenities">
                  <span className="service-pill">
                    <Icon name="bus" size={13} /> رحلات مباشرة
                  </span>
                  <span className="service-pill">
                    <Icon name="seat" size={13} /> حجز مقاعد
                  </span>
                </div>

                <div className="company-meta">
                  <div>
                    <b>{tripCountFor(company.id)}</b>
                    <small>رحلة متاحة غدًا</small>
                  </div>
                  <div>
                    <b>#{company.id}</b>
                    <small>معرّف الشركة</small>
                  </div>
                </div>

                <Link
                  className="btn btn-outline full"
                  to={`/results?companyId=${company.id}`}
                >
                  عرض رحلات الشركة <Icon name="arrow-left" size={17} />
                </Link>
              </article>
            ))}
          </div>
        ) : null}

        <p className="disclaimer-line">
          ملاحظة: أسماء الشركات وأوقات الرحلات المعروضة تأتي مباشرة من واجهة
          <span dir="ltr"> SAIRNA Training API </span>
          وتُعتبر بيانات تدريبية.
        </p>
      </section>
    </main>
  );
}
