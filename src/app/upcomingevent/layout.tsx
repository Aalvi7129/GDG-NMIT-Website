import { pageMetadata } from "@/lib/pageMetadata";

export const metadata = pageMetadata(
  "Upcoming Event",
  "What's next at GDG on Campus NMIT: dates, venue and how to register.",
  "/upcomingevent"
);

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
