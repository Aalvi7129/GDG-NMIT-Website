import { pageMetadata } from "@/lib/pageMetadata";

export const metadata = pageMetadata(
  "Team",
  "Meet the leads and core team behind GDG on Campus NMIT.",
  "/team"
);

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
