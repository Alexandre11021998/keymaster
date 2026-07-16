import { defineConfig } from "vite";
import react from "@vitejs/plugin-react"; // ⬅️ O segredo está aqui! Mudou para plugin-react
import tailwindcss from "@tailwindcss/vite";
import path from "path"; // Geralmente usado pelo Shadcn UI para os caminhos com "@"

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react(), tailwindcss()],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
});
