import axios from "axios";

async function getLatLong(city, state) {
  const url = `https://nominatim.openstreetmap.org/search?city=${encodeURIComponent(
    city
  )}&state=${encodeURIComponent(state)}&format=json&limit=1`;

  const response = await axios.get(url, {
    headers: { "User-Agent": "NodeApp" } // required
  });

  if (response.data.length > 0) {
    const { lat, lon } = response.data[0];
    return { lat, lon };
  } else {
    throw new Error("Location not found");
  }
}

getLatLong("Chennai", "Tamil Nadu")
  .then(console.log)
  .catch(console.error);
