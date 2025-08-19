// Nav component 
import Link from "next/link"

export default function Nav() {
  return (
    <div>
     
        <nav className="navbar navbar-expand-lg shadow-sm px-4 py-3">
  <Link className="navbar-brand fw-bold" href="/">Lena Cruz</Link>

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
        <Link className="nav-link" href="/">Courses</Link>
      </li>
      <li className="nav-item">
        <Link className="nav-link" href="/">Events</Link>
      </li>
      <li className="nav-item">
        <Link className="nav-link" href="/about">About</Link>
      </li>
      <li className="nav-item">
        <Link className="nav-link" href="/contact">Contact</Link>
      </li>
      <li className="nav-item">
        <Link className="btn btn-face-rec ms-lg-3" href="/login">
          <i className="fas fa-user-circle me-2"></i> Sign In
        </Link>
      </li>
    </ul>
  </div>
</nav>

    </div>
  )
}
