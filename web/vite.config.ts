import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";
import svgrPlugin from "vite-plugin-svgr";
import tailwindcss from "@tailwindcss/vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), svgrPlugin(), tailwindcss()],
  server: {
    port: 3000,
    strictPort: true,
    host: true,
    open: true,
  },
});
