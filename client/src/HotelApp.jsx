import { useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  NavLink,
  Navigate,
  Outlet,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { api, useData, currency } from "./api";
import Home from "./pages/public/Home";
import Navbar from "./components/common/Navbar";
import Footer from "./components/common/Footer";
import "./assets/css/operations.css";

function Message({ error, message }) {
  return (
    <>
      {error && (
        <div role="alert" className="alert alert-danger">
          {error}
        </div>
      )}
      {message && (
        <div role="status" className="alert alert-success">
          {message}
        </div>
      )}
    </>
  );
}
function Loading({ resource }) {
  return (
    <>
      <Message error={resource.error} />
      {resource.loading && <p role="status">Loading records…</p>}
    </>
  );
}
function Field({ label, name, type = "text", value, onChange, ...rest }) {
  return (
    <label className="form-label d-block">
      {label}
      <input
        className="form-control mt-1"
        name={name}
        type={type}
        value={value ?? ""}
        onChange={onChange}
        {...rest}
      />
    </label>
  );
}
let razorpayScript;
function loadRazorpay() {
  if (window.Razorpay) return Promise.resolve(window.Razorpay);
  if (razorpayScript) return razorpayScript;
  razorpayScript = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(window.Razorpay);
    script.onerror = () =>
      reject(new Error("Razorpay Checkout could not be loaded."));
    document.head.appendChild(script);
  });
  return razorpayScript;
}
function Select({ label, value, onChange, children, ...rest }) {
  return (
    <label className="form-label d-block">
      {label}
      <select
        className="form-select mt-1"
        value={value}
        onChange={onChange}
        {...rest}
      >
        {children}
      </select>
    </label>
  );
}
function useForm(initial) {
  const [form, setForm] = useState(initial);
  return [
    form,
    (e) => setForm({ ...form, [e.target.name]: e.target.value }),
    setForm,
  ];
}
function Public({ children }) {
  return (
    <>
      <Navbar />
      <main className="container py-5">{children}</main>
      <Footer />
    </>
  );
}

function Login() {
  const [form, change] = useForm({ email: "", password: "" }),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const user = await api("/auth/login", "POST", form);
      navigate(user.role === "staff" ? "/staff" : "/admin");
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Public>
      <div className="hp-card auth-card">
        <p className="eyebrow">HOTEL PALACE • TEAM ACCESS</p>
        <h1>Welcome back</h1>
        <p className="text-secondary">Sign in to manage your hotel.</p>
        <Message error={error} />
        <form onSubmit={submit}>
          <Field
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={change}
            autoComplete="username"
            required
          />
          <Field
            label="Password"
            name="password"
            type="password"
            value={form.password}
            onChange={change}
            autoComplete="current-password"
            required
          />
          <button className="btn btn-dark w-100" disabled={busy}>
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>
        <p className="small text-secondary mt-3">
          Need an account or password reset? Contact your hotel administrator.
        </p>
      </div>
    </Public>
  );
}
function Rooms({ featured = false }) {
  const [params, setParams] = useSearchParams();
  const [form, change] = useForm({
    checkIn: params.get("checkIn") || "",
    checkOut: params.get("checkOut") || "",
    guests: params.get("guests") || "1",
  });
  const resource = useData(`/rooms?${params.toString()}`),
    [type, setType] = useState(""),
    [sort, setSort] = useState("price");
  const rooms = [...(resource.data || [])]
    .filter((r) => !type || r.roomType === type)
    .sort((a, b) =>
      sort === "price"
        ? a.pricePerNight - b.pricePerNight
        : b.pricePerNight - a.pricePerNight,
    );
  const content = (
    <>
      <div className="d-flex justify-content-between align-items-end flex-wrap gap-3 mb-4">
        <div>
          <p className="eyebrow">REST WELL, STAY LONGER</p>
          <h1>{featured ? "Explore our rooms" : "Find your perfect stay"}</h1>
          <p className="text-secondary">
            Comfortable rooms at Hotel Palace. Choose your dates to check
            availability.
          </p>
        </div>
      </div>
      {!featured && (
        <form
          className="hp-card form-grid mb-4"
          onSubmit={(e) => {
            e.preventDefault();
            setParams(form);
          }}
        >
          <Field
            label="Arrival"
            name="checkIn"
            type="date"
            value={form.checkIn}
            onChange={change}
            required
          />
          <Field
            label="Departure"
            name="checkOut"
            type="date"
            value={form.checkOut}
            onChange={change}
            min={form.checkIn}
            required
          />
          <Field
            label="Guests"
            name="guests"
            type="number"
            min="1"
            max="20"
            value={form.guests}
            onChange={change}
            required
          />
          <button className="btn btn-dark align-self-end mb-2">
            Check availability
          </button>
        </form>
      )}
      <Loading resource={resource} />
      {!featured && (
        <div className="d-flex gap-3 mb-4">
          <Select
            label="Room type"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="">All rooms</option>
            {["Standard", "Deluxe", "Suite"].map((t) => (
              <option key={t}>{t}</option>
            ))}
          </Select>
          <Select
            label="Sort price"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="price">Lowest first</option>
            <option value="descending">Highest first</option>
          </Select>
        </div>
      )}
      <div className="row g-4">
        {rooms.map((room) => (
          <div className="col-md-6 col-xl-4" key={room._id}>
            <article className="hp-card p-0 overflow-hidden h-100">
              <img
                className="room-photo"
                src={room.image}
                alt={`${room.roomType} room`}
              />
              <div className="p-4">
                <span className="badge text-bg-light mb-2">
                  Up to {room.capacity} guests
                </span>
                <h3>
                  {room.roomType} · {room.roomNumber}
                </h3>
                <p className="text-secondary">{room.description}</p>
                <p>{room.amenities.join(" · ")}</p>
                <strong>{currency(room.pricePerNight)} / night</strong>
                <div className="d-flex gap-2 mt-3">
                  <Link
                    className="btn btn-outline-dark"
                    to={`/rooms/${room._id}?${params}`}
                  >
                    Details
                  </Link>
                  <Link
                    className="btn btn-dark"
                    to={`/booking/${room._id}?${params}`}
                  >
                    Book room
                  </Link>
                </div>
              </div>
            </article>
          </div>
        ))}
      </div>
      {!resource.loading && !resource.error && !rooms.length && (
        <p className="hp-card">No rooms match these dates. Try another stay.</p>
      )}
    </>
  );
  return featured ? (
    <section className="container py-5">{content}</section>
  ) : (
    <Public>{content}</Public>
  );
}
export function FeaturedRooms() {
  return <Rooms featured />;
}
function RoomDetails() {
  const { id } = useParams(),
    [params] = useSearchParams(),
    resource = useData(`/rooms/${id}`),
    room = resource.data;
  return (
    <Public>
      <Loading resource={resource} />
      {room && (
        <div className="row g-4">
          <div className="col-lg-7">
            <img
              className="w-100 rounded-4"
              src={room.image}
              alt={room.roomType}
            />
          </div>
          <div className="col-lg-5 hp-card">
            <p className="eyebrow">HOTEL PALACE</p>
            <h1>
              {room.roomType} room {room.roomNumber}
            </h1>
            <p>{room.description}</p>
            <p>
              Floor {room.floor} · Up to {room.capacity} guests
            </p>
            <p>{room.amenities.join(" · ")}</p>
            <h3>{currency(room.pricePerNight)} / night</h3>
            <Link className="btn btn-dark mt-3" to={`/booking/${id}?${params}`}>
              Choose your stay
            </Link>
          </div>
        </div>
      )}
    </Public>
  );
}
function Booking() {
  const { id } = useParams(),
    [params] = useSearchParams(),
    rooms = useData("/rooms"),
    settings = useData("/settings");
  const [form, change] = useForm({
    roomId: id || "",
    checkIn: params.get("checkIn") || "",
    checkOut: params.get("checkOut") || "",
    adults: params.get("guests") || 1,
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    specialRequests: "",
  });
  const [error, setError] = useState(""),
    [result, setResult] = useState(null),
    [busy, setBusy] = useState(false),
    [onlinePayment, setOnlinePayment] = useState(false);
  const room = rooms.data?.find((r) => r._id === form.roomId),
    nights =
      Math.max(
        0,
        (new Date(form.checkOut) - new Date(form.checkIn)) / 86400000,
      ) || 0;
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      setResult(await api("/bookings", "POST", form));
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function payOnline() {
    setBusy(true);
    setError("");
    try {
      const order = await api(
        `/public/bookings/${encodeURIComponent(result.bookingNumber)}/razorpay/order`,
        "POST",
        { paymentToken: result.paymentToken },
      );
      const Razorpay = await loadRazorpay();
      if (!Razorpay) throw new Error("Razorpay Checkout could not be loaded.");
      const checkout = new Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: settings.data?.name || "Hotel Palace",
        description: `Booking ${order.bookingNumber}`,
        order_id: order.orderId,
        prefill: {
          name: `${form.firstName} ${form.lastName}`,
          email: form.email,
          contact: form.phone,
        },
        notes: { booking_number: order.bookingNumber },
        handler: async (response) => {
          try {
            await api(
              `/public/bookings/${encodeURIComponent(result.bookingNumber)}/razorpay/verify`,
              "POST",
              { paymentToken: result.paymentToken, ...response },
            );
            setOnlinePayment(true);
          } catch (e) {
            setError(e.message);
          } finally {
            setBusy(false);
          }
        },
        modal: { ondismiss: () => setBusy(false) },
      });
      checkout.open();
    } catch (e) {
      setError(e.message);
      setBusy(false);
    }
  }
  return (
    <Public>
      <h1>Book your stay</h1>
      <Loading resource={rooms} />
      <Message error={error} />
      {result ? (
        <div className="hp-card">
          <span className="badge text-bg-success">Confirmed</span>
          <h2 className="mt-3">We look forward to welcoming you.</h2>
          <p>
            Booking reference: <strong>{result.bookingNumber}</strong>
          </p>
          <p>
            {result.checkInDate.slice(0, 10)} to{" "}
            {result.checkOutDate.slice(0, 10)}
          </p>
          <h3>Total: {currency(result.totalAmount)}</h3>
          {onlinePayment ? (
            <p className="text-success">
              Online payment verified. Please bring your ID at check-in.
            </p>
          ) : (
            <p>
              Pay online securely with Razorpay, or pay at the hotel during
              check-in. Save this reference and bring your ID.
            </p>
          )}
          {!onlinePayment && (
            <button
              type="button"
              className="btn btn-dark me-2"
              disabled={busy}
              onClick={payOnline}
            >
              {busy
                ? "Opening secure checkout…"
                : `Pay ${currency(result.totalAmount)} online`}
            </button>
          )}
          <Link to="/" className="btn btn-dark">
            Back to home
          </Link>
        </div>
      ) : (
        <form className="hp-card" onSubmit={submit}>
          <div className="form-grid">
            <Select
              label="Room"
              value={form.roomId}
              name="roomId"
              onChange={change}
              required
            >
              <option value="">Choose a room</option>
              {rooms.data?.map((r) => (
                <option value={r._id} key={r._id}>
                  {r.roomNumber} · {r.roomType} · {currency(r.pricePerNight)}
                </option>
              ))}
            </Select>
            <Field
              label="Arrival"
              name="checkIn"
              type="date"
              value={form.checkIn}
              onChange={change}
              required
            />
            <Field
              label="Departure"
              name="checkOut"
              type="date"
              value={form.checkOut}
              onChange={change}
              min={form.checkIn}
              required
            />
            <Field
              label="Guests"
              name="adults"
              type="number"
              min="1"
              max={room?.capacity || 20}
              value={form.adults}
              onChange={change}
              required
            />
            {[
              ["firstName", "First name"],
              ["lastName", "Last name"],
              ["email", "Email"],
              ["phone", "Phone"],
            ].map(([name, label]) => (
              <Field
                key={name}
                label={label}
                name={name}
                type={name === "email" ? "email" : "text"}
                value={form[name]}
                onChange={change}
                required
              />
            ))}
          </div>
          <Field
            label="Special requests (optional)"
            name="specialRequests"
            value={form.specialRequests}
            onChange={change}
            maxLength="1000"
          />
          {room && nights > 0 && (
            <p className="fs-5">
              {nights} nights · Estimated total{" "}
              {currency(
                room.pricePerNight *
                  nights *
                  (1 + (settings.data?.taxPercent || 0) / 100),
              )}
            </p>
          )}
          <p className="small text-secondary">
            Availability and total are checked again when you confirm. You can
            choose secure Razorpay payment after the reservation is created.
          </p>
          <button className="btn btn-dark" disabled={busy || !rooms.data}>
            {busy ? "Confirming…" : "Confirm reservation"}
          </button>
        </form>
      )}
    </Public>
  );
}

function Workspace({ admin }) {
  const resource = useData("/auth/me"),
    navigate = useNavigate(),
    [error, setError] = useState("");
  if (resource.loading)
    return <main className="container py-5">Checking session…</main>;
  if (!resource.data) return <Navigate to="/login" replace />;
  const user = resource.data,
    base = admin ? "/admin" : "/staff";
  if (admin && user.role === "staff") return <Navigate to="/staff" replace />;
  const links = [
    ["", "Overview"],
    ["bookings", "Reservations"],
    ["rooms", "Rooms"],
    ["guests", "Guests"],
    ["housekeeping", "Housekeeping"],
    ...(admin
      ? [
          ["staff", "Team"],
          ["settings", "Hotel settings"],
        ]
      : []),
    ["profile", "My account"],
  ];
  return (
    <div className="ops-shell">
      <aside className="ops-nav">
        <Link to="/" className="ops-brand">
          HP <span>Hotel Palace</span>
        </Link>
        <small>OPERATIONS WORKSPACE</small>
        <nav>
          {links.map(([path, label]) => (
            <NavLink key={path} to={`${base}/${path}`} end={!path}>
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto">
          <strong>{user.name}</strong>
          <p className="small">{user.role}</p>
          <button
            className="btn btn-outline-light btn-sm"
            onClick={async () => {
              try {
                await api("/auth/logout", "POST");
                navigate("/login");
              } catch (e) {
                setError(e.message);
              }
            }}
          >
            Sign out
          </button>
        </div>
      </aside>
      <main className="ops-main">
        <Message error={error} />
        <Outlet context={{ user, base }} />
      </main>
    </div>
  );
}
function Dashboard() {
  const resource = useData("/dashboard"),
    d = resource.data;
  return (
    <>
      <p className="eyebrow">YOUR HOTEL AT A GLANCE</p>
      <h1>Operations overview</h1>
      <p className="text-secondary mb-4">
        Live room inventory, arrivals and collected payments.
      </p>
      <Loading resource={resource} />
      {d && (
        <div className="row g-3">
          {[
            ["Total rooms", d.totalRooms],
            ["Available rooms", d.available],
            ["Occupied rooms", d.occupied],
            ["Today’s arrivals", d.arrivals],
            ["Open housekeeping tasks", d.pendingTasks],
            ["Net receipts", currency(d.revenue)],
            ["Outstanding balance", currency(d.outstanding)],
            [
              "Occupancy",
              `${d.totalRooms ? Math.round((d.occupied / d.totalRooms) * 100) : 0}%`,
            ],
          ].map(([label, value]) => (
            <div className="col-sm-6 col-xl-3" key={label}>
              <div className="hp-card h-100">
                <p className="text-secondary">{label}</p>
                <h2>{value}</h2>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
function Table({ columns, rows }) {
  const [search, setSearch] = useState("");
  const filtered = rows.filter((row) =>
    JSON.stringify(row).toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <div className="hp-card">
      <Field
        label="Search records"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <div className="table-responsive">
        <table className="table align-middle">
          <thead>
            <tr>
              {columns.map(([key, label]) => (
                <th key={key}>{label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((row) => (
              <tr key={row._id}>
                {columns.map(([key, , render]) => (
                  <td key={key}>
                    {render ? render(row) : String(row[key] ?? "—")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {!filtered.length && (
          <p className="text-secondary">No records to display.</p>
        )}
      </div>
    </div>
  );
}
function RoomManager() {
  const resource = useData("/rooms"),
    me = useData("/auth/me"),
    editable = ["admin", "manager"].includes(me.data?.role);
  const initial = {
    roomNumber: "",
    roomType: "Standard",
    floor: 1,
    capacity: 2,
    pricePerNight: "",
    description: "",
    image: "/img/homestay-hotel.jpg",
    amenities: "Wi-Fi, Air conditioning",
  };
  const [form, change, setForm] = useForm(initial),
    [editing, setEditing] = useState(null),
    [show, setShow] = useState(false),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      await api(
        editing ? `/rooms/${editing}` : "/rooms",
        editing ? "PUT" : "POST",
        {
          ...form,
          amenities: form.amenities
            .split(",")
            .map((x) => x.trim())
            .filter(Boolean),
        },
      );
      setShow(false);
      setEditing(null);
      setForm(initial);
      await resource.refresh();
      setError("");
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <div className="page-heading">
        <h1>Room inventory</h1>
        {editable && (
          <button
            className="btn btn-dark"
            onClick={() => {
              setEditing(null);
              setForm(initial);
              setShow(!show);
            }}
          >
            Add room
          </button>
        )}
      </div>
      <Message error={error} />
      <Loading resource={resource} />
      {show && (
        <form className="hp-card mb-4" onSubmit={submit}>
          <h3>{editing ? "Edit room" : "New room"}</h3>
          <div className="form-grid">
            {[
              ["roomNumber", "Room number", "text"],
              ["floor", "Floor", "number"],
              ["capacity", "Capacity", "number"],
              ["pricePerNight", "Nightly rate", "number"],
            ].map(([name, label, type]) => (
              <Field
                key={name}
                name={name}
                label={label}
                type={type}
                min={name === "capacity" ? 1 : 0}
                step={name === "pricePerNight" ? "0.01" : "1"}
                value={form[name]}
                onChange={change}
                required
              />
            ))}
            <Select
              label="Type"
              name="roomType"
              value={form.roomType}
              onChange={change}
            >
              {["Standard", "Deluxe", "Suite"].map((t) => (
                <option key={t}>{t}</option>
              ))}
            </Select>
            <Field
              label="Image URL or /img/ path"
              name="image"
              value={form.image}
              onChange={change}
            />
            <Field
              label="Amenities, comma separated"
              name="amenities"
              value={form.amenities}
              onChange={change}
            />
            <Field
              label="Description"
              name="description"
              value={form.description}
              onChange={change}
              required
            />
          </div>
          <button className="btn btn-dark" disabled={busy}>
            Save room
          </button>{" "}
          <button
            type="button"
            className="btn btn-light"
            onClick={() => setShow(false)}
          >
            Cancel
          </button>
        </form>
      )}
      <Table
        rows={resource.data || []}
        columns={[
          ["roomNumber", "Room"],
          ["roomType", "Type"],
          ["capacity", "Capacity"],
          ["pricePerNight", "Rate", (r) => currency(r.pricePerNight)],
          ["status", "Status"],
          [
            "actions",
            "Actions",
            (r) =>
              editable ? (
                <div className="d-flex gap-2">
                  <button
                    className="btn btn-sm btn-outline-dark"
                    onClick={() => {
                      setEditing(r._id);
                      setForm({ ...r, amenities: r.amenities.join(", ") });
                      setShow(true);
                    }}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={async () => {
                      if (!window.confirm(`Deactivate room ${r.roomNumber}?`))
                        return;
                      try {
                        await api(`/rooms/${r._id}`, "DELETE");
                        await resource.refresh();
                      } catch (e) {
                        setError(e.message);
                      }
                    }}
                  >
                    Deactivate
                  </button>
                </div>
              ) : (
                "Read only"
              ),
          ],
        ]}
      />
    </>
  );
}

function Bookings() {
  const resource = useData("/bookings"),
    me = useData("/auth/me"),
    settings = useData("/settings");
  const [selected, setSelected] = useState(null),
    [action, setAction] = useState("payment"),
    [form, change, setForm] = useForm({
      amount: "",
      method: "cash",
      transactionId: "",
      notes: "",
      reason: "",
      idVerified: false,
    }),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState("");
  const booking = resource.data?.find((b) => b._id === selected);
  const payments = useData(
    selected ? `/bookings/${selected}/payments` : "/health",
  );
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api(`/bookings/${selected}/${action}`, "POST", form);
      await resource.refresh();
      await payments.refresh();
      setMessage("Booking updated successfully.");
      setForm({
        amount: "",
        method: "cash",
        transactionId: "",
        notes: "",
        reason: "",
        idVerified: false,
      });
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <div className="page-heading">
        <h1>Reservations & billing</h1>
        <Link to="/booking" className="btn btn-dark">
          New reservation
        </Link>
      </div>
      <Loading resource={resource} />
      <Message error={error} message={message} />
      <Table
        rows={resource.data || []}
        columns={[
          ["bookingNumber", "Reference"],
          [
            "guest",
            "Guest",
            (b) => `${b.guest?.firstName} ${b.guest?.lastName}`,
          ],
          [
            "rooms",
            "Room",
            (b) => b.rooms.map((r) => r.room?.roomNumber).join(", "),
          ],
          ["checkInDate", "Arrival", (b) => b.checkInDate.slice(0, 10)],
          ["checkOutDate", "Departure", (b) => b.checkOutDate.slice(0, 10)],
          ["bookingStatus", "Status"],
          [
            "totalAmount",
            "Balance",
            (b) => currency(b.totalAmount - b.paidAmount),
          ],
          [
            "actions",
            "",
            (b) => (
              <button
                className="btn btn-sm btn-outline-dark"
                onClick={() => {
                  setSelected(b._id);
                  setError("");
                  setMessage("");
                }}
              >
                Manage / invoice
              </button>
            ),
          ],
        ]}
      />
      {booking && (
        <section className="hp-card mt-4 invoice-panel">
          <div className="page-heading">
            <h2>{settings.data?.name || "Hotel Palace"} · Invoice</h2>
            <button
              className="btn btn-outline-dark no-print"
              onClick={() => window.print()}
            >
              Print invoice
            </button>
          </div>
          <p>
            {settings.data?.address} {settings.data?.phone}
          </p>
          <p>
            <strong>{booking.bookingNumber}</strong> ·{" "}
            {booking.guest?.firstName} {booking.guest?.lastName}
            <br />
            {booking.guest?.email} · {booking.guest?.phone}
          </p>
          <p>
            {booking.checkInDate.slice(0, 10)} —{" "}
            {booking.checkOutDate.slice(0, 10)} · {booking.bookingStatus}
          </p>
          <div className="bill-lines">
            {[
              ["Room charges", booking.roomAmount],
              ["Tax", booking.taxAmount],
              ["Additional charges", booking.extraCharges],
              ["Total", booking.totalAmount],
              ["Paid (net)", booking.paidAmount],
              ["Balance due", booking.totalAmount - booking.paidAmount],
            ].map(([label, value]) => (
              <div key={label}>
                <span>{label}</span>
                <strong>{currency(value)}</strong>
              </div>
            ))}
          </div>
          {booking.chargeNotes && <p>{booking.chargeNotes}</p>}
          <h4 className="mt-4">Payment history</h4>
          <Loading resource={payments} />
          {Array.isArray(payments.data) &&
            payments.data.map((p) => (
              <p key={p._id}>
                {new Date(p.paidAt).toLocaleString()} · {p.method} · {p.status}{" "}
                · {currency(p.amount)}{" "}
                {p.transactionId && `(${p.transactionId})`}
              </p>
            ))}
          {!["cancelled", "checked-out"].includes(booking.bookingStatus) && (
            <form onSubmit={submit} className="no-print border-top pt-4 mt-4">
              <Select
                label="Action"
                value={action}
                onChange={(e) => setAction(e.target.value)}
              >
                <option value="payment">Record manual payment received</option>
                <option value="charges">Set additional charges</option>
                <option value="check-in">Check in guest</option>
                <option value="check-out">Check out guest</option>
                <option value="cancel">Cancel reservation</option>
                {me.data?.role !== "staff" && (
                  <option value="refund">Record manual refund paid</option>
                )}
              </Select>
              {["payment", "refund", "charges"].includes(action) && (
                <Field
                  label={
                    action === "charges" ? "Total additional charges" : "Amount"
                  }
                  name="amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.amount}
                  onChange={change}
                  required
                />
              )}
              {["payment", "refund"].includes(action) && (
                <>
                  <Select
                    label="Payment method"
                    name="method"
                    value={form.method}
                    onChange={change}
                  >
                    {["cash", "card", "upi", "online", "bank_transfer"].map(
                      (m) => (
                        <option key={m}>{m}</option>
                      ),
                    )}
                  </Select>
                  <Field
                    label="External transaction reference (optional)"
                    name="transactionId"
                    value={form.transactionId}
                    onChange={change}
                  />
                  <p className="small text-secondary">
                    Record funds already received or refunded. This does not
                    charge a card or transfer money.
                  </p>
                </>
              )}
              {action === "charges" && (
                <Field
                  label="Charge description"
                  name="notes"
                  value={form.notes}
                  onChange={change}
                  required
                />
              )}
              {action === "cancel" && (
                <Field
                  label="Cancellation reason"
                  name="reason"
                  value={form.reason}
                  onChange={change}
                  required
                />
              )}
              {action === "check-in" && (
                <label className="d-block mb-3">
                  <input
                    type="checkbox"
                    checked={form.idVerified}
                    onChange={(e) =>
                      setForm({ ...form, idVerified: e.target.checked })
                    }
                    required
                  />{" "}
                  I have verified the guest’s identity document.
                </label>
              )}
              {action === "check-out" && (
                <p>
                  Outstanding balance must be paid. Checkout creates a cleaning
                  task.
                </p>
              )}
              <button className="btn btn-dark" disabled={busy}>
                {busy ? "Saving…" : "Apply action"}
              </button>
            </form>
          )}
          <button
            className="btn btn-light mt-3 no-print"
            onClick={() => setSelected(null)}
          >
            Close invoice
          </button>
        </section>
      )}
    </>
  );
}
function Guests() {
  const resource = useData("/guests");
  return (
    <>
      <h1 className="mb-4">Guest directory</h1>
      <Loading resource={resource} />
      <Table
        rows={resource.data || []}
        columns={[
          ["firstName", "First name"],
          ["lastName", "Last name"],
          ["email", "Email"],
          ["phone", "Phone"],
          [
            "idVerified",
            "ID verified",
            (r) => (r.idVerified ? "Yes" : "Not yet"),
          ],
        ]}
      />
    </>
  );
}
function Housekeeping() {
  const resource = useData("/housekeeping"),
    rooms = useData("/rooms"),
    users = useData("/team");
  const [form, change] = useForm({
      room: "",
      taskType: "cleaning",
      assignedTo: "",
      notes: "",
    }),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      await api("/housekeeping", "POST", form);
      await resource.refresh();
      await rooms.refresh();
      setError("");
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <h1 className="mb-4">Housekeeping & maintenance</h1>
      <Loading resource={resource} />
      <Message error={error} />
      <form onSubmit={submit} className="hp-card mb-4">
        <div className="form-grid">
          <Select
            label="Room"
            name="room"
            value={form.room}
            onChange={change}
            required
          >
            <option value="">Choose room</option>
            {rooms.data?.map((r) => (
              <option key={r._id} value={r._id}>
                {r.roomNumber} · {r.status}
              </option>
            ))}
          </Select>
          <Select
            label="Task"
            name="taskType"
            value={form.taskType}
            onChange={change}
          >
            <option value="cleaning">Cleaning</option>
            <option value="maintenance">Maintenance</option>
          </Select>
          <Select
            label="Assign to"
            name="assignedTo"
            value={form.assignedTo}
            onChange={change}
          >
            <option value="">Unassigned</option>
            {users.data
              ?.filter((u) => u.isActive)
              .map((u) => (
                <option value={u._id} key={u._id}>
                  {u.name}
                </option>
              ))}
          </Select>
          <Field
            label="Notes"
            name="notes"
            value={form.notes}
            onChange={change}
          />
        </div>
        <button className="btn btn-dark" disabled={busy}>
          Create task
        </button>
      </form>
      <Table
        rows={resource.data || []}
        columns={[
          ["room", "Room", (r) => r.room?.roomNumber],
          ["taskType", "Task"],
          [
            "assignedTo",
            "Assigned to",
            (r) => r.assignedTo?.name || "Unassigned",
          ],
          ["notes", "Notes"],
          ["status", "Status"],
          [
            "actions",
            "Update",
            (r) =>
              r.status !== "completed" && (
                <div className="d-flex gap-2">
                  {["in-progress", "completed"].map((status) => (
                    <button
                      key={status}
                      className="btn btn-sm btn-outline-dark"
                      disabled={busy || status === r.status}
                      onClick={async () => {
                        setBusy(true);
                        try {
                          await api(`/housekeeping/${r._id}`, "PUT", {
                            status,
                          });
                          await resource.refresh();
                          setError("");
                        } catch (e) {
                          setError(e.message);
                        } finally {
                          setBusy(false);
                        }
                      }}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              ),
          ],
        ]}
      />
    </>
  );
}
function Team() {
  const resource = useData("/users"),
    me = useData("/auth/me"),
    [form, change, setForm] = useForm({
      name: "",
      email: "",
      password: "",
      phone: "",
      role: "staff",
      isActive: true,
    }),
    [editing, setEditing] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      await api(
        editing ? `/users/${editing}` : "/users",
        editing ? "PUT" : "POST",
        form,
      );
      setEditing("");
      setForm({
        name: "",
        email: "",
        password: "",
        phone: "",
        role: "staff",
        isActive: true,
      });
      await resource.refresh();
      setError("");
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <h1 className="mb-4">Hotel team</h1>
      <Loading resource={resource} />
      <Message error={error} />
      {me.data?.role === "admin" && (
        <form onSubmit={submit} className="hp-card mb-4">
          <h3>
            {editing ? "Edit account / reset password" : "Create account"}
          </h3>
          <div className="form-grid">
            {[
              ["name", "Name"],
              ["email", "Email"],
              ["phone", "Phone"],
              [
                "password",
                editing
                  ? "New password (leave blank to keep)"
                  : "Initial password",
              ],
            ].map(([name, label]) => (
              <Field
                key={name}
                label={label}
                name={name}
                type={
                  name === "password"
                    ? "password"
                    : name === "email"
                      ? "email"
                      : "text"
                }
                minLength={name === "password" ? 10 : undefined}
                value={form[name]}
                onChange={change}
                disabled={editing && name === "email"}
                required={!editing || name === "name"}
              />
            ))}
            <Select
              label="Role"
              name="role"
              value={form.role}
              onChange={change}
            >
              {["staff", "manager", "admin"].map((r) => (
                <option key={r}>{r}</option>
              ))}
            </Select>
            <label>
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) =>
                  setForm({ ...form, isActive: e.target.checked })
                }
              />{" "}
              Active account
            </label>
          </div>
          <button className="btn btn-dark" disabled={busy}>
            Save account
          </button>
        </form>
      )}
      <Table
        rows={resource.data || []}
        columns={[
          ["name", "Name"],
          ["email", "Email"],
          ["role", "Role"],
          ["isActive", "Active", (r) => (r.isActive ? "Yes" : "No")],
          [
            "actions",
            "",
            (r) =>
              me.data?.role === "admin" &&
              r._id !== me.data._id && (
                <button
                  className="btn btn-sm btn-outline-dark"
                  onClick={() => {
                    setEditing(r._id);
                    setForm({ ...r, password: "" });
                  }}
                >
                  Edit / reset
                </button>
              ),
          ],
        ]}
      />
    </>
  );
}
function Settings() {
  const resource = useData("/settings");
  return (
    <>
      <h1 className="mb-4">Hotel settings</h1>
      <Loading resource={resource} />
      {resource.data && <SettingsForm initial={resource.data} />}
    </>
  );
}
function SettingsForm({ initial }) {
  const [form, change] = useForm(initial),
    [error, setError] = useState(""),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false);
  return (
    <form
      className="hp-card"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        try {
          await api("/settings", "PUT", form);
          setMessage("Hotel settings saved. New bookings use this tax rate.");
          setError("");
        } catch (e) {
          setError(e.message);
        } finally {
          setBusy(false);
        }
      }}
    >
      <Message error={error} message={message} />
      {[
        ["name", "Hotel name"],
        ["email", "Contact email"],
        ["phone", "Phone"],
        ["address", "Address"],
        ["taxPercent", "Tax percentage"],
      ].map(([name, label]) => (
        <Field
          key={name}
          name={name}
          label={label}
          type={
            name === "taxPercent"
              ? "number"
              : name === "email"
                ? "email"
                : "text"
          }
          min="0"
          max="100"
          step="0.01"
          value={form[name]}
          onChange={change}
          required
        />
      ))}
      <button className="btn btn-dark" disabled={busy}>
        Save settings
      </button>
    </form>
  );
}
function Profile() {
  const resource = useData("/auth/me");
  return (
    <>
      <h1 className="mb-4">My account</h1>
      <Loading resource={resource} />
      {resource.data && <ProfileForm initial={resource.data} />}
    </>
  );
}
function ProfileForm({ initial }) {
  const [form, change] = useForm(initial),
    [pass, changePass] = useForm({ current: "", password: "" }),
    [error, setError] = useState(""),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false),
    navigate = useNavigate();
  async function save(e, passwordChange) {
    e.preventDefault();
    setBusy(true);
    try {
      await api(
        passwordChange ? "/auth/password" : "/auth/profile",
        "PUT",
        passwordChange ? pass : form,
      );
      if (passwordChange) navigate("/login");
      else {
        setMessage("Profile saved");
        setError("");
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <Message error={error} message={message} />
      <form className="hp-card mb-4" onSubmit={(e) => save(e, false)}>
        <p>
          {initial.email} · {initial.role}
        </p>
        <Field
          label="Name"
          name="name"
          value={form.name}
          onChange={change}
          required
        />
        <Field
          label="Phone"
          name="phone"
          value={form.phone}
          onChange={change}
          required
        />
        <button className="btn btn-dark" disabled={busy}>
          Save profile
        </button>
      </form>
      <form className="hp-card" onSubmit={(e) => save(e, true)}>
        <h3>Change password</h3>
        <Field
          label="Current password"
          name="current"
          type="password"
          value={pass.current}
          onChange={changePass}
          required
        />
        <Field
          label="New password (at least 10 characters)"
          name="password"
          type="password"
          minLength="10"
          value={pass.password}
          onChange={changePass}
          required
        />
        <p className="small text-secondary">
          Changing your password signs out all sessions.
        </p>
        <button className="btn btn-dark" disabled={busy}>
          Change password
        </button>
      </form>
    </>
  );
}
export default function HotelApp() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Navigate to="/login" replace />} />
        <Route path="/rooms" element={<Rooms />} />
        <Route path="/rooms/:id" element={<RoomDetails />} />
        <Route path="/booking" element={<Booking />} />
        <Route path="/booking/:id" element={<Booking />} />
        {["admin", "staff"].map((area) => (
          <Route
            key={area}
            path={`/${area}`}
            element={<Workspace admin={area === "admin"} />}
          >
            <Route index element={<Dashboard />} />
            <Route path="bookings" element={<Bookings />} />
            <Route path="reservations" element={<Bookings />} />
            <Route path="check-in" element={<Bookings />} />
            <Route path="check-out" element={<Bookings />} />
            <Route path="rooms" element={<RoomManager />} />
            <Route path="guests" element={<Guests />} />
            <Route path="housekeeping" element={<Housekeeping />} />
            {area === "admin" && <Route path="staff" element={<Team />} />}
            {area === "admin" && (
              <Route path="settings" element={<Settings />} />
            )}
            <Route path="profile" element={<Profile />} />
          </Route>
        ))}
        <Route
          path="*"
          element={
            <Public>
              <h1>Page not found</h1>
              <Link to="/">Return home</Link>
            </Public>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
