/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "",
          },
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors 'self' https://www.humansundermanagement.com https://humansundermanagement.com",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
