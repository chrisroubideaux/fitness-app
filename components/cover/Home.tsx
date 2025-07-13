

export default function Home() {
  return (
    <section className="pt-lg-8 pt-6 py-xxl-10 pt-3">
      
      <div className="container">
        <div className="row d-flex align-items-center">
          <div className="col-xxl-5 col-lg-6 col-12">
            <div>
              <h5 className="text-muted mb-4">Personal Trainer</h5>
              <h1 className="mb-3 fw-bold">
                Hello, I&#39;m{" "}
                <span className="text-bottom-line">Lena Cruz,</span>
                Certified Fitness Coach
              </h1>
              <p className="mb-4">
                Ready to transform your body and boost your confidence?
                I create custom fitness programs that fit your goals, schedule, and lifestyle.
              </p>
              <div className="d-grid d-lg-block">
                <a href="#" className="btn btn-sm">
                  Book a free consultation
                </a>
                <a
                  href="#"
                  className="btn btn-sm ms-lg-1 mt-2 mt-lg-0"
                >
                  View training plans
                </a>
              </div>
            </div>
          </div>
          <div className="col-xxl-6 offset-xxl-1 col-lg-6 col-12">
            <div className="text-center d-none d-lg-block fade-in">
              <img
                src="/images/admin/image.png"
                alt="Lena Cruz"
                className="img-fluid rounded"
              />

            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
