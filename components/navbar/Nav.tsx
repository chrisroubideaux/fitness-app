

export default function Nav() {
  return (
    <div>
     
        <nav className="navbar navbar-expand-lg navbar-light bg-light shadow-sm px-4 py-3">
  <a className="navbar-brand fw-bold" href="#">Lena Cruz</a>

  <button
    className="navbar-toggler"
    type="button"
    data-bs-toggle="collapse"
    data-bs-target="#navbarNav"
    aria-controls="navbarNav"
    aria-expanded="false"
    aria-label="Toggle navigation"
  >
    <span className="navbar-toggler-icon"></span>
  </button>

  <div className="collapse navbar-collapse" id="navbarNav">
    <ul className="navbar-nav ms-auto align-items-center">
      <li className="nav-item">
        <a className="nav-link" href="#">Courses</a>
      </li>
      <li className="nav-item">
        <a className="nav-link" href="#">Events</a>
      </li>
      <li className="nav-item">
        <a className="nav-link" href="#">About</a>
      </li>
      <li className="nav-item">
        <a className="nav-link" href="#">Contact</a>
      </li>
      <li className="nav-item">
        <a className="btn btn-face-rec ms-lg-3" href="#">
          <i className="fas fa-user-circle me-2"></i> Sign In
        </a>
      </li>
    </ul>
  </div>
</nav>

    </div>
  )
}
