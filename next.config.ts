const nextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "blog.laleo.com",
      },
    ],
  },
  experimental: {
    allowedDevOrigins: ["http://localhost:3000", "http://192.168.1.85:3000"],
  },
};

export default nextConfig;
