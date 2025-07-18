// About Page
import AboutIntro from "@/components/admin/about/aboutIntro";
import MissionSection from "@/components/admin/about/MissionSection";
import ServicesSection from "@/components/admin/about/ServicesSection";
import TrainerDetails from "@/components/admin/about/TrainerDetails";
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
          <ServicesSection />
          <div className="container-fluid  mt-5">
            <Footer />
        </div>
        </div>
        
      </div>
    </>
  );
}
