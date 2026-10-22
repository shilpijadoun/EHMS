
import { useState } from 'react'
import {
  CircleHelp,
  Mail,
  Phone,
  MessageCircle,
  ChevronDown,
} from 'lucide-react'

const faqs = [
  {
    question: 'How can I manage hotel bookings?',
    answer:
      'Open the Bookings section from the admin sidebar to view and manage reservations.',
  },
  {
    question: 'How can I manage room availability?',
    answer:
      'Open the Rooms section to manage room information and availability.',
  },
  {
    question: 'How can I manage staff?',
    answer:
      'Open the Staff section to view and manage staff records.',
  },
  {
    question: 'How can I contact technical support?',
    answer:
      'Use the support contact details configured by your Hotel Palace administrator.',
  },
]

function Help() {
  const [openFaq, setOpenFaq] = useState(0)
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')

  const handleSubmit = (event) => {
    event.preventDefault()

    const subject = encodeURIComponent('Hotel Palace Admin Support')
    const body = encodeURIComponent(
      `Admin email: ${email}\n\nIssue:\n${message}`,
    )

    window.location.href =
      `mailto:support@hotelpalace.com?subject=${subject}&body=${body}`
  }

  return (
    <div className="container-fluid p-3 p-lg-4">
      <div className="mb-4">
        <h2 className="fw-bold mb-1">Help & Support</h2>
        <p className="text-secondary mb-0">
          Get help managing your Hotel Palace dashboard.
        </p>
      </div>

      <div className="admin-help-banner rounded-4 p-4 p-lg-5 mb-4">
        <CircleHelp size={35} className="mb-3" />
        <h3 className="fw-bold">How can we help you?</h3>
        <p className="mb-0">
          Find answers to common questions or contact the support team.
        </p>
      </div>

      <div className="row g-4">
        <div className="col-12 col-xl-7">
          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-body p-4">
              <h5 className="fw-bold mb-4">Frequently Asked Questions</h5>

              {faqs.map((faq, index) => (
                <div className="border-bottom py-3" key={faq.question}>
                  <button
                    type="button"
                    className="admin-faq-question"
                    aria-expanded={openFaq === index}
                    onClick={() =>
                      setOpenFaq(openFaq === index ? -1 : index)
                    }
                  >
                    <span>{faq.question}</span>
                    <ChevronDown
                      size={18}
                      className={openFaq === index ? 'rotate-180' : ''}
                    />
                  </button>

                  {openFaq === index && (
                    <p className="text-secondary mt-3 mb-0">
                      {faq.answer}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="col-12 col-xl-5">
          <div className="card border-0 shadow-sm rounded-4 mb-4">
            <div className="card-body p-4">
              <h5 className="fw-bold mb-4">Support Contact</h5>

              <div className="d-flex align-items-center gap-3 mb-4">
                <div className="admin-support-icon">
                  <Mail size={20} />
                </div>
                <div>
                  <div className="fw-semibold">Email Support</div>
                  <a
                    href="mailto:support@hotelpalace.com"
                    className="text-secondary text-decoration-none"
                  >
                    support@hotelpalace.com
                  </a>
                </div>
              </div>

              <div className="d-flex align-items-center gap-3 mb-4">
                <div className="admin-support-icon">
                  <Phone size={20} />
                </div>
                <div>
                  <div className="fw-semibold">Phone Support</div>
                  <p className="text-secondary mb-0">
                    Add your official support number
                  </p>
                </div>
              </div>

              <div className="d-flex align-items-center gap-3">
                <div className="admin-support-icon">
                  <MessageCircle size={20} />
                </div>
                <div>
                  <div className="fw-semibold">Support Requests</div>
                  <p className="text-secondary mb-0">
                    Describe the issue using the form.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-body p-4">
              <h5 className="fw-bold mb-3">Contact Support</h5>

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="supportEmail" className="form-label">
                    Email address
                  </label>
                  <input
                    id="supportEmail"
                    type="email"
                    className="form-control"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="admin@example.com"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="supportMessage" className="form-label">
                    Describe your issue
                  </label>
                  <textarea
                    id="supportMessage"
                    className="form-control"
                    rows="4"
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    placeholder="Enter your query..."
                    required
                  />
                </div>

                <button type="submit" className="btn btn-dark w-100">
                  Send Request
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Help