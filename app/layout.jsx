import "./globals.css";

export const metadata = {
  title: "Sahyadri | Online Admission Portal",
  description: "Sahyadri College of Engineering & Management B.E. admission portal prototype",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
