import { pageMetadata } from "@/lib/pageMetadata";

export const metadata = pageMetadata(
  "Events",
  "Workshops, hackathons and tech talks hosted by GDG on Campus NMIT.",
  "/event"
);

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
