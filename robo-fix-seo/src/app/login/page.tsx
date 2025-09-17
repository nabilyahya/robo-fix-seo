import Image from "next/image";
import { loginAction } from "./actions";
import logo from "../../../public/logo.png";
export default async function Page({
  searchParams,
}: {
  // في Next 15 searchParams قد تكون Promise
  searchParams?: Promise<Record<string, string | string[]>>;
}) {
  const sp = (await searchParams) ?? {};
  const errorParam = Array.isArray(sp.error) ? sp.error[0] : sp.error;

  const errorMsg =
    errorParam === "missing"
      ? "الرجاء إدخال الاسم وكلمة المرور."
      : errorParam === "invalid"
      ? "بيانات الدخول غير صحيحة."
      : null;

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 text-slate-50 relative overflow-hidden">
      {/* ضجيج خفيف على الخلفية */}
      <div className="pointer-events-none absolute inset-0 opacity-20 mix-blend-overlay [background-image:radial-gradient(#ffffff22_1px,transparent_1px)] [background-size:16px_16px]" />

      <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* الهيدر: الشعار + العنوان */}
          <div className="mb-6 flex items-center gap-3">
            <Image
              src={logo}
              alt="Robonarim"
              width={40}
              height={40}
              className="rounded-xl ring-1 ring-white/15 shadow-sm"
              priority
            />
            <div>
              <h1 className="text-xl font-semibold leading-tight">Robonarim</h1>
              <p className="text-slate-300 text-sm">لوحة الدخول الداخلية</p>
            </div>
          </div>

          {/* الكارت */}
          <div className="rounded-2xl bg-white/95 backdrop-blur ring-1 ring-black/5 shadow-xl p-6 sm:p-7">
            {errorMsg && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {errorMsg}
              </div>
            )}

            <form action={loginAction} className="space-y-4">
              {/* اسم المستخدم */}
              <div>
                <label
                  htmlFor="name"
                  className="mb-1 block text-sm font-medium text-slate-700"
                >
                  اسم المستخدم
                </label>
                <div className="relative">
                  <input
                    id="name"
                    name="name"
                    required
                    autoComplete="username"
                    className="peer w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 pr-10 text-slate-900 placeholder:text-slate-400 shadow-sm outline-none transition
                               focus:border-emerald-500 focus:ring-4 focus:ring-emerald-200"
                    placeholder="مثال: Nabil"
                  />
                  {/* أيقونة */}
                  <svg
                    viewBox="0 0 24 24"
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 peer-focus:text-emerald-500"
                    aria-hidden="true"
                  >
                    <path
                      fill="currentColor"
                      d="M12 12c2.21 0 4-1.79 4-4S14.21 4 12 4 8 5.79 8 8s1.79 4 4 4Zm0 2c-3.31 0-6 2.02-6 4.5V20h12v-1.5c0-2.48-2.69-4.5-6-4.5Z"
                    />
                  </svg>
                </div>
              </div>

              {/* كلمة المرور */}
              <div>
                <label
                  htmlFor="password"
                  className="mb-1 block text-sm font-medium text-slate-700"
                >
                  كلمة المرور
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    autoComplete="current-password"
                    className="peer w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 pr-10 text-slate-900 placeholder:text-slate-400 shadow-sm outline-none transition
                               focus:border-emerald-500 focus:ring-4 focus:ring-emerald-200"
                    placeholder="••••••"
                  />
                  {/* أيقونة */}
                  <svg
                    viewBox="0 0 24 24"
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 peer-focus:text-emerald-500"
                    aria-hidden="true"
                  >
                    <path
                      fill="currentColor"
                      d="M12 6C7 6 2.73 9.11 1 13.5 2.73 17.89 7 21 12 21s9.27-3.11 11-7.5C21.27 9.11 17 6 12 6Zm0 12a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9Z"
                    />
                  </svg>
                </div>
              </div>

              {/* زر الدخول */}
              <button
                className="mt-2 w-full rounded-xl bg-emerald-600 px-4 py-2.5 text-white font-medium shadow-lg shadow-emerald-600/20
                           hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-300 active:bg-emerald-800 transition"
              >
                دخول
              </button>
            </form>

            {/* تلميح أمان */}
            <p className="mt-4 text-xs text-slate-500 leading-relaxed">
              للاستخدام الداخلي فقط. سيتم تسجيل الدخول عبر جلسة آمنة (HTTP-only
              Cookie). في حال نسيت كلمة المرور تواصل مع المدير.
            </p>
          </div>

          {/* فوتر صغير */}
          <p className="mt-6 text-center text-xs text-slate-300">
            © {new Date().getFullYear()} Robonarim. كل الحقوق محفوظة.
          </p>
        </div>
      </div>
    </main>
  );
}
