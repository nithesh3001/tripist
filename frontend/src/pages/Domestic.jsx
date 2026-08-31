import React, { useState, useEffect } from "react";
import DomesticRegion from "../Components/DomesticRegion";
import { api } from "../Admin/api";
import "./Domestic.css";

const Domestic = () => {
  const [domesticData, setDomesticData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(20);

  useEffect(() => {
    const loadDomesticDestinations = async () => {
      try {
        setLoading(true);
        const res = await api.listDestinations();
        const rawList = Array.isArray(res)
          ? res
          : res?.destinations || res?.data || [];

        const domesticOnly = rawList.filter((item) => {
          const type = String(
            item.destination_type ??
            item.destinationType ??
            item.category ??
            item.type ??
            ""
          ).trim().toLowerCase();

          return type === "domestic";
        });

        setDomesticData(domesticOnly);
      } catch (err) {
        console.error("Error fetching domestic destinations:", err);
        setDomesticData([]);
      } finally {
        setLoading(false);
      }
    };

    loadDomesticDestinations();
  }, []);

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 4);
  };

  return (
    <div className="domestic-page-wrapper">
      <section className="domestic-hero-banner">
        <div className="domestic-hero-overlay"></div>
        <div className="container position-relative text-start z-2">
          <p className="domestic-hero-subtitle">DISCOVER INDIA</p>
          <h1 className="domestic-hero-title">
            Domestic holidays that feel
            <br />
            like home away from home.
          </h1>
          <p className="domestic-hero-description">
            From misty backwaters to snow-capped valleys — handpicked destinations
            that show off the very best of India.
          </p>
        </div>
      </section>

      <section className="py-5">
        <div className="container">
          <div className="text-center mb-5">
            <span
              className="text-uppercase fw-bold text-warning font-xs"
              style={{ fontSize: "12px", letterSpacing: "1.5px" }}
            >
              Explore Incredible India
            </span>
            <h2 className="fw-bold mt-2 mb-3 display-6">
              Popular Domestic Destinations
            </h2>
            <p className="text-secondary mx-auto mb-0" style={{ maxWidth: "620px" }}>
              Discover iconic travel spots across the nation crafted for unforgettable memories.
            </p>
          </div>

          {loading ? (
            <div className="text-center py-5">Loading destinations...</div>
          ) : (
            <div className="row g-4">
              {domesticData.slice(0, visibleCount).map((item) => (
                <div key={item.id} className="col-12 col-sm-6 col-md-4 col-lg-3">
                  <a
                    href={`/destination-details?id=${item.id}`}
                    className="text-decoration-none d-block h-100"
                  >
                    <div className="card custom-dest-card border-0 h-100 shadow-sm overflow-hidden">
                      <div className="card-img-container  position-relative">
                        <img
                          src={item.hero_slider_images?.[0] || item.image || item.imageUrl || "https://via.placeholder.com/600"}
                          className="card-img w-100 h-100 object-fit-cover"
                          alt={item.name || "Destination"}
                          referrerPolicy="no-referrer"
                        />
                        <span className="badge tag-badge-gold position-absolute top-0 start-0 m-3">
                          {(item.destination_type || "DOMESTIC").toUpperCase()}
                        </span>

                        <div className="card-img-overlay-bottom">
                          <div className="location-pin d-flex align-items-center gap-1">
                            <svg
                              width="12"
                              height="12"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.5"
                            >
                              <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z" />
                              <circle cx="12" cy="10" r="3" />
                            </svg>
                            <span>{item.capital || "India"}</span>
                          </div>
                          <h3 className="overlay-card-title m-0 mt-1">{item.name}</h3>
                        </div>
                        
                      </div>
                    </div>
                  </a>
                </div>
              ))}
            </div>
          )}

          {visibleCount < domesticData.length && (
            <div className="text-center mt-5">
              <button onClick={handleLoadMore} className="btn-load-more">
                Load More Destinations
              </button>
            </div>
          )}
        </div>
      </section>
      <DomesticRegion />
    </div>
  );
};

export default Domestic;