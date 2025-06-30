export const config = {
  api: {
    baseUrl:
      import.meta.env.VITE_API_BASE_URL ||
      "https://2taw3onzgd.execute-api.ap-south-1.amazonaws.com/prod/api/v1",
  },
  app: {
    name: "SpenWiseAI",
    description: "Smart expense tracking made simple",
  },
} as const;
