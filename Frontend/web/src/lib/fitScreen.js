// Fit-to-screen.
//
// The pages were designed on a screen about 1920 px wide. A laptop (a 14-inch HP at 125-150%
// Windows scaling shows only 1280-1536 px) has less room, so the page rearranges itself and
// looks different from the one on the big monitor. Here the whole page is scaled down by
// (screen width / 1920) on narrower screens, so every screen shows the same layout.
//
//   screen >= 1800 px  : untouched (a normal monitor, scale 1)
//   screen <  1800 px  : scale = width / 1920, never below 0.6
//
// It follows the window while it is resized, and the browser's own zoom (Ctrl + / Ctrl -)
// still works: it changes the width the browser reports, and the scale adjusts.
//
// To switch it off on one computer, run this once in the browser console, then reload:
//   localStorage.setItem("fitScreen", "off")      (and "on" to switch it back on)

const DESIGN_WIDTH = 1920;
const NO_SCALE_FROM = 1800;
const MIN_SCALE = 0.6;

const isOff = () => {
  try {
    return localStorage.getItem("fitScreen") === "off";
  } catch {
    return false; // storage blocked: just keep the feature on
  }
};

export function applyFitScreen() {
  const root = document.documentElement;
  const width = window.innerWidth;

  let scale = width >= NO_SCALE_FROM ? 1 : Math.max(MIN_SCALE, width / DESIGN_WIDTH);
  scale = Math.round(scale * 100) / 100; // 2 decimals, so tiny resizes do not keep re-scaling

  if (scale >= 1 || isOff()) {
    root.style.removeProperty("zoom");
    root.style.removeProperty("--fit");
    root.removeAttribute("data-fit");
    return 1;
  }

  root.style.zoom = String(scale);
  // the CSS uses this to correct the parts that are sized by the screen height (index.css)
  root.style.setProperty("--fit", String(scale));
  root.setAttribute("data-fit", "");
  return scale;
}

export function installFitScreen() {
  if (typeof window === "undefined") return;
  applyFitScreen();
  window.addEventListener("resize", applyFitScreen);
}
