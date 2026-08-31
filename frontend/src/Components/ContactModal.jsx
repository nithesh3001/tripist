import React, { useState, useEffect } from "react";
import {
  X,
  Check,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Loader2,
  BookmarkCheck,
  UserRound,
  MapPinned,
} from "lucide-react";
import { api } from "../Admin/api";
import "./ContactModal.css";

export default function ContactModal({
  isOpen,
  onClose,
  initialPackageName = "",
  initialPackageId = "",
}) {
  const [currentStep, setCurrentStep] = useState(1);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    mobile: "",
    country: "",
    city: "",
    destination: initialPackageName || "",
    travelType: "Domestic",
    travelDate: "",
    adults: 1,
    children: 0,
    budget: "",
    services: initialPackageName ? ["Holiday Package"] : [],
    message: initialPackageName
      ? `I am interested in booking the "${initialPackageName}" package (Package ID: ${initialPackageId || "N/A"}). Please provide more details and the best quotation.`
      : "",
  });

  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialPackageName) {
      setFormData((prev) => ({
        ...prev,
        destination: initialPackageName,
        services: prev.services.includes("Holiday Package")
          ? prev.services
          : [...prev.services, "Holiday Package"],
        message: `I am interested in booking the "${initialPackageName}" package (Package ID: ${initialPackageId || "N/A"}). Please provide more details and the best quotation.`,
      }));
    }
  }, [initialPackageName, initialPackageId]);

  if (!isOpen) return null;

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
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleServiceChange = (serviceName) => {
    setFormData((prev) => {
      const isAlreadySelected = prev.services.includes(serviceName);
      const updatedServices = isAlreadySelected
        ? prev.services.filter((s) => s !== serviceName)
        : [...prev.services, serviceName];
      return { ...prev, services: updatedServices };
    });
  };
// Inside your ContactModal component, right above the return statement:
const todayDate = new Date().toISOString().split("T")[0];


  // Validate Step 1 required personal details
  const validateStep1 = () => {
    const tempErrors = {};
    if (!formData.fullName.trim()) tempErrors.fullName = "Full Name is required";
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

  const handleNextStep = () => {
    if (validateStep1()) {
      setCurrentStep(2);
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.sendContactEnquiry(formData);
      setSubmitted(true);
    } catch (error) {
      console.error("Failed to send contact enquiry:", error);
      alert(error.message || "Failed to submit enquiry. Please try again.");
    } finally {
      setLoading(false);
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
    setCurrentStep(1);
  };

  return (
    <div className="contact-modal-backdrop" onClick={onClose}>
      <div className="contact-modal-container" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="contact-modal-close" onClick={onClose} aria-label="Close modal">
          <X size={20} />
        </button>

        {/* {initialPackageName && !submitted && (
          <div className="alert alert-warning border-0 d-flex align-items-center gap-2 mb-3 p-2.5 rounded-3 shadow-sm small" style={{ background: "#fef9c3", color: "#854d0e" }}>
            <BookmarkCheck size={18} className="text-warning flex-shrink-0" />
            <div>
              Booking enquiry for: <strong>{initialPackageName}</strong>
            </div>
          </div>
        )} */}

        {!submitted ? (
          <>
            <h3 className="text-trip mb-1">
              {initialPackageName ? "Complete Your Package Booking" : "Send Us an Enquiry"}
            </h3>
            <p className="text-muted mb-3 small">
              Step {currentStep} of 2: {currentStep === 1 ? "Personal Details" : "Travel Requirements"}
            </p>

            {/* Stepper Progress Bar */}
            <div className="stepper-bar-container mb-4">
              <div className="stepper-track">
                <div
                  className="stepper-fill"
                  style={{ width: currentStep === 1 ? "50%" : "100%" }}
                ></div>
              </div>
              <div className="stepper-label-row">
                <span className={`stepper-label ${currentStep >= 1 ? "active" : ""}`}>
                  <UserRound size={14} /> Contact
                </span>
                <span className={`stepper-label ${currentStep === 2 ? "active" : ""}`}>
                  Travel Details <MapPinned size={14} />
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} noValidate>
              {/* STEP 1: Personal Details */}
              {currentStep === 1 && (
                <div className="step-content">
                  <div className="step-intro">Tell us how we can reach you</div>
                  <div className="row g-3">
                    <div className="col-12">
                      <div className="form-group-custom">
                        
                        <input
                          type="text"
                          aria-label="Full Name" id="modal-fullName"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleInputChange}
                          className={`form-control-custom ${errors.fullName ? "is-invalid" : ""}`}
                          placeholder="e.g. Sunil Kumar"
                          required
                        />
                        {errors.fullName && <div className="invalid-feedback-custom">{errors.fullName}</div>}
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="form-group-custom">
                        
                        <input
                          type="email"
                          aria-label="Email Address" id="modal-email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className={`form-control-custom ${errors.email ? "is-invalid" : ""}`}
                          placeholder="name@example.com"
                          required
                        />
                        {errors.email && <div className="invalid-feedback-custom">{errors.email}</div>}
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="form-group-custom">
                        
                        <input
                          type="tel"
                          aria-label="Mobile Number" id="modal-mobile"
                          name="mobile"
                          value={formData.mobile}
                          onChange={handleInputChange}
                          className={`form-control-custom ${errors.mobile ? "is-invalid" : ""}`}
                          placeholder="+91 98765 43210"
                          required
                        />
                        {errors.mobile && <div className="invalid-feedback-custom">{errors.mobile}</div>}
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="form-group-custom">
                        
                        <input
                          type="text"
                          aria-label="Country" id="modal-country"
                          name="country"
                          value={formData.country}
                          onChange={handleInputChange}
                          className="form-control-custom"
                          placeholder="Country"
                        />
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="form-group-custom">
                        
                        <input
                          type="text"
                          aria-label="City" id="modal-city"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          className="form-control-custom"
                          placeholder="City"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 text-end">
                    <button
                      type="button"
                      onClick={handleNextStep}
                      className="btn-trip-submit btn-next py-2.5 px-4 shadow-sm inline-flex align-items-center"
                    >
                      Next: Travel Details <ArrowRight className="ms-2" size={16} />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: Travel Details */}
              {currentStep === 2 && (
                <div className="step-content">
                  <div className="step-intro">Plan your trip your way</div>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <div className="form-group-custom">
                        
                        <input
                          type="text"
                          aria-label="Destination or Package" id="modal-destination"
                          name="destination"
                          value={formData.destination}
                          onChange={handleInputChange}
                          className="form-control-custom"
                          placeholder="Destination or package"
                        />
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="form-group-custom">
                        
                        <select
                          aria-label="Travel Type" id="modal-travelType"
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
                        
                        <input
                          type="date"
                          aria-label="Tentative Travel Date" title="Select your tentative travel date" id="modal-travelDate"
                          name="travelDate"
                          min={todayDate}
                          value={formData.travelDate}
                          onChange={handleInputChange}
                          className="form-control-custom"
                        />
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="form-group-custom">
                        
                        <input
                          type="text"
                          aria-label="Budget" id="modal-budget"
                          name="budget"
                          value={formData.budget}
                          onChange={handleInputChange}
                          className="form-control-custom"
                          placeholder="Approx. budget per person"
                        />
                      </div>
                    </div>

                    <div className="col-6 col-md-6">
                      <div className="form-group-custom">
                        
                        <input
                          type="number"
                          aria-label="Adults" id="modal-adults"
                          name="adults"
                          min="1"
                          value={formData.adults}
                          onChange={handleInputChange}
                          className="form-control-custom"
                        
                           placeholder="Adults"
                        />
                      </div>
                    </div>

                    <div className="col-6 col-md-6">
                      <div className="form-group-custom">
                        
                        <input
                          type="number"
                          aria-label="Children" id="modal-children"
                          name="children"
                          min="0"
                          value={formData.children}
                          onChange={handleInputChange}
                          className="form-control-custom"
                        
                           placeholder="Children"
                        />
                      </div>
                    </div>

                    <div className="col-12">
                      <div className="form-group-custom">
                        
                        <div className="services-placeholder">What would you like help with?</div>
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

                    <div className="col-12">
                      <div className="form-group-custom">
                        
                        <textarea
                          aria-label="Message" id="modal-message"
                          name="message"
                          rows="3"
                          value={formData.message}
                          onChange={handleInputChange}
                          className="form-control-custom textarea-custom"
                          placeholder="Tell us about your travel plans, preferences or special requests..."
                        ></textarea>
                      </div>
                    </div>
                  </div>

                  <div className="d-flex justify-content-between align-items-center mt-4">
                    <button
                      type="button"
                      onClick={handlePrevStep}
                      className="btn-trip-back py-2.5 px-3 rounded-3 d-inline-flex align-items-center"
                    >
                      <ArrowLeft className="me-1" size={16} /> Back
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn-trip-submit btn-submit py-2.5 px-4 shadow-sm inline-flex align-items-center"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="animate-spin me-2" size={18} /> Submitting...
                        </>
                      ) : (
                        <>
                          Submit Enquiry <ArrowRight className="ms-2" size={18} />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </>
        ) : (
          <div className="enquiry-success-container text-center py-4">
            <div className="success-icon-wrapper mb-3">
              <CheckCircle2 size={70} className="text-gold stroke-2" style={{ color: "var(--trip-gold)" }} />
            </div>
            <h3 className="text-trip mb-2">Enquiry Submitted Successfully!</h3>
            <p className="text-muted mb-3 small">
              Thank you, <strong className="text-trip">{formData.fullName}</strong>! An automated confirmation email has been sent to <strong>{formData.email}</strong>. Our team will contact you shortly.
            </p>

            <div className="summary-box p-3 rounded-4 bg-light text-start mb-3 border border-light-subtle small">
              <h6 className="font-semibold text-trip mb-2 border-bottom pb-1">Enquiry Summary</h6>
              <ul className="list-unstyled d-flex flex-column gap-1 text-muted m-0">
                <li><strong>Contact:</strong> {formData.mobile} | {formData.email}</li>
                <li><strong>Trip Type:</strong> {formData.travelType}</li>
                {formData.travelDate && <li><strong>Travel Date:</strong> {formData.travelDate}</li>}
                <li><strong>Travellers:</strong> {formData.adults} Adults {formData.children > 0 && `, ${formData.children} Children`}</li>
                {formData.services.length > 0 && (
                  <li><strong>Services:</strong> {formData.services.join(", ")}</li>
                )}
              </ul>
            </div>

            <div className="d-flex gap-2 justify-content-center">
              <button
                type="button"
                onClick={handleReset}
                className="btn-trip-outline-reset px-3 py-2"
              >
                <RefreshCw size={14} className="me-1 inline-block align-middle" />
                New Enquiry
              </button>
              <button
                type="button"
                onClick={onClose}
                className="btn btn-navy px-4 py-2"
                style={{ background: "#0f2d52", color: "#fff" }}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}