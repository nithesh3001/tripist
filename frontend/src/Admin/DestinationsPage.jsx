import React, { useEffect, useMemo, useState } from "react";
import { api } from "./api";
import "./DestinationPage.css";

const API_BASE =
  import.meta.env?.VITE_API_BASE_URL || "http://localhost:5000/api";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const SHORT_MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const CLIMATES = [
  "27°C to 32°C (Tropical Warm)",
  "20°C to 26°C (Mild & Pleasant)",
  "15°C to 22°C (Cool & Temperate)",
  "5°C to 15°C (Cold Alpine)",
  "30°C to 42°C (Hot Desert)",
  "10°C to 20°C (Mediterranean)",
];

const FALLBACK_COUNTRIES = [
  "Australia", "Canada", "France", "Germany", "India", "Indonesia",
  "Italy", "Japan", "Malaysia", "Maldives", "New Zealand", "Singapore",
  "Spain", "Sri Lanka", "Switzerland", "Thailand", "United Arab Emirates",
  "United Kingdom", "United States", "Vietnam",
];

const EMPTY_FORM = {
  id: null,
  name: "",
  capital: "",
  currency: "",
  climate: CLIMATES[0],
  languages_spoken: [],
  time_zone: "",
  driving_side: "Left",
  calling_code: "",
  about_text: "",
  is_top_destination: false,
  travel_tips: ["", "", "", ""],
};

const DEFAULT_ATTRACTIONS = [
  { name: "", file: null, image: "" },
  { name: "", file: null, image: "" },
];

function getDestinationId(destination) {
  return destination?.id || destination?._id;
}

function getDestinationName(destination) {
  return (
    destination?.name ||
    destination?.country ||
    destination?.destination_name ||
    "Unknown Destination"
  );
}

function getDestinationImage(destination) {
  if (destination?.image) return destination.image;
  if (Array.isArray(destination?.hero_slider_images) && destination.hero_slider_images.length) {
    return destination.hero_slider_images[0];
  }
  return "https://placehold.co/500x300?text=Destination";
}

function parseArray(value) {
  if (Array.isArray(value)) return value;
  if (!value) return [];
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [value];
    } catch {
      return value.split(",").map((item) => item.trim()).filter(Boolean);
    }
  }
  return [];
}

function getSeasonFromDestination(destination) {
  const value = destination?.best_season_to_visit || "";
  if (!value) return { start: "April", end: "October" };

  const parts = String(value)
    .replace(/\s+to\s+/i, "|")
    .replace(/\s*-\s*/g, "|")
    .split("|");

  if (parts.length >= 2) {
    const findMonth = (val) => {
      const clean = val.trim().toLowerCase();
      return (
        MONTHS.find((month) => month.toLowerCase() === clean) ||
        MONTHS.find((month) => month.toLowerCase().startsWith(clean)) ||
        "April"
      );
    };

    return {
      start: findMonth(parts[0]),
      end: findMonth(parts[1]),
    };
  }

  return { start: "April", end: "October" };
}

function buildSeason(start, end) {
  if (!start || !end) return "Year-Round";
  const startIndex = MONTHS.indexOf(start);
  const endIndex = MONTHS.indexOf(end);

  if (startIndex === -1 || endIndex === -1) return "Year-Round";
  if (startIndex === endIndex) return SHORT_MONTHS[startIndex];

  return `${SHORT_MONTHS[startIndex]} to ${SHORT_MONTHS[endIndex]}`;
}

export default function DestinationsPage({ notify }) {
  const [destinations, setDestinations] = useState([]);
  const [loadingDestinations, setLoadingDestinations] = useState(true);
  const [search, setSearch] = useState("");

  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const [countriesList, setCountriesList] = useState([]);
  const [fetchingCountries, setFetchingCountries] = useState(false);
  const [fetchingDetails, setFetchingDetails] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState(EMPTY_FORM);
  const [seasonStart, setSeasonStart] = useState("April");
  const [seasonEnd, setSeasonEnd] = useState("October");
  const [sliderFiles, setSliderFiles] = useState([]);
  const [existingSliderImages, setExistingSliderImages] = useState([]);
  const [attractions, setAttractions] = useState(DEFAULT_ATTRACTIONS);

  const loadDestinations = async () => {
    setLoadingDestinations(true);
    try {
      const data = await api.listDestinations();
      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.destinations)
        ? data.destinations
        : Array.isArray(data?.data)
        ? data.data
        : [];
      setDestinations(list);
    } catch (err) {
      console.error(err);
      setDestinations([]);
      if (notify) {
        notify("danger", err.message || "Failed to load destinations from database");
      }
    } finally {
      setLoadingDestinations(false);
    }
  };

  useEffect(() => {
    loadDestinations();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, pageSize]);

  useEffect(() => {
    let cancelled = false;

    const loadCountries = async () => {
      setFetchingCountries(true);

      try {
        const response = await fetch(
          `${API_BASE}/destinations/countries`
        );

        if (!response.ok) {
          throw new Error("Country list unavailable");
        }

        const data = await response.json();

        const countries = Array.isArray(data?.countries)
          ? data.countries
              .map((country) => country?.name || country)
              .filter(Boolean)
              .sort((a, b) => a.localeCompare(b))
          : [];

        if (!cancelled) {
          setCountriesList(
            countries.length ? countries : FALLBACK_COUNTRIES
          );
        }
      } catch {
        // Silently use the local fallback.
        if (!cancelled) {
          setCountriesList(FALLBACK_COUNTRIES);
        }
      } finally {
        if (!cancelled) {
          setFetchingCountries(false);
        }
      }
    };

    loadCountries();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleCountrySelect = async (event) => {
    const countryName = event.target.value;

    if (!countryName) {
      setFormData((prev) => ({
        ...prev,
        name: "",
        capital: "",
        currency: "",
        languages_spoken: [],
        time_zone: "",
        driving_side: "Left",
        calling_code: "",
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      name: countryName,
    }));

    setFetchingDetails(true);

    try {
      const response = await fetch(
        `${API_BASE}/destinations/countries/${encodeURIComponent(
          countryName
        )}`
      );

      if (!response.ok) {
        throw new Error("Country details unavailable");
      }

      const data = await response.json();
      const country = data?.country;

      if (!country) {
        throw new Error("Country details unavailable");
      }

      setFormData((prev) => ({
        ...prev,
        name: country.name || countryName,
        capital: country.capital || "",
        currency: country.currency || "",
        languages_spoken: Array.isArray(country.languages)
          ? country.languages
          : [],
        time_zone: country.time_zone || "",
        driving_side: country.driving_side || "Left",
        calling_code: country.calling_code || "",
      }));
    } catch {
      // Do not show an error message.
      // The selected country remains in the form and the user can
      // continue entering details manually.
      setFormData((prev) => ({
        ...prev,
        name: countryName,
      }));
    } finally {
      setFetchingDetails(false);
    }
  };

  const handleOpenAdd = () => {
    setFormData({ ...EMPTY_FORM, travel_tips: ["", "", "", ""] });
    setSeasonStart("April");
    setSeasonEnd("October");
    setSliderFiles([]);
    setExistingSliderImages([]);
    setAttractions([
      { name: "", file: null, image: "" },
      { name: "", file: null, image: "" },
    ]);
    setCurrentStep(1);
    setIsModalOpen(true);
  };

  const handleOpenEdit = async (destination) => {
    const id = getDestinationId(destination);
    if (!id) {
      notify?.("danger", "Destination ID not found");
      return;
    }

    try {
      let details = destination;
      try {
        const response = await api.getDestinationById(id);
        if (response?.destination) details = response.destination;
        else if (response?.data) details = response.data;
        else if (response) details = response;
      } catch (error) {
        console.warn("Using list data for editing:", error);
      }

      const season = getSeasonFromDestination(details);
      const tips = parseArray(details?.travel_tips);
      const languages = parseArray(details?.languages_spoken);

      while (tips.length < 4) tips.push("");

      const attrNames = parseArray(details?.attraction_names);
      const attrImages = parseArray(details?.attraction_images);
      
      let existingAttractions = attrNames.map((name, index) => ({
        name,
        file: null,
        image: attrImages[index] || "",
      }));

      if (existingAttractions.length === 0 && Array.isArray(details?.attractions)) {
        existingAttractions = details.attractions.map((item) => ({
          name: typeof item === "string" ? item : item?.attraction_name || "",
          file: null,
          image: item?.image || "",
        }));
      }

      if (existingAttractions.length === 0) {
        existingAttractions = [
          { name: "", file: null, image: "" },
          { name: "", file: null, image: "" },
        ];
      }

      const sliderImgs = parseArray(details?.hero_slider_images);

      setFormData({
        id,
        name: getDestinationName(details),
        capital: details?.capital || "",
        currency: details?.currency || "",
        climate: details?.climate || CLIMATES[0],
        languages_spoken: languages,
        time_zone: details?.time_zone || "",
        driving_side: details?.driving_side || "Left",
        calling_code: details?.calling_code || "",
        about_text: details?.about_text || "",
        is_top_destination: Boolean(details?.is_top_destination),
        travel_tips: tips,
      });

      setSeasonStart(season.start);
      setSeasonEnd(season.end);
      setSliderFiles([]);
      setExistingSliderImages(sliderImgs);
      setAttractions(existingAttractions);
      setCurrentStep(1);
      setIsModalOpen(true);
    } catch (error) {
      console.error(error);
      notify?.("danger", error.message || "Could not open destination");
    }
  };

  const handleClose = () => {
    if (isSubmitting) return;
    setIsModalOpen(false);
    setCurrentStep(1);
  };

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleTipChange = (index, value) => {
    setFormData((prev) => {
      const updated = [...prev.travel_tips];
      updated[index] = value;
      return { ...prev, travel_tips: updated };
    });
  };

  const addTip = () => {
    setFormData((prev) => ({
      ...prev,
      travel_tips: [...prev.travel_tips, ""],
    }));
  };

  const removeTip = (index) => {
    setFormData((prev) => ({
      ...prev,
      travel_tips: prev.travel_tips.filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const handleAttractionChange = (index, field, value) => {
    setAttractions((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const addAttraction = () => {
    setAttractions((prev) => [...prev, { name: "", file: null, image: "" }]);
  };

  const removeAttraction = (index) => {
    setAttractions((prev) => prev.filter((_, itemIndex) => itemIndex !== index));
  };

  const validateStep = () => {
    if (currentStep === 1) {
      if (!formData.name.trim()) {
        notify?.("warning", "Please select a country.");
        return false;
      }
      if (!formData.capital.trim()) {
        notify?.("warning", "Please enter the capital city.");
        return false;
      }
      if (!formData.currency.trim()) {
        notify?.("warning", "Please enter the currency.");
        return false;
      }
    }

    if (currentStep === 2) {
      if (!formData.about_text.trim()) {
        notify?.("warning", "Please enter destination information.");
        return false;
      }
    }

    return true;
  };

  const handleNext = (e) => {
    if (e) e.preventDefault();
    if (!validateStep()) return;
    setCurrentStep((prev) => Math.min(prev + 1, 3));
  };

  const handleBack = (e) => {
    if (e) e.preventDefault();
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (event) => {
    if (event) event.preventDefault();
    if (currentStep !== 3) return;
    if (!validateStep()) return;

    setIsSubmitting(true);

    try {
      let uploadedSliderImages = [...existingSliderImages];
      if (sliderFiles && sliderFiles.length > 0) {
        for (const file of Array.from(sliderFiles)) {
          const uploadRes = await api.uploadImage(file);
          if (uploadRes?.imageUrl || uploadRes?.url) {
            uploadedSliderImages.push(uploadRes.imageUrl || uploadRes.url);
          }
        }
      }

      const validAttractions = attractions.filter((a) => a.name && a.name.trim());
      const attractionNames = [];
      const attractionImages = [];

      for (const a of validAttractions) {
        let imageUrl = a.image || null;
        if (a.file) {
          const uploadRes = await api.uploadImage(a.file);
          if (uploadRes?.imageUrl || uploadRes?.url) {
            imageUrl = uploadRes.imageUrl || uploadRes.url;
          }
        }
        attractionNames.push(a.name.trim());
        attractionImages.push(imageUrl || "");
      }

      // Payload strictly matching schema columns
      const payload = {
        name: formData.name || "Unknown",
        capital: formData.capital || null,
        currency: formData.currency || null,
        climate: formData.climate || CLIMATES[0],
        best_season_to_visit: buildSeason(seasonStart, seasonEnd),
        languages_spoken: formData.languages_spoken || [],
        time_zone: formData.time_zone || null,
        driving_side: formData.driving_side || "Left",
        calling_code: formData.calling_code || null,
        hero_slider_images: uploadedSliderImages,
        about_text: formData.about_text || null,
        travel_tips: formData.travel_tips.filter((tip) => tip.trim() !== ""),
        attraction_names: attractionNames,
        attraction_images: attractionImages,
        destination_type: "international",
        is_top_destination: Boolean(formData.is_top_destination),
      };

      if (formData.id) {
        await api.updateDestinationJSON(formData.id, payload);
        notify?.("success", `"${formData.name}" updated successfully!`);
      } else {
        await api.createDestinationJSON(payload);
        notify?.("success", `"${formData.name}" added successfully!`);
      }

      await loadDestinations();
      setIsModalOpen(false);
      setCurrentStep(1);
    } catch (error) {
      console.error("Submit Error:", error);
      notify?.("danger", error.message || "Failed to save destination");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (destination) => {
    const id = getDestinationId(destination);
    const name = getDestinationName(destination);

    if (!id) {
      notify?.("danger", "Destination ID not found");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete "${name}"?\n\nThis action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      await api.deleteDestination(id);
      setDestinations((prev) => prev.filter((item) => getDestinationId(item) !== id));
      notify?.("success", `"${name}" deleted successfully!`);
    } catch (error) {
      console.error(error);
      notify?.("danger", error.message || "Failed to delete destination");
    }
  };

  const filteredDestinations = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return destinations;

    return destinations.filter((destination) => {
      const name = getDestinationName(destination).toLowerCase();
      const capital = String(destination?.capital || "").toLowerCase();
      const climate = String(destination?.climate || "").toLowerCase();
      const season = String(destination?.best_season_to_visit || "").toLowerCase();

      return (
        name.includes(query) ||
        capital.includes(query) ||
        climate.includes(query) ||
        season.includes(query)
      );
    });
  }, [destinations, search]);

  const paginatedDestinations = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredDestinations.slice(startIndex, startIndex + pageSize);
  }, [filteredDestinations, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredDestinations.length / pageSize) || 1;

  return (
    <div className="destination-admin-page">
      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
        <div>
          <h2 className="fw-bold text-trip-navy mb-1">Destinations</h2>
          <p className="text-muted mb-0">
            Manage countries, travel information, seasons and attractions.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-trip-gold px-4 py-2 fw-semibold"
          onClick={handleOpenAdd}
        >
          <i className="bi bi-plus-lg me-2"></i>Add Destination
        </button>
      </div>

      {/* CARD */}
      <div className="card admin-card border-0 shadow-sm">
        <div className="card-header bg-white p-3">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div>
              <h5 className="fw-bold text-trip-navy mb-1">Destination List</h5>
              <span className="text-muted small">
                {filteredDestinations.length} destination
                {filteredDestinations.length !== 1 ? "s" : ""}
              </span>
            </div>

            <div className="d-flex align-items-center gap-3 flex-wrap">
              <div className="d-flex align-items-center gap-2">
                <span className="text-muted small fw-semibold">Show:</span>
                <select
                  className="form-select form-select-sm"
                  style={{ width: "80px" }}
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={30}>30</option>
                </select>
              </div>

              <div className="position-relative" style={{ minWidth: "240px" }}>
                <i
                  className="bi bi-search position-absolute"
                  style={{ left: "13px", top: "11px", color: "#7b8798" }}
                ></i>
                <input
                  type="text"
                  className="form-control ps-5"
                  placeholder="Search destinations..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="card-body p-0">
          {loadingDestinations ? (
            <div className="text-center py-5">
              <div className="spinner-border text-trip-navy mb-3" role="status"></div>
              <div className="text-muted">Loading destinations...</div>
            </div>
          ) : filteredDestinations.length === 0 ? (
            <div className="text-center py-5 px-3">
              <h5 className="fw-bold text-trip-navy">No destinations found</h5>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead>
                  <tr>
                    <th style={{ width: "85px" }}>Image</th>
                    <th>Destination</th>
                    <th>Capital</th>
                    <th>Climate</th>
                    <th>Best Season</th>
                    <th>Currency</th>
                    <th className="text-end" style={{ width: "130px" }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedDestinations.map((destination) => {
                    const id = getDestinationId(destination);
                    const image = getDestinationImage(destination);
                    const season = destination?.best_season_to_visit || "Year-Round";

                    return (
                      <tr key={id}>
                        <td>
                          <img
                            src={image}
                            alt={getDestinationName(destination)}
                            style={{
                              width: "68px",
                              height: "50px",
                              objectFit: "cover",
                              borderRadius: "10px",
                              border: "1px solid #e5eaf0",
                            }}
                          />
                        </td>
                        <td>
                          <div className="fw-bold text-trip-navy">
                            {getDestinationName(destination)}
                            {Boolean(destination?.is_top_destination) && (
                              <span className="badge bg-warning text-dark ms-2" style={{ fontSize: "10px" }}>
                                TOP
                              </span>
                            )}
                          </div>
                          <div className="small text-muted">
                            {destination?.calling_code || "No calling code"}
                          </div>
                        </td>
                        <td className="small">{destination?.capital || "-"}</td>
                        <td>
                          <span className="badge badge-soft-info px-2 py-1">
                            {destination?.climate || "-"}
                          </span>
                        </td>
                        <td>
                          <span className="badge badge-soft-warning px-2 py-1">
                            <i className="bi bi-calendar3 me-1"></i>
                            {season}
                          </span>
                        </td>
                        <td className="small fw-semibold">
                          {destination?.currency || "-"}
                        </td>
                        <td>
                          <div className="d-flex justify-content-end gap-2">
                            <button
                              type="button"
                              className="btn btn-action-icon"
                              onClick={() => handleOpenEdit(destination)}
                            >
                              <i className="bi bi-pencil text-trip-navy"></i>
                            </button>
                            <button
                              type="button"
                              className="btn btn-action-icon"
                              onClick={() => handleDelete(destination)}
                            >
                              <i className="bi bi-trash text-danger"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* FOOTER PAGINATION */}
        {filteredDestinations.length > 0 && (
          <div className="card-footer bg-white p-3 d-flex justify-content-between align-items-center flex-wrap gap-2">
            <span className="text-muted small">
              Showing {(currentPage - 1) * pageSize + 1} to{" "}
              {Math.min(currentPage * pageSize, filteredDestinations.length)} of{" "}
              {filteredDestinations.length} destinations
            </span>
            <div className="d-flex gap-1">
              <button
                className="btn btn-sm btn-outline-secondary"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  className={`btn btn-sm ${
                    currentPage === page ? "btn-primary" : "btn-outline-secondary"
                  }`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              ))}
              <button
                className="btn btn-sm btn-outline-secondary"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(5, 20, 40, 0.65)", backdropFilter: "blur(4px)" }}
        >
          <div className="modal-dialog modal-xl modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header">
                <div>
                  <h5 className="modal-title fw-bold mb-1">
                    {formData.id ? "Edit Destination" : "Add Destination"}
                  </h5>
                  <small className="text-muted">
                    {formData.id ? "Update destination information" : "Create a new destination"}
                  </small>
                </div>
                <button type="button" className="btn-close" onClick={handleClose} disabled={isSubmitting}></button>
              </div>

              <div className="destination-step-header">
                <div className="destination-step-items">
                  <div className={`destination-step ${currentStep >= 1 ? "active" : ""}`}>
                    <span className="destination-step-number">1</span>
                    <div><strong>Basic</strong></div>
                  </div>
                  <div className={`destination-step ${currentStep >= 2 ? "active" : ""}`}>
                    <span className="destination-step-number">2</span>
                    <div><strong>Travel Info</strong></div>
                  </div>
                  <div className={`destination-step ${currentStep >= 3 ? "active" : ""}`}>
                    <span className="destination-step-number">3</span>
                    <div><strong>Media & Tips</strong></div>
                  </div>
                </div>
              </div>

              {/* Prevent browser default submit; explicitly handle submit on step 3 */}
              <form onSubmit={(e) => {
                e.preventDefault();
                if (currentStep === 3) {
                  handleSubmit(e);
                } else {
                  handleNext(e);
                }
              }}>
                <div className="modal-body p-4">
                  {currentStep === 1 && (
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">Country / Destination</label>
                        <select
                          className="form-select"
                          value={formData.name}
                          onChange={handleCountrySelect}
                          required
                          disabled={fetchingCountries || fetchingDetails}
                        >
                          <option value="">
                            {fetchingCountries ? "Loading countries..." : fetchingDetails ? "Loading country details..." : "-- Select Country --"}
                          </option>
                          {countriesList.map((country) => (
                            <option key={country} value={country}>
                              {country}
                            </option>
                          ))}
                        </select>
                        {fetchingDetails && (
                          <div className="d-flex align-items-center gap-2 mt-2 text-muted small">
                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                            Fetching country information...
                          </div>
                        )}
                      </div>

                      <div className="col-md-6">
                        <label className="form-label fw-semibold">Capital City</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.capital}
                          onChange={(e) => updateField("capital", e.target.value)}
                          required
                        />
                      </div>

                      <div className="col-12">
                        <div className="form-check form-switch bg-light p-3 rounded border">
                          <input
                            className="form-check-input me-2"
                            type="checkbox"
                            role="switch"
                            id="isTopDestinationToggle"
                            checked={formData.is_top_destination}
                            onChange={(e) => updateField("is_top_destination", e.target.checked)}
                          />
                          <label className="form-check-label fw-semibold" htmlFor="isTopDestinationToggle">
                            Mark as Top Destination
                          </label>
                          <small className="text-muted d-block">
                            Featured on home page hero sections.
                          </small>
                        </div>
                      </div>

                      <div className="col-md-4">
                        <label className="form-label fw-semibold">Currency</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.currency}
                          onChange={(e) => updateField("currency", e.target.value)}
                          required
                        />
                      </div>

                      <div className="col-md-4">
                        <label className="form-label fw-semibold">Calling Code</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.calling_code}
                          onChange={(e) => updateField("calling_code", e.target.value)}
                        />
                      </div>

                      <div className="col-md-4">
                        <label className="form-label fw-semibold">Driving Side</label>
                        <select
                          className="form-select"
                          value={formData.driving_side}
                          onChange={(e) => updateField("driving_side", e.target.value)}
                        >
                          <option value="Left">Left</option>
                          <option value="Right">Right</option>
                        </select>
                      </div>

                      <div className="col-md-7">
                        <label className="form-label fw-semibold">Languages Spoken</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.languages_spoken.join(", ")}
                          onChange={(e) =>
                            updateField(
                              "languages_spoken",
                              e.target.value.split(",").map((i) => i.trim()).filter(Boolean)
                            )
                          }
                        />
                      </div>

                      <div className="col-md-5">
                        <label className="form-label fw-semibold">Time Zone</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.time_zone}
                          onChange={(e) => updateField("time_zone", e.target.value)}
                        />
                      </div>
                    </div>
                  )}

                  {currentStep === 2 && (
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">Climate</label>
                        <select
                          className="form-select"
                          value={formData.climate}
                          onChange={(e) => updateField("climate", e.target.value)}
                        >
                          {CLIMATES.map((climate) => (
                            <option key={climate} value={climate}>{climate}</option>
                          ))}
                        </select>
                      </div>

                      <div className="col-md-6">
                        <label className="form-label fw-semibold">Best Season Preview</label>
                        <div className="best-season-preview p-2 border rounded bg-light">
                          <strong>{buildSeason(seasonStart, seasonEnd)}</strong>
                        </div>
                      </div>

                      <div className="col-md-6">
                        <label className="form-label fw-semibold">Season Starts</label>
                        <select
                          className="form-select"
                          value={seasonStart}
                          onChange={(e) => setSeasonStart(e.target.value)}
                        >
                          {MONTHS.map((m) => (<option key={m} value={m}>{m}</option>))}
                        </select>
                      </div>

                      <div className="col-md-6">
                        <label className="form-label fw-semibold">Season Ends</label>
                        <select
                          className="form-select"
                          value={seasonEnd}
                          onChange={(e) => setSeasonEnd(e.target.value)}
                        >
                          {MONTHS.map((m) => (<option key={m} value={m}>{m}</option>))}
                        </select>
                      </div>

                      <div className="col-12">
                        <label className="form-label fw-semibold">About Destination</label>
                        <textarea
                          rows={5}
                          className="form-control"
                          value={formData.about_text}
                          onChange={(e) => updateField("about_text", e.target.value)}
                          required
                        />
                      </div>

                      {/* Travel Tips section mapping to travel_tips array column */}
                      <div className="col-12 mt-3">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <label className="form-label fw-semibold mb-0">Travel Tips</label>
                          <button type="button" className="btn btn-outline-secondary btn-sm" onClick={addTip}>
                            Add Tip
                          </button>
                        </div>
                        {formData.travel_tips.map((tip, index) => (
                          <div className="input-group mb-2" key={index}>
                            <input
                              type="text"
                              className="form-control"
                              placeholder={`Tip #${index + 1}`}
                              value={tip}
                              onChange={(e) => handleTipChange(index, e.target.value)}
                            />
                            {formData.travel_tips.length > 1 && (
                              <button
                                type="button"
                                className="btn btn-outline-danger"
                                onClick={() => removeTip(index)}
                              >
                                Remove
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {currentStep === 3 && (
                    <div>
                      <div className="mb-4">
                        <label className="form-label fw-semibold">Hero Slider Images</label>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          className="form-control"
                          onChange={(e) => setSliderFiles(e.target.files)}
                        />
                      </div>

                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <h6 className="fw-bold text-trip-navy mb-0">Top Attractions</h6>
                        <button
                          type="button"
                          className="btn btn-outline-secondary btn-sm"
                          onClick={addAttraction}
                        >
                          Add Attraction
                        </button>
                      </div>

                      <div className="row g-3">
                        {attractions.map((attraction, index) => (
                          <div className="col-12" key={index}>
                            <div className="attraction-admin-card p-3 border rounded bg-light">
                              <div className="d-flex gap-3 align-items-start">
                                <div className="attraction-number">{index + 1}</div>
                                <div className="flex-grow-1">
                                  <input
                                    type="text"
                                    className="form-control mb-2"
                                    value={attraction.name}
                                    onChange={(e) => handleAttractionChange(index, "name", e.target.value)}
                                    placeholder="Attraction Name"
                                  />
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="form-control"
                                    onChange={(e) =>
                                      handleAttractionChange(index, "file", e.target.files?.[0] || null)
                                    }
                                  />
                                </div>
                                {attractions.length > 1 && (
                                  <button
                                    type="button"
                                    className="btn btn-outline-danger btn-sm"
                                    onClick={() => removeAttraction(index)}
                                  >
                                    Remove
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="modal-footer bg-white border-top p-3">
                  <div className="w-100 d-flex justify-content-between align-items-center">
                    <div>
                      {currentStep > 1 && (
                        <button type="button" className="btn btn-outline-secondary px-4" onClick={handleBack}>
                          Back
                        </button>
                      )}
                    </div>
                    <div className="d-flex gap-2">
                      <button type="button" className="btn btn-outline-secondary px-4" onClick={handleClose}>
                        Cancel
                      </button>
                      {currentStep < 3 ? (
                        <button type="button" className="btn btn-primary px-4" onClick={handleNext}>
                          Next
                        </button>
                      ) : (
                        <button type="submit" className="btn btn-success px-4" disabled={isSubmitting}>
                          {isSubmitting ? "Saving..." : "Save Destination"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}