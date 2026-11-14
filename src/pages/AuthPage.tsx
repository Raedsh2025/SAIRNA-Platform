import { useState, type FormEvent } from "react";
import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { useLogin, useRegister } from "@/hooks";
import { Icon } from "@/components/ui/Icon";
import { Photo } from "@/components/ui/Photo";
import { useAuth } from "@/lib/auth";

type Mode = "login" | "register";

interface LocationState {
  from?: string;
}

export function AuthPage({ mode }: { mode: Mode }) {
  const isRegister = mode === "register";
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  const { signIn } = useAuth();

  const login = useLogin();
  const register = useRegister();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);

  const pending = login.isPending || register.isPending;
  const mutationError = login.error ?? register.error;

  const state = location.state as LocationState | null;
  const redirectTo = state?.from || params.get("from") || "/";

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    if (isRegister && name.trim().length < 3) {
      setFormError("اكتب اسمك الكامل (3 أحرف على الأقل).");
      return;
    }
    if (!email.includes("@")) {
      setFormError("اكتب بريدًا إلكترونيًا صحيحًا.");
      return;
    }
    if (password.length < (isRegister ? 8 : 6)) {
      setFormError(
        isRegister
          ? "كلمة المرور يجب أن تكون 8 أحرف على الأقل."
          : "اكتب كلمة المرور.",
      );
      return;
    }

    const onSuccess = (session: {
      token: string;
      user: { name: string; email: string };
    }) => {
      signIn(session.token, session.user);
      navigate(redirectTo, { replace: true });
    };

    const onError = (error: unknown) => {
      setFormError(
        error instanceof Error ? error.message : "تعذّر إكمال العملية.",
      );
    };

    if (isRegister) {
      register.mutate(
        { name: name.trim(), email: email.trim(), password },
        { onSuccess, onError },
      );
    } else {
      login.mutate({ email: email.trim(), password }, { onSuccess, onError });
    }
  }

  return (
    <main className="auth-main">
      <div className="container auth-grid">
        <div className="auth-panel">
          <div className="auth-top">
            <span className="eyebrow">
              <span className="mini-star">
                <Icon name="sparkle" size={13} />
              </span>{" "}
              {isRegister ? "انضم لعيلة سيرنا" : "أهلاً برجعتك"}
            </span>
            <h1>
              {isRegister ? (
                <>
                  خلّينا نبدأ <span>المشوار سوا.</span>
                </>
              ) : (
                <>
                  منوّر، <span>اشتقنالك!</span>
                </>
              )}
            </h1>
            <p>
              {isRegister
                ? "حساب بسيط، ورحلاتك كلها بين إيديك."
                : "ادخل على حسابك، وكمّل حجز رحلتك براحة."}
            </p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            {isRegister ? (
              <label className="form-group">
                <span>الاسم الكامل</span>
                <div className="field-control">
                  <Icon name="user" size={19} />
                  <input
                    name="name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="اسمك الكامل"
                    autoComplete="name"
                    minLength={3}
                    required
                  />
                </div>
              </label>
            ) : null}

            <label className="form-group">
              <span>البريد الإلكتروني</span>
              <div className="field-control">
                <Icon name="mail" size={19} />
                <input
                  name="email"
                  type="email"
                  dir="ltr"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="name@example.com"
                  autoComplete="email"
                  required
                />
              </div>
            </label>

            <label className="form-group">
              <span>كلمة المرور</span>
              <div className="field-control">
                <Icon name="lock" size={19} />
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  dir="ltr"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder={isRegister ? "8 أحرف على الأقل" : "كلمة المرور"}
                  autoComplete={
                    isRegister ? "new-password" : "current-password"
                  }
                  required
                  minLength={isRegister ? 8 : 6}
                />
                <button
                  className="show-password"
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={
                    showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"
                  }
                >
                  <Icon name={showPassword ? "eye-off" : "eye"} size={19} />
                </button>
              </div>
            </label>

            {isRegister ? (
              <label className="terms-check">
                <input type="checkbox" required defaultChecked />{" "}
                <span>
                  أوافق على استخدام بياناتي لإتمام الحجوزات على هذه المنصة.
                </span>
              </label>
            ) : (
              <div className="auth-helper">
                <label className="terms-check">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(event) => setRemember(event.target.checked)}
                  />{" "}
                  تذكرني
                </label>
                <Link to="/support">نسيت كلمة المرور؟</Link>
              </div>
            )}

            {formError || mutationError ? (
              <p className="form-error" role="alert">
                <Icon name="info" size={17} />{" "}
                {formError ??
                  (mutationError instanceof Error ? mutationError.message : "")}
              </p>
            ) : null}

            <button
              className="btn btn-primary full auth-submit"
              type="submit"
              disabled={pending}
            >
              {pending
                ? "جارِ المعالجة…"
                : isRegister
                  ? "إنشاء حساب"
                  : "تسجيل الدخول"}
              <Icon name="arrow-left" size={18} />
            </button>
          </form>

          <p className="auth-switch">
            {isRegister ? "عندك حساب من قبل؟" : "لسا ما عندك حساب؟"}{" "}
            <Link to={isRegister ? "/login" : "/register"}>
              {isRegister ? "سجّل دخولك" : "أنشئ حساب جديد"}
            </Link>
          </p>

          <div className="auth-demo-note">
            <Icon name="info" size={18} /> الدخول والتسجيل يتمّان فعليًا على
            خادم
            <span dir="ltr"> SAIRNA Training API </span>
            والتوكن محفوظ في متصفحك.
          </div>
        </div>

        <div className="auth-visual">
          <div className="auth-visual-top">
            <span>
              <Icon name="sparkle" size={18} /> عالم جديد بانتظارك
            </span>
            <h2>
              كل الطرق <br /> بتوصّل لذكريات.
            </h2>
            <p>ومن أول محطة رح نكون معك.</p>
          </div>

          <Photo
            src="/assets/city-damascus.svg"
            alt="مشهد من دمشق"
            className="auth-photo"
          />

          <div className="auth-visual-bottom">
            <span>
              <Icon name="shield" size={19} /> سهل وواضح
            </span>
            <span>
              <Icon name="ticket" size={19} /> حجز بخطوات بسيطة
            </span>
          </div>
        </div>
      </div>
    </main>
  );
}
