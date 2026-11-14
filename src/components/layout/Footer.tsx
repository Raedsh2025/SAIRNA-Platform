import { Link } from "react-router-dom";
import { Icon } from "@/components/ui/Icon";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-main">
        <div className="footer-brand">
          <Logo />
          <p>
            طريقة أجمل وأسهل للسفر بين المحافظات السورية. ابحث، اختار، واحجز بكل
            راحة.
          </p>
          <div className="footer-social">
            <span>
              <Icon name="globe" size={17} />
            </span>
            <span>
              <Icon name="mail" size={17} />
            </span>
            <span>
              <Icon name="phone" size={17} />
            </span>
          </div>
        </div>

        <div className="footer-col">
          <h4>استكشف</h4>
          <Link to="/">الرئيسية</Link>
          <Link to="/results">احجز رحلتك</Link>
          <Link to="/companies">شركات النقل</Link>
          <Link to="/tracking">تتبّع رحلتك</Link>
        </div>

        <div className="footer-col">
          <h4>حسابك</h4>
          <Link to="/login">تسجيل الدخول</Link>
          <Link to="/register">إنشاء حساب</Link>
          <Link to="/trips">حجوزاتي</Link>
          <Link to="/account">الملف الشخصي</Link>
        </div>

        <div className="footer-col">
          <h4>نحن هون لمساعدتك</h4>
          <Link to="/about">عن سيرنا</Link>
          <Link to="/support">مركز المساعدة</Link>
          <div className="footer-contact">
            <Icon name="mail" size={16} /> hello@sairna.example
          </div>
        </div>
      </div>

      <div className="container photo-credit">
        واجهة سيرنا مبنية بـ React و TypeScript، وتقرأ بياناتها الحقيقية من
        <span dir="ltr"> SAIRNA Training API v2.0 </span>
        عبر مواصفة OpenAPI — الرحلات والحجوزات المعروضة بيانات تجريبية من
        الخادم.
      </div>
    </footer>
  );
}
