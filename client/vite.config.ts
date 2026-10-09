import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from "vite"
import istanbul from "vite-plugin-istanbul"
import solid from "vite-plugin-solid"

export default defineConfig({
  build: { sourcemap: true },
  plugins: [
    tailwindcss(),
    solid(),
    istanbul({
      include: "src/**/*",
      exclude: ["node_modules", "test/**", "e2e/**"],
      extension: [".ts", ".tsx"],
      requireEnv: true,
    }),
  ],
  server: {
    proxy: {
      "/api": `http://127.0.0.1:${process.env.STAFF_PORT ?? "3000"}`,
    },
  },
})
