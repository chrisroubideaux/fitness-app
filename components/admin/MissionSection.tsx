import Image from "next/image";

export default function MissionSection() {
  return (
    <section className="mission-section pt-5 ">
      <div className="container my-5">
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
            <h3 className="fw-bold mb-3">My Mission</h3>
            <p className="text-dark fs-5">
              To inspire a consistent, confident lifestyle through holistic training — combining strength, balance, and mindset coaching. Whether you&#39;re new or experienced, I meet you where you are.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}
