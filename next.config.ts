import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["typeorm", "mysql2", "ical-generator"],
};

export default nextConfig;
