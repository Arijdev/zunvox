const configuredSiteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://zunvox.vercel.app";

export const siteUrl = new URL(configuredSiteUrl || "https://zunvox.vercel.app");

if (
  siteUrl.protocol !== "https:" ||
    siteUrl.pathname !== "/" ||
    siteUrl.search !== "" ||
    siteUrl.hash !== ""
) {
  throw new Error("NEXT_PUBLIC_SITE_URL must be an HTTPS origin without a path.");
}
