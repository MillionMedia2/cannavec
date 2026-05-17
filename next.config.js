/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        // Allow the standalone triage page to be embedded as an iframe
        // on plantz.io and any subdomain. Modern browsers honour CSP's
        // frame-ancestors over the older X-Frame-Options when both exist.
        source: "/triage",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors 'self' https://plantz.io https://*.plantz.io",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
