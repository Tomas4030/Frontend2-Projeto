
import { NextResponse } from "next/server";

export const GET = async () => {
  const baseUrl = "https://veydral.vercel.app";


  const staticRoutes = [
  "/",
  "/login",
  "/register",
  "/create-character",
  "/dashboard"];



  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${staticRoutes.
  map(
    (route) => `
  <url>
    <loc>${baseUrl}${route}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`
  ).
  join("")}
</urlset>`;

  return new NextResponse(sitemapXml, {
    headers: {
      "Content-Type": "application/xml"
    }
  });
};