import React, { useState, useMemo } from "react";
import {
  PACKAGE_CATEGORIES as DEFAULT_CATEGORIES,
  COUNTRIES,
  LOCATION_DATA,
  EMPTY_PACKAGE,
  EMPTY_ITINERARY_DAY,
  EMPTY_FAQ,
  PACKAGE_STATUSES,
  todayDateStr,
} from "./Constants";
import { api } from "./api";
import "./PackagesPage.css";

export default function PackagesPage({ packages, setPackages, notify }) {
  const [packageForm, setPackageForm] = useState(EMPTY_PACKAGE);
  const [packageImgUploading, setPackageImgUploading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dynamic Categories Management
  const [categoriesList, setCategoriesList] = useState(DEFAULT_CATEGORIES);
  const [newCategoryInput, setNewCategoryInput] = useState("");
  const [isAddingCategory, setIsAddingCategory] = useState(false);

  // Inclusion / Exclusion Input States
  const [incInput, setIncInput] = useState("");
  const [excInput, setExcInput] = useState("");

  // Filtering & Pagination States
  const [sortField, setSortField] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("ALL");
  const [showExpired, setShowExpired] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [expandedCardId, setExpandedCardId] = useState(null);

  const today = todayDateStr();

  const isExpired = (pkg) =>
    Boolean(pkg.validUntil || pkg.valid_until) &&
    (pkg.validUntil || pkg.valid_until) < today;

  const handleOpenAddModal = () => {
    setPackageForm(EMPTY_PACKAGE);
    setIncInput("");
    setExcInput("");
    setCurrentStep(1);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (isSubmitting) return;
    setIsModalOpen(false);
    setPackageForm(EMPTY_PACKAGE);
    setIncInput("");
    setExcInput("");
    setCurrentStep(1);
    setIsAddingCategory(false);
  };

  const handleCountryChange = (e) => {
    const selectedCountry = e.target.value;
    const availableStates = LOCATION_DATA[selectedCountry] || ["N/A"];
    setPackageForm({
      ...packageForm,
      country: selectedCountry,
      state: availableStates[0] || "N/A",
    });
  };

  const handleAddCategory = () => {
    const trimmed = newCategoryInput.trim();
    if (!trimmed) return;
    if (!categoriesList.includes(trimmed)) {
      setCategoriesList((prev) => [...prev, trimmed]);
    }
    setPackageForm((prev) => ({ ...prev, category: trimmed }));
    setNewCategoryInput("");
    setIsAddingCategory(false);
  };

  // Tag Input Handlers
  const handleAddInclusion = (e) => {
    if (e) e.preventDefault();
    if (!incInput.trim()) return;
    setPackageForm((prev) => ({
      ...prev,
      inclusions: [...(prev.inclusions || []), incInput.trim()],
    }));
    setIncInput("");
  };

  const handleRemoveInclusion = (index) => {
    setPackageForm((prev) => ({
      ...prev,
      inclusions: prev.inclusions.filter((_, i) => i !== index),
    }));
  };

  const handleAddExclusion = (e) => {
    if (e) e.preventDefault();
    if (!excInput.trim()) return;
    setPackageForm((prev) => ({
      ...prev,
      exclusions: [...(prev.exclusions || []), excInput.trim()],
    }));
    setExcInput("");
  };

  const handleRemoveExclusion = (index) => {
    setPackageForm((prev) => ({
      ...prev,
      exclusions: prev.exclusions.filter((_, i) => i !== index),
    }));
  };

  const handlePackageImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPackageImgUploading(true);
    try {
      const { url } = await api.uploadImage(file);
      setPackageForm((f) => ({ ...f, image: url }));
    } catch (err) {
      notify("danger", err.message || "Image upload failed");
    } finally {
      setPackageImgUploading(false);
    }
  };

  const validateStep = () => {
    if (currentStep === 1) {
      if (!packageForm.name.trim()) {
        notify?.("warning", "Please enter Package Name.");
        return false;
      }
      if (!packageForm.price.trim()) {
        notify?.("warning", "Please enter Package Price.");
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (!validateStep()) return;
    setCurrentStep((prev) => Math.min(prev + 1, 3));
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSavePackage = async () => {
    if (currentStep !== 3) return;
    if (!validateStep()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        ...packageForm,
        itinerary: packageForm.itinerary.filter(
          (d) => d.title.trim() || d.activities.trim()
        ),
        faqs: packageForm.faqs.filter(
          (f) => f.question.trim() || f.answer.trim()
        ),
      };

      if (packageForm.id) {
        const updated = await api.updatePackage(packageForm.id, payload);
        setPackages((prev) =>
          prev.map((p) => (p.id === updated.id ? updated : p))
        );
        notify("success", "Package updated successfully!");
      } else {
        const created = await api.createPackage(payload);
        setPackages((prev) => [created, ...prev]);
        notify("success", "Package added successfully!");
      }
      handleCloseModal();
    } catch (err) {
      notify("danger", err.message || "Failed to save package");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditPackage = (packageItem) => {
    setPackageForm({
      ...EMPTY_PACKAGE,
      ...packageItem,
      category: packageItem.category || categoriesList[0] || "",
      durationDays: packageItem.durationDays || packageItem.duration_days || "4",
      durationNights:
        packageItem.durationNights || packageItem.duration_nights || "3",
      shortDescription:
        packageItem.shortDescription || packageItem.short_description || "",
      longDescription:
        packageItem.longDescription || packageItem.long_description || "",
      status: packageItem.status || "active",
      validUntil: packageItem.validUntil || packageItem.valid_until || "",
      inclusions: packageItem.inclusions || [],
      exclusions: packageItem.exclusions || [],
      itinerary:
        packageItem.itinerary && packageItem.itinerary.length > 0
          ? packageItem.itinerary
          : [{ ...EMPTY_ITINERARY_DAY }],
      faqs:
        packageItem.faqs && packageItem.faqs.length > 0
          ? packageItem.faqs
          : [{ ...EMPTY_FAQ }],
    });
    setIncInput("");
    setExcInput("");
    setCurrentStep(1);
    setIsModalOpen(true);
  };

  const handleDeletePackage = async (id) => {
    if (!window.confirm("Delete this package?")) return;
    try {
      await api.deletePackage(id);
      setPackages((prev) => prev.filter((p) => p.id !== id));
      notify("success", "Package deleted successfully!");
    } catch (err) {
      notify("danger", err.message || "Failed to delete package");
    }
  };

  const handleToggleStatusWithConfirm = async (pkg) => {
    const currentStatus = pkg.status || "active";
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    if (
      !window.confirm(
        `Are you sure you want to change the status of "${pkg.name}" to ${
          newStatus === "active" ? "Active" : "Inactive"
        }?`
      )
    )
      return;

    try {
      const updated = await api.updatePackage(pkg.id, {
        ...pkg,
        status: newStatus,
      });
      setPackages((prev) => prev.map((p) => (p.id === pkg.id ? updated : p)));
      notify(
        "success",
        `"${pkg.name}" marked as ${newStatus === "active" ? "Active" : "Inactive"}`
      );
    } catch (err) {
      notify("danger", err.message || "Failed to update status");
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const parsePrice = (priceStr) => {
    if (!priceStr) return 0;
    return parseInt(String(priceStr).replace(/[^0-9]/g, ""), 10) || 0;
  };

  const addItineraryDay = () => {
    setPackageForm({
      ...packageForm,
      itinerary: [
        ...packageForm.itinerary,
        { ...EMPTY_ITINERARY_DAY, day: packageForm.itinerary.length + 1 },
      ],
    });
  };

  const removeItineraryDay = (idx) => {
    const updated = packageForm.itinerary
      .filter((_, i) => i !== idx)
      .map((d, i) => ({ ...d, day: i + 1 }));
    setPackageForm({
      ...packageForm,
      itinerary: updated.length > 0 ? updated : [{ ...EMPTY_ITINERARY_DAY }],
    });
  };

  const handleItineraryChange = (idx, field, value) => {
    const updated = [...packageForm.itinerary];
    updated[idx] = { ...updated[idx], [field]: value };
    setPackageForm({ ...packageForm, itinerary: updated });
  };

  const addFaq = () => {
    setPackageForm({
      ...packageForm,
      faqs: [...packageForm.faqs, { ...EMPTY_FAQ }],
    });
  };

  const removeFaq = (idx) => {
    const updated = packageForm.faqs.filter((_, i) => i !== idx);
    setPackageForm({
      ...packageForm,
      faqs: updated.length > 0 ? updated : [{ ...EMPTY_FAQ }],
    });
  };

  const handleFaqChange = (idx, field, value) => {
    const updated = [...packageForm.faqs];
    updated[idx] = { ...updated[idx], [field]: value };
    setPackageForm({ ...packageForm, faqs: updated });
  };

  const toggleExpand = (id) => {
    setExpandedCardId((prev) => (prev === id ? null : id));
  };

  const filteredAndSortedPackages = useMemo(() => {
    let result = [...packages];

    if (!showExpired) {
      result = result.filter((p) => !isExpired(p));
    }

    if (searchTerm.trim() !== "") {
      const query = searchTerm.toLowerCase();
      result = result.filter(
        (p) =>
          (p.name || "").toLowerCase().includes(query) ||
          (p.country || "").toLowerCase().includes(query) ||
          (p.state || "").toLowerCase().includes(query)
      );
    }

    if (selectedStatusFilter !== "ALL") {
      result = result.filter(
        (p) => (p.status || "active") === selectedStatusFilter
      );
    }

    return result.sort((a, b) => {
      let aVal = a[sortField] || "";
      let bVal = b[sortField] || "";

      if (sortField === "price") {
        aVal = parsePrice(aVal);
        bVal = parsePrice(bVal);
      } else if (typeof aVal === "string") {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
      if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }, [
    packages,
    sortField,
    sortOrder,
    searchTerm,
    selectedStatusFilter,
    showExpired,
  ]);

  const totalPages =
    Math.ceil(filteredAndSortedPackages.length / itemsPerPage) || 1;

  const paginatedPackages = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedPackages.slice(start, start + itemsPerPage);
  }, [filteredAndSortedPackages, currentPage, itemsPerPage]);

  const expiredCount = packages.filter(isExpired).length;

  return (
    <div>
      {/* Top Header */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h3 className="fw-bold text-trip-navy mb-0">Tour Packages</h3>
          <small className="text-muted">Manage your available package catalog</small>
        </div>

        <button className="btn btn-trip-gold px-3 btn-sm" onClick={handleOpenAddModal}>
          <i className="bi bi-plus-lg me-1"></i> Add Package
        </button>
      </div>

      {/* Destination Form Structured Step Modal */}
      {isModalOpen && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(5, 20, 40, 0.65)", backdropFilter: "blur(4px)", zIndex: 1050 }}
        >
          <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content shadow-lg border-0 package-modal-content">
              {/* Header */}
              <div className="modal-header bg-white border-bottom py-3">
                <div>
                  <h5 className="modal-title fw-bold text-trip-navy mb-0">
                    {packageForm.id ? "Edit Package" : "Add Package"}
                  </h5>
                  <small className="text-muted">
                    {packageForm.id ? "Update tour package details" : "Create a new tour package"}
                  </small>
                </div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={handleCloseModal}
                  disabled={isSubmitting}
                ></button>
              </div>

              {/* Step Navigation Bar */}
              <div className="destination-step-header bg-light border-bottom">
                <div className="destination-step-items">
                  <div className={`destination-step ${currentStep >= 1 ? "active" : ""}`}>
                    <span className="destination-step-number">1</span>
                    <div>
                      <strong>Basics</strong>
                    </div>
                  </div>
                  <div className={`destination-step ${currentStep >= 2 ? "active" : ""}`}>
                    <span className="destination-step-number">2</span>
                    <div>
                      <strong>Itinerary</strong>
                    </div>
                  </div>
                  <div className={`destination-step ${currentStep >= 3 ? "active" : ""}`}>
                    <span className="destination-step-number">3</span>
                    <div>
                      <strong>FAQs</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Scrollable Modal Body */}
              <div className="modal-body p-4 package-modal-body">
                {currentStep === 1 && (
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Package Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={packageForm.name}
                        onChange={(e) => setPackageForm({ ...packageForm, name: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold d-flex justify-content-between align-items-center">
                        Category
                        <button
                          type="button"
                          className="btn btn-link p-0 small text-decoration-none"
                          onClick={() => setIsAddingCategory(!isAddingCategory)}
                        >
                          {isAddingCategory ? "Cancel" : "+ Add New Category"}
                        </button>
                      </label>
                      {isAddingCategory ? (
                        <div className="input-group">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="New category..."
                            value={newCategoryInput}
                            onChange={(e) => setNewCategoryInput(e.target.value)}
                          />
                          <button className="btn btn-outline-primary" type="button" onClick={handleAddCategory}>
                            Save
                          </button>
                        </div>
                      ) : (
                        <select
                          className="form-select"
                          value={packageForm.category}
                          onChange={(e) => setPackageForm({ ...packageForm, category: e.target.value })}
                        >
                          {categoriesList.map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      )}
                    </div>

                    <div className="col-md-3">
                      <label className="form-label fw-semibold">Duration (Days)</label>
                      <input
                        type="number"
                        min="1"
                        className="form-control"
                        value={packageForm.durationDays}
                        onChange={(e) => setPackageForm({ ...packageForm, durationDays: e.target.value })}
                      />
                    </div>

                    <div className="col-md-3">
                      <label className="form-label fw-semibold">Duration (Nights)</label>
                      <input
                        type="number"
                        min="0"
                        className="form-control"
                        value={packageForm.durationNights}
                        onChange={(e) => setPackageForm({ ...packageForm, durationNights: e.target.value })}
                      />
                    </div>

                    <div className="col-md-3">
                      <label className="form-label fw-semibold">Status</label>
                      <select
                        className="form-select"
                        value={packageForm.status}
                        onChange={(e) => setPackageForm({ ...packageForm, status: e.target.value })}
                      >
                        {PACKAGE_STATUSES.map((s) => (
                          <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-3">
                      <label className="form-label fw-semibold">Price *</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="₹20,000"
                        value={packageForm.price}
                        onChange={(e) => setPackageForm({ ...packageForm, price: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label fw-semibold">Valid Until</label>
                      <input
                        type="date"
                        className="form-control"
                        min={today}
                        value={packageForm.validUntil}
                        onChange={(e) => setPackageForm({ ...packageForm, validUntil: e.target.value })}
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label fw-semibold">Country</label>
                      <select className="form-select" value={packageForm.country} onChange={handleCountryChange}>
                        {COUNTRIES.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-4">
                      <label className="form-label fw-semibold">State / Region</label>
                      <select
                        className="form-select"
                        value={packageForm.state}
                        onChange={(e) => setPackageForm({ ...packageForm, state: e.target.value })}
                      >
                        {(LOCATION_DATA[packageForm.country] || ["N/A"]).map((st) => (
                          <option key={st} value={st}>{st}</option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        Image File {packageImgUploading && "(uploading...)"}
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        className="form-control"
                        onChange={handlePackageImageUpload}
                        disabled={packageImgUploading}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Image URL</label>
                      <input
                        type="url"
                        className="form-control"
                        value={packageForm.image}
                        onChange={(e) => setPackageForm({ ...packageForm, image: e.target.value })}
                      />
                    </div>

                    {packageForm.image && (
                      <div className="col-12 text-center my-2">
                        <img
                          src={packageForm.image}
                          alt="Preview"
                          style={{ maxHeight: "150px", borderRadius: "8px", objectFit: "cover" }}
                        />
                      </div>
                    )}

                    <div className="col-12">
                      <label className="form-label fw-semibold">Package Highlight</label>
                      <textarea
                        className="form-control"
                        rows={2}
                        value={packageForm.shortDescription}
                        onChange={(e) => setPackageForm({ ...packageForm, shortDescription: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label fw-semibold">About Package</label>
                      <textarea
                        className="form-control"
                        rows={3}
                        value={packageForm.longDescription}
                        onChange={(e) => setPackageForm({ ...packageForm, longDescription: e.target.value })}
                      />
                    </div>
                  </div>
                )}

                {currentStep === 2 && (
                  <div>
                    {/* Tag Inputs for Inclusions & Exclusions */}
                    <div className="row g-3 mb-4">
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">Inclusions</label>
                        <div className="p-2 border rounded bg-white">
                          <div className="d-flex flex-wrap gap-1 mb-2">
                            {(packageForm.inclusions || []).map((item, idx) => (
                              <span key={idx} className="badge bg-success-subtle text-success border px-2 py-1 me-1">
                                <i className="bi bi-check-circle me-1"></i>
                                {item}
                                <button
                                  type="button"
                                  className="btn-close ms-2"
                                  style={{ fontSize: "10px" }}
                                  onClick={() => handleRemoveInclusion(idx)}
                                ></button>
                              </span>
                            ))}
                          </div>
                          <div className="d-flex align-items-center gap-2">
                            <input
                              type="text"
                              className="form-control form-control-sm border-0 shadow-none"
                              placeholder="Type and press Enter..."
                              value={incInput}
                              onChange={(e) => setIncInput(e.target.value)}
                              onKeyDown={(e) => e.key === "Enter" && handleAddInclusion(e)}
                            />
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-secondary text-nowrap"
                              onClick={handleAddInclusion}
                            >
                              + Add
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="col-md-6">
                        <label className="form-label fw-semibold">Exclusions</label>
                        <div className="p-2 border rounded bg-white">
                          <div className="d-flex flex-wrap gap-1 mb-2">
                            {(packageForm.exclusions || []).map((item, idx) => (
                              <span key={idx} className="badge bg-danger-subtle text-danger border px-2 py-1 me-1">
                                <i className="bi bi-x-circle me-1"></i>
                                {item}
                                <button
                                  type="button"
                                  className="btn-close ms-2"
                                  style={{ fontSize: "10px" }}
                                  onClick={() => handleRemoveExclusion(idx)}
                                ></button>
                              </span>
                            ))}
                          </div>
                          <div className="d-flex align-items-center gap-2">
                            <input
                              type="text"
                              className="form-control form-control-sm border-0 shadow-none"
                              placeholder="Type and press Enter..."
                              value={excInput}
                              onChange={(e) => setExcInput(e.target.value)}
                              onKeyDown={(e) => e.key === "Enter" && handleAddExclusion(e)}
                            />
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-secondary text-nowrap"
                              onClick={handleAddExclusion}
                            >
                              + Add
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h6 className="fw-bold text-trip-navy mb-0">Day-by-Day Itinerary</h6>
                      <button
                        type="button"
                        className="btn btn-outline-secondary btn-sm"
                        onClick={addItineraryDay}
                      >
                        + Add Day
                      </button>
                    </div>

                    <div className="row g-3">
                      {packageForm.itinerary.map((day, idx) => (
                        <div className="col-12" key={idx}>
                          <div className="attraction-admin-card">
                            <div className="attraction-number">{day.day}</div>
                            <div className="flex-grow-1">
                              <input
                                type="text"
                                className="form-control mb-2"
                                placeholder="Day Title"
                                value={day.title}
                                onChange={(e) => handleItineraryChange(idx, "title", e.target.value)}
                              />
                              <textarea
                                className="form-control"
                                rows={2}
                                placeholder="Day Activities..."
                                value={day.activities}
                                onChange={(e) => handleItineraryChange(idx, "activities", e.target.value)}
                              />
                            </div>
                            {packageForm.itinerary.length > 1 && (
                              <button
                                type="button"
                                className="btn btn-outline-danger btn-sm"
                                onClick={() => removeItineraryDay(idx)}
                              >
                                Remove
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {currentStep === 3 && (
                  <div>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h6 className="fw-bold text-trip-navy mb-0">Frequently Asked Questions</h6>
                      <button
                        type="button"
                        className="btn btn-outline-secondary btn-sm"
                        onClick={addFaq}
                      >
                        + Add FAQ
                      </button>
                    </div>

                    <div className="row g-3">
                      {packageForm.faqs.map((faq, idx) => (
                        <div className="col-12" key={idx}>
                          <div className="attraction-admin-card">
                            <div className="attraction-number">Q{idx + 1}</div>
                            <div className="flex-grow-1">
                              <input
                                type="text"
                                className="form-control mb-2"
                                placeholder="Question"
                                value={faq.question}
                                onChange={(e) => handleFaqChange(idx, "question", e.target.value)}
                              />
                              <textarea
                                className="form-control"
                                rows={2}
                                placeholder="Answer"
                                value={faq.answer}
                                onChange={(e) => handleFaqChange(idx, "answer", e.target.value)}
                              />
                            </div>
                            {packageForm.faqs.length > 1 && (
                              <button
                                type="button"
                                className="btn btn-outline-danger btn-sm"
                                onClick={() => removeFaq(idx)}
                              >
                                Remove
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Fixed Footer Actions */}
              <div className="modal-footer bg-white border-top p-3 package-modal-footer">
                <div className="w-100 d-flex justify-content-between align-items-center">
                  <div>
                    {currentStep > 1 && (
                      <button
                        type="button"
                        className="btn btn-outline-secondary px-4"
                        onClick={handleBack}
                      >
                        Back
                      </button>
                    )}
                  </div>
                  <div className="d-flex gap-2">
                    <button
                      type="button"
                      className="btn btn-outline-secondary px-4"
                      onClick={handleCloseModal}
                    >
                      Cancel
                    </button>
                    {currentStep < 3 ? (
                      <button
                        type="button"
                        className="btn btn-primary px-4"
                        onClick={handleNext}
                      >
                        Next
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="btn btn-success px-4"
                        disabled={isSubmitting}
                        onClick={handleSavePackage}
                      >
                        {isSubmitting
                          ? "Saving..."
                          : packageForm.id
                          ? "Update Package"
                          : "Save Package"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Collapsed Header Listing View */}
      <div className="card shadow-sm border-0">
        <div className="card-header bg-white py-2 d-flex flex-wrap justify-content-between align-items-center gap-1">
          <span className="fw-bold text-trip-navy small">
            Packages Directory ({filteredAndSortedPackages.length})
          </span>

        <div>
          <input
              type="text"
              className="form-control form-control-sm search-bar-input"
              placeholder="Search by package name, country..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
        </div>
          <div className="d-flex flex-wrap align-items-center gap-1">
            

            <select
              className="form-select form-select-sm w-auto"
              value={selectedStatusFilter}
              onChange={(e) => {
                setSelectedStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="ALL">All Statuses</option>
              {PACKAGE_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>

            <div className="form-check form-switch m-0 small">
              <input
                className="form-check-input"
                type="checkbox"
                id="showExpiredSwitch"
                checked={showExpired}
                onChange={(e) => {
                  setShowExpired(e.target.checked);
                  setCurrentPage(1);
                }}
              />
              <label className="form-check-label text-muted ms-1" htmlFor="showExpiredSwitch">
                Show Expired ({expiredCount})
              </label>
            </div>

            <button
              className={`btn btn-xs ${sortField === "name" ? "btn-trip-gold" : "btn-outline-secondary"}`}
              onClick={() => handleSort("name")}
            >
              Name {sortField === "name" && (sortOrder === "asc" ? "↑" : "↓")}
            </button>
            <button
              className={`btn btn-xs ${sortField === "country" ? "btn-trip-gold" : "btn-outline-secondary"}`}
              onClick={() => handleSort("country")}
            >
              Country {sortField === "country" && (sortOrder === "asc" ? "↑" : "↓")}
            </button>
            <button
              className={`btn btn-xs ${sortField === "price" ? "btn-trip-gold" : "btn-outline-secondary"}`}
              onClick={() => handleSort("price")}
            >
              Price {sortField === "price" && (sortOrder === "asc" ? "↑" : "↓")}
            </button>
          </div>
        </div>

        {/* Directory Cards View */}
        <div className="card-body p-2 bg-light">
          {paginatedPackages.length === 0 ? (
            <div className="text-center py-4 text-muted bg-white rounded small">
              No Packages Found
            </div>
          ) : (
            <div className="d-flex flex-column gap-2">
              {paginatedPackages.map((p) => {
                const status = p.status || "active";
                const isActive = status === "active";
                const expired = isExpired(p);
                const days = p.durationDays || p.duration_days || "-";
                const nights = p.durationNights || p.duration_nights || "-";
                const isExpanded = expandedCardId === p.id;
                const locationText = [p.country, p.state].filter(Boolean).join(", ");

                return (
                  <div
                    key={p.id}
                    className={`card border-0 shadow-sm p-2 bg-white pkg-card-compact ${expired ? "opacity-75" : ""}`}
                  >
                    <div className="d-flex align-items-center justify-content-between gap-3">
                      <div className="d-flex align-items-center gap-3 overflow-hidden">
                        <div
                          className={`insta-avatar-container ${isActive ? "insta-avatar-active" : "insta-avatar-inactive"}`}
                        >
                          <img
                            src={p.image || "https://via.placeholder.com/150?text=No+Image"}
                            alt={p.name}
                            className="insta-avatar-img"
                          />
                          <span className={`insta-pulse-dot ${isActive ? "dot-active" : "dot-inactive"}`}></span>
                        </div>

                        <div className="text-truncate">
                          <div className="fw-bold text-trip-navy text-truncate small mb-1">{p.name}</div>
                          <span className="badge bg-light text-muted border extra-small">{days}D / {nights}N</span>
                        </div>
                      </div>

                      <div className="text-center">
                        <span className="badge bg-secondary-subtle text-dark border extra-small px-2 py-1">
                          {p.category || "General"}
                        </span>
                      </div>

                      {locationText && (
                        <div className="text-muted extra-small d-flex align-items-center gap-1">
                          <i className="bi bi-geo-alt text-danger"></i>
                          <span>{locationText}</span>
                        </div>
                      )}

                      <div className="d-flex align-items-center gap-2 pkg-min-width-actions justify-content-end">
                        <div className="fw-bold text-trip-gold small">₹{p.price}</div>

                        <button
                          className={`btn-status-pill ${isActive ? "status-pill-active" : "status-pill-inactive"}`}
                          onClick={() => handleToggleStatusWithConfirm(p)}
                        >
                          {isActive ? "Active" : "Inactive"}
                        </button>

                        <button className="btn btn-xs btn-outline-secondary" onClick={() => toggleExpand(p.id)}>
                          <i className={`bi bi-chevron-${isExpanded ? "up" : "down"}`}></i>
                        </button>
                        <button className="btn btn-xs btn-outline-primary" onClick={() => handleEditPackage(p)}>
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button className="btn btn-xs btn-outline-danger" onClick={() => handleDeletePackage(p.id)}>
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="border-top mt-2 pt-2 small text-muted">
                        <div className="row g-2">
                          <div className="col-md-6">
                            <strong>Inclusions:</strong>
                            <div className="d-flex flex-wrap gap-1 mt-1">
                              {p.inclusions?.length ? (
                                p.inclusions.map((inc, i) => (
                                  <span key={i} className="inc-badge">
                                    <i className="bi bi-check-circle-fill"></i> {inc}
                                  </span>
                                ))
                              ) : (
                                <span className="extra-small text-muted">None listed</span>
                              )}
                            </div>
                          </div>
                          <div className="col-md-6">
                            <strong>Exclusions:</strong>
                            <div className="d-flex flex-wrap gap-1 mt-1">
                              {p.exclusions?.length ? (
                                p.exclusions.map((exc, i) => (
                                  <span key={i} className="exc-badge">
                                    <i className="bi bi-x-circle-fill"></i> {exc}
                                  </span>
                                ))
                              ) : (
                                <span className="extra-small text-muted">None listed</span>
                              )}
                            </div>
                          </div>
                          {p.longDescription && (
                            <div className="col-12 mt-1">
                              <strong>About:</strong> {p.longDescription}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination Footer */}
          <div className="d-flex justify-content-between align-items-center p-2 mt-2 bg-white rounded border small">
            <div className="d-flex align-items-center gap-2">
              <span className="text-muted extra-small">
                Showing {filteredAndSortedPackages.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to{" "}
                {Math.min(currentPage * itemsPerPage, filteredAndSortedPackages.length)} of{" "}
                {filteredAndSortedPackages.length}
              </span>
              <div className="d-flex align-items-center gap-1 ms-2">
                <span className="extra-small text-muted">Per Page:</span>
                <select
                  className="form-select form-select-sm py-0 px-2 extra-small w-auto"
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={30}>30</option>
                </select>
              </div>
            </div>

            {totalPages > 1 && (
              <ul className="pagination pagination-sm m-0">
                <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                  <button className="page-link py-0 px-2" onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}>
                    Prev
                  </button>
                </li>
                {Array.from({ length: totalPages }, (_, i) => (
                  <li key={i + 1} className={`page-item ${currentPage === i + 1 ? "active" : ""}`}>
                    <button className="page-link py-0 px-2" onClick={() => setCurrentPage(i + 1)}>
                      {i + 1}
                    </button>
                  </li>
                ))}
                <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                  <button className="page-link py-0 px-2" onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}>
                    Next
                  </button>
                </li>
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}