const express = require("express");
const db = require("../db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

function mapRow(row) {
  if (!row) return row;
  return {
    id: row.id,
    name: row.name,
    price: row.price,
    image: row.image,
    category: row.category,
    country: row.country,
    state: row.state,
    destinationId: row.destination_id,
    isTopPackage: Boolean(row.isTopPackage ?? row.is_top_package ?? false),
    durationDays: row.duration_days,
    durationNights: row.duration_nights,
    shortDescription: row.short_description,
    longDescription: row.long_description,
    status: row.status || "active",
    validUntil: row.valid_until,
    inclusions: row.inclusions || [],
    exclusions: row.exclusions || [],
    itinerary: typeof row.itinerary === "string" ? JSON.parse(row.itinerary) : row.itinerary || [],
    faqs: typeof row.faqs === "string" ? JSON.parse(row.faqs) : row.faqs || [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// GET /api/packages?sort=name&order=asc&destination_id=1
router.get("/", async (req, res) => {
  try {
    const sortableFields = {
      name: "name",
      price: "price",
      category: "category",
      country: "country",
      createdAt: "created_at",
    };
    const sortField = sortableFields[req.query.sort] || "created_at";
    const order = req.query.order === "asc" ? "ASC" : "DESC";

    let query = `SELECT * FROM packages`;
    const values = [];

    // Parse destination_id or destinationId from query parameters
    const rawDestId = req.query.destination_id || req.query.destinationId;

    if (rawDestId) {
      const parsedDestId = parseInt(rawDestId, 10);
      if (!isNaN(parsedDestId)) {
        query += ` WHERE destination_id = $1`;
        values.push(parsedDestId);
      }
    }

    query += ` ORDER BY ${sortField} ${order}`;

    const result = await db.query(query, values);
    res.json(result.rows.map(mapRow));
  } catch (err) {
    console.error("Get packages error:", err);
    res.status(500).json({ error: "Failed to fetch packages" });
  }
});

// GET /api/packages/:id
router.get("/:id", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM packages WHERE id = $1", [
      req.params.id,
    ]);
    if (!result.rows[0]) {
      return res.status(404).json({ error: "Package not found" });
    }
    res.json(mapRow(result.rows[0]));
  } catch (err) {
    console.error("Get package details error:", err);
    res.status(500).json({ error: "Failed to fetch package details" });
  }
});
// POST /api/packages
router.post("/", requireAuth, async (req, res) => {
  try {
    const p = req.body;
    const shortDesc = p.shortDescription || p.short_description;
    const longDesc = p.longDescription || p.long_description;
    const durationDays = p.durationDays || p.duration_days;
    const durationNights = p.durationNights || p.duration_nights;
    const validUntil = p.validUntil || p.valid_until;
    
    // Convert destination ID to integer or null
    const rawDestId = p.destinationId || p.destination_id;
    const destinationId = rawDestId ? parseInt(rawDestId, 10) : null;
    
    const isTopPackage = p.isTopPackage ?? p.is_top_package ?? false;

    if (!p.name || !shortDesc) {
      return res
        .status(400)
        .json({ error: "Name and short description are required" });
    }

    const result = await db.query(
      `INSERT INTO packages
        (name, price, image, category, country, state, duration_days, duration_nights, 
         short_description, long_description, is_top_package, status, valid_until, 
         inclusions, exclusions, itinerary, faqs, destination_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
       RETURNING *`,
      [
        p.name,
        p.price || null,
        p.image || null,
        p.category || "Special Package",
        p.country || null,
        p.state || null,
        durationDays || null,
        durationNights || null,
        shortDesc,
        longDesc || null,
        isTopPackage,
        p.status || "active",
        validUntil || null,
        p.inclusions || [],
        p.exclusions || [],
        JSON.stringify(p.itinerary || []),
        JSON.stringify(p.faqs || []),
        isNaN(destinationId) ? null : destinationId,
      ]
    );
    res.status(201).json(mapRow(result.rows[0]));
  } catch (err) {
    console.error("Create package error:", err);
    res.status(500).json({ error: "Failed to create package" });
  }
});

// PUT /api/packages/:id
router.put("/:id", requireAuth, async (req, res) => {
  try {
    const p = req.body;
    const shortDesc = p.shortDescription || p.short_description;
    const longDesc = p.longDescription || p.long_description;
    const durationDays = p.durationDays || p.duration_days;
    const durationNights = p.durationNights || p.duration_nights;
    const validUntil = p.validUntil || p.valid_until;
    
    // Convert destination ID to integer or null
    const rawDestId = p.destinationId || p.destination_id;
    const destinationId = rawDestId ? parseInt(rawDestId, 10) : null;

    const isTopPackage = p.isTopPackage ?? p.is_top_package ?? false;

    const result = await db.query(
      `UPDATE packages SET
        name=$1, price=$2, image=$3, category=$4, country=$5, state=$6,
        duration_days=$7, duration_nights=$8, short_description=$9, long_description=$10,
        is_top_package=$11, status=$12, valid_until=$13, inclusions=$14, exclusions=$15,
        itinerary=$16, faqs=$17, destination_id=$18, updated_at = now()
       WHERE id = $19 RETURNING *`,
      [
        p.name,
        p.price || null,
        p.image || null,
        p.category || "Special Package",
        p.country || null,
        p.state || null,
        durationDays || null,
        durationNights || null,
        shortDesc,
        longDesc || null,
        isTopPackage,
        p.status || "active",
        validUntil || null,
        p.inclusions || [],
        p.exclusions || [],
        JSON.stringify(p.itinerary || []),
        JSON.stringify(p.faqs || []),
        isNaN(destinationId) ? null : destinationId,
        req.params.id,
      ]
    );

    if (!result.rows[0]) return res.status(404).json({ error: "Package not found" });
    res.json(mapRow(result.rows[0]));
  } catch (err) {
    console.error("Update package error:", err);
    res.status(500).json({ error: "Failed to update package" });
  }
});

// DELETE /api/packages/:id
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const result = await db.query("DELETE FROM packages WHERE id = $1 RETURNING id", [
      req.params.id,
    ]);
    if (!result.rows[0]) return res.status(404).json({ error: "Package not found" });
    res.json({ message: "Package deleted" });
  } catch (err) {
    console.error("Delete package error:", err);
    res.status(500).json({ error: "Failed to delete package" });
  }
});

module.exports = router;