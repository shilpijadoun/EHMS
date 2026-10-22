
import { useState } from 'react'
import { Link } from 'react-router-dom'
import Footer from '../../components/common/Footer'
import Navbar from '../../components/common/Navbar'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [forgotPassword, setForgotPassword] = useState(false)

  const backgroundStyle = {
    backgroundImage:
      "linear-gradient(rgba(15, 28, 22, 0.6), rgba(15, 28, 22, 0.6)), url('public/img/lights-the-evening-netherlands-holland-zaandam-hd-wallpaper-preview.jpg')",
    backgroundPosition: 'center',
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
  }

  function handleSubmit(event) {
    event.preventDefault()
    // Connect the login API here.
  }

  return (
    <>
    {/* Navigation */}
    <Navbar/>

    <main
        className="container-fluid min-vh-100 d-flex align-items-center py-4"
        style={backgroundStyle}
        >
        <div
            className="container-fluid p-3 p-md-5 rounded-4"
            style={{
            background: 'rgba(255,255,255,0.10)',
            border: '1px solid rgba(255,255,255,0.25)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            }}
        >
            <div className="row align-items-center g-5">
            <div className="col-lg-8 text-white">
                <h1
                className="display-3 fw-bold"
                style={{ fontFamily: 'Kalam, cursive' }}
                >
                Hotel Palace - Where Every Journey Feels Like Home
                </h1>

                <p className="fs-5 mt-4">
                Find the comfort of home amenities in every city.
                Choose Hotel Palace for your next stay.
                </p>
            </div>

            <div className="col-lg-4">
                <div
                className="card border-light border-opacity-25 rounded-4"
                style={{ background: 'rgba(255,255,255,0.12)' }}
                >
                <h3 className="text-white fs-4 px-4 pt-4">
                    Login / Sign Up
                </h3>

                <div className="card-body p-4">
                    <form onSubmit={handleSubmit}>
                    <div className="form-floating mb-3">
                        <input
                        type="email"
                        className="form-control"
                        id="loginEmail"
                        placeholder="name@example.com"
                        autoComplete="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        required
                        />
                        <label htmlFor="loginEmail">Email address</label>
                    </div>

                    <div className="form-floating">
                        <input
                        type="password"
                        className="form-control"
                        id="loginPassword"
                        placeholder="Password"
                        autoComplete="current-password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        required
                        />
                        <label htmlFor="loginPassword">Password</label>
                    </div>

                    <div className="text-center my-4">
                        <button
                        type="submit"
                        className="btn btn-outline-light px-5"
                        >
                        Login
                        </button>
                    </div>
                    </form>

                    <div className="row g-3 text-white small">
                    <div className="col-sm-6">
                        Forgot Password?{' '}
                        <button
                        type="button"
                        className="btn btn-link text-warning p-0 text-decoration-none"
                        onClick={() => setForgotPassword(!forgotPassword)}
                        >
                        Click here
                        </button>
                    </div>

                    <div className="col-sm-6">
                        New User?{' '}
                        <Link
                        to="/signup"
                        className="link-warning text-decoration-none"
                        >
                        Register
                        </Link>
                    </div>
                    </div>

                    {forgotPassword && (
                    <div className="mt-4">
                        <label
                        htmlFor="forgotEmail"
                        className="form-label text-white"
                        >
                        Registered email
                        </label>
                        <input
                        id="forgotEmail"
                        type="email"
                        className="form-control mb-3"
                        placeholder="name@example.com"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        />
                        <button
                        type="button"
                        className="btn btn-light btn-sm"
                        onClick={() => setForgotPassword(false)}
                        >
                        Cancel
                        </button>
                    </div>
                    )}
                </div>
                </div>
            </div>
            </div>
        </div>
    </main>

    {/* Footer */}
    {/* <Footer/> */}
    
    </>
  )
}

export default Login
