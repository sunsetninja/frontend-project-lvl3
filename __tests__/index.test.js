import { beforeEach, test } from "@jest/globals";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import testingLibrary from "@testing-library/dom";
import "@testing-library/jest-dom/extend-expect";
import run from "../src/application.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { screen } = testingLibrary;

beforeEach(() => {
  const initHtml = fs
    .readFileSync(path.resolve(__dirname, "__fixtures__/index.html"))
    .toString();
  document.body.innerHTML = initHtml;
  run();
});

test("init", async () => {
  const helloElement = await screen.findByText(/hello world/);

  expect(helloElement).toBeInTheDocument();
});
