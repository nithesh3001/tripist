import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import "./Contact.css";
import {
  Phone,
  Mail,
  MapPin,
  Globe,
  Clock,
  Check,
  Compass,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  Loader2,
  BookmarkCheck,
} from "lucide-react";
import { api } from "../Admin/api";

import banner from "../assets/hero2.jpg";

const Contact = () => {
  const [searchParams] = useSearchParams();
  const formRef = useRef(null);

  // Read URL query parameters from the ExplorePackages redirect
  const queryPackageId = searchParams.get("packageId");
  const queryPackageName = searchParams.get("packageName");

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    mobile: "",
    country: "",
    city: "",
    destination: queryPackageName || "",
    travelType: "Domestic",
    travelDate: "",
    adults: 1,
    children: 0,
    budget: "",
    services: queryPackageName ? ["Holiday Package"] : [],
    message: queryPackageName
      ? `I am interested in booking the "${queryPackageName}" package (Package ID: ${queryPackageId || "N/A"}). Please provide more details and the best quotation.`
      : "",
  });

  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  // Dynamic contact info matching database schema
  const [contactInfo, setContactInfo] = useState({
    phone: "+91 96555 96867",
    email: "info@tripistholidays.com",
    website: "www.tripistholidays.com",
    address:
      "Flat No. 2, Plot No. 1051, I Block 35th Street,\nAnna Nagar, Chennai,\nTamil Nadu – 600040\nIndia",
  });

  useEffect(() => {
    api.getContact()
      .then((data) => {
        if (data && !data.error && Object.keys(data).length > 0) {
          setContactInfo((prev) => ({
            ...prev,
            phone: data.phone || prev.phone,
            email: data.email || prev.email,
            address: data.address || prev.address,
          }));
        }
      })
      .catch((err) => console.error("Error fetching contact info:", err));
  }, []);

  // Update form & auto-scroll to the form when redirected from "Book Now"
  useEffect(() => {
    if (queryPackageName) {
      setFormData((prev) => ({
        ...prev,
        destination: queryPackageName,
        services: prev.services.includes("Holiday Package")
          ? prev.services
          : [...prev.services, "Holiday Package"],
        message: `I am interested in booking the "${queryPackageName}" package (Package ID: ${queryPackageId || "N/A"}). Please provide more details and the best quotation.`,
      }));

      // Smooth scroll directly to the booking form
      if (formRef.current) {
        setTimeout(() => {
          formRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 150);
      }
    }
  }, [queryPackageName, queryPackageId]);

  const servicesList = [
    "Holiday Package",
    "Flight Booking",
    "Hotel Booking",
    "Visa Assistance",
    "Cruise",
    "Airport Transfer",
    "Corporate Travel",
    "Other",
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleServiceChange = (serviceName) => {
    setFormData((prev) => {
      const isAlreadySelected = prev.services.includes(serviceName);
      const updatedServices = isAlreadySelected
        ? prev.services.filter((s) => s !== serviceName)
        : [...prev.services, serviceName];
      return {
        ...prev,
        services: updatedServices,
      };
    });
  };

  const validateForm = () => {
    const tempErrors = {};
    if (!formData.fullName.trim()) {
      tempErrors.fullName = "Full Name is required";
    }
    if (!formData.email.trim()) {
      tempErrors.email = "Email Address is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      tempErrors.email = "Please enter a valid email address";
    }
    if (!formData.mobile.trim()) {
      tempErrors.mobile = "Mobile Number is required";
    } else if (!/^[0-9+\s-]{10,15}$/.test(formData.mobile.replace(/\s+/g, ""))) {
      tempErrors.mobile = "Please enter a valid mobile number";
    }
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      setLoading(true);
      try {
        await api.sendContactEnquiry(formData);
        setSubmitted(true);
        window.scrollTo({ top: 350, behavior: "smooth" });
      } catch (error) {
        console.error("Failed to send contact enquiry:", error);
        alert(error.message || "Failed to submit enquiry. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleReset = () => {
    setFormData({
      fullName: "",
      email: "",
      mobile: "",
      country: "",
      city: "",
      destination: "",
      travelType: "Domestic",
      travelDate: "",
      adults: 1,
      children: 0,
      budget: "",
      services: [],
      message: "",
    });
    setSubmitted(false);
  };

  const businessHours = [
    { day: "Monday", hours: "9:00 AM – 6:00 PM" },
    { day: "Tuesday", hours: "9:00 AM – 6:00 PM" },
    { day: "Wednesday", hours: "9:00 AM – 6:00 PM" },
    { day: "Thursday", hours: "9:00 AM – 6:00 PM" },
    { day: "Friday", hours: "9:00 AM – 6:00 PM" },
    { day: "Saturday", hours: "9:00 AM – 4:00 PM" },
    { day: "Sunday", hours: "Closed (Online enquiries accepted)", isSpecial: true },
  ];

  const highlights = [
    "Personalized Travel Consultation",
    "Fast & Reliable Support",
    "Customized Holiday Packages",
    "Domestic & International Expertise",
    "Corporate & Group Travel Solutions",
    "Trusted Travel Partners",
  ];

  return (
    <div className="contact-page-wrapper ">
      {/* Hero Section */}
      <section
        className="contact-hero"
        style={{ backgroundImage: `url(${banner})` }}
      >
        <div className="contact-overlay ">
          <div className="container text-center text-md-start">
            <p className="section-tag">TRIPIST HOLIDAYS</p>
            <h1>We'd Love to Hear From You</h1>
            <p className="hero-desc">
              Whether you're planning your next holiday, looking for a customized
              travel package, seeking corporate travel solutions, or interested in
              partnering with us, our team is here to assist you.
            </p>
            <p className="hero-subdesc">
              At Tripist Holidays, we are committed to providing prompt, reliable, and
              personalized support to ensure every journey begins with confidence.
            </p>
          </div>
        </div>
      </section>

      {/* Main Section */}
      <section className="contact-main-section py-5">
        <div className="container">
          <div className="row g-5">
            {/* Left Side: Info */}
            <div className="col-lg-5 col-xl-5">
              <div className="contact-info-column d-flex flex-column gap-4">
                <div className="info-card shadow-sm p-4 rounded-4 bg-white">
                  <h3 className="card-heading-gold border-bottom pb-3 mb-4">
                    <Compass className="icon-title-gold me-2 inline-block" size={24} />
                    Get in Touch
                  </h3>
                  
                  <div className="office-details mb-4">
                    <div className="d-flex align-items-start gap-3">
                      <div className="icon-container-accent">
                        <MapPin size={20} className="text-gold" />
                      </div>
                      <div>
                        <h5 className="font-semibold text-trip mb-1">Registered Office</h5>
                        <p className="office-title text-navy font-bold m-0">
                          Tripist Holidays Private Limited
                        </p>
                        <p
                          className="address-text text-muted mb-0 mt-1"
                          style={{ whiteSpace: "pre-line" }}
                        >
                          {contactInfo.address}
                        </p>
                      </div>
                    </div>
                  </div>

                  <hr className="my-4 text-mutedopacity" />

                  <div className="contact-links-list d-flex flex-column gap-3">
                    <a
                      href={`tel:${contactInfo.phone}`}
                      className="contact-link-item d-flex align-items-center gap-3 text-decoration-none"
                    >
                      <div className="icon-container-accent">
                        <Phone size={18} />
                      </div>
                      <div>
                        <span className="small text-muted d-block">Phone</span>
                        <span className="link-value font-bold text-trip">{contactInfo.phone}</span>
                      </div>
                    </a>

                    <a
                      href={`mailto:${contactInfo.email}`}
                      className="contact-link-item d-flex align-items-center gap-3 text-decoration-none"
                    >
                      <div className="icon-container-accent">
                        <Mail size={18} />
                      </div>
                      <div>
                        <span className="small text-muted d-block">Email</span>
                        <span className="link-value font-bold text-trip">{contactInfo.email}</span>
                      </div>
                    </a>

                    <a
                      href={
                        contactInfo.website.startsWith("http")
                          ? contactInfo.website
                          : `https://${contactInfo.website}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="contact-link-item d-flex align-items-center gap-3 text-decoration-none"
                    >
                      <div className="icon-container-accent">
                        <Globe size={18} />
                      </div>
                      <div>
                        <span className="small text-muted d-block">Website</span>
                        <span className="link-value font-bold text-trip">{contactInfo.website}</span>
                      </div>
                    </a>
                  </div>
                </div>

                {/* Business Hours */}
                <div className="info-card shadow-sm p-4 rounded-4 bg-white">
                  <h3 className="card-heading-gold border-bottom pb-3 mb-4">
                    <Clock className="icon-title-gold me-2 inline-block" size={24} />
                    Business Hours
                  </h3>
                  <div className="table-responsive">
                    <table className="table table-borderless business-hours-table m-0">
                      <tbody>
                        {businessHours.map((item, index) => (
                          <tr key={index} className={item.isSpecial ? "table-row-special" : ""}>
                            <td className="day-name font-semibold text-trip py-2">{item.day}</td>
                            <td className={`day-hours py-2 text-end ${item.isSpecial ? "text-gold font-bold" : "text-muted"}`}>
                              {item.hours}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="business-hours-notice text-muted mt-3 mb-0 small">
                    * Business hours may vary on public holidays.
                  </p>
                </div>

                {/* Why Choose Us */}
                <div className="why-choose-card p-4 rounded-4 bg-navy text-white shadow-sm">
                  <h3 className="mb-4 text-white d-flex align-items-center gap-2">
                    <CheckCircle2 size={24} className="text-gold" />
                    Why Contact Tripist?
                  </h3>
                  <div className="row g-3">
                    {highlights.map((h, i) => (
                      <div className="col-12 col-md-6 col-lg-12" key={i}>
                        <div className="d-flex align-items-start gap-2">
                          <div className="check-bullet bg-gold text-navy rounded-circle p-1 d-flex align-items-center justify-content-center mt-1">
                            <Check size={14} strokeWidth={3} />
                          </div>
                          <span className="highlight-text">{h}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side: Form */}
            <div className="col-lg-7 col-xl-7" ref={formRef}>
              <div className="form-card shadow p-4 p-md-5 rounded-4 bg-white position-relative overflow-hidden">
                <div className="form-accent-stripe"></div>

                {/* Notification Banner when package is selected */}
                {queryPackageName && !submitted && (
                  <div className="alert alert-warning border-0 d-flex align-items-center gap-2 mb-4 p-3 rounded-3 shadow-sm" style={{ background: "#fef9c3", color: "#854d0e" }}>
                    <BookmarkCheck size={20} className="text-warning flex-shrink-0" />
                    <div>
                      Booking enquiry for package: <strong>{queryPackageName}</strong>
                    </div>
                  </div>
                )}

                {!submitted ? (
                  <>
                    <h2 className="text-trip mb-2">
                      {queryPackageName ? "Complete Your Package Booking" : "Send Us an Enquiry"}
                    </h2>
                    <p className="text-muted mb-4">
                      {queryPackageName 
                        ? "Please fill in your details below to confirm dates and receive a tailored quotation."
                        : "Whether you're planning a vacation or need travel assistance, simply fill out the enquiry form and we'll get back to you as soon as possible."}
                    </p>

                    <form onSubmit={handleSubmit} noValidate>
                      <div className="form-section-title mb-4">
                        <span className="badge bg-navy text-gold me-2">1</span>
                        Personal Information
                      </div>

                      <div className="row g-4 mb-5">
                        <div className="col-12">
                          <div className="form-group-custom">
                            <label htmlFor="fullName" className="required-label">Full Name</label>
                            <input
                              type="text"
                              id="fullName"
                              name="fullName"
                              value={formData.fullName}
                              onChange={handleInputChange}
                              className={`form-control-custom ${errors.fullName ? "is-invalid" : ""}`}
                              placeholder="e.g. Nithesh Kumar"
                              autoComplete="name"
                              required
                            />
                            {errors.fullName && <div className="invalid-feedback-custom">{errors.fullName}</div>}
                          </div>
                        </div>

                        <div className="col-md-6">
                          <div className="form-group-custom">
                            <label htmlFor="email" className="required-label">Email Address</label>
                            <input
                              type="email"
                              id="email"
                              name="email"
                              value={formData.email}
                              onChange={handleInputChange}
                              className={`form-control-custom ${errors.email ? "is-invalid" : ""}`}
                              placeholder="name@example.com"
                              autoComplete="email"
                              required
                            />
                            {errors.email && <div className="invalid-feedback-custom">{errors.email}</div>}
                          </div>
                        </div>

                        <div className="col-md-6">
                          <div className="form-group-custom">
                            <label htmlFor="mobile" className="required-label">Mobile Number</label>
                            <input
                              type="tel"
                              id="mobile"
                              name="mobile"
                              value={formData.mobile}
                              onChange={handleInputChange}
                              className={`form-control-custom ${errors.mobile ? "is-invalid" : ""}`}
                              placeholder="e.g. +91 96555 96867"
                              autoComplete="tel"
                              required
                            />
                            {errors.mobile && <div className="invalid-feedback-custom">{errors.mobile}</div>}
                          </div>
                        </div>

                        <div className="col-md-6">
                          <div className="form-group-custom">
                            <label htmlFor="country">Country</label>
                            <input
                              type="text"
                              id="country"
                              name="country"
                              value={formData.country}
                              onChange={handleInputChange}
                              className="form-control-custom"
                              placeholder="India"
                              autoComplete="country-name"
                            />
                          </div>
                        </div>

                        <div className="col-md-6">
                          <div className="form-group-custom">
                            <label htmlFor="city">City</label>
                            <input
                              type="text"
                              id="city"
                              name="city"
                              value={formData.city}
                              onChange={handleInputChange}
                              className="form-control-custom"
                              placeholder="Chennai"
                              autoComplete="address-level2"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="form-section-title mb-4">
                        <span className="badge bg-navy text-gold me-2">2</span>
                        Travel Details
                      </div>

                      <div className="row g-4 mb-4">
                        <div className="col-md-6">
                          <div className="form-group-custom">
                            <label htmlFor="destination">Destination / Package</label>
                            <input
                              type="text"
                              id="destination"
                              name="destination"
                              value={formData.destination}
                              onChange={handleInputChange}
                              className="form-control-custom"
                              placeholder="e.g. Maldives, Europe, Kashmir"
                            />
                          </div>
                        </div>

                        <div className="col-md-6">
                          <div className="form-group-custom">
                            <label htmlFor="travelType">Travel Type</label>
                            <select
                              id="travelType"
                              name="travelType"
                              value={formData.travelType}
                              onChange={handleInputChange}
                              className="form-select-custom"
                            >
                              <option value="Domestic">Domestic</option>
                              <option value="International">International</option>
                            </select>
                          </div>
                        </div>

                        <div className="col-md-6">
                          <div className="form-group-custom">
                            <label htmlFor="travelDate">Tentative Travel Date</label>
                            <input
                              type="date"
                              id="travelDate"
                              name="travelDate"
                              min={new Date().toISOString().split("T")[0]}
                              value={formData.travelDate}
                              onChange={handleInputChange}
                              className="form-control-custom"
                            />
                          </div>
                        </div>

                        <div className="col-md-6">
                          <div className="form-group-custom">
                            <label htmlFor="budget">Budget</label>
                            <input
                              type="text"
                              id="budget"
                              name="budget"
                              value={formData.budget}
                              onChange={handleInputChange}
                              className="form-control-custom"
                              placeholder="e.g. ₹50,000 per person"
                            />
                          </div>
                        </div>

                        <div className="col-6 col-md-6">
                          <div className="form-group-custom">
                            <label htmlFor="adults">Number of Adults (12+ yrs)</label>
                            <input
                              type="number"
                              id="adults"
                              name="adults"
                              min="1"
                              value={formData.adults}
                              onChange={handleInputChange}
                              className="form-control-custom"
                            />
                          </div>
                        </div>

                        <div className="col-6 col-md-6">
                          <div className="form-group-custom">
                            <label htmlFor="children">Number of Children (2-12 yrs)</label>
                            <input
                              type="number"
                              id="children"
                              name="children"
                              min="0"
                              value={formData.children}
                              onChange={handleInputChange}
                              className="form-control-custom"
                            />
                          </div>
                        </div>

                        <div className="col-12 mt-4">
                          <div className="form-group-custom">
                            <label className="mb-2">Services Required (Select all that apply)</label>
                            <div className="services-chips-grid">
                              {servicesList.map((service, index) => {
                                const isSelected = formData.services.includes(service);
                                return (
                                  <button
                                    type="button"
                                    key={index}
                                    className={`service-chip-btn ${isSelected ? "active" : ""}`}
                                    onClick={() => handleServiceChange(service)}
                                  >
                                    {isSelected && <Check size={14} className="me-1 stroke-3" />}
                                    {service}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>

                        <div className="col-12 mt-4">
                          <div className="form-group-custom">
                            <label htmlFor="message">Message</label>
                            <textarea
                              id="message"
                              name="message"
                              rows="4"
                              value={formData.message}
                              onChange={handleInputChange}
                              className="form-control-custom textarea-custom"
                              placeholder="Tell us about your travel plans..."
                            ></textarea>
                          </div>
                        </div>
                      </div>

                      <div className="col-12 mt-4">
                        <button
                          type="submit"
                          disabled={loading}
                          className="btn-trip-submit w-100 py-3 shadow d-flex align-items-center justify-content-center"
                        >
                          {loading ? (
                            <>
                              <Loader2 className="animate-spin me-2" size={18} /> Submitting...
                            </>
                          ) : (
                            <>
                              {queryPackageName ? "Confirm Booking Enquiry" : "Get My Free Quote"}
                              <ArrowRight className="ms-2 inline-block" size={18} />
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </>
                ) : (
                  <div className="enquiry-success-container text-center py-5">
                    <div className="success-icon-wrapper mb-4">
                      <CheckCircle2 size={80} className="text-gold stroke-2" style={{ color: "var(--trip-gold)" }} />
                    </div>
                    <h2 className="text-trip mb-3">Enquiry Submitted Successfully!</h2>
                    <p className="text-muted mb-4 max-w-lg mx-auto">
                      Thank you, <strong className="text-trip">{formData.fullName}</strong>! We have received your enquiry for{" "}
                      <strong className="text-trip">{formData.destination || "your destination"}</strong>. Our travel specialist team will review your requirements and reach out to you within 24 hours.
                    </p>

                    <div className="summary-box p-4 rounded-4 bg-light text-start mb-4 border border-light-subtle">
                      <h5 className="font-semibold text-trip mb-3 border-bottom pb-2">Enquiry Summary</h5>
                      <ul className="list-unstyled d-flex flex-column gap-2 small text-muted">
                        <li><strong>Contact:</strong> {formData.mobile} | {formData.email}</li>
                        <li><strong>Trip Type:</strong> {formData.travelType}</li>
                        {formData.travelDate && <li><strong>Travel Date:</strong> {formData.travelDate}</li>}
                        <li><strong>Travellers:</strong> {formData.adults} Adults {formData.children > 0 && `, ${formData.children} Children`}</li>
                        {formData.budget && <li><strong>Budget:</strong> {formData.budget}</li>}
                        {formData.services.length > 0 && (
                          <li><strong>Services:</strong> {formData.services.join(", ")}</li>
                        )}
                      </ul>
                    </div>

                    <button
                      type="button"
                      onClick={handleReset}
                      className="btn-trip-outline-reset px-4 py-2 mt-2"
                    >
                      <RefreshCw size={16} className="me-2 inline-block align-middle" />
                      Send Another Enquiry
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="map-section py-5 bg-sec">
        <div className="container">
          <div className="text-center mb-4">
            <h2 className="text-trip">Find Us</h2>
            <div className="horline mx-auto mb-2"></div>
            <p className="text-muted">Registered Office Location on Google Maps</p>
          </div>
          <div className="map-card-wrapper shadow rounded-4 overflow-hidden bg-white border border-light-subtle">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3886.136894086968!2d80.19830567586548!3d13.090518712349348!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a52640248a3cc0f%3A0xc07a78aa0e77d337!2sI%20Block%2035th%20St%2C%20Anna%20Nagar%2C%20Chennai%2C%20Tamil%20Nadu%20600040!5e0!3m2!1sen!2sin!4v1710000000000!5m2!1sen!2sin"
              width="100%"
              height="450"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Tripist Holidays Google Maps Location"
            ></iframe>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;