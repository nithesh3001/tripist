import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaMapMarkerAlt, FaArrowRight } from "react-icons/fa";

import { api } from "../Admin/api";
import "./Desti.css";

const Destinations = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ============================================================
  // FETCH DESTINATIONS
  // ============================================================

  useEffect(() => {
    const loadDestinations = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.listDestinations();

        console.log("Destination API Response:", response);

        setDestinations(response?.destinations || []);
      } catch (err) {
        console.error("Error fetching destinations:", err);
        setError("Failed to load destinations.");
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
    // If backend eventually provides destination_type,
    // use it automatically.
    if (item.destination_type) {
      return item.destination_type.toLowerCase();
    }

    // Temporary classification based on your current data
    if (item.name?.toLowerCase() === "india") {
      return "domestic";
    }

    return "international";
  };

  // ============================================================
  // FILTER DESTINATIONS
  // ============================================================

  const filteredDestinations = destinations.filter((item) => {
    if (activeTab === "all") {
      return true;
    }

    return getDestinationType(item) === activeTab;
  });

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="destinations-wrapper">

      {/* ======================================================
          HERO
      ====================================================== */}

      <section className="desti-hero">
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
              From backyard getaways to bucket-list adventures, browse
              our full collection of curated escapes.
            </p>

            <p className="hero-subdesc">
              Discover unique itineraries, overwater retreats, and
              cultural journeys across India and around the globe.
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
              style={{ maxWidth: "650px" }}
            >
              Discover handpicked destinations across India and
              around the world. Explore destination details,
              attractions and available travel packages.
            </p>

          </div>


          {/* ==================================================
              FILTER BUTTONS
          ================================================== */}

          <div className="d-flex justify-content-center flex-wrap gap-2 mb-5">

            {/* ALL */}

            <button
              type="button"
              className={`custom-pill-btn px-4 py-2 rounded-pill ${
                activeTab === "all" ? "active" : ""
              }`}
              onClick={() => setActiveTab("all")}
            >
              All Destinations
            </button>


            {/* DOMESTIC */}

            <button
              type="button"
              className={`custom-pill-btn px-4 py-2 rounded-pill ${
                activeTab === "domestic" ? "active" : ""
              }`}
              onClick={() => setActiveTab("domestic")}
            >
              Domestic
            </button>


            {/* INTERNATIONAL */}

            <button
              type="button"
              className={`custom-pill-btn px-4 py-2 rounded-pill ${
                activeTab === "international" ? "active" : ""
              }`}
              onClick={() => setActiveTab("international")}
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

              <p className="text-danger">
                {error}
              </p>

            </div>

          )}


          {/* ==================================================
              NO DESTINATIONS
          ================================================== */}

          {!loading &&
            !error &&
            filteredDestinations.length === 0 && (

              <div className="text-center py-5">

                <h5>
                  No destinations found.
                </h5>

                <p className="text-muted">
                  No destinations are available in this category.
                </p>

              </div>

            )}


          {/* ==================================================
              DESTINATION CARDS
          ================================================== */}

          {!loading &&
            !error &&
            filteredDestinations.length > 0 && (

              <div className="row g-4">

                {filteredDestinations.map((item) => {

                  // --------------------------------------------
                  // IMAGE
                  // --------------------------------------------

                  const image =
                    item.hero_slider_images?.[0] ||
                    "https://placehold.co/600x400?text=Destination";


                  // --------------------------------------------
                  // TYPE
                  // --------------------------------------------

                  const destinationType =
                    getDestinationType(item);


                  // --------------------------------------------
                  // DISPLAY TYPE
                  // --------------------------------------------

                  const displayType =
                    destinationType === "domestic"
                      ? "DOMESTIC"
                      : "INTERNATIONAL";


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
                            alt={item.name || "Destination"}
                            referrerPolicy="no-referrer"
                            onError={(e) => {
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

                          <p className="card-desc text-secondary">

                            {item.about_text ||
                              "Explore this beautiful destination and discover unforgettable travel experiences."}

                          </p>


                          {/* =================================
                              BEST SEASON
                          ================================= */}

                          {/* {item.best_season_to_visit && (

                            <div className="mb-3">

                              <small className="text-uppercase text-muted fw-semibold">

                                Best Time To Visit

                              </small>

                              <div className="fw-medium">

                                {item.best_season_to_visit}

                              </div>

                            </div>

                          )} */}


                          {/* =================================
                              CURRENCY
                          ================================= */}

                          {/* {item.currency && (

                            <div className="mb-2">

                              <small className="text-muted">

                                Currency:{" "}

                              </small>

                              <span className="fw-medium">

                                {item.currency}

                              </span>

                            </div>

                          )} */}


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

                })}

              </div>

            )}

        </div>

      </section>

    </div>
  );
};

export default Destinations;