// Contact page
import ContactForm from "@/components/contact/ContactForm";
import ContactInfo from "@/components/contact/contactInfo";
import Nav from "@/components/navbar/Nav";
import AdminContact from "@/components/admin/adminContact";

export default function Contact() {
  return (
  <>
    <div className="">
      <Nav />
    </div>
    <section className="layout py-5">
      <AdminContact />
      <div className="container text-center mb-5">
        <h2 className="fw-bold">Contact Us</h2>
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
    </>
  );
}

