const express = require('express');
const router = express.Router();

// Dynamically import node-fetch (required for ESM modules in CommonJS)
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const getGeoCoords = async (location) => {
  if (!location) return null;

  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`;

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "yourappname@example.com", // Required by Nominatim
      },
    });

    const data = await response.json();
    if (data.length === 0) return null;

    const { lat, lon } = data[0];
    return { lat, lon };
  } catch (err) {
    console.error("Error fetching geocoordinates:", err);
    return null;
  }
};

const geocoords =  async (location) => {
  try {
     // Use query, not body for GET
    if (!location) return res.status(400).json({ error: "Location is required" });

    const geo = await getGeoCoords(location);
    if (!geo) return res.status(404).json({ error: "Location not found" });

    return(geo);
  } catch (err) {
    // res.status(500).json({ error: "Internal server error" });
    return(err)
  }
};

module.exports = geocoords;
