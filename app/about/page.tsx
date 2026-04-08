// app/about/page.tsx
import Nav from "@/components/navbar/Nav";
import AboutIntro from "@/components/admin/about/aboutIntro";
import JourneyTimeline from "@/components/admin/about/JourneyTimeline";
import ValuesSection from "@/components/admin/about/ValuesSection";
import MiniTestimonialsCarousel from "@/components/admin/about/MiniTestimonialsCarousel";
import TrainerFooter from '@/components/admin/trainers/TrainerFooter';


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
        <TrainerFooter />
        </div>
      </div>
    </>
  );
}
