import { Link } from "react-router-dom";
import { Icon } from "@/components/ui/Icon";

const FAQ = [
  {
    q: "كيف بحجز رحلة؟",
    a: "حدد المحافظة اللي رح تطلع منها والمحافظة اللي بدك توصل إلها، بعدين اختار التاريخ والشركة والموعد والمقعد، وأكّد الحجز.",
  },
  {
    q: "في دفع إلكتروني حقيقي؟",
    a: "لا. خيارات الدفع معروضة لأغراض التصميم فقط، والحجز يُسجَّل على الخادم دون أي تحصيل مالي.",
  },
  {
    q: "الخريطة بتعرض مكان الباص الحقيقي؟",
    a: "لا. الخريطة بتعرض مسار تقديري ومحاكاة لحركة الباص. التتبع المباشر يحتاج GPS وAPI من شركة النقل.",
  },
  {
    q: "وين بلاقي حجوزاتي؟",
    a: "من صفحة «حجوزاتي». الحجوزات مرتبطة بحسابك على الخادم، وبتظهر بعد تسجيل الدخول.",
  },
  {
    q: "هل في حسابات حقيقية؟",
    a: "نعم، التسجيل والدخول يتمّان على واجهة SAIRNA Training API ويُعاد رمز وصول (Bearer Token) يُستخدم في الطلبات المحمية.",
  },
];

export function SupportPage() {
  return (
    <main className="inner-main">
      <section className="page-banner">
        <div className="container">
          <span className="eyebrow">
            <span className="mini-star">
              <Icon name="sparkle" size={13} />
            </span>{" "}
            نحن معك
          </span>
          <h1 className="page-title">
            شو حابب <span>تعرف؟</span>
          </h1>
          <p>أسئلة بتساعدك تستخدم منصة سيرنا بسهولة.</p>
        </div>
      </section>

      <section className="container faq-section">
        <div className="faq-list">
          {FAQ.map((item) => (
            <details className="faq-item" key={item.q}>
              <summary>
                {item.q} <Icon name="plus" size={18} />
              </summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>

        <div className="support-aside">
          <Icon name="headphones" size={32} />
          <h2>بحاجة لمساعدة؟</h2>
          <p>
            لأي استفسار عن الحجز أو الرحلات، تواصل معنا وبنرد عليك بأقرب وقت
            ممكن.
          </p>
          <Link to="/" className="btn btn-primary">
            رجوع للرئيسية
          </Link>
        </div>
      </section>
    </main>
  );
}
