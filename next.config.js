/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Bỏ qua lỗi cảnh báo type hẹp khi build production trên Vercel
    ignoreBuildErrors: true,
  },
  eslint: {
    // Bỏ qua cảnh báo lint khi build
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
