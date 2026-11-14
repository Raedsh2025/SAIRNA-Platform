import { Link } from "react-router-dom";
import { Icon } from "@/components/ui/Icon";
import { Photo } from "@/components/ui/Photo";

export function AboutPage() {
  return (
    <main className="inner-main">
      <section className="page-banner">
        <div className="container">
          <span className="eyebrow">
            <span className="mini-star">
              <Icon name="sparkle" size={13} />
            </span>{" "}
            قصتنا
          </span>
          <h1 className="page-title">
            سيرنا. <span>رحلة أبسط لكل حدا.</span>
          </h1>
          <p>
            منصة لحجز الرحلات البرية بين المحافظات السورية، مبنية كواجهة React
            تتصل مباشرة بواجهة API حقيقية.
          </p>
        </div>
      </section>

      <section className="container section about-grid">
        <div>
          <h2>فكرة صغيرة... تجربة كبيرة.</h2>
          <p>
            بدنا تجربة واضحة للمستخدم من لحظة اختيار مدينة الانطلاق والوصول،
            وصولاً لمقارنة الشركات، اختيار المقاعد، تأكيد التذكرة، ومشاهدة مسار
            الرحلة على الخريطة.
          </p>
          
          <Link to="/results" className="btn btn-primary">
            جرّب رحلة <Icon name="arrow-left" size={17} />
          </Link>
        </div>
        <Photo src="/assets/city-latakia.svg" alt="الساحل السوري في اللاذقية" />
      </section>
    </main>
  );
}
