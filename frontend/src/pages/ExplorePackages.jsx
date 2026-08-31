import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaCheckCircle,
  FaHotel,
  FaUtensils,
  FaCar,
  FaCamera,
  FaShieldAlt,
  FaInfoCircle,
  FaTimesCircle,
  FaQuestionCircle,
  FaChevronDown,
  FaClock
} from "react-icons/fa";
import { api } from "../Admin/api";
import ContactModal from "../Components/ContactModal";
import "./ExplorePackages.css";

const travelTips = [
  {
    number: "01",
    title: "Plan Around the Season",
    text: "Choose the right travel season for better weather, experiences, and value."
  },
  {
    number: "02",
    title: "Keep Your Itinerary Flexible",
    text: "Leave room for local discoveries, relaxed moments, and unexpected experiences."
  },
];

const defaultAmenities = [
  { icon: <FaHotel />, text: "Premium Hotel Accommodation" },
  { icon: <FaUtensils />, text: "Daily Breakfast & Meals" },
  { icon: <FaCar />, text: "Private Airport & Sightseeing Transfers" },
  { icon: <FaCamera />, text: "Guided City Excursions" },
  { icon: <FaShieldAlt />, text: "24/7 Dedicated Support" }
];

export default function ExplorePackages() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const packageId = searchParams.get("id");

  const [packageData, setPackageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFaq, setActiveFaq] = useState(null);
  const [activeDay, setActiveDay] = useState(0);

  // State to handle the contact modal popup
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!packageId) {
      setError("No package selected. Please select a package from our listings.");
      setLoading(false);
      return;
    }

    const fetchPackage = async () => {
      try {
        let data;
        if (api.getPackageById) {
          data = await api.getPackageById(packageId);
        } else {
          const res = await fetch(`/api/packages/${packageId}`);
          if (!res.ok) throw new Error("Package not found");
          data = await res.json();
        }

        // Normalize JSON database columns if returned as strings
        if (typeof data.itinerary === "string") {
          try { data.itinerary = JSON.parse(data.itinerary); } catch (e) { data.itinerary = []; }
        }
        if (typeof data.faqs === "string") {
          try { data.faqs = JSON.parse(data.faqs); } catch (e) { data.faqs = []; }
        }

        setPackageData(data);
      } catch (err) {
        console.error("Failed to load package details:", err);
        setError("Failed to load package details.");
      } finally {
        setLoading(false);
      }
    };

    fetchPackage();
  }, [packageId]);

  const handleBookNow = () => {
    if (!packageData) return;
    setIsModalOpen(true);
  };

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5 my-5" style={{ minHeight: "50vh" }}>
        <div className="spinner-border text-warning" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error || !packageData) {
    return (
      <div className="text-center py-5 my-5">
        <h4 className="text-danger">{error || "Package unavailable"}</h4>
        <button onClick={() => navigate("/destinations")} className="btn btn-gold-tripist mt-3">
          Back to Destinations
        </button>
      </div>
    );
  }

  const durationDays = packageData.durationDays || packageData.duration_days;
  const durationNights = packageData.durationNights || packageData.duration_nights;
  const shortDesc = packageData.shortDescription || packageData.short_description;
  const longDesc = packageData.longDescription || packageData.long_description;
  const validUntil = packageData.validUntil || packageData.valid_until;
  const inclusions = packageData.inclusions || [];
  const exclusions = packageData.exclusions || [];
  const itinerary = packageData.itinerary || [];
  const faqs = packageData.faqs || [];

  return (
    <main className="explore-page-wrapper">
      {/* Hero Banner */}
      <section className="explore-hero-banner" style={{ backgroundImage: packageData.image ? `url(${packageData.image})` : undefined }}>
        <div className="explore-hero-overlay"></div>
        <div className="container position-relative text-start z-2">
          <p className="explore-hero-subtitle">
            {packageData.category?.toUpperCase() || "CURATED ESCAPE"}
          </p>
          <h1 className="explore-hero-title">{packageData.name}</h1>
          <p className="explore-hero-description">
            {shortDesc || "Handcrafted itinerary designed to make your journey extraordinary."}
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-5" id="packages">
        <div className="container">
          <div className="row g-5">
            {/* Left Main Content */}
            <div className="col-12 col-lg-8">
              {/* Hero Image Card */}
              <div className="package-hero-container position-relative rounded-4 overflow-hidden mb-4 shadow-sm">
                <img
                  src={packageData.image || "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80"}
                  alt={packageData.name}
                  className="w-100 h-100 object-fit-cover"
                />
              </div>

              {/* Header Badges */}
              <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3">
                <div className="d-flex align-items-center gap-2 text-muted">
                  <FaMapMarkerAlt className="text-danger" />
                  <span className="fw-semibold">
                    {packageData.state ? `${packageData.state}, ` : ""}
                    {packageData.country || "India"}
                  </span>
                </div>

                {(durationDays || durationNights) && (
                  <div className="d-flex align-items-center gap-2 text-secondary bg-light px-3 py-1.5 rounded-pill border">
                    <FaCalendarAlt className="text-warning" />
                    <span className="small fw-semibold">
                      {durationDays ? `${durationDays}D` : ""}
                      {durationNights ? ` / ${durationNights}N` : ""}
                    </span>
                  </div>
                )}
              </div>

              <h2 className="fw-bold text-navy font-georgia mb-3">{packageData.name}</h2>

              {/* Short Description */}
              {shortDesc && (
                <div className="mb-4 p-3 rounded-3 bg-light border-start border-4 border-warning shadow-sm">
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <FaInfoCircle className="text-warning" />
                    <h5 className="fw-bold text-navy m-0">Package Highlights</h5>
                  </div>
                  <p className="text-secondary m-0 mt-2 leading-relaxed font-sm">
                    {shortDesc}
                  </p>
                </div>
              )}

              {/* Overview / Long Description */}
              {longDesc && (
                <div className="mb-5">
                  <h4 className="fw-bold text-navy font-georgia">Trip Overview</h4>
                  <p className="text-secondary leading-relaxed mt-2" style={{ whiteSpace: "pre-line" }}>
                    {longDesc}
                  </p>
                </div>
              )}

              {/* Inclusions & Exclusions */}
              {(inclusions.length > 0 || exclusions.length > 0) && (
                <div className="mb-5">
                  <h4 className="fw-bold text-navy font-georgia mb-3">What's Included & Excluded</h4>
                  <div className="row g-4">
                    {inclusions.length > 0 && (
                      <div className="col-12 col-md-6">
                        <div className="p-3 rounded-3 bg-white border shadow-sm h-100">
                          <h6 className="fw-bold text-success mb-3 d-flex align-items-center gap-2">
                            <FaCheckCircle /> Included in Package
                          </h6>
                          <ul className="list-unstyled mb-0  d-flex flex-column gap-2 font-sm">
                            {inclusions.map((inc, i) => (
                              <li key={i} className="d-flex align-items-start gap-2 text-secondary">
                                <span className="text-success mt-1">•</span> {inc}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}

                    {exclusions.length > 0 && (
                      <div className="col-12 col-md-6">
                        <div className="p-3 rounded-3 bg-white border shadow-sm h-100">
                          <h6 className="fw-bold text-danger mb-3 d-flex align-items-center gap-2">
                            <FaTimesCircle /> Excluded from Package
                          </h6>
                          <ul className="list-unstyled mb-0 d-flex flex-column gap-2 font-sm">
                            {exclusions.map((exc, i) => (
                              <li key={i} className="d-flex align-items-start gap-2 text-secondary">
                                <span className="text-danger mt-1">•</span> {exc}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Day-by-Day Itinerary */}
              {itinerary.length > 0 && (
                <div className="mb-5 itinerary-section">
                  <div className="itinerary-heading">
                    <div>
                      <span className="itinerary-eyebrow">YOUR JOURNEY</span>
                      <h4 className="fw-bold text-navy font-georgia mb-1">Day-by-Day Itinerary</h4>
                      <p className="text-secondary font-sm mb-0">
                        Explore your trip one day at a time.
                      </p>
                    </div>
                    <span className="itinerary-count">
                      {itinerary.length} {itinerary.length === 1 ? "DAY" : "DAYS"}
                    </span>
                  </div>

                  <div className="itinerary-accordion">
                    {itinerary.map((dayItem, idx) => {
                      const isOpen = activeDay === idx;

                      return (
                        <div key={idx} className={`itinerary-day ${isOpen ? "is-open" : ""}`}>
                          <button
                            type="button"
                            className="itinerary-day-trigger"
                            onClick={() => setActiveDay(isOpen ? null : idx)}
                            aria-expanded={isOpen}
                          >
                            <span className="day-number">
                              <span>DAY</span>
                              {String(dayItem.day || idx + 1).padStart(2, "0")}
                            </span>

                            <span className="day-summary">
                              <strong>{dayItem.title || `Day ${idx + 1}`}</strong>
                              {dayItem.date && (
                                <small>
                                  <FaClock /> {dayItem.date}
                                </small>
                              )}
                            </span>

                            <span className="day-chevron">
                              <FaChevronDown />
                            </span>
                          </button>

                          <div className={`itinerary-day-content ${isOpen ? "show" : ""}`}>
                            <div className="day-content-inner">
                              <div className="day-content-line"></div>
                              <div>
                                <span className="day-content-label">ITINERARY DETAILS</span>
                                <p>
                                  {dayItem.activities ||
                                    "Enjoy a thoughtfully planned day with memorable experiences."}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Standard Amenities */}
              <div className="mb-5">
                <h4 className="fw-bold text-navy font-georgia mb-3">Standard Amenities</h4>
                <div className="row g-3">
                  {defaultAmenities.map((amenity, index) => (
                    <div key={index} className="col-12 col-sm-6">
                      <div className="d-flex align-items-center gap-3 p-3 rounded-3 shadow-sm border bg-white amenity-card">
                        <span className="fs-5 text-warning">{amenity.icon}</span>
                        <span className="fw-medium text-dark font-sm">{amenity.text}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* FAQs Accordion */}
              {faqs.length > 0 && (
                <div className="mb-4">
                  <h4 className="fw-bold text-navy font-georgia mb-3">Frequently Asked Questions</h4>
                  <div className="d-flex flex-column gap-2">
                    {faqs.map((faq, idx) => (
                      <div key={idx} className="border rounded-3 bg-white overflow-hidden shadow-sm">
                        <button
                          className="w-100 p-3 text-start bg-white border-0 d-flex align-items-center justify-content-between fw-bold text-navy"
                          onClick={() => toggleFaq(idx)}
                        >
                          <span className="d-flex align-items-center gap-2 font-sm">
                            <FaQuestionCircle className="text-warning" /> {faq.question}
                          </span>
                          <FaChevronDown
                            className={`transition-transform ${activeFaq === idx ? "rotate-180" : ""}`}
                            style={{ transform: activeFaq === idx ? "rotate(180deg)" : "rotate(0deg)", transition: "0.2s" }}
                          />
                        </button>
                        {activeFaq === idx && (
                          <div className="p-3 bg-light border-top text-secondary font-sm">
                            {faq.answer}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Sidebar */}
            <div className="col-12 col-lg-4">
              <div className="card shadow-sm border-0 p-4 sticky-top rounded-4 bg-white">
                <small className="text-muted text-uppercase fw-semibold" style={{ fontSize: "11px", letterSpacing: "0.5px" }}>
                  STARTS FROM
                </small>
                <h2 className="fw-bold text-navy my-2">
                  {packageData.price ? (packageData.price.startsWith("₹") || packageData.price.startsWith("$") ? packageData.price : `₹ ${packageData.price}`) : "Price On Request"}
                  <span className="fs-6 text-muted fw-normal"> / person</span>
                </h2>

                {validUntil && (
                  <p className="font-xs text-danger fw-semibold mb-3">
                    Valid until: {validUntil}
                  </p>
                )}

                <ul className="list-unstyled my-4 text-secondary font-sm">
                  <li className="mb-2"><FaCheckCircle className="text-success me-2" /> Guaranteed Best Service</li>
                  <li className="mb-2"><FaCheckCircle className="text-success me-2" /> Flexible Travel Dates</li>
                  <li className="mb-2"><FaCheckCircle className="text-success me-2" /> Customizable Itinerary</li>
                </ul>

                <button
                  onClick={handleBookNow}
                  className="btn btn-gold-tripist w-100 py-3 rounded-pill fw-bold text-dark"
                >
                  Book Now →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Travel Wisdom Section */}
      <section className="py-5 bg-soft-beige">
        <div className="container">
          <div className="row align-items-center g-5">
            <div className="col-lg-6">
              <span className="explore-label-gold">TRAVEL YOUR WAY</span>
              <h2 className="explore-title-dark font-georgia mt-2">
                More than a package.
                <br />
                <span className="text-trip-gold font-georgia italic-style">It's your journey.</span>
              </h2>
              <p className="text-secondary mt-3">
                Every traveller has a different idea of the perfect holiday. That's why our packages are designed as flexible starting points that can be shaped around your interests and travel style.
              </p>
            </div>

            <div className="col-lg-6">
              <div className="d-flex flex-column gap-3">
                {travelTips.map((tip) => (
                  <div className="d-flex gap-3 align-items-start p-3 bg-white rounded-3 shadow-sm" key={tip.number}>
                    <span className="text-trip-gold fw-bold fs-5">{tip.number}</span>
                    <div>
                      <h5 className="fw-bold m-0 font-georgia">{tip.title}</h5>
                      <p className="text-secondary m-0 mt-1 font-sm">{tip.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Booking Popup Modal */}
      <ContactModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialPackageName={packageData?.name || ""}
        initialPackageId={packageData?.id || ""}
      />
    </main>
  );
}