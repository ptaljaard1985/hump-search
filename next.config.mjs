/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: "/search",
        headers: [
          {
            key: "X-Frame-Options",
            value: "ALLOW-FROM https://www.humansundermanagement.com",
          },
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors https://www.humansundermanagement.com https://humansundermanagement.com",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
