import { pageMetadata } from "@/lib/pageMetadata";

export const metadata = pageMetadata(
  "Projects",
  "Projects built by members of GDG on Campus NMIT.",
  "/projects"
);

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
