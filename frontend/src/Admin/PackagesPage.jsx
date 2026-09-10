import React, { useState, useEffect, useMemo } from "react";
import {
  PACKAGE_CATEGORIES as DEFAULT_CATEGORIES,
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
  const [packageForm, setPackageForm] = useState({
  ...EMPTY_PACKAGE,
  destinationId: "",
  amenities: [],
});
  const [packageImgUploading, setPackageImgUploading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dynamic Destinations API State
  const [destinationsList, setDestinationsList] = useState([]);
  const [isDestinationsLoading, setIsDestinationsLoading] = useState(false);

  // Dynamic Countries API State
  const [countriesList, setCountriesList] = useState([]); // [{ name, iso2 }]
  const [isCountriesLoading, setIsCountriesLoading] = useState(true);

  // Dynamic States/Provinces API State (fetched per selected country)
  const [statesList, setStatesList] = useState([]);
  const [isStatesLoading, setIsStatesLoading] = useState(false);

  // Fetch destinations list on component mount
  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        setIsDestinationsLoading(true);
        const data = await api.listDestinations();
        if (Array.isArray(data)) {
          setDestinationsList(data);
        }
      } catch (err) {
        console.warn("Failed to fetch destinations list", err);
        notify("warning", "Could not load destination list options.");
      } finally {
        setIsDestinationsLoading(false);
      }
    };

    fetchDestinations();
  }, [notify]);

  // Fetch countries via our own backend (which proxies countries.dev
  // server-side), with a static fallback if that also fails.
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const data = await api.listCountries();
        if (Array.isArray(data) && data.length > 0) {
          setCountriesList(data);
        } else {
          throw new Error("Empty country list returned");
        }
      } catch (err) {
        console.warn("Countries endpoint failed, falling back to static list...", err);
        const staticFallback = Object.keys(LOCATION_DATA || {});
        const fallbackList = staticFallback.length > 0
          ? staticFallback.sort((a, b) => a.localeCompare(b))
          : ["India", "United States", "United Kingdom", "Canada", "Australia", "France", "Germany", "Japan"];
        setCountriesList(fallbackList.map((name) => ({ name, iso2: null })));
        notify("warning", "Using offline country list — couldn't reach the countries service.");
      } finally {
        setIsCountriesLoading(false);
      }
    };

    fetchCountries();
  }, [notify]);

  // Fetch states/provinces for a given country's ISO2 code
  const fetchStatesForCountry = async (iso2) => {
    if (!iso2) return [];
    try {
      setIsStatesLoading(true);
      const data = await api.listStatesByCountry(iso2);
      return Array.isArray(data) ? data : [];
    } catch (err) {
      console.warn(`States lookup failed for ${iso2}, falling back...`, err);
      return [];
    } finally {
      setIsStatesLoading(false);
    }
  };

  // View Details Modal State
  const [viewingPackage, setViewingPackage] = useState(null);

  // Dynamic Categories Management
  const [categoriesList, setCategoriesList] = useState(DEFAULT_CATEGORIES);
  const [newCategoryInput, setNewCategoryInput] = useState("");
  const [isAddingCategory, setIsAddingCategory] = useState(false);

  // Inclusion / Exclusion Input States
  const [incInput, setIncInput] = useState("");
  const [excInput, setExcInput] = useState("");
  // ============================================================
// AMENITIES
// ============================================================

const DEFAULT_AMENITIES = [
  {
    name: "Hotel Accommodation",
    icon: "hotel",
  },
  {
    name: "Premium Hotel Accommodation",
    icon: "hotel",
  },
  {
    name: "Daily Breakfast",
    icon: "utensils",
  },
  {
    name: "Breakfast & Dinner",
    icon: "utensils",
  },
  {
    name: "All Meals",
    icon: "utensils",
  },
  {
    name: "Airport Transfers",
    icon: "car",
  },
  {
    name: "Private Transfers",
    icon: "car",
  },
  {
    name: "Sightseeing Transfers",
    icon: "bus",
  },
  {
    name: "Guided Sightseeing",
    icon: "camera",
  },
  {
    name: "City Tours",
    icon: "map",
  },
  {
    name: "Professional Tour Guide",
    icon: "guide",
  },
  {
    name: "24/7 Travel Support",
    icon: "support",
  },
  {
    name: "Travel Insurance",
    icon: "shield",
  },
  {
    name: "Flight Tickets",
    icon: "plane",
  },
  {
    name: "Train Tickets",
    icon: "train",
  },
  {
    name: "Cruise Tickets",
    icon: "ship",
  },
  {
    name: "Visa Assistance",
    icon: "passport",
  },
  {
    name: "Free Wi-Fi",
    icon: "wifi",
  },
  {
    name: "Swimming Pool",
    icon: "pool",
  },
  {
    name: "Spa & Wellness",
    icon: "spa",
  },
  {
    name: "Gym Access",
    icon: "gym",
  },
  {
    name: "Welcome Drinks",
    icon: "drinks",
  },
  {
    name: "Beach Access",
    icon: "beach",
  },
  {
    name: "Luggage Assistance",
    icon: "luggage",
  },
  {
    name: "Room Upgrade",
    icon: "bed",
  },
  {
    name: "Local Guide",
    icon: "guide",
  },
  {
    name: "Photography Assistance",
    icon: "camera",
  },
  {
    name: "24-Hour Front Desk",
    icon: "bell",
  },
  {
    name: "Laundry Service",
    icon: "laundry",
  },
  {
    name: "Parking",
    icon: "parking",
  },
  {
    name: "Child Friendly",
    icon: "child",
  },
];

const [amenityOptions, setAmenityOptions] = useState(
  DEFAULT_AMENITIES
);

const [newAmenityName, setNewAmenityName] =
  useState("");

const [newAmenityIcon, setNewAmenityIcon] =
  useState("check");

// Controls the custom amenity form
const [isAddingAmenity, setIsAddingAmenity] =
  useState(false);

  // ============================================================
// ADD AMENITY
// ============================================================

const handleAddAmenity = (amenity) => {
  if (!amenity) return;

  setPackageForm((prev) => {
    const current = Array.isArray(prev.amenities)
      ? prev.amenities
      : [];

    const alreadyExists = current.some(
      (item) => item.name === amenity.name
    );

    if (alreadyExists) {
      return prev;
    }

    return {
      ...prev,
      amenities: [
        ...current,
        {
          name: amenity.name,
          icon: amenity.icon || "check",
        },
      ],
    };
  });
};

// ============================================================
// REMOVE AMENITY
// ============================================================

const handleRemoveAmenity = (index) => {
  setPackageForm((prev) => ({
    ...prev,
    amenities: (prev.amenities || []).filter(
      (_, i) => i !== index
    ),
  }));
};

// ============================================================
// ADD CUSTOM AMENITY
// ============================================================

const handleAddCustomAmenity = () => {
  const name = newAmenityName.trim();

  if (!name) {
    notify(
      "warning",
      "Please enter an amenity name."
    );
    return;
  }

  const exists = amenityOptions.some(
    (item) =>
      item.name.toLowerCase() === name.toLowerCase()
  );

  const customAmenity = {
    name,
    icon: newAmenityIcon || "check",
  };

  // Add to dropdown permanently for this session
  if (!exists) {
    setAmenityOptions((prev) => [
      ...prev,
      customAmenity,
    ]);
  }

  // Add to current package
  handleAddAmenity(customAmenity);

  setNewAmenityName("");
  setNewAmenityIcon("check");
  setIsAddingAmenity(false);
};

  // Filtering & Pagination States
  const [sortField, setSortField] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("ALL");
  const [showExpired, setShowExpired] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  const today = todayDateStr();

  const isExpired = (pkg) =>
    Boolean(pkg.validUntil || pkg.valid_until) &&
    (pkg.validUntil || pkg.valid_until) < today;

  const handleOpenAddModal = () => {
    setPackageForm({
  ...EMPTY_PACKAGE,
  destinationId: "",
  amenities: [],
});
    setIncInput("");
    setExcInput("");
    setCurrentStep(1);
    setIsModalOpen(true);
    setStatesList([]);
  };

  const handleCloseModal = () => {
    if (isSubmitting) return;
    setIsModalOpen(false);
    setPackageForm({
  ...EMPTY_PACKAGE,
  destinationId: "",
  amenities: [],
});
    setIncInput("");
    setExcInput("");
    setCurrentStep(1);
    setStatesList([]);
    setIsAddingCategory(false);
  };

  const handleCountryChange = async (e) => {
    const selectedCountry = e.target.value;
    const countryEntry = countriesList.find((c) => c.name === selectedCountry);
    const iso2 = countryEntry?.iso2 || null;

    setPackageForm((prev) => ({ ...prev, country: selectedCountry, state: "" }));
    setStatesList([]);

    const liveStates = await fetchStatesForCountry(iso2);

    if (liveStates.length > 0) {
      setStatesList(liveStates);
      setPackageForm((prev) => ({ ...prev, state: liveStates[0] }));
      return;
    }

    const staticStates = LOCATION_DATA[selectedCountry];
    if (staticStates && staticStates.length > 0) {
      setPackageForm((prev) => ({ ...prev, state: staticStates[0] }));
      return;
    }
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
      if (!packageForm.price) {
        notify?.("warning", "Please enter Package Price.");
        return false;
      }
      if (!packageForm.destinationId && !packageForm.destination_id) {
        notify?.("warning", "Please select a Destination.");
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
        destination_id: packageForm.destinationId || packageForm.destination_id,
        amenities: Array.isArray(packageForm.amenities)
          ? packageForm.amenities
          : [],
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
      destinationId: packageItem.destinationId || packageItem.destination_id || "",
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
      amenities: Array.isArray(packageItem.amenities)
        ? packageItem.amenities
        : [],
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

    setStatesList([]);
    const countryEntry = countriesList.find((c) => c.name === packageItem.country);
    if (countryEntry?.iso2) {
      fetchStatesForCountry(countryEntry.iso2).then((liveStates) => {
        if (liveStates.length > 0) setStatesList(liveStates);
      });
    }
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

      {/* View Package Details Modal Popup */}
      {viewingPackage && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(5, 20, 40, 0.65)", backdropFilter: "blur(4px)", zIndex: 1060 }}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content shadow-lg border-0 package-modal-content">
              <div className="modal-header bg-white border-bottom py-3">
                <div className="d-flex align-items-center gap-3">
                  <img
                    src={viewingPackage.image || "https://via.placeholder.com/150?text=No+Image"}
                    alt={viewingPackage.name}
                    style={{ width: "50px", height: "40px", objectFit: "cover", borderRadius: "6px" }}
                  />
                  <div>
                    <h5 className="modal-title fw-bold text-trip-navy mb-0">{viewingPackage.name}</h5>
                    <small className="text-muted">
                      {[viewingPackage.country, viewingPackage.state].filter(Boolean).join(", ")}
                    </small>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setViewingPackage(null)}
                ></button>
              </div>

              <div className="modal-body p-4 package-modal-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <span className="text-muted small d-block">Category</span>
                    <strong className="text-dark">{viewingPackage.category || "General"}</strong>
                  </div>
                  <div className="col-md-6">
                    <span className="text-muted small d-block">Price</span>
                    <strong className="text-trip-gold">₹{viewingPackage.price}</strong>
                  </div>
                  <div className="col-md-6">
                    <span className="text-muted small d-block">Duration</span>
                    <strong className="text-dark">
                      {viewingPackage.durationDays || viewingPackage.duration_days || "-"} Days /{" "}
                      {viewingPackage.durationNights || viewingPackage.duration_nights || "-"} Nights
                    </strong>
                  </div>
                  <div className="col-md-6">
                    <span className="text-muted small d-block">Status</span>
                    <span className={`badge ${ (viewingPackage.status || "active") === "active" ? "bg-success" : "bg-danger" }`}>
                      {viewingPackage.status || "active"}
                    </span>
                  </div>

                  {viewingPackage.shortDescription && (
                    <div className="col-12">
                      <span className="text-muted small d-block">Highlight</span>
                      <p className="mb-0 text-dark">{viewingPackage.shortDescription}</p>
                    </div>
                  )}

                  {viewingPackage.longDescription && (
                    <div className="col-12">
                      <span className="text-muted small d-block">Description</span>
                      <p className="mb-0 text-dark">{viewingPackage.longDescription}</p>
                    </div>
                  )}

                  <hr className="my-2" />

                  <div className="col-md-6">
                    <h6 className="fw-bold text-trip-navy mb-2">Inclusions</h6>
                    <div className="d-flex flex-wrap gap-1">
                      {viewingPackage.inclusions?.length ? (
                        viewingPackage.inclusions.map((inc, i) => (
                          <span key={i} className="inc-badge">
                            <i className="bi bi-check-circle-fill"></i> {inc}
                          </span>
                        ))
                      ) : (
                        <span className="text-muted small">None listed</span>
                      )}
                    </div>
                  </div>

                  <div className="col-md-6">
                    <h6 className="fw-bold text-trip-navy mb-2">Exclusions</h6>
                    <div className="d-flex flex-wrap gap-1">
                      {viewingPackage.exclusions?.length ? (
                        viewingPackage.exclusions.map((exc, i) => (
                          <span key={i} className="exc-badge">
                            <i className="bi bi-x-circle-fill"></i> {exc}
                          </span>
                        ))
                      ) : (
                        <span className="text-muted small">None listed</span>
                      )}
                    </div>
                  </div>

                  <div className="col-12 mt-2">
                    <h6 className="fw-bold text-trip-navy mb-2">Amenities</h6>
                    <div className="d-flex flex-wrap gap-2">
                      {Array.isArray(viewingPackage.amenities) &&
                      viewingPackage.amenities.length > 0 ? (
                        viewingPackage.amenities.map((amenity, i) => (
                          <span
                            key={i}
                            className="badge bg-primary-subtle text-primary border px-2 py-2"
                          >
                            <i className="bi bi-check-circle me-1"></i>
                            {typeof amenity === "string"
                              ? amenity
                              : amenity?.name}
                          </span>
                        ))
                      ) : (
                        <span className="text-muted small">
                          No amenities listed
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer bg-white border-top p-3 package-modal-footer">
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm px-4"
                  onClick={() => setViewingPackage(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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

                    {/* Destination Selection Dropdown */}
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        Destination * {isDestinationsLoading && <small className="text-muted">(Loading...)</small>}
                      </label>
                      <select
                        className="form-select"
                        value={packageForm.destinationId}
                        onChange={(e) => setPackageForm({ ...packageForm, destinationId: e.target.value })}
                        disabled={isDestinationsLoading}
                        required
                      >
                        <option value="">-- Select Destination --</option>
                        {destinationsList.map((dest) => (
                          <option key={dest.id} value={dest.id}>
                            {dest.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-6">
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

                    <div className="col-md-3">
                      <label className="form-label fw-semibold">Valid Until</label>
                      <input
                        type="date"
                        className="form-control"
                        min={today}
                        value={packageForm.validUntil}
                        onChange={(e) => setPackageForm({ ...packageForm, validUntil: e.target.value })}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        Country {isCountriesLoading && <small className="text-muted">(Loading...)</small>}
                      </label>
                      <select
                        className="form-select"
                        value={packageForm.country}
                        onChange={handleCountryChange}
                        disabled={isCountriesLoading}
                      >
                        <option value="">Select Country</option>
                        {countriesList.map((c) => (
                          <option key={c.name} value={c.name}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        State / Region {isStatesLoading && <small className="text-muted">(Loading...)</small>}
                      </label>
                      {statesList.length > 0 || LOCATION_DATA[packageForm.country] ? (
                        <select
                          className="form-select"
                          value={packageForm.state}
                          onChange={(e) => setPackageForm({ ...packageForm, state: e.target.value })}
                          disabled={isStatesLoading}
                        >
                          {(statesList.length > 0 ? statesList : LOCATION_DATA[packageForm.country]).map((st) => (
                            <option key={st} value={st}>{st}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Enter state / region"
                          value={packageForm.state}
                          onChange={(e) => setPackageForm({ ...packageForm, state: e.target.value })}
                          disabled={isStatesLoading}
                        />
                      )}
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

                    {/* =====================================================
                        AMENITIES
                        Unlimited selection + custom amenities
                    ====================================================== */}
                    <div className="col-12">
                      <div className="border rounded-3 p-3 bg-white">
                        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-2">
                          <div>
                            <label className="form-label fw-semibold mb-0">
                              Package Amenities
                            </label>
                            <div className="small text-muted">
                              Select as many amenities as required.
                            </div>
                          </div>

                          <button
                            type="button"
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => setIsAddingAmenity((prev) => !prev)}
                          >
                            <i className={`bi ${isAddingAmenity ? "bi-x-lg" : "bi-plus-lg"} me-1`}></i>
                            {isAddingAmenity ? "Cancel" : "Add New Amenity"}
                          </button>
                        </div>

                        {isAddingAmenity && (
                          <div className="border rounded-3 bg-light p-3 mb-3">
                            <div className="row g-2 align-items-end">
                              <div className="col-md-6">
                                <label className="form-label small fw-semibold">
                                  New Amenity Name
                                </label>
                                <input
                                  type="text"
                                  className="form-control"
                                  placeholder="e.g. Sunset Cruise"
                                  value={newAmenityName}
                                  onChange={(e) => setNewAmenityName(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      e.preventDefault();
                                      handleAddCustomAmenity();
                                    }
                                  }}
                                />
                              </div>

                              <div className="col-md-4">
                                <label className="form-label small fw-semibold">
                                  Icon
                                </label>
                                <select
                                  className="form-select"
                                  value={newAmenityIcon}
                                  onChange={(e) => setNewAmenityIcon(e.target.value)}
                                >
                                  <option value="check">Check</option>
                                  <option value="hotel">Hotel</option>
                                  <option value="utensils">Food / Meals</option>
                                  <option value="car">Car / Transfer</option>
                                  <option value="bus">Bus</option>
                                  <option value="camera">Camera</option>
                                  <option value="map">Map / Tour</option>
                                  <option value="guide">Guide</option>
                                  <option value="support">Support</option>
                                  <option value="shield">Insurance / Security</option>
                                  <option value="plane">Flight</option>
                                  <option value="train">Train</option>
                                  <option value="ship">Cruise / Ship</option>
                                  <option value="passport">Visa / Passport</option>
                                  <option value="wifi">Wi-Fi</option>
                                  <option value="pool">Swimming Pool</option>
                                  <option value="spa">Spa</option>
                                  <option value="gym">Gym</option>
                                  <option value="drinks">Drinks</option>
                                  <option value="beach">Beach</option>
                                  <option value="luggage">Luggage</option>
                                  <option value="bed">Bed / Room</option>
                                  <option value="bell">Bell / Front Desk</option>
                                  <option value="laundry">Laundry</option>
                                  <option value="parking">Parking</option>
                                  <option value="child">Child Friendly</option>
                                </select>
                              </div>

                              <div className="col-md-2">
                                <button
                                  type="button"
                                  className="btn btn-primary w-100"
                                  onClick={handleAddCustomAmenity}
                                >
                                  Add
                                </button>
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="row g-2">
                          <div className="col-md-7">
                            <select
                              className="form-select"
                              value=""
                              onChange={(e) => {
                                const selected = amenityOptions.find(
                                  (item) => item.name === e.target.value
                                );
                                if (selected) handleAddAmenity(selected);
                              }}
                            >
                              <option value="">-- Select an amenity to add --</option>
                              {amenityOptions.map((amenity) => {
                                const alreadySelected = (packageForm.amenities || []).some(
                                  (item) => item.name === amenity.name
                                );

                                return (
                                  <option
                                    key={`${amenity.name}-${amenity.icon}`}
                                    value={amenity.name}
                                    disabled={alreadySelected}
                                  >
                                    {alreadySelected ? "✓ " : ""}
                                    {amenity.name}
                                  </option>
                                );
                              })}
                            </select>
                          </div>

                          <div className="col-md-5">
                            <div className="small text-muted py-2">
                              {(packageForm.amenities || []).length} amenit
                              {(packageForm.amenities || []).length === 1 ? "y" : "ies"} selected
                            </div>
                          </div>
                        </div>

                        <div className="d-flex flex-wrap gap-2 mt-3">
                          {(packageForm.amenities || []).length > 0 ? (
                            packageForm.amenities.map((amenity, index) => (
                              <span
                                key={`${amenity.name}-${index}`}
                                className="badge bg-primary-subtle text-primary border px-2 py-2 d-inline-flex align-items-center"
                              >
                                <i
                                  className={`bi bi-${{
                                    hotel: "building",
                                    utensils: "cup-hot",
                                    car: "car-front",
                                    bus: "bus-front",
                                    camera: "camera",
                                    map: "map",
                                    guide: "person-badge",
                                    support: "headset",
                                    shield: "shield-check",
                                    plane: "airplane",
                                    train: "train-front",
                                    ship: "water",
                                    passport: "passport",
                                    wifi: "wifi",
                                    pool: "water",
                                    spa: "flower1",
                                    gym: "activity",
                                    drinks: "cup-straw",
                                    beach: "umbrella",
                                    luggage: "luggage",
                                    bed: "bed",
                                    bell: "bell",
                                    laundry: "washer",
                                    parking: "p-circle",
                                    child: "person-heart",
                                    check: "check-circle"
                                  }[amenity.icon] || "check-circle"} me-1`}
                                ></i>
                                {amenity.name}
                                <button
                                  type="button"
                                  className="btn btn-sm p-0 ms-2 text-danger"
                                  style={{ lineHeight: 1 }}
                                  title={`Remove ${amenity.name}`}
                                  onClick={() => handleRemoveAmenity(index)}
                                >
                                  <i className="bi bi-x-circle-fill"></i>
                                </button>
                              </span>
                            ))
                          ) : (
                            <span className="small text-muted">
                              No amenities selected yet.
                            </span>
                          )}
                        </div>
                      </div>
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

      {/* Main Table-Based Directory View */}
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

        {/* Directory Table View with Scrollable Container applied ONLY here */}
        <div className="card-body p-0">
          <div className="table-responsive packages-table-scroll-container">
            <table className="table table-hover align-middle mb-0">
              <thead>
                <tr>
                  <th>Package Name</th>
                  <th>Category</th>
                  <th>Location</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th className="text-end" style={{ minWidth: "150px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedPackages.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4 text-muted">
                      No Packages Found
                    </td>
                  </tr>
                ) : (
                  paginatedPackages.map((p) => {
                    const status = p.status || "active";
                    const isActive = status === "active";
                    const expired = isExpired(p);
                    const days = p.durationDays || p.duration_days || "-";
                    const nights = p.durationNights || p.duration_nights || "-";
                    const locationText = [p.country, p.state].filter(Boolean).join(", ");

                    return (
                      <tr key={p.id} className={expired ? "opacity-75" : ""}>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <div
                              className={`insta-avatar-container ${isActive ? "insta-avatar-active" : "insta-avatar-inactive"}`}
                              style={{ width: "42px", height: "42px" }}
                            >
                              <img
                                src={p.image || "https://via.placeholder.com/150?text=No+Image"}
                                alt={p.name}
                                className="insta-avatar-img"
                              />
                              <span className={`insta-pulse-dot ${isActive ? "dot-active" : "dot-inactive"}`}></span>
                            </div>
                            <div>
                              <div className="pkg-title">{p.name}</div>
                              <div className="pkg-sub">{days}D / {nights}N</div>
                            </div>
                          </div>
                        </td>

                        <td>
                          <span className="badge badge-soft-info px-2 py-1">
                            {p.category || "General"}
                          </span>
                        </td>

                        <td>
                          {locationText ? (
                            <div className="text-muted small d-flex align-items-center gap-1">
                              <i className="bi bi-geo-alt text-danger"></i>
                              <span>{locationText}</span>
                            </div>
                          ) : (
                            <span className="text-muted small">-</span>
                          )}
                        </td>

                        <td>
                          <span className="fw-bold text-trip-gold">₹{p.price}</span>
                        </td>

                        <td>
                          <button
                            className={`btn-status-pill ${isActive ? "status-pill-active" : "status-pill-inactive"}`}
                            onClick={() => handleToggleStatusWithConfirm(p)}
                          >
                            {isActive ? "Active" : "Inactive"}
                          </button>
                        </td>

                        <td className="text-end">
                          <div className="d-flex align-items-center justify-content-end gap-1">
                            <button
                              className="btn btn-action-icon"
                              title="View Inclusions & Details"
                              onClick={() => setViewingPackage(p)}
                            >
                              <i className="bi bi-eye text-primary"></i>
                            </button>
                            <button
                              className="btn btn-action-icon"
                              title="Edit Package"
                              onClick={() => handleEditPackage(p)}
                            >
                              <i className="bi bi-pencil text-secondary"></i>
                            </button>
                            <button
                              className="btn btn-action-icon"
                              title="Delete Package"
                              onClick={() => handleDeletePackage(p.id)}
                            >
                              <i className="bi bi-trash text-danger"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer - Fixed outside scroll area */}
          <div className="d-flex justify-content-between align-items-center p-3 bg-white border-top small">
            <div className="d-flex align-items-center gap-2">
              <span className="text-muted">
                Showing {filteredAndSortedPackages.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to{" "}
                {Math.min(currentPage * itemsPerPage, filteredAndSortedPackages.length)} of{" "}
                {filteredAndSortedPackages.length} entries
              </span>
              <div className="d-flex align-items-center gap-1 ms-3">
                <span className="text-muted">Per Page:</span>
                <select
                  className="form-select form-select-sm py-0 px-2 w-auto"
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
                  <button className="page-link" onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}>
                    Prev
                  </button>
                </li>
                {Array.from({ length: totalPages }, (_, i) => (
                  <li key={i + 1} className={`page-item ${currentPage === i + 1 ? "active" : ""}`}>
                    <button className="page-link" onClick={() => setCurrentPage(i + 1)}>
                      {i + 1}
                    </button>
                  </li>
                ))}
                <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                  <button className="page-link" onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}>
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