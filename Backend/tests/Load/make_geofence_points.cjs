// Makes the check-in positions for the geo-fence accuracy test (non-functional test 5). It only writes two CSV
// files; it does not contact the server.
//
//   node tests/Load/make_geofence_points.cjs
//
// geofence_points.csv         exact positions, like the Android emulator's GPS
// geofence_points_noise5m.csv the same positions with 5 m of GPS error (standard deviation), like a real phone
//
// Each row: distance (m), latitude, longitude, expected answer (200 = in range, 300 = out of range).
// 50 positions per distance, spread evenly around the fence centre. The fence is "Load Test Fence":
// 15.4709 N, 120.6035 E, radius 50 m. The earth radius is the same 6,371,000 m the server uses, so "49 m"
// here is 49 m there.
const fs = require('fs');
const path = require('path');

const CENTER = { lat: 15.4709, lon: 120.6035, radius: 50 };
const INSIDE = [0, 10, 25, 40, 49];
const OUTSIDE = [51, 60, 80, 100, 150];
const PER_DISTANCE = 50;
const NOISE_M = 5;

const R = 6371000;
const rad = Math.PI / 180;

function destination(lat, lon, distM, bearingDeg) {
  const d = distM / R, b = bearingDeg * rad, p1 = lat * rad, l1 = lon * rad;
  const p2 = Math.asin(Math.sin(p1) * Math.cos(d) + Math.cos(p1) * Math.sin(d) * Math.cos(b));
  const l2 = l1 + Math.atan2(Math.sin(b) * Math.sin(d) * Math.cos(p1), Math.cos(d) - Math.sin(p1) * Math.sin(p2));
  return [p2 / rad, l2 / rad];
}

// a seeded random number, so the files come out the same every time
let seed = 20261020;
const random = () => ((seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296);
const gauss = () => Math.sqrt(-2 * Math.log(random() || 1e-12)) * Math.cos(2 * Math.PI * random());

function jitter(lat, lon, metres) {
  if (!metres) return [lat, lon];
  const east = gauss() * metres, north = gauss() * metres;
  return [lat + north / R / rad, lon + east / (R * Math.cos(lat * rad)) / rad];
}

function build(noise) {
  const lines = [];
  [...INSIDE, ...OUTSIDE].forEach((d, n) => {
    for (let i = 0; i < PER_DISTANCE; i++) {
      const bearing = (i * 360) / PER_DISTANCE + n * 3; // evenly around; a small turn per distance
      const [lat, lon] = jitter(...destination(CENTER.lat, CENTER.lon, d, bearing), noise);
      lines.push(`${d},${lat.toFixed(9)},${lon.toFixed(9)},${d <= CENTER.radius ? 200 : 300}`);
    }
  });
  return lines.join('\n') + '\n';
}

fs.writeFileSync(path.join(__dirname, 'geofence_points.csv'), build(0));
fs.writeFileSync(path.join(__dirname, 'geofence_points_noise5m.csv'), build(NOISE_M));
console.log(`wrote ${(INSIDE.length + OUTSIDE.length) * PER_DISTANCE} positions to geofence_points.csv and geofence_points_noise5m.csv`);
