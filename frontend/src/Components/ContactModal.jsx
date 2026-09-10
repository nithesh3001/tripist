import React, { useState, useEffect, useRef } from "react";
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
    message: "", // Kept completely empty
  });

  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const dateInputRef = useRef(null);

  useEffect(() => {
    if (initialPackageName) {
      setFormData((prev) => ({
        ...prev,
        destination: initialPackageName,
        services: prev.services.includes("Holiday Package")
          ? prev.services
          : [...prev.services, "Holiday Package"],
        message: prev.message || "", // Retains user input without pre-filling
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

  const todayDate = new Date().toISOString().split("T")[0];

  const validateStep1 = () => {
    const tempErrors = {};
    if (!formData.fullName.trim())
      tempErrors.fullName = "Full Name is required";
    if (!formData.email.trim()) {
      tempErrors.email = "Email Address is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      tempErrors.email = "Please enter a valid email address";
    }
    if (!formData.mobile.trim()) {
      tempErrors.mobile = "Mobile Number is required";
    } else if (
      !/^[0-9+\s-]{10,15}$/.test(formData.mobile.replace(/\s+/g, ""))
    ) {
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
      <div
        className="contact-modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="contact-modal-close"
          onClick={onClose}
          aria-label="Close modal"
        >
          <X size={20} />
        </button>

        {!submitted ? (
          <>
            <h3 className="text-trip mb-1">
              {initialPackageName
                ? "Complete Your Package Booking"
                : "Send Us an Enquiry"}
            </h3>
            <p className="text-muted mb-3 small">
              Step {currentStep} of 2:{" "}
              {currentStep === 1 ? "Personal Details" : "Travel Requirements"}
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
                <span
                  className={`stepper-label ${currentStep >= 1 ? "active" : ""}`}
                >
                  <UserRound size={14} /> Contact
                </span>
                <span
                  className={`stepper-label ${currentStep === 2 ? "active" : ""}`}
                >
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
                          aria-label="Full Name"
                          id="modal-fullName"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleInputChange}
                          className={`form-control-custom ${errors.fullName ? "is-invalid" : ""}`}
                          placeholder="e.g. Sunil Kumar"
                          required
                        />
                        {errors.fullName && (
                          <div className="invalid-feedback-custom">
                            {errors.fullName}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="form-group-custom">
                        <input
                          type="email"
                          aria-label="Email Address"
                          id="modal-email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className={`form-control-custom ${errors.email ? "is-invalid" : ""}`}
                          placeholder="name@example.com"
                          required
                        />
                        {errors.email && (
                          <div className="invalid-feedback-custom">
                            {errors.email}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="form-group-custom">
                        <input
                          type="tel"
                          aria-label="Mobile Number"
                          id="modal-mobile"
                          name="mobile"
                          value={formData.mobile}
                          onChange={handleInputChange}
                          className={`form-control-custom ${errors.mobile ? "is-invalid" : ""}`}
                          placeholder="+91 98765 43210"
                          required
                        />
                        {errors.mobile && (
                          <div className="invalid-feedback-custom">
                            {errors.mobile}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="form-group-custom">
                        <input
                          type="text"
                          aria-label="Country"
                          id="modal-country"
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
                          aria-label="City"
                          id="modal-city"
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
                      Next: Travel Details{" "}
                      <ArrowRight className="ms-2" size={16} />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: Travel Details */}
              {currentStep === 2 && (
                <div className="step-content">
                  <div className="step-intro">Plan your trip your way</div>
                  <div className="row g-4 mb-4">
                    <div className="col-md-6">
                      <div className="form-group-custom">
                        <label htmlFor="destination">
                          Destination / Package
                        </label>
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
                          <option value="Domestic">Select The Type</option>
                          <option value="Domestic">Domestic</option>
                          <option value="International">International</option>
                        </select>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="form-group-custom">
                        <label htmlFor="travelDate">
                          Tentative Travel Date
                        </label>
                        <div
                          className="date-picker-container"
                          onClick={() => {
                            if (dateInputRef.current) {
                              if (
                                typeof dateInputRef.current.showPicker ===
                                "function"
                              ) {
                                dateInputRef.current.showPicker();
                              } else {
                                dateInputRef.current.focus();
                              }
                            }
                          }}
                        >
                          {/* Display text in dd/mm/yyyy */}
                          <input
                            type="text"
                            id="travelDate"
                            name="travelDateDisplay"
                            readOnly
                            placeholder="dd/mm/yyyy"
                            value={
                              typeof formData?.travelDate === "string" &&
                              formData.travelDate.includes("-")
                                ? formData.travelDate
                                    .split("-")
                                    .reverse()
                                    .join("/")
                                : ""
                            }
                            className="form-control-custom date-display-input"
                          />

                          {/* Hidden Native Picker */}
                          <input
                            ref={dateInputRef}
                            type="date"
                            id="hiddenDateInput"
                            name="travelDate"
                            min={todayDate}
                            value={formData?.travelDate || ""}
                            onChange={handleInputChange}
                            className="date-picker-hidden-native"
                            tabIndex={-1}
                            aria-hidden="true"
                          />

                          {/* Calendar SVG Button */}
                          <button
                            type="button"
                            className="date-picker-calendar-btn"
                            aria-label="Open Calendar"
                            tabIndex={-1}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="#0f2d52"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <rect
                                x="3"
                                y="4"
                                width="18"
                                height="18"
                                rx="2"
                                ry="2"
                              ></rect>
                              <line x1="16" y1="2" x2="16" y2="6"></line>
                              <line x1="8" y1="2" x2="8" y2="6"></line>
                              <line x1="3" y1="10" x2="21" y2="10"></line>
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="form-group-custom">
                        <label htmlFor="budget">Budget</label>
                        <input
                          type="text"
                          aria-label="Budget"
                          id="modal-budget"
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
                          aria-label="Adults"
                          id="modal-adults"
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
                          aria-label="Children"
                          id="modal-children"
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
                        <div className="services-placeholder">
                          What would you like help with?
                        </div>
                        <div className="services-chips-grid">
                          {servicesList.map((service, index) => {
                            const isSelected =
                              formData.services.includes(service);
                            return (
                              <button
                                type="button"
                                key={index}
                                className={`service-chip-btn ${isSelected ? "active" : ""}`}
                                onClick={() => handleServiceChange(service)}
                              >
                                {isSelected && (
                                  <Check size={14} className="me-1 stroke-3" />
                                )}
                                {service}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Optional Message Field */}
                    <div className="col-12">
                      <div className="form-group-custom">
                        <textarea
                          aria-label="Message (Optional)"
                          id="modal-message"
                          name="message"
                          rows="3"
                          value={formData.message}
                          onChange={handleInputChange}
                          className="form-control-custom textarea-custom"
                          placeholder="Tell us about your travel plans, preferences or special requests (Optional)..."
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
                          <Loader2 className="animate-spin me-2" size={18} />{" "}
                          Submitting...
                        </>
                      ) : (
                        <>
                          Submit Enquiry{" "}
                          <ArrowRight className="ms-2" size={18} />
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
              <CheckCircle2
                size={70}
                className="text-gold stroke-2"
                style={{ color: "var(--trip-gold)" }}
              />
            </div>
            <h3 className="text-trip mb-2">Enquiry Submitted Successfully!</h3>
            <p className="text-muted mb-3 small">
              Thank you,{" "}
              <strong className="text-trip">{formData.fullName}</strong>! An
              automated confirmation email has been sent to{" "}
              <strong>{formData.email}</strong>. Our team will contact you
              shortly.
            </p>

            <div className="summary-box p-3 rounded-4 bg-light text-start mb-3 border border-light-subtle small">
              <h6 className="font-semibold text-trip mb-2 border-bottom pb-1">
                Enquiry Summary
              </h6>
              <ul className="list-unstyled d-flex flex-column gap-1 text-muted m-0">
                <li>
                  <strong>Contact:</strong> {formData.mobile} | {formData.email}
                </li>
                <li>
                  <strong>Trip Type:</strong> {formData.travelType}
                </li>
                {formData.travelDate && (
                  <li>
                    <strong>Travel Date:</strong> {formData.travelDate}
                  </li>
                )}
                <li>
                  <strong>Travellers:</strong> {formData.adults} Adults{" "}
                  {formData.children > 0 && `, ${formData.children} Children`}
                </li>
                {formData.services.length > 0 && (
                  <li>
                    <strong>Services:</strong> {formData.services.join(", ")}
                  </li>
                )}
              </ul>
            </div>

            <div className="d-flex gap-2 justify-content-center">
              <button
                type="button"
                onClick={handleReset}
                className="btn-trip-outline-reset px-3 py-2"
              >
                <RefreshCw
                  size={14}
                  className="me-1 inline-block align-middle"
                />
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
