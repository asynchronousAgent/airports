const express = require("express");
const fs = require("fs");

const router = express.Router();

const extracting = fs.readFileSync("../alaska_airports_II.json");
const data = JSON.parse(extracting);

const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
  let R = 6371;
  let dLat = deg2rad(lat2 - lat1);
  let dLon = deg2rad(lon2 - lon1);
  let a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  let d = R * c;
  return d;
};

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

//to list all airports
router.get("/allAirports", (req, res) => {
  const airports = [];
  data.map((val) => {
    if (val.Type === "AIRPORT") airports.push(val);
  });
  res.status(200).json({
    success: 1,
    message: "All airports has been fetched successfully",
    data: airports,
  });
});

//find the three nearest airports
router.post("/nearest", (req, res) => {
  const FacilityName = req.body.FacilityName;
  const location = {};
  data.map((val) => {
    if (val.FacilityName === FacilityName && val.Type === "AIRPORT") {
      location.Lat = val.Lat;
      location.Lon = val.Lon;
    }
  });
  let distance;
  const airports = [];
  for (let single of data) {
    if (single.Type === "AIRPORT" && single.FacilityName !== FacilityName) {
      distance = getDistanceFromLatLonInKm(
        location.Lat,
        location.Lon,
        single.Lat,
        single.Lon
      );
      single.distanceInKm = distance;
      airports.push(single);
    }
  }
  airports.sort((a, b) => a.distanceInKm - b.distanceInKm);

  res.status(200).json({
    success: 1,
    message: `Three nearest airports of FacilityName ${FacilityName} has been fetched successfully`,
    data: airports.slice(0, 3),
  });
});

//find the distance between any two airports
router.post("/anytwo", (req, res) => {
  const LocationID1 = req.body.LocationID1;
  const LocationID2 = req.body.LocationID2;
  const location = [];
  data.map((val) => {
    if (
      (val.Type === "AIRPORT" && val.LocationID === LocationID1) ||
      val.LocationID === LocationID2
    ) {
      const latnlon = {};
      latnlon.lat = val.Lat;
      latnlon.lon = val.Lon;
      location.push(latnlon);
    }
  });
  const distance = getDistanceFromLatLonInKm(
    location[0].lat,
    location[0].lon,
    location[1].lat,
    location[1].lon
  );
  res.status(200).json({
    success: 1,
    message: `The distance between ${LocationID1} and ${LocationID2} has been fetched successfully`,
    data: distance + " KM",
  });
});

router.get("/each-airport", (req, res) => {
  const airports = [];
  let distance;
  data.map((val) => {
    if (val.Type === "AIRPORT") {
      let nearest = [];
      const nearset_within_100km = {};
      for (let single of data) {
        if (single.Type === "AIRPORT" && val.LocationID !== single.LocationID) {
          distance = getDistanceFromLatLonInKm(
            val.Lat,
            val.Lon,
            single.Lat,
            single.Lon
          );
        }
        if (distance !== undefined && distance <= 100) {
          single.distanceInKm = distance;
          nearest.push(single);
        }
      }
      if (nearest.length > 0) nearset_within_100km.nearest_airport = nearest;
      else
        nearset_within_100km.nearest_airport =
          "No nearest airports found within 100km";
      airports.push([val, nearset_within_100km]);
    }
  });
  res.status(200).json({
    success: 1,
    message: `Nearest airports within 100km has been fetched successfully`,
    data: airports,
  });
});

module.exports = router;
