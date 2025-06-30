export const config = {
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL,
  },
  app: {
    name: "SpenWiseAI",
    description: "Smart expense tracking made simple",
  },
} as const;
