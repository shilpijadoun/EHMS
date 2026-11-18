from pathlib import Path
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether

OUT = Path(__file__).resolve().parents[1] / "output" / "pdf" / "makemytrip-website-analysis-hindi.pdf"
OUT.parent.mkdir(parents=True, exist_ok=True)

styles = getSampleStyleSheet()
styles.add(ParagraphStyle(name="TitleHindi", parent=styles["Title"], fontName="Helvetica-Bold", fontSize=24, leading=29, textColor=colors.HexColor("#0A2F4F"), alignment=TA_CENTER, spaceAfter=8))
styles.add(ParagraphStyle(name="Subtitle", parent=styles["Normal"], fontSize=10.5, leading=15, textColor=colors.HexColor("#52606D"), alignment=TA_CENTER, spaceAfter=18))
styles.add(ParagraphStyle(name="H1x", parent=styles["Heading1"], fontName="Helvetica-Bold", fontSize=16, leading=20, textColor=colors.HexColor("#0A5275"), spaceBefore=12, spaceAfter=8))
styles.add(ParagraphStyle(name="H2x", parent=styles["Heading2"], fontName="Helvetica-Bold", fontSize=12, leading=15, textColor=colors.HexColor("#123B55"), spaceBefore=8, spaceAfter=5))
styles.add(ParagraphStyle(name="Bodyx", parent=styles["BodyText"], fontSize=9.3, leading=13.3, textColor=colors.HexColor("#202A33"), spaceAfter=6))
styles.add(ParagraphStyle(name="Smallx", parent=styles["BodyText"], fontSize=8, leading=10.5, textColor=colors.HexColor("#52606D"), spaceAfter=4))
styles.add(ParagraphStyle(name="Callout", parent=styles["BodyText"], fontSize=9.5, leading=13.5, textColor=colors.HexColor("#083344"), backColor=colors.HexColor("#E6F4F1"), borderColor=colors.HexColor("#99D6CB"), borderWidth=0.5, borderPadding=9, spaceBefore=5, spaceAfter=9))

def p(text, style="Bodyx"):
    return Paragraph(text, styles[style])

def bullet(text):
    return Paragraph("&bull; " + text, styles["Bodyx"])

def table(rows, widths):
    data = [[Paragraph(str(cell), styles["Smallx"]) for cell in row] for row in rows]
    t = Table(data, colWidths=widths, repeatRows=1, hAlign="LEFT")
    t.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,0), colors.HexColor("#0A5275")),
        ("TEXTCOLOR", (0,0), (-1,0), colors.white),
        ("FONTNAME", (0,0), (-1,0), "Helvetica-Bold"),
        ("VALIGN", (0,0), (-1,-1), "TOP"),
        ("GRID", (0,0), (-1,-1), 0.35, colors.HexColor("#C8D5DE")),
        ("ROWBACKGROUNDS", (0,1), (-1,-1), [colors.white, colors.HexColor("#F5F9FB")]),
        ("LEFTPADDING", (0,0), (-1,-1), 7), ("RIGHTPADDING", (0,0), (-1,-1), 7),
        ("TOPPADDING", (0,0), (-1,-1), 6), ("BOTTOMPADDING", (0,0), (-1,-1), 6),
    ]))
    return t

story = []
story += [Spacer(1, 24*mm), p("MakeMyTrip Website Analysis", "TitleHindi"), p("Public website review | Feature map, user journeys and EHMS learnings", "Subtitle"),
          p("Scope", "H1x"), p("Yeh report MakeMyTrip ke public homepage aur Hotels section ke observed navigation/content par based hai. Yeh product aur UX analysis hai; private internal systems, commercial contracts ya hidden implementation ka claim nahi karta."),
          p("Executive summary", "H1x"),
          p("MakeMyTrip ek single hotel website nahi hai. Yeh multi-supplier travel marketplace hai jo discovery, comparison, booking, payments, trip management, support, partner acquisition aur corporate travel ko ek ecosystem mein jodta hai."),
          p("EHMS ke liye sabse relevant lesson: hotel search ko date availability, guest count, clear price breakdown, cancellation rules, saved trips aur post-booking service ke saath tightly connect karna chahiye.", "Callout")]

story += [p("1. Public product map", "H1x"),
          table([
              ["Layer", "Observed capabilities", "Purpose"],
              ["Travel inventory", "Flights, Hotels, Villas & Homestays, Holiday Packages, Trains, Buses, Cabs, Tours & Attractions", "Multiple travel needs from a single entry point"],
              ["Travel services", "Visa, Forex Card & Currency, Travel Insurance", "Ancillary services and trip completion"],
              ["Customer account", "Login/Create Account, My Trips, Wishlist", "Booking management and saved favourites"],
              ["Business ecosystem", "List Your Property, myBiz corporate travel, myPartner travel-agent portal", "Supplier acquisition and B2B travel workflows"],
              ["Trust & support", "Customer Support, Payment Security, Privacy/Cookie Policy, terms and escalation links", "Customer confidence and post-booking assistance"],
          ], [34*mm, 83*mm, 55*mm]), Spacer(1,6),
          p("The public navigation itself shows a marketplace structure: inventory categories at the top, account/trip controls, a seller entry point, and corporate/agent channels. Hotels are one key vertical among several.")]

story += [p("2. Key user journeys", "H1x"),
          table([
              ["Journey", "Likely flow", "What reduces user friction"],
              ["Hotel booking", "Destination + dates + guests -> property list -> filters/comparison -> room selection -> traveller details -> payment -> My Trips", "Date-led availability, searchable inventory, account-linked itinerary"],
              ["Flight booking", "Route + dates -> fare comparison -> traveller details -> payment -> trip management", "Fare/route discovery, status information and rebooking cues"],
              ["Holiday planning", "Destination/package discovery -> inclusions/itinerary -> enquiry or booking", "Curated packages for users who do not want to assemble a trip"],
              ["Property onboarding", "List Your Property -> partner onboarding", "Supply-side acquisition for hotel inventory"],
              ["Corporate travel", "myBiz -> business travel/expense/GST workflows", "Policy, reporting and expense-oriented travel management"],
          ], [38*mm, 75*mm, 59*mm]),
          p("Observed account features such as My Trips and Wishlist give the platform a pre-booking save loop and a post-booking management loop; these are as important as the checkout itself.")]

story += [p("3. What the website has built", "H1x"),
          p("A. Discovery and merchandising", "H2x"),
          bullet("Category-first navigation covers core transport, accommodation, packages, activities and travel services."),
          bullet("Large destination, route and property-link collections support SEO discovery and direct entry into a relevant search context."),
          bullet("Separate offerings for hotels, villas/homestays and international hotels address different stay types."),
          p("B. Conversion and retention", "H2x"),
          bullet("Account creation, My Trips and Wishlist provide repeat-user and booking-management paths."),
          bullet("Offers, instant discounts, Fare Calendar, rewards/wallet and fare-drop/price comparison claims are positioned as decision aids."),
          bullet("Payment-security links, policies, support and escalation channels make the commercial journey more credible."),
          p("C. Marketplace operations", "H2x"),
          bullet("List Your Property, travel-agent portal and corporate products indicate independent workflows for guests, suppliers, agents and enterprises."),
          bullet("Visa, forex, insurance, gift cards, travel blog and trip-planner links extend the platform beyond the primary booking transaction.")]

story += [PageBreak(), p("4. UX and information architecture observations", "H1x"),
          table([
              ["Pattern", "Why it exists", "EHMS translation"],
              ["One global navigation", "Lets customers switch travel category without leaving the brand", "Keep EHMS focused on rooms; add only relevant hotel services later"],
              ["Search-led entry", "Travel purchase starts with a date, location or route", "Put check-in, check-out and guests at the first visual priority"],
              ["Account + My Trips", "Supports repeat booking and self-service after payment", "Add guest booking lookup / customer portal before building broad loyalty"],
              ["Wishlist", "Captures undecided buyers", "Add saved rooms only after core booking works reliably"],
              ["Price/offer cues", "Helps users compare value and complete a booking", "Show room rate, taxes, total, cancellation terms and payment status clearly"],
              ["Trust footer", "Addresses risk around payment and cancellation", "Add privacy, refund/cancellation, contact and payment-security pages"],
          ], [43*mm, 62*mm, 67*mm]),
          p("Important distinction", "H2x"),
          p("MakeMyTrip solves a marketplace problem: many properties and many travel suppliers. EHMS currently solves a single-hotel operations problem. Copy the customer-facing patterns, but do not copy marketplace complexity until there is a real multi-property requirement.", "Callout")]

story += [p("5. EHMS gap analysis", "H1x"),
          table([
              ["Capability", "MakeMyTrip public experience", "EHMS current position", "Recommended priority"],
              ["Room search", "Destination/category-led discovery", "Single-hotel room availability search", "Improve: date/guest-first search and no-result guidance"],
              ["Property comparison", "Marketplace-scale comparison", "Not needed for one hotel", "Do not build now"],
              ["Room detail", "Property/room discovery expected", "Room details, amenities and images available", "Improve: cancellation policy, check-in policy and room rules"],
              ["Booking management", "My Trips account journey", "Staff workspace; booking reference at confirmation", "Build guest self-service lookup, cancellation request and invoice download"],
              ["Payment", "Payment-security messaging and online payment", "Razorpay order/verification/webhook implementation", "Add clear payment result, retry and refund workflow"],
              ["Offers/loyalty", "Discounts, rewards/wallet positioning", "Not implemented", "Later, after pricing rules and demand data"],
              ["Support", "Customer support and escalation links", "Not a public guest support flow", "Add contact, FAQ and booking-help entry"],
              ["Supplier/corporate", "Property listing, agent and myBiz", "Single-hotel admin/staff model", "Only if hotel later sells B2B/corporate contracts"],
          ], [31*mm, 47*mm, 46*mm, 48*mm])]

story += [p("6. Recommended EHMS roadmap inspired by the analysis", "H1x"),
          p("Phase 1 - booking confidence", "H2x"),
          bullet("Show exact total: room rate, tax, extras, amount paid and amount due."),
          bullet("Publish check-in/out, cancellation, payment and privacy policies."),
          bullet("After Razorpay result, show verified payment state, booking reference and downloadable invoice."),
          p("Phase 2 - guest self-service", "H2x"),
          bullet("Build My Booking lookup with reference + verified email/phone, then allow invoice view and cancellation request according to policy."),
          bullet("Add help/FAQ for payment, arrival time, ID proof and cancellation."),
          p("Phase 3 - revenue and retention", "H2x"),
          bullet("Add promo codes, seasonal pricing, minimum-stay rules and controlled packages only with audit logs."),
          bullet("Add saved rooms and repeat-guest recognition after consent and privacy design are in place."),
          p("Phase 4 - business channels", "H2x"),
          bullet("Only if required: corporate accounts, negotiated rates, GST invoices, agent bookings and reporting."),
          p("Avoid adding flights, trains, visas, forex or a multi-hotel marketplace to EHMS unless the business model changes. Those require supplier APIs, settlement, compliance, support and reconciliation processes.", "Callout")]

story += [p("7. Source notes", "H1x"),
          p("Analysis date: 17 November 2026 (Asia/Kolkata). Public pages may vary by location, account state, promotions and availability."),
          p("1. MakeMyTrip homepage - https://www.makemytrip.com/"),
          p("2. MakeMyTrip Hotels - https://www.makemytrip.com/hotels/"),
          p("3. MakeMyTrip Holiday Packages - https://www.makemytrip.com/holidays-india/"),
          p("The homepage publicly lists the product categories, account/trip functions, partner/corporate channels, customer-support/policy links, destination/route pages and its stated offers. Conclusions labelled as recommendations are an EHMS product inference, not a claim about MakeMyTrip internal systems.", "Smallx")]

def footer(canvas, doc):
    canvas.saveState()
    canvas.setStrokeColor(colors.HexColor("#C8D5DE"))
    canvas.line(18*mm, 14*mm, 192*mm, 14*mm)
    canvas.setFont("Helvetica", 8)
    canvas.setFillColor(colors.HexColor("#52606D"))
    canvas.drawString(18*mm, 9*mm, "MakeMyTrip public website analysis | EHMS reference report")
    canvas.drawRightString(192*mm, 9*mm, f"Page {doc.page}")
    canvas.restoreState()

SimpleDocTemplate(str(OUT), pagesize=A4, rightMargin=18*mm, leftMargin=18*mm, topMargin=16*mm, bottomMargin=20*mm, title="MakeMyTrip Website Analysis").build(story, onFirstPage=footer, onLaterPages=footer)
print(OUT)
