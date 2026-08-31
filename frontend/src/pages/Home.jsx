import React, { useEffect, useState } from "react";
import { PhoneCall, AtSign } from "lucide-react";

import Hero from "../Components/Heroslidr";
import DestinationSlider from "../Components/Toppack";
import HandpickedPackages from "../Components/HandpickedPackages";
import BenefitsSection from "../Components/Benifitssection";

import care from "../assets/info-bnr.svg";
import DestinationSpecialistsCTA from "../Components/DestinationSpecialistsCTA";
import AccreditationPartners from "../Components/AccreditationPartners";
import NotificationCenter from "../Components/NotificationCenter";
import { api } from "../Admin/api";
import ContactModal from "../Components/contactModal";

const Home = () => {
  const [contactInfo, setContactInfo] = useState({
    phone: "+91 96555 96867",
    email: "info@tripistholidays.com",
  });

  useEffect(() => {
    api.getContact()
      .then((data) => {
        if (data && !data.error && Object.keys(data).length > 0) {
          setContactInfo((prev) => ({
            ...prev,
            phone: data.phone || prev.phone,
            email: data.email || prev.email,
          }));
        }
      })
      .catch((err) => console.error("Error fetching support contact info:", err));
  }, []);

  return (
    <div>

      <ContactModal />
      <NotificationCenter />
      {/* Hero Section */}
      <section>
        <Hero />
      </section>

      <div>
        {/* Top Destinations Section */}
        <section className="container py-3">
          <DestinationSlider />
        </section>

        {/* Handpicked Packages Section */}
        <section className="bg-sec py-3">
          <HandpickedPackages />

          {/* 24x7 Customer Support Section */}
          <div className="px-1 pb-1">
            <div className="container my-4 pt-4">
              <div className="position-relative">
                {/* Heading */}
                <div className="text-end pe-5 me-5 mb-3">
                  <h3 className="fw-bold text-dark m-0 fs-md-4 d-md-block d-none ">
                    Hassle Free. 24X7 on-trip assistance
                  </h3>
                </div>

                {/* Support Banner */}
                <div
                  className="rounded-4 p-4 p-md-0 text-white shadow-sm"
                  style={{ backgroundColor: "#3c4252" }}
                >
                  <div className="row align-items-center">
                    {/* Support Illustration */}
                    <div className="col-12 col-md-6 text-center d-flex justify-content-center text-md-start mb-4 mb-md-0">
                      <img
                        src={care}
                        alt="24/7 Support Agent"
                        className="img-fluid"
                        style={{
                          maxHeight: "220px",
                          marginTop: "-60px",
                          filter: "drop-shadow(0px 8px 12px rgba(0,0,0,0.15))",
                        }}
                      />
                    </div>

                    {/* Dynamic Contact Details */}
                    <div className="col-12 col-md-6 d-flex flex-column align-items-center align-items-md-start gap-3 ps-md-4">
                      {/* Phone */}
                      <div className="d-flex align-items-center gap-3">
                        <PhoneCall className="text-white" size={28} />
                        <a
                          href={`tel:${contactInfo.phone}`}
                          className="text-white text-decoration-none fw-bold fs-5"
                        >
                          {contactInfo.phone}
                        </a>
                      </div>

                      {/* Email */}
                      <div className="d-flex align-items-center gap-3">
                        <AtSign className="text-white" size={28} />
                        <a
                          href={`mailto:${contactInfo.email}`}
                          className="text-white text-decoration-none fw-bold fs-5"
                        >
                          {contactInfo.email}
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
                {/* End Support Banner */}
              </div>
            </div>
          </div>
        </section>
      </div>
      <div className="container">
        <DestinationSpecialistsCTA />
      </div>
      {/* Benefits Section */}
      <BenefitsSection />
      <AccreditationPartners />
    </div>
  );
};

export default Home;