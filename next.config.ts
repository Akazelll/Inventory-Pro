/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: [
        "hznff7kn-3000.asse.devtunnels.ms", // Ganti dengan domain tunnel Anda
        "localhost:3000",
      ],
    },
  },
};

export default nextConfig;
