import { Link } from "react-router-dom";
import { Icon } from "@/components/ui/Icon";

export function NotFoundPage() {
  return (
    <main className="container section">
      <div className="empty-state">
        <Icon name="bus" size={48} />
        <h2>هاد المسار مش موجود</h2>
        <p>يبدو إنك طلعت عن خط السير. ارجع للرئيسية وكمّل رحلتك.</p>
        <Link to="/" className="btn btn-primary">
          الرئيسية <Icon name="arrow-left" size={17} />
        </Link>
      </div>
    </main>
  );
}
