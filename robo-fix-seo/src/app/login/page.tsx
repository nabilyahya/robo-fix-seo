import { loginAction } from "./actions";

export default function Page() {
  return (
    <form
      action={loginAction}
      className="space-y-3 bg-white border rounded-2xl p-6"
    >
      <div className="block text-sm text-neutral-600 mb-1">اسم المستخدم</div>
      <input
        name="name"
        required
        className="w-full rounded-lg border px-3 py-2"
      />

      <div className="block text-sm text-neutral-600 mb-1">كلمة المرور</div>
      <input
        name="password"
        type="password"
        required
        className="w-full rounded-lg border px-3 py-2"
      />

      <button className="mt-3 px-4 py-2 rounded-xl bg-emerald-600 text-white">
        دخول
      </button>
    </form>
  );
}
