import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaMapMarkerAlt,
  FaArrowRight,
} from "react-icons/fa";
import banner from "../assets/hero2.jpg";
import { api } from "../Admin/api";
import "./Desti.css";

const Destinations = () => {
  const [activeTab, setActiveTab] = useState("all");

  const [destinations, setDestinations] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  // ============================================================
  // HELPER - PARSE ARRAY
  // ============================================================

  const parseArrayData = (value) => {
    if (!value) {
      return [];
    }

    if (Array.isArray(value)) {
      return value;
    }

    if (typeof value === "string") {
      try {
        const parsed = JSON.parse(value);

        if (Array.isArray(parsed)) {
          return parsed;
        }

        return [value];
      } catch {
        return value
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean);
      }
    }

    return [];
  };

  // ============================================================
  // FETCH DESTINATIONS FROM BACKEND
  // ============================================================

  useEffect(() => {
    const loadDestinations = async () => {
      try {
        setLoading(true);
        setError("");

        console.log(
          "================================="
        );
        console.log(
          "FETCHING DESTINATIONS..."
        );
        console.log(
          "================================="
        );

        const response =
          await api.listDestinations();

        console.log(
          "DESTINATION API RESPONSE:",
          response
        );

        // ======================================================
        // SUPPORT BOTH RESPONSE FORMATS
        // ======================================================

        let destinationList = [];

        // Format 1:
        // [
        //   { id: 1, name: "India" }
        // ]

        if (Array.isArray(response)) {
          destinationList = response;
        }

        // Format 2:
        // {
        //   success: true,
        //   destinations: [...]
        // }

        else if (
          Array.isArray(
            response?.destinations
          )
        ) {
          destinationList =
            response.destinations;
        }

        // Format 3:
        // {
        //   data: {
        //     destinations: [...]
        //   }
        // }

        else if (
          Array.isArray(
            response?.data?.destinations
          )
        ) {
          destinationList =
            response.data.destinations;
        }

        // Format 4:
        // {
        //   data: [...]
        // }

        else if (
          Array.isArray(response?.data)
        ) {
          destinationList =
            response.data;
        }

        console.log(
          "FINAL DESTINATION LIST:",
          destinationList
        );

        console.log(
          "DESTINATION COUNT:",
          destinationList.length
        );

        setDestinations(
          destinationList
        );

        if (
          destinationList.length === 0
        ) {
          console.warn(
            "No destinations returned from backend."
          );
        }
      } catch (err) {
        console.error(
          "❌ ERROR FETCHING DESTINATIONS:",
          err
        );

        console.error(
          "Error message:",
          err?.message
        );

        setDestinations([]);

        setError(
          err?.message ||
          "Failed to load destinations."
        );
      } finally {
        setLoading(false);
      }
    };

    loadDestinations();
  }, []);

  // ============================================================
  // GET DESTINATION TYPE
  // ============================================================

  const getDestinationType = (item) => {
    if (!item) {
      return "international";
    }

    // If backend provides destination_type
    if (item.destination_type) {
      return String(
        item.destination_type
      ).toLowerCase();
    }

    // If backend provides type
    if (item.type) {
      return String(
        item.type
      ).toLowerCase();
    }

    // If backend provides category
    if (item.destination_category) {
      const category =
        String(
          item.destination_category
        ).toLowerCase();

      if (
        category.includes("domestic")
      ) {
        return "domestic";
      }

      if (
        category.includes("international")
      ) {
        return "international";
      }
    }

    // India = domestic
    if (
      item.name?.toLowerCase() ===
      "india"
    ) {
      return "domestic";
    }

    // Everything else = international
    return "international";
  };

  // ============================================================
  // FILTER DESTINATIONS
  // ============================================================

  const filteredDestinations =
    destinations.filter((item) => {
      if (activeTab === "all") {
        return true;
      }

      return (
        getDestinationType(item) ===
        activeTab
      );
    });

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="destinations-wrapper">

      {/* ======================================================
          HERO
      ====================================================== */}

      <section className="desti-hero"  style={{ backgroundImage: `url(${banner})` }}>

        <div className="desti-overlay">

          <div className="container text-center text-md-start">

            <p className="section-tag">
              EXPLORE THE MAP
            </p>

            <h1>
              Every destination we craft —
              <br />
              in one place.
            </h1>

            <p className="hero-desc">
              From backyard getaways to
              bucket-list adventures, browse
              our full collection of curated
              escapes.
            </p>

            <p className="hero-subdesc">
              Discover unique itineraries,
              overwater retreats, and cultural
              journeys across India and around
              the globe.
            </p>

          </div>

        </div>

      </section>

      {/* ======================================================
          DESTINATION SECTION
      ====================================================== */}

      <section className="destinations-gallery py-5">

        <div className="container">

          {/* ==================================================
              HEADING
          ================================================== */}

          <div className="text-center mb-5">

            <span className="section-tag d-block mb-1">
              TAILORED ITINERARIES
            </span>

            <h2 className="fw-bold mt-1 mb-2 display-6">
              Explore Our Destinations
            </h2>

            <p
              className="text-muted mx-auto mb-0"
              style={{
                maxWidth: "650px",
              }}
            >
              Discover handpicked destinations
              across India and around the world.
              Explore destination details,
              attractions and available travel
              packages.
            </p>

          </div>

          {/* ==================================================
              FILTER BUTTONS
          ================================================== */}

          <div className="d-flex justify-content-center flex-wrap gap-2 mb-5">

            {/* ALL */}

            <button
              type="button"
              className={`custom-pill-btn px-4 py-2 rounded-pill ${activeTab === "all"
                  ? "active"
                  : ""
                }`}
              onClick={() =>
                setActiveTab("all")
              }
            >
              All Destinations
            </button>

            {/* DOMESTIC */}

            <button
              type="button"
              className={`custom-pill-btn px-4 py-2 rounded-pill ${activeTab === "domestic"
                  ? "active"
                  : ""
                }`}
              onClick={() =>
                setActiveTab("domestic")
              }
            >
              Domestic
            </button>

            {/* INTERNATIONAL */}

            <button
              type="button"
              className={`custom-pill-btn px-4 py-2 rounded-pill ${activeTab === "international"
                  ? "active"
                  : ""
                }`}
              onClick={() =>
                setActiveTab(
                  "international"
                )
              }
            >
              International
            </button>

          </div>

          {/* ==================================================
              LOADING
          ================================================== */}

          {loading && (

            <div className="text-center py-5">

              <div
                className="spinner-border text-warning"
                role="status"
              >
                <span className="visually-hidden">
                  Loading...
                </span>
              </div>

              <p className="mt-3 text-muted">
                Loading destinations...
              </p>

            </div>

          )}

          {/* ==================================================
              ERROR
          ================================================== */}

          {!loading && error && (

            <div className="text-center py-5">

              <div className="alert alert-danger mx-auto"
                style={{
                  maxWidth: "600px",
                }}
              >
                <strong>
                  Unable to load destinations
                </strong>

                <div className="small mt-2">
                  {error}
                </div>

              </div>

              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() =>
                  window.location.reload()
                }
              >
                Try Again
              </button>

            </div>

          )}

          {/* ==================================================
              NO DESTINATIONS
          ================================================== */}

          {!loading &&
            !error &&
            destinations.length === 0 && (

              <div className="text-center py-5">

                <h5>
                  No destinations found.
                </h5>

                <p className="text-muted">
                  The backend returned no
                  destination records.
                </p>

                <small className="text-muted">
                  Open the browser console and
                  check "DESTINATION API RESPONSE".
                </small>

              </div>

            )}

          {/* ==================================================
              FILTERED EMPTY
          ================================================== */}

          {!loading &&
            !error &&
            destinations.length > 0 &&
            filteredDestinations.length ===
            0 && (

              <div className="text-center py-5">

                <h5>
                  No destinations found.
                </h5>

                <p className="text-muted">
                  No destinations are available
                  in this category.
                </p>

              </div>

            )}

          {/* ==================================================
              DESTINATION CARDS
          ================================================== */}

          {!loading &&
            !error &&
            filteredDestinations.length >
            0 && (

              <div className="row g-4">

                {filteredDestinations.map(
                  (item) => {

                    // ------------------------------------------
                    // IMAGE
                    // ------------------------------------------

                    const imageArray =
                      parseArrayData(
                        item.hero_slider_images
                      );

                    const image =
                      imageArray[0] ||
                      item.hero_image ||
                      item.image_url ||
                      item.image ||
                      "https://placehold.co/600x400?text=Destination";

                    // ------------------------------------------
                    // TYPE
                    // ------------------------------------------

                    const destinationType =
                      getDestinationType(
                        item
                      );

                    // ------------------------------------------
                    // DISPLAY TYPE
                    // ------------------------------------------

                    const displayType =
                      destinationType ===
                        "domestic"
                        ? "DOMESTIC"
                        : "INTERNATIONAL";

                    // ------------------------------------------
                    // DESCRIPTION
                    // ------------------------------------------

                    const description =
                      item.about_text ||
                      item.about ||
                      item.description ||
                      "Explore this beautiful destination and discover unforgettable travel experiences.";

                    // ------------------------------------------
                    // CARD
                    // ------------------------------------------

                    return (

                      <div
                        key={item.id}
                        className="col-12 col-sm-6 col-md-4 col-lg-3"
                      >

                        <div className="card custom-dest-card border-0 h-100 shadow-sm">

                          {/* ==================================
                              IMAGE
                          ================================== */}

                          <div className="card-img-container">

                            <img
                              src={image}
                              className="card-img"
                              alt={
                                item.name ||
                                "Destination"
                              }
                              referrerPolicy="no-referrer"
                              onError={(e) => {

                                e.currentTarget.onerror =
                                  null;

                                e.currentTarget.src =
                                  "https://placehold.co/600x400?text=Destination";

                              }}
                            />

                            {/* =================================
                                TYPE BADGE
                            ================================= */}

                            <span className="badge tag-badge-gold">
                              {displayType}
                            </span>

                            {/* =================================
                                IMAGE OVERLAY
                            ================================= */}

                            <div className="card-img-overlay-bottom">

                              {/* LOCATION */}

                              <div className="location-pin">

                                <FaMapMarkerAlt />

                                <span>
                                  {item.capital ||
                                    item.name ||
                                    "Location"}
                                </span>

                              </div>

                              {/* DESTINATION NAME */}

                              <h3 className="overlay-card-title">

                                {item.name ||
                                  "Destination"}

                              </h3>

                            </div>

                          </div>

                          {/* ==================================
                              CARD BODY
                          ================================== */}

                          <div className="card-body d-flex flex-column p-3">

                            {/* DESCRIPTION */}

                            <p
                              className="card-desc text-secondary"
                              style={{
                                display: "-webkit-box",
                                WebkitLineClamp: 3,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                              }}
                            >
                              {description}
                            </p>



                            {/* =================================
                                BUTTON
                            ================================= */}

                            <div className="mt-auto">

                              <hr className="my-3 text-muted opacity-25" />

                              <Link
                                to={`/destination-details?id=${item.id}`}
                                className="explore-link text-decoration-none d-flex align-items-center justify-content-between"
                              >

                                <span>
                                  Explore Destination
                                </span>

                                <FaArrowRight />

                              </Link>

                            </div>

                          </div>

                        </div>

                      </div>

                    );
                  }
                )}

              </div>

            )}

        </div>

      </section>

    </div>
  );
};

export default Destinations;