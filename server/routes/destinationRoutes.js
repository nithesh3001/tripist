
const express = require("express");
const router = express.Router();

const db = require("../db");
const pool = db.pool || db;

// ============================================================
// HELPER - PostgreSQL text arrays
// ============================================================

function toPgArray(val) {
  if (!val) return [];

  if (Array.isArray(val)) {
    return val
      .map((item) =>
        typeof item === "object" && item !== null
          ? item.name ||
            item.attraction_name ||
            JSON.stringify(item)
          : String(item).trim()
      )
      .filter(Boolean);
  }

  if (typeof val === "string") {
    return val
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [String(val)];
}

// ============================================================
// REST COUNTRIES CONFIGURATION
// ============================================================

const REST_COUNTRIES_BASE =
  "https://api.restcountries.com/countries/v5";

const REST_COUNTRIES_KEY =
  process.env.REST_COUNTRIES_API_KEY || "rc_live_demo";

// ============================================================
// GET ALL COUNTRIES
// GET /api/destinations/countries
// ============================================================

router.get("/countries", async (req, res) => {
  try {
    const url =
      `${REST_COUNTRIES_BASE}` +
      `?api-key=${REST_COUNTRIES_KEY}` +
      `&limit=100`;

    console.log("Loading countries from REST Countries...");

    const response = await fetch(url);
    const result = await response.json();

    console.log(
      "REST Countries list status:",
      response.status
    );

    if (!response.ok) {
      console.error(
        "REST Countries list error:",
        result
      );

      return res.status(200).json({
        success: false,
        countries: [],
        message: "Country list unavailable",
      });
    }

    const objects =
      result?.data?.objects || [];

    const countries = objects
      .map((country) => {
        return (
          country?.names?.common ||
          country?.name?.common ||
          country?.common_name ||
          null
        );
      })
      .filter(Boolean)
      .sort((a, b) =>
        a.localeCompare(b)
      );

    return res.status(200).json({
      success: true,
      count: countries.length,
      countries,
    });

  } catch (error) {
    console.error(
      "Country list server error:",
      error.message
    );

    return res.status(200).json({
      success: false,
      countries: [],
      message: "Country list unavailable",
    });
  }
});

// ============================================================
// GET COUNTRY DETAILS
// GET /api/destinations/countries/:name
// ============================================================

router.get("/countries/:name", async (req, res) => {
  try {
    const countryName =
      decodeURIComponent(req.params.name);

    if (!countryName) {
      return res.status(200).json({
        success: false,
        country: null,
      });
    }

    console.log(
      "Fetching country details:",
      countryName
    );

    const url =
      `${REST_COUNTRIES_BASE}/names.common/` +
      `${encodeURIComponent(countryName)}` +
      `?api-key=${REST_COUNTRIES_KEY}`;

    const response = await fetch(url);
    const result = await response.json();

    console.log(
      "REST Countries country status:",
      response.status
    );

    if (!response.ok) {
      console.error(
        "REST Countries country error:",
        result
      );

      return res.status(200).json({
        success: false,
        country: null,
      });
    }

    const objects =
      result?.data?.objects || [];

    if (
      !Array.isArray(objects) ||
      objects.length === 0
    ) {
      return res.status(200).json({
        success: false,
        country: null,
      });
    }

    // ========================================================
    // PREFER EXACT COUNTRY MATCH
    // ========================================================

    const country =
      objects.find(
        (item) =>
          (
            item?.names?.common ||
            item?.name?.common ||
            ""
          ).toLowerCase() ===
          countryName.toLowerCase()
      ) || objects[0];

    // ========================================================
    // COUNTRY NAME
    // ========================================================

    const name =
      country?.names?.common ||
      country?.name?.common ||
      countryName;

    // ========================================================
    // OFFICIAL NAME
    // ========================================================

    const officialName =
      country?.names?.official ||
      country?.name?.official ||
      name;

    // ========================================================
    // CAPITAL
    // ========================================================

    let capital = "";

    if (Array.isArray(country?.capital)) {
      capital =
        country.capital[0] || "";
    } else if (
      typeof country?.capital === "string"
    ) {
      capital =
        country.capital;
    }

    // ========================================================
    // CURRENCY
    // ========================================================

    let currency = "";

    const currencies =
      country?.currencies;

    if (Array.isArray(currencies)) {
      const firstCurrency =
        currencies[0];

      if (firstCurrency) {
        const currencyCode =
          firstCurrency.code ||
          firstCurrency.iso_4217 ||
          "";

        const currencyName =
          firstCurrency.name || "";

        if (
          currencyName &&
          currencyCode
        ) {
          currency =
            `${currencyName} (${currencyCode})`;
        } else {
          currency =
            currencyName ||
            currencyCode;
        }
      }

    } else if (
      currencies &&
      typeof currencies === "object"
    ) {
      const currencyKeys =
        Object.keys(currencies);

      if (currencyKeys.length > 0) {
        const currencyCode =
          currencyKeys[0];

        const currencyData =
          currencies[currencyCode];

        const currencyName =
          typeof currencyData === "string"
            ? currencyData
            : currencyData?.name || "";

        if (
          currencyName &&
          currencyCode
        ) {
          currency =
            `${currencyName} (${currencyCode})`;
        } else {
          currency =
            currencyName ||
            currencyCode;
        }
      }
    }

    // ========================================================
    // LANGUAGES
    // ========================================================

    let languages = [];

    if (Array.isArray(country?.languages)) {
      languages =
        country.languages
          .map((language) => {
            if (
              typeof language === "string"
            ) {
              return language;
            }

            return language?.name;
          })
          .filter(Boolean);

    } else if (
      country?.languages &&
      typeof country.languages === "object"
    ) {
      languages =
        Object.values(
          country.languages
        )
          .map((language) => {
            if (
              typeof language === "string"
            ) {
              return language;
            }

            return language?.name;
          })
          .filter(Boolean);
    }

    // ========================================================
    // TIME ZONE
    // ========================================================

    let timeZone = "UTC";

    if (
      Array.isArray(country?.timezones) &&
      country.timezones.length > 0
    ) {
      timeZone =
        country.timezones[0];
    }

    // ========================================================
    // DRIVING SIDE
    // ========================================================

    let drivingSide = "Right";

    if (country?.car?.side) {
      drivingSide =
        country.car.side
          .charAt(0)
          .toUpperCase() +
        country.car.side.slice(1);
    }

    // ========================================================
    // CALLING CODE
    // ========================================================

    let callingCode = "";

    if (country?.idd?.root) {
      const root =
        country.idd.root;

      const suffix =
        country.idd.suffixes?.[0] ||
        "";

      callingCode =
        `${root}${suffix}`;
    }

    // ========================================================
    // RETURN COUNTRY DETAILS
    // ========================================================

    return res.status(200).json({
      success: true,

      country: {
        name: name,

        official_name:
          officialName,

        capital:
          capital,

        currency:
          currency,

        languages_spoken:
          languages,

        time_zone:
          timeZone,

        driving_side:
          drivingSide,

        calling_code:
          callingCode,
      },
    });

  } catch (error) {
    console.error(
      "Country details server error:",
      error.message
    );

    return res.status(200).json({
      success: false,
      country: null,
    });
  }
});

// ============================================================
// GET DESTINATIONS
//
// GET /api/destinations
// GET /api/destinations?type=domestic
// GET /api/destinations?type=international
// GET /api/destinations?top=true
// GET /api/destinations?top=true&type=domestic
//
// IMPORTANT:
// Only ONE router.get("/") should exist.
// ============================================================

router.get("/", async (req, res) => {
  try {
    const { type, top } = req.query;

    let query =
      `SELECT * FROM destinations`;

    const params = [];
    const conditions = [];

    // ========================================================
    // FILTER BY DESTINATION TYPE
    // ========================================================

    if (type) {
      conditions.push(
        `LOWER(destination_type) = $${params.length + 1}`
      );

      params.push(
        type.toLowerCase()
      );
    }

    // ========================================================
    // FILTER ONLY TOP DESTINATIONS
    // ========================================================

    if (
      top === "true" ||
      top === "1"
    ) {
      conditions.push(
        `is_top_destination = true`
      );
    }

    // ========================================================
    // ADD WHERE CLAUSE
    // ========================================================

    if (conditions.length > 0) {
      query +=
        ` WHERE ` +
        conditions.join(" AND ");
    }

    // ========================================================
    // SORT
    // ========================================================

    query +=
      ` ORDER BY created_at DESC`;

    console.log(
      "Get destinations query:",
      query
    );

    console.log(
      "Get destinations params:",
      params
    );

    // ========================================================
    // DATABASE QUERY
    // ========================================================

    const result =
      await pool.query(
        query,
        params
      );

    // ========================================================
    // RESPONSE
    // ========================================================

    return res.status(200).json({
      success: true,
      count: result.rows.length,
      destinations: result.rows,
    });

  } catch (error) {
    console.error(
      "Get destinations error:",
      error
    );

    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// ============================================================
// GET SINGLE DESTINATION BY ID
// GET /api/destinations/:id
// ============================================================

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result =
      await pool.query(
        `SELECT * FROM destinations WHERE id = $1`,
        [id]
      );

    if (
      result.rows.length === 0
    ) {
      return res.status(404).json({
        success: false,
        error: "Destination not found",
      });
    }

    return res.status(200).json({
      success: true,
      destination:
        result.rows[0],
    });

  } catch (error) {
    console.error(
      "Get destination by ID error:",
      error
    );

    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// ============================================================
// CREATE DESTINATION
// POST /api/destinations
// ============================================================

router.post("/", async (req, res) => {
  try {
    const body = req.body;

    // ========================================================
    // BASIC DETAILS
    // ========================================================

    const name =
      body.name ||
      body.destinationName ||
      body.country;

    if (!name) {
      return res.status(400).json({
        success: false,
        error:
          "Destination name is required",
      });
    }

    const capital =
      body.capital ||
      body.location ||
      null;

    const currency =
      body.currency ||
      null;

    const climate =
      body.climate ||
      null;

    const bestSeason =
      body.best_season_to_visit ||
      body.bestSeason ||
      null;

    const languagesSpoken =
      toPgArray(
        body.languages_spoken ||
        body.languagesSpoken
      );

    const timeZone =
      body.time_zone ||
      body.timeZone ||
      null;

    const drivingSide =
      body.driving_side ||
      body.drivingSide ||
      null;

    const callingCode =
      body.calling_code ||
      body.callingCode ||
      null;

    // ========================================================
    // HERO IMAGES
    // ========================================================

    const heroSliderImages =
      toPgArray(
        body.hero_slider_images ||
        body.heroSliderImages ||
        body.coverImage
      );

    // ========================================================
    // ABOUT
    // ========================================================

    const aboutText =
      body.about_text ||
      body.aboutText ||
      body.description ||
      null;

    // ========================================================
    // TRAVEL TIPS
    // ========================================================

    const travelTips =
      toPgArray(
        body.travel_tips ||
        body.travelTips
      );

    // ========================================================
    // DESTINATION TYPE
    // ========================================================

    const destinationType = (
      body.destination_type ||
      body.destinationType ||
      "domestic"
    ).toLowerCase();

    // ========================================================
    // TOP DESTINATION
    // ========================================================

    const isTopDestination =
      body.is_top_destination !== undefined
        ? Boolean(
            body.is_top_destination
          )
        : body.isTopDestination !== undefined
        ? Boolean(
            body.isTopDestination
          )
        : false;

    // ========================================================
    // ATTRACTIONS
    // ========================================================

    let attractionNames = [];
    let attractionImages = [];

    if (
      Array.isArray(
        body.attractions
      )
    ) {
      attractionNames =
        body.attractions
          .map(
            (a) =>
              a.attraction_name ||
              a.name
          )
          .filter(Boolean);

      attractionImages =
        body.attractions
          .map(
            (a) => a.image
          )
          .filter(Boolean);

    } else {
      attractionNames =
        toPgArray(
          body.attraction_names ||
          body.attractionNames
        );

      attractionImages =
        toPgArray(
          body.attraction_images ||
          body.attractionImages
        );
    }

    // ========================================================
    // INSERT
    // ========================================================

    const result =
      await pool.query(
        `
        INSERT INTO destinations (
          name,
          capital,
          currency,
          climate,
          best_season_to_visit,
          languages_spoken,
          time_zone,
          driving_side,
          calling_code,
          hero_slider_images,
          about_text,
          travel_tips,
          attraction_names,
          attraction_images,
          destination_type,
          is_top_destination
        )
        VALUES (
          $1,
          $2,
          $3,
          $4,
          $5,
          $6,
          $7,
          $8,
          $9,
          $10,
          $11,
          $12,
          $13,
          $14,
          $15,
          $16
        )
        RETURNING *
        `,
        [
          name,
          capital,
          currency,
          climate,
          bestSeason,
          languagesSpoken,
          timeZone,
          drivingSide,
          callingCode,
          heroSliderImages,
          aboutText,
          travelTips,
          attractionNames,
          attractionImages,
          destinationType,
          isTopDestination,
        ]
      );

    return res.status(201).json({
      success: true,
      message:
        "Destination created successfully",
      destination:
        result.rows[0],
    });

  } catch (error) {
    console.error(
      "Create destination error:",
      error
    );

    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// ============================================================
// UPDATE DESTINATION
// PUT /api/destinations/:id
// ============================================================

router.put("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // ========================================================
    // GET EXISTING DESTINATION
    // ========================================================

    const existing =
      await pool.query(
        `SELECT * FROM destinations WHERE id = $1`,
        [id]
      );

    if (
      existing.rows.length === 0
    ) {
      return res.status(404).json({
        success: false,
        error:
          "Destination not found",
      });
    }

    const ex =
      existing.rows[0];

    const body =
      req.body;

    // ========================================================
    // BASIC DETAILS
    // ========================================================

    const name =
      body.name ||
      body.destinationName ||
      ex.name;

    const capital =
      body.capital !== undefined
        ? body.capital
        : body.location !== undefined
        ? body.location
        : ex.capital;

    const currency =
      body.currency !== undefined
        ? body.currency
        : ex.currency;

    const climate =
      body.climate !== undefined
        ? body.climate
        : ex.climate;

    const bestSeason =
      body.best_season_to_visit !== undefined
        ? body.best_season_to_visit
        : body.bestSeason !== undefined
        ? body.bestSeason
        : ex.best_season_to_visit;

    // ========================================================
    // LANGUAGES
    // ========================================================

    const languagesSpoken =
      body.languages_spoken !== undefined ||
      body.languagesSpoken !== undefined
        ? toPgArray(
            body.languages_spoken ||
            body.languagesSpoken
          )
        : ex.languages_spoken;

    // ========================================================
    // OTHER DETAILS
    // ========================================================

    const timeZone =
      body.time_zone !== undefined
        ? body.time_zone
        : body.timeZone !== undefined
        ? body.timeZone
        : ex.time_zone;

    const drivingSide =
      body.driving_side !== undefined
        ? body.driving_side
        : body.drivingSide !== undefined
        ? body.drivingSide
        : ex.driving_side;

    const callingCode =
      body.calling_code !== undefined
        ? body.calling_code
        : body.callingCode !== undefined
        ? body.callingCode
        : ex.calling_code;

    // ========================================================
    // HERO IMAGES
    // ========================================================

    const heroSliderImages =
      body.hero_slider_images !== undefined ||
      body.heroSliderImages !== undefined
        ? toPgArray(
            body.hero_slider_images ||
            body.heroSliderImages
          )
        : ex.hero_slider_images;

    // ========================================================
    // ABOUT
    // ========================================================

    const aboutText =
      body.about_text !== undefined
        ? body.about_text
        : body.aboutText !== undefined
        ? body.aboutText
        : body.description !== undefined
        ? body.description
        : ex.about_text;

    // ========================================================
    // TRAVEL TIPS
    // ========================================================

    const travelTips =
      body.travel_tips !== undefined ||
      body.travelTips !== undefined
        ? toPgArray(
            body.travel_tips ||
            body.travelTips
          )
        : ex.travel_tips;

    // ========================================================
    // DESTINATION TYPE
    // ========================================================

    const destinationType = (
      body.destination_type !== undefined
        ? body.destination_type
        : body.destinationType !== undefined
        ? body.destinationType
        : ex.destination_type ||
          "domestic"
    ).toLowerCase();

    // ========================================================
    // TOP DESTINATION
    // ========================================================

    const isTopDestination =
      body.is_top_destination !== undefined
        ? Boolean(
            body.is_top_destination
          )
        : body.isTopDestination !== undefined
        ? Boolean(
            body.isTopDestination
          )
        : ex.is_top_destination;

    // ========================================================
    // ATTRACTIONS
    // ========================================================

    let attractionNames =
      ex.attraction_names;

    let attractionImages =
      ex.attraction_images;

    if (
      Array.isArray(
        body.attractions
      )
    ) {
      attractionNames =
        body.attractions
          .map(
            (a) =>
              a.attraction_name ||
              a.name
          )
          .filter(Boolean);

      attractionImages =
        body.attractions
          .map(
            (a) => a.image
          )
          .filter(Boolean);

    } else {

      if (
        body.attraction_names !==
          undefined ||
        body.attractionNames !==
          undefined
      ) {
        attractionNames =
          toPgArray(
            body.attraction_names ||
            body.attractionNames
          );
      }

      if (
        body.attraction_images !==
          undefined ||
        body.attractionImages !==
          undefined
      ) {
        attractionImages =
          toPgArray(
            body.attraction_images ||
            body.attractionImages
          );
      }
    }

    // ========================================================
    // UPDATE
    // ========================================================

    const result =
      await pool.query(
        `
        UPDATE destinations
        SET
          name = $1,
          capital = $2,
          currency = $3,
          climate = $4,
          best_season_to_visit = $5,
          languages_spoken = $6,
          time_zone = $7,
          driving_side = $8,
          calling_code = $9,
          hero_slider_images = $10,
          about_text = $11,
          travel_tips = $12,
          attraction_names = $13,
          attraction_images = $14,
          destination_type = $15,
          is_top_destination = $16,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $17
        RETURNING *
        `,
        [
          name,
          capital,
          currency,
          climate,
          bestSeason,
          languagesSpoken,
          timeZone,
          drivingSide,
          callingCode,
          heroSliderImages,
          aboutText,
          travelTips,
          attractionNames,
          attractionImages,
          destinationType,
          isTopDestination,
          id,
        ]
      );

    return res.status(200).json({
      success: true,
      message:
        "Destination updated successfully",
      destination:
        result.rows[0],
    });

  } catch (error) {
    console.error(
      "Update destination error:",
      error
    );

    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// ============================================================
// DELETE DESTINATION
// DELETE /api/destinations/:id
// ============================================================

router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result =
      await pool.query(
        `DELETE FROM destinations WHERE id = $1 RETURNING *`,
        [id]
      );

    if (
      result.rows.length === 0
    ) {
      return res.status(404).json({
        success: false,
        error:
          "Destination not found",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Destination deleted successfully",
      destination:
        result.rows[0],
    });

  } catch (error) {
    console.error(
      "Delete destination error:",
      error
    );

    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// ============================================================
// EXPORT ROUTER
// ============================================================

module.exports = router;

