// About Page
import AboutIntro from "@/components/admin/about/aboutIntro";
import JourneyTimeline from "@/components/admin/about/JourneyTimeline";
import MissionSection from "@/components/admin/about/MissionSection";
import TrainerDetails from "@/components/admin/about/TrainerDetails";
import ValuesSection from "@/components/admin/about/ValuesSection";
import StatsSection from "@/components/admin/about/StatsSection";
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
          <MissionSection />
          
          <TrainerDetails />
          <div className="my-5">
          <ValuesSection />
          </div>
          <div className="my-5">
          <JourneyTimeline />
          </div>
          <div className="my-5">
          <StatsSection />
          </div>
          <div className="my-5">
          <MiniTestimonialsCarousel />
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
}
