import Image from "next/image";

export default function TrainerDetails() {
  return (
    <section className="trainer-details py-5 text-center">
      <div className="container">
        <Image
          src="/images/admin/image3.jpg"
          alt="Lena Cruz"
          width={150}
          height={150}
          className="rounded-circle mb-3 shadow"
        />
        <h4 className="fw-bold">Lena Cruz</h4>
        <p className="text-muted mb-1">NASM Certified Personal Trainer</p>
        <p className="text-muted">
          Specializing in strength training, yoga, mobility, and confidence coaching.
        </p>
      </div>
    </section>
  );
}
