import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /** @react-email/render가 prettier를 런타임에 resolve (Next 빌드/번들 경고 방지) */
  serverExternalPackages: ["prettier"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.youtube.com",
        pathname: "/vi/**",
      },
      {
        protocol: "https",
        hostname: "i.ytimg.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
