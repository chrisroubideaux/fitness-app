// components/about/TrainerTeam.tsx
import { FaUsers } from "react-icons/fa";

export default function TrainerTeam() {
  return (
    <section className="trainer-team-section py-5">
      <div className="container-fluid my-5 pt-5">
        <div className="row align-items-center">
          {/* Left: Text */}
          <div className="col-md-6 text-center text-md-start">
            <h1 className="fw-bold mb-4">Meet the Team</h1>
            <p className="fs-5 par">
              Lena works alongside a close-knit group of certified trainers, yoga instructors,
              and wellness professionals. Each team member shares the same mission: to help you
              move better, feel stronger, and live with intention.
            </p>
            <p className="fs-5 par">
              From strength training to mobility work and mindfulness coaching, our team is here
              to support you with personalized guidance, accountability, and real results.
            </p>
          </div>

          {/* Right: Gradient Icon Box */}
          <div className="col-md-6 text-center mt-4 mt-md-0">
            <div className="team-gradient-box d-flex justify-content-center align-items-center mx-auto">
              <FaUsers className="team-icon" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


{/*
import Image from "next/image";

export default function TrainerTeam() {
  return (
    <section className="trainer-team-section py-5">
      <div className="container-fluid my-5 pt-5">
        <div className="row align-items-center">
        
          <div className="col-md-6 text-center text-md-start">
            <h1 className="fw-bold mb-4">Meet the Team</h1>
            <p className="fs-5 text-dark">
              Lena works alongside a close-knit group of certified trainers, yoga instructors,
              and wellness professionals. Each team member shares the same mission: to help you
              move better, feel stronger, and live with intention.
            </p>
            <p className="fs-5 text-dark">
              From strength training to mobility work and mindfulness coaching, our team is here
              to support you with personalized guidance, accountability, and real results.
            </p>
          </div>

        
          <div className="col-md-6 text-center mt-4 mt-md-0">
            <Image
              src="/images/studio/studio2.png" 
              alt="Our Trainer Team"
              width={400}
              height={400}
              className="img-fluid rounded shadow"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
*/}
