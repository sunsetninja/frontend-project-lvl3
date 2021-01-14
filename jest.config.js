import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  testEnvironment: "jest-environment-jsdom",
  moduleNameMapper: {
    "^lodash-es$": "lodash",
    "\\.(css|sass|scss)$": "identity-obj-proxy",
  },
  modulePathIgnorePatterns: [
    path.resolve(__dirname, "__tests__/__fixtures__/"),
  ],
};
