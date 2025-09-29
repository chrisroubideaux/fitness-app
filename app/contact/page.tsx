// Contact page
import ContactForm from "@/components/contact/ContactForm"; 
import ContactInfo from "@/components/contact/contactInfo";
import Nav from "@/components/navbar/Nav";
import AdminContact from "@/components/admin/about/adminContact";
import Footer from "@/components/misc/Footer";

export default function Contact() {
  return (
    <>
      <Nav />

      <section
        className="min-vh-100 d-flex flex-column justify-content-between"
        style={{
          background: "linear-gradient(135deg, #fdfbfb, #ebedee)",
        }}
      >
        <div className="container py-5">
          {/* Top Section */}
          <div className="text-center mb-4">
            <AdminContact />
            <h1 className="fw-bold mt-3 fs-2">Contact Us</h1>
            <p className="text-muted">
              We’d love to hear from you. Send us a message or connect with us
              directly.
            </p>
          </div>

          {/* Cards Layout */}
          <div className="row g-4">
            {/* Contact Form */}
            <div className="col-lg-6 col-12">
              <div className="card shadow-md border-0 rounded-4 h-100">
                <div className="card-body p-4">
                  <ContactForm />
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="col-lg-6 col-12">
              <div className="card shadow-sm border-0 rounded-4 h-100">
                <div className="card-body p-4">
                  <ContactInfo />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <Footer />
      </section>
    </>
  );
}

