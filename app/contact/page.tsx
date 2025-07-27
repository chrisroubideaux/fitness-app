// Contact page
import ContactForm from "@/components/contact/ContactForm";
import ContactInfo from "@/components/contact/contactInfo";
import Nav from "@/components/navbar/Nav";
import AdminContact from "@/components/admin/about/adminContact";
import Footer from "@/components/misc/Footer";

export default function Contact() {
  return (
  <>
    <div className="">
      <Nav />
    </div>
    <div className="layout">
    <section className=" py-5">
      <AdminContact />
      <div className="container text-center mb-5">
        <h5 className="fw-bold fs-2">Contact Us</h5>
      </div>
      <div className="container">
        <div className="row g-5 align-items-start">
          <div className="col-lg-6 col-12">
            <ContactForm />
          </div>
          <div className="col-lg-6 col-12">
            <ContactInfo />
          </div>
        </div>
      </div>
   
    </section>
      <Footer />
    </div>
    </>
  );
}

