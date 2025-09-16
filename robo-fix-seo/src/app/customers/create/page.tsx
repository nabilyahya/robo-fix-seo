import CustomerForm from "../CustomerForm";

export const metadata = { title: "Robonarim | إنشاء عميل" };

export default function Page() {
  return (
    <div className="px-4 py-8 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">إنشاء عميل جديد</h1>
      <p className="text-neutral-600 mb-6">
        أدخل بيانات العميل وسيتم حفظها على Google Sheets تلقائياً.
      </p>
      <CustomerForm />
    </div>
  );
}
