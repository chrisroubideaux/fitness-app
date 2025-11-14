// app/about/page.tsx

import AboutIntro from "@/components/admin/about/aboutIntro";
import JourneyTimeline from "@/components/admin/about/JourneyTimeline";
import ValuesSection from "@/components/admin/about/ValuesSection";
import MiniTestimonialsCarousel from "@/components/admin/about/MiniTestimonialsCarousel";
import Footer from "@/components/misc/Footer";
import Nav from "@/components/navbar/Nav";

export default function About() {
  return (
    <>
      <Nav />
      <AboutIntro />
      <div className="layout h-100">
          
        <div className="container">
          <div className=" pt-5">
            <JourneyTimeline />
          </div>
          <div className="pt-5 mt-5">
            <ValuesSection />
          </div>
    
          <div className="pt-5 mt-5">
            <MiniTestimonialsCarousel />
          </div>
        </div>
        <div className="pt-5">
        <Footer />
        </div>
      </div>
    </>
  );
}
