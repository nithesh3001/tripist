import React, { useState } from "react";
import "./CreatorProgram.css";
import { api } from "../Admin/api";
import { 
  Camera, 
  Video, 
  FileText, 
  Image as ImageIcon, 
  Film, 
  Compass, 
  MapPin, 
  Utensils, 
  Send, 
  UserCheck, 
  Users, 
  Award 
} from "lucide-react";

const creatorTypes = [
  ["Travel Influencers", "Create engaging travel content across Instagram, Facebook, TikTok, Threads, and other social platforms.", <Camera className="creator-icon-styled" size={24} />],
  ["YouTubers", "Produce destination guides, travel documentaries, vlogs, itinerary videos, and travel experiences.", <Video className="creator-icon-styled" size={24} />],
  ["Travel Bloggers", "Write destination articles, travel tips, itineraries, hotel reviews, and cultural stories.", <FileText className="creator-icon-styled" size={24} />],
  ["Photographers", "Capture landscapes, hotels, resorts, cultural experiences, wildlife, food, and local life.", <ImageIcon className="creator-icon-styled" size={24} />],
  ["Videographers & Filmmakers", "Create cinematic destination films, promotional videos, and storytelling content.", <Film className="creator-icon-styled" size={24} />],
  ["Drone Creators", "Showcase destinations from unique aerial perspectives, subject to local drone regulations.", <Compass className="creator-icon-styled" size={24} />],
  ["Adventure Creators", "Feature trekking, diving, safaris, camping, road trips, cycling, and outdoor experiences.", <MapPin className="creator-icon-styled" size={24} />],
  ["Food & Culture Creators", "Highlight regional cuisine, traditions, festivals, local markets, and authentic cultural experiences.", <Utensils className="creator-icon-styled" size={24} />]
];

const benefits = [
  ["Travel Opportunities", "Invitations to selected FAM trips, destination campaigns, and hosted travel experiences."],
  ["Brand Collaborations", "Work with Tripist Holidays and travel partners on promotional campaigns."],
  ["Destination Access", "Explore hotels, resorts, attractions, tourism boards, and local experiences through collaborations."],
  ["Grow Your Audience", "Reach wider audiences through collaborations, featured content, and cross-promotion."],
  ["Build Your Portfolio", "Create high-quality travel content while expanding your professional portfolio."],
  ["Community", "Join a growing network of travel storytellers, photographers, filmmakers, and creators."]
];

const collaborationOpportunities = [
  "Destination Promotions", "Hotel & Resort Reviews", "Cruise Experiences",
  "Road Trips", "Adventure Tourism", "Pilgrimage Journeys", "Family Holidays",
  "Luxury Travel", "Food Experiences", "Cultural Festivals", "Tourism Campaigns",
  "Travel Tips & Guides", "Photography Projects", "Video Productions",
  "Social Media Campaigns"
];

const creatorQualities = [
  "Authentic storytelling",
  "High-quality content",
  "Professionalism",
  "Creativity",
  "Positive community engagement",
  "Consistent publishing",
  "Respect for local cultures and environments"
];

const creatorBenefits = [
  "Sponsored or discounted travel experiences",
  "Complimentary stays (campaign-dependent)",
  "Familiarization (FAM) trips",
  "Destination collaborations",
  "Event invitations",
  "Early access to campaigns",
  "Social media features",
  "Portfolio-building opportunities",
  "Long-term collaboration opportunities"
];

const expertiseOptions = [
  "Travel", "Luxury Travel", "Adventure", "Family Travel", "Food", "Wildlife",
  "Hotels & Resorts", "Cruises", "Photography", "Videography", "Drone",
  "Lifestyle", "Pilgrimage", "Culture & Heritage"
];

const interestOptions = [
  "Destination Campaigns", "Hotel Reviews", "Tourism Board Campaigns",
  "Brand Partnerships", "Event Coverage", "Press Trips", "FAM Trips",
  "Social Media Campaigns", "Video Production", "Photography Projects"
];

const initialForm = {
  fullName: "",
  email: "",
  mobile: "",
  country: "",
  city: "",
  creatorName: "",
  primaryCategory: "",
  instagram: "",
  youtube: "",
  facebook: "",
  blog: "",
  linkedin: "",
  portfolio: "",
  audienceCountry: "",
  followers: "",
  monthlyReach: "",
  engagementRate: "",
  expertise: [],
  interests: [],
  about: "",
  mediaKit: null
};

export default function CreatorProgram() {
  const [form, setForm] = useState(initialForm);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (event) => {
    const { name, value, files } = event.target;
    setForm((current) => ({
      ...current,
      [name]: files ? files[0] : value
    }));
  };

  const handleCheckbox = (name, value) => {
    setForm((current) => {
      const exists = current[name].includes(value);
      return {
        ...current,
        [name]: exists
          ? current[name].filter((item) => item !== value)
          : [...current[name], value]
      };
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const formData = new FormData();

      Object.keys(form).forEach((key) => {
        if (key === "expertise" || key === "interests") {
          formData.append(key, JSON.stringify(form[key]));
        } else if (form[key] !== null && form[key] !== undefined) {
          formData.append(key, form[key]);
        }
      });

      await api.sendCreatorApplication(formData);
      setSubmitted(true);
      setForm(initialForm);
      window.scrollTo({ top: document.getElementById("creator-application")?.offsetTop - 50, behavior: "smooth" });
    } catch (err) {
      console.error("Creator application submission error:", err);
      setErrorMsg(err.message || "Failed to submit creator application. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="creator-program">
      {/* Hero */}
      <section className="creator-hero">
        <div className="creator-container creator-hero-inner">
          <span className="creator-eyebrow">Tripist Holidays</span>
          <h1>Tripist Creator Program</h1>
          <p className="creator-tagline">Inspire. Explore. Create.</p>
          <p className="creator-hero-description">
            Turn your passion for travel into meaningful collaborations with Tripist Holidays.
          </p>
          <a href="#creator-application" className="creator-btn creator-btn-gold">
            Apply to Become a Creator
          </a>
        </div>
      </section>

      {/* Introduction */}
      <section className="creator-section">
        <div className="creator-container creator-narrow">
          <span className="creator-section-label">About the Program</span>
          <h2>Share authentic journeys. Inspire people to travel.</h2>
          <p>
            The Tripist Creator Program is designed for passionate travel creators
            who love discovering destinations, sharing authentic experiences, and
            inspiring others to travel.
          </p>
          <p>
            Whether you're an influencer, photographer, blogger, YouTuber,
            filmmaker, or storyteller, we invite you to join our growing community
            of travel creators and help showcase incredible destinations across
            India and around the world.
          </p>
        </div>
      </section>

      {/* Who Can Join */}
      <section className="creator-section creator-section-soft">
        <div className="creator-container">
          <span className="creator-section-label">Who Can Join?</span>
          <h2>Creators from diverse backgrounds are welcome</h2>

          <div className="creator-card-grid">
            {creatorTypes.map(([title, description, icon]) => (
              <article className="creator-info-card" key={title}>
                <div className="creator-card-icon-wrapper">
                  {icon}
                </div>
                <h3>{title}</h3>
                <p>{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="creator-section">
        <div className="creator-container">
          <span className="creator-section-label">Why Join?</span>
          <h2>Why Join the Tripist Creator Program?</h2>

          <div className="creator-benefit-grid">
            {benefits.map(([title, description]) => (
              <article className="creator-benefit-card" key={title}>
                <span className="creator-check">✓</span>
                <div>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Collaboration Opportunities */}
      <section className="creator-section creator-section-navy">
        <div className="creator-container">
          <span className="creator-section-label creator-label-light">
            Collaboration Opportunities
          </span>
          <h2>Depending on your expertise, you may collaborate on</h2>

          <div className="creator-chip-grid">
            {collaborationOpportunities.map((item) => (
              <span className="creator-chip" key={item}>{item}</span>
            ))}
          </div>
        </div>
      </section>

      {/* What We Look For */}
      <section className="creator-section">
        <div className="creator-container creator-two-column">
          <div>
            <span className="creator-section-label">What We're Looking For</span>
            <h2>Passion matters more than follower count</h2>
            <p>
              We value creators who demonstrate authenticity, creativity,
              professionalism, consistent publishing, and respect for local
              cultures and environments.
            </p>
            <p>
              Follower count is not the only factor. We welcome both established
              and emerging creators with original ideas and a genuine passion for travel.
            </p>
          </div>

          <ul className="creator-check-list">
            {creatorQualities.map((item) => (
              <li key={item}>
                <span>✓</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Creator Benefits */}
      <section className="creator-section creator-section-soft">
        <div className="creator-container creator-two-column">
          <div>
            <span className="creator-section-label">Creator Benefits</span>
            <h2>Opportunities designed to help you create</h2>
          </div>

          <ul className="creator-check-list">
            {creatorBenefits.map((item) => (
              <li key={item}>
                <span>✓</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="creator-container creator-note">
          Benefits vary depending on the campaign, destination, and partnership
          agreement. Participation in the program does not guarantee paid
          assignments or complimentary travel.
        </div>
      </section>

      {/* Responsible Content */}
      <section className="creator-section">
        <div className="creator-container creator-responsibility">
          <div>
            <span className="creator-section-label">Responsible Content Creation</span>
            <h2>Create responsibly. Travel respectfully.</h2>
          </div>

          <ul className="creator-check-list">
            <li><span>✓</span>Share honest and authentic experiences.</li>
            <li><span>✓</span>Respect local customs, traditions, and communities.</li>
            <li><span>✓</span>Promote responsible and sustainable tourism.</li>
            <li><span>✓</span>Follow all applicable laws and regulations, including drone and photography permissions.</li>
            <li><span>✓</span>Clearly disclose sponsored collaborations where required by law or platform guidelines.</li>
          </ul>
        </div>
      </section>

      {/* Application Form */}
      <section className="creator-section creator-application-section" id="creator-application">
        <div className="creator-container">
          <div className="creator-form-heading">
            <span className="creator-section-label">Apply Now</span>
            <h2>Apply to Become a Tripist Creator</h2>
            <p>
              Complete the application form below, and our Creator Partnerships
              Team will review your profile.
            </p>
          </div>

          <form className="creator-form" onSubmit={handleSubmit}>
            {/* Personal Information */}
            <fieldset>
              <legend>Personal Information</legend>

              <div className="creator-form-grid">
                <FormField
                  label="Full Name"
                  name="fullName"
                  required
                  value={form.fullName}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                />

                <FormField
                  label="Email Address"
                  name="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                />

                <FormField
                  label="Mobile Number"
                  name="mobile"
                  type="tel"
                  required
                  value={form.mobile}
                  onChange={handleChange}
                  placeholder="+91 XXXXX XXXXX"
                />

                <FormField
                  label="Country"
                  name="country"
                  required
                  value={form.country}
                  onChange={handleChange}
                  placeholder="India"
                />

                <FormField
                  label="City"
                  name="city"
                  required
                  value={form.city}
                  onChange={handleChange}
                  placeholder="Your city"
                />
              </div>
            </fieldset>

            {/* Creator Profile */}
            <fieldset>
              <legend>Creator Profile</legend>

              <div className="creator-form-grid">
                <FormField
                  label="Creator Name / Brand"
                  name="creatorName"
                  value={form.creatorName}
                  onChange={handleChange}
                  placeholder="Your creator or brand name"
                />

                <FormField
                  label="Primary Content Category"
                  name="primaryCategory"
                  value={form.primaryCategory}
                  onChange={handleChange}
                  placeholder="e.g. Travel, Photography, Food"
                />

                <FormField
                  label="Instagram Profile"
                  name="instagram"
                  type="url"
                  value={form.instagram}
                  onChange={handleChange}
                  placeholder="https://instagram.com/..."
                />

                <FormField
                  label="YouTube Channel"
                  name="youtube"
                  type="url"
                  value={form.youtube}
                  onChange={handleChange}
                  placeholder="https://youtube.com/..."
                />

                <FormField
                  label="Facebook Page"
                  name="facebook"
                  type="url"
                  value={form.facebook}
                  onChange={handleChange}
                  placeholder="https://facebook.com/..."
                />

                <FormField
                  label="Blog / Website"
                  name="blog"
                  type="url"
                  value={form.blog}
                  onChange={handleChange}
                  placeholder="https://..."
                />

                <FormField
                  label="LinkedIn Profile"
                  name="linkedin"
                  type="url"
                  value={form.linkedin}
                  onChange={handleChange}
                  placeholder="https://linkedin.com/in/..."
                />

                <FormField
                  label="Portfolio Link"
                  name="portfolio"
                  type="url"
                  value={form.portfolio}
                  onChange={handleChange}
                  placeholder="https://..."
                />
              </div>
            </fieldset>

            {/* Audience Information */}
            <fieldset>
              <legend>Audience Information</legend>

              <div className="creator-form-grid">
                <FormField
                  label="Primary Audience Country"
                  name="audienceCountry"
                  value={form.audienceCountry}
                  onChange={handleChange}
                  placeholder="e.g. India"
                />

                <FormField
                  label="Total Followers / Subscribers"
                  name="followers"
                  value={form.followers}
                  onChange={handleChange}
                  placeholder="e.g. 25,000"
                />

                <FormField
                  label="Average Monthly Reach"
                  name="monthlyReach"
                  value={form.monthlyReach}
                  onChange={handleChange}
                  placeholder="e.g. 100,000"
                />

                <FormField
                  label="Average Engagement Rate"
                  name="engagementRate"
                  value={form.engagementRate}
                  onChange={handleChange}
                  placeholder="e.g. 4.5%"
                />
              </div>
            </fieldset>

            {/* Content Expertise */}
            <fieldset>
              <legend>Content Expertise</legend>
              <p className="creator-field-help">Select all that apply.</p>

              <CheckboxGrid
                name="expertise"
                options={expertiseOptions}
                values={form.expertise}
                onChange={handleCheckbox}
              />
            </fieldset>

            {/* Collaboration Interests */}
            <fieldset>
              <legend>Collaboration Interests</legend>

              <CheckboxGrid
                name="interests"
                options={interestOptions}
                values={form.interests}
                onChange={handleCheckbox}
              />
            </fieldset>

            {/* Additional Information */}
            <fieldset>
              <legend>Additional Information</legend>

              <label className="creator-label" htmlFor="about">
                Tell us about yourself and why you'd like to collaborate with Tripist Holidays.
              </label>

              <textarea
                id="about"
                name="about"
                rows="6"
                value={form.about}
                onChange={handleChange}
                placeholder="Tell us about your content, audience, travel interests, and collaboration ideas..."
              />

              <label className="creator-label" htmlFor="mediaKit">
                Upload Portfolio / Media Kit <span>(Optional)</span>
              </label>

              <input
                id="mediaKit"
                name="mediaKit"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.mp4"
                onChange={handleChange}
                className="creator-file-input"
              />
            </fieldset>

            <div className="creator-submit-area">
              {errorMsg && (
                <p style={{ color: "#dc3545", marginBottom: "15px", fontWeight: "600" }}>
                  ⚠️ {errorMsg}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="creator-btn creator-btn-gold"
              >
                {loading ? "Submitting Application..." : "Submit Application"}
              </button>

              {submitted && (
                <p
                  className="creator-success"
                  style={{
                    color: "#28a745",
                    fontWeight: "bold",
                    marginTop: "16px",
                    padding: "12px",
                    background: "#f0fff4",
                    borderRadius: "6px",
                    border: "1px solid #c6f6d5"
                  }}
                >
                  ✓ Thank you! Your application has been submitted successfully. Our Creator Partnerships Team will review your portfolio and get in touch with you.
                </p>
              )}
            </div>
          </form>
        </div>
      </section>

      {/* Selection Process */}
      <section className="creator-section creator-section-soft">
        <div className="creator-container">
          <span className="creator-section-label">Our Selection Process</span>
          <h2>How it works</h2>

          <div className="creator-process">
            {[
              [<Send size={22} />, "Submit Your Application", "Complete the online Creator Program application."],
              [<UserCheck size={22} />, "Profile Review", "Our team evaluates your content quality, creativity, engagement, and alignment with our brand values."],
              [<Users size={22} />, "Collaboration Discussion", "If shortlisted, we'll connect to discuss suitable campaigns and partnership opportunities."],
              [<Award size={22} />, "Join the Network", "Become part of the Tripist Creator Network and collaborate on future travel campaigns."]
            ].map(([icon, title, description], index) => (
              <article className="creator-process-item" key={index}>
                <div className="creator-process-icon-wrapper">
                  {icon}
                </div>
                <h3>{title}</h3>
                <p>{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="creator-final-cta">
        <div className="creator-container">
          <span className="creator-section-label creator-label-light">
            Let's Tell Extraordinary Travel Stories Together
          </span>
          <h2>Every destination has a story. Every journey creates a memory.</h2>
          <p>
            Join the Tripist Creator Program and help inspire travellers through
            authentic storytelling, stunning visuals, and unforgettable experiences.
          </p>
          <a href="#creator-application" className="creator-btn creator-btn-gold">
            Apply Now
          </a>
        </div>
      </section>
    </main>
  );
}

function FormField({
  label,
  name,
  type = "text",
  required = false,
  value,
  onChange,
  placeholder
}) {
  return (
    <div className="creator-form-field">
      <label className="creator-label" htmlFor={name}>
        {label} {required && <span>*</span>}
      </label>

      <input
        id={name}
        name={name}
        type={type}
        required={required}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
    </div>
  );
}

function CheckboxGrid({ name, options, values, onChange }) {
  return (
    <div className="creator-checkbox-grid">
      {options.map((option) => (
        <label className="creator-checkbox" key={option}>
          <input
            type="checkbox"
            checked={values.includes(option)}
            onChange={() => onChange(name, option)}
          />
          <span>{option}</span>
        </label>
      ))}
    </div>
  );
}