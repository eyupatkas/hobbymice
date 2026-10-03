/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async rewrites() {
    // IndexNow 验证文件保持外链形状：/indexnow-<key>.txt
    return [{ source: '/indexnow-:key.txt', destination: '/api/indexnow?key=:key' }];
  },
};

export default nextConfig;
