import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import ServicesSection from "@/components/ServicesSection";
import WhyChooseUsSection from "@/components/WhyChooseUsSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import BrandsSection from "@/components/BrandsSection";
import FloatingActions from "@/components/FloatingActions";
import ReviewsSection from "@/components/ReviewsSection";

const Index = () => {
  return (
    <div className="relative flex size-full min-h-screen flex-col bg-background font-work-sans overflow-x-hidden">
      <div className="layout-container flex h-full grow flex-col">
        <Header />
        <main className="px-4 sm:px-8 md:px-16 lg:px-24 xl:px-40 flex flex-1 justify-center py-2 sm:py-4 lg:py-5">
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1 w-full">
            <HeroSection />
            <ServicesSection />
            <BrandsSection />
            <WhyChooseUsSection />
            <ReviewsSection />
            {/* <ContactSection /> */}
            <FloatingActions />
            {/* <ContactSection /> */}
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default Index;
