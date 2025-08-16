import HomeCover from "@/components/cover/Home";
import Footer from "@/components/misc/Footer";
import Nav from "@/components/navbar/Nav";

export default function Home() {
  return (
   <div className="layout">
     <Nav />
     <HomeCover />
     <Footer />
   </div>
  );
}