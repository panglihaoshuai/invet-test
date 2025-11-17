
    import { defineConfig, loadConfigFromFile } from "vite";
    import type { ConfigEnv } from "vite";
    import path from "path";

    const env: ConfigEnv = { command: "serve", mode: "development" };
    const configFile = path.resolve(__dirname, "vite.config.ts");
    const result = await loadConfigFromFile(env, configFile);
    const userConfig = result?.config;

    export default defineConfig({
      ...userConfig,
      plugins: [
        ...(userConfig?.plugins || []),
      ]
    });
    
