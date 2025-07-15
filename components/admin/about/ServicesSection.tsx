// components/about/ServicesSection.tsx
// components/about/ServicesSection.tsx
import { FaDumbbell, FaUtensils, FaCalendarAlt, FaHeartbeat } from "react-icons/fa";

export default function ServicesSection() {
  return (
    <section className="services-section py-5">
      <div className="container-fluid my-5 pt-5">
        <div className="row align-items-center">
          {/* Left: Grid of Service Cards */}
          <div className="col-md-6 mb-4 mb-md-0">
            <div className="row g-3">
              <div className="col-6">
                <div className="service-card text-center p-4 shadow-sm h-100">
                  <FaDumbbell className="service-icon mb-3" />
                  <h5 className="fw-bold">Personalized Workouts</h5>
                  <p className="small">Custom fitness plans tailored to your goals and schedule.</p>
                </div>
              </div>
              <div className="col-6">
                <div className="service-card text-center p-4 shadow-sm h-100">
                  <FaUtensils className="service-icon mb-3" />
                  <h5 className="fw-bold">Meal Guidance</h5>
                  <p className="small">Nutrition support and meal prep tips for sustainable results.</p>
                </div>
              </div>
              <div className="col-6">
                <div className="service-card text-center p-4 shadow-sm h-100">
                  <FaCalendarAlt className="service-icon mb-3" />
                  <h5 className="fw-bold">Flexible Scheduling</h5>
                  <p className="small">Train at your pace, from home or at the gym — on your time.</p>
                </div>
              </div>
              <div className="col-6">
                <div className="service-card text-center p-4 shadow-sm h-100">
                  <FaHeartbeat className="service-icon mb-3" />
                  <h5 className="fw-bold">Mind & Body Wellness</h5>
                  <p className="small">Holistic coaching that includes breathwork, mobility, and more.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Descriptive Paragraph */}
          <div className="col-md-6 text-center text-md-start">
            <h1 className="fw-bold mb-4">What We Offer</h1>
            <p className="fs-5 text-dark">
              Whether you&#39;re looking to lose weight, build muscle, or simply feel more confident in your skin,
              Lena’s programs are designed to support your full transformation.
            </p>
            <p className="fs-5 text-dark">
              From flexible training plans and group coaching to meal prep resources and accountability check-ins,
              this platform delivers everything you need to level up your wellness journey — at your pace.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
