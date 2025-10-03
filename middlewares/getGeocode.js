const axios = require("axios");

const getGeocode = async (req, res, next) => {
  try {
    const { country, region, city, street, pincode } = req.body.userDetails;

    // Simplify address: avoid house numbers / sub-streets
    const address = `${city}, ${region}, ${pincode}, ${country}`;
    console.log("Geocode search:", address);

    const url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=1&q=${encodeURIComponent(
      address
    )}`;

    const response = await axios.get(url, {
      headers: { "User-Agent": "machinestreet-app/1.0 (karthi@example.com)" },
    });

    if (response.data.length > 0) {
      const { lat, lon } = response.data[0];
      req.body.userDetails.lat = lat;
      req.body.userDetails.lon = lon;
      console.log("✅ Found coords:", lat, lon);
    } else {
      console.warn("⚠️ No geocode results for:", address);
    }

    next();
  } catch (error) {
    console.error("❌ Geocoding failed:", error.message);
    next();
  }
};

module.exports = getGeocode;
