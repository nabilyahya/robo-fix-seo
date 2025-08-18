import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

const ContactSection = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log("Form submitted:", formData);
  };

  return (
    <section 
      id="contact"
      className="py-4 sm:py-6 lg:py-8"
      aria-labelledby="contact-title"
    >
      <h2 
        id="contact-title"
        className="text-foreground text-lg sm:text-xl lg:text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-3 sm:pt-5"
      >
        تواصل معنا
      </h2>
      <div className="w-full max-w-[480px] px-4">
        <form onSubmit={handleSubmit} className="w-full">
          <div className="flex flex-col gap-3 sm:gap-4 py-3">
            <div className="flex flex-col w-full">
              <label htmlFor="name" className="sr-only">الاسم</label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="اسمك"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full bg-input-bg border-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted-foreground h-12 sm:h-14 text-sm sm:text-base"
                required
                aria-label="أدخل اسمك الكامل"
              />
            </div>
            
            <div className="flex flex-col w-full">
              <label htmlFor="email" className="sr-only">البريد الإلكتروني</label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="بريدك الإلكتروني"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full bg-input-bg border-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted-foreground h-12 sm:h-14 text-sm sm:text-base"
                required
                aria-label="أدخل بريدك الإلكتروني"
              />
            </div>
            
            <div className="flex flex-col w-full">
              <label htmlFor="phone" className="sr-only">رقم الهاتف</label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="رقم هاتفك"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full bg-input-bg border-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted-foreground h-12 sm:h-14 text-sm sm:text-base"
                required
                aria-label="أدخل رقم هاتفك"
              />
            </div>
            
            <div className="flex flex-col w-full">
              <label htmlFor="message" className="sr-only">الرسالة</label>
              <Textarea
                id="message"
                name="message"
                placeholder="رسالتك"
                value={formData.message}
                onChange={handleInputChange}
                className="w-full bg-input-bg border-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted-foreground min-h-24 sm:min-h-36 resize-none text-sm sm:text-base"
                required
                aria-label="أدخل رسالتك أو وصف المشكلة"
              />
            </div>
            
            <div className="flex justify-start pt-2 sm:pt-3">
              <Button
                type="submit"
                variant="hero"
                size="lg"
                className="w-full sm:w-auto min-w-[120px] max-w-[480px] h-11 sm:h-12 text-sm sm:text-base"
                aria-label="إرسال الرسالة"
              >
                <span className="truncate">أرسل الرسالة</span>
              </Button>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
};

export default ContactSection;