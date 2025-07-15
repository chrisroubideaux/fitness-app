import Image from "next/image";

export default function MissionSection() {
  return (
    <section className="mission-section pt-5 ">
      <div className="container-fluid my-5 pt-5">
        <div className="row align-items-center">
          {/* Left: Image */}
          <div className="col-md-6 text-center mb-4 mb-md-0">
            <Image
              src="/images/studio/image.png"
              alt="Mission Visual"
              width={300}
              height={300}
              className="img-fluid shadow mission-img"
            />
          </div>

          {/* Right: Text */}
          <div className="col-md-6 text-center text-md-start">
            <h1 className="fw-bold mb-3">My Mission</h1>
            <p className="text-dark fs-5">
             To inspire a consistent, confident lifestyle through holistic training — combining strength, balance, and mindset coaching. Whether you&apos;re new to fitness or a seasoned athlete, I meet you exactly where you are.

             My mission is to help you build lasting habits, rediscover your inner power, and create a routine that feels sustainable — not stressful. This is more than just physical training; it&apos;s about mental resilience, self-love, and showing up for yourself every single day.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}
