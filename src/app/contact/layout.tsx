import { pageMetadata } from "@/lib/pageMetadata";

export const metadata = pageMetadata(
  "Contact Us",
  "Get in touch with GDG on Campus NMIT, Nitte Meenakshi Institute of Technology, Yelahanka, Bengaluru.",
  "/contact"
);

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
