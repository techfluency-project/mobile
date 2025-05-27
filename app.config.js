// app.config.js
import 'dotenv/config';

export default ({ config }) => ({
  ...config,
  "plugins": [
    "expo-secure-store"
  ],
  extra: {
    apiBaseUrl: process.env.API_BASE_URL,
  },
});
