import { bannerAlt, bannerSize, renderEventBanner } from "@/lib/eventBanner";

// Rebuilt at most every 10 minutes, so a newly added event shows up on its own
export const revalidate = 600;
export const alt = bannerAlt;
export const size = bannerSize;
export const contentType = "image/png";

export default function Image() {
  return renderEventBanner();
}
