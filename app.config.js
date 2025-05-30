// app.config.js
import 'dotenv/config';

export default ({ config }) => ({
  ...config,
  "plugins": [
    "expo-secure-store"
  ],
  extra: {
    API_BASE_URL: "https://techfluency.onrender.com",
  },
});
