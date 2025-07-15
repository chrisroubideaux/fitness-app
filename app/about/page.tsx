// About Page
import AboutIntro from "@/components/admin/aboutIntro";
import MissionSection from "@/components/admin/MissionSection";
import TrainerDetails from "@/components/admin/TrainerDetails";
import Nav from "@/components/navbar/Nav";

export default function About() {
  return (
    <>
      <Nav />
      <AboutIntro />
        <div className="layout  ">
            <div className="container">
            
           
      <MissionSection />
      <TrainerDetails />
       </div>
        </div>
    </>
  );
}
