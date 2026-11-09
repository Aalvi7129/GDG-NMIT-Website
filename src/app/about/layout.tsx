import { pageMetadata } from "@/lib/pageMetadata";

export const metadata = pageMetadata(
  "About Us",
  "Who we are: GDG on Campus NMIT, a student developer community at Nitte Meenakshi Institute of Technology, Bengaluru.",
  "/about"
);

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
