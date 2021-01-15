import { beforeEach, test } from "@jest/globals";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import nock from "nock";
import testingLibrary from "@testing-library/dom";
import testingLibraryUserEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/extend-expect";

import initApp from "../src/init.js";
import runApp from "../src/application.js";

const start = async () => {
  await initApp();
  runApp();
};

const userEvent = testingLibraryUserEvent.default;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { screen, waitFor } = testingLibrary;

const rssUrl1 = "https://lorem.com/feed1.rss";
let rssData1;
const rssUrl2 = new URL("https://lorem.com/feed1.rss");
let rssData2;

beforeAll(() => {
  rssData1 = fs
    .readFileSync(path.resolve(__dirname, "__fixtures__/response1.rss"))
    .toString();
  rssData2 = fs
    .readFileSync(path.resolve(__dirname, "__fixtures__/response2.rss"))
    .toString();
  nock.disableNetConnect();

  nock("https://api.allorigins.win")
    .persist()
    .defaultReplyHeaders({
      "access-control-allow-origin": "*",
      "access-control-allow-credentials": "true",
    })
    .get(`/get?url=${encodeURIComponent(rssUrl1)}`)
    .reply(200, { contents: rssData1 })
    .get(`/get?url=${encodeURIComponent(rssUrl2)}`)
    .reply(200, { contents: rssData2 });
});

const domparser = new DOMParser();

beforeEach(() => {
  const initDOM = domparser.parseFromString(
    fs.readFileSync(path.resolve(__dirname, "../index.html")).toString(),
    "text/html"
  );
  document.body.innerHTML = initDOM.querySelector("body").innerHTML;
  start();
});

test("initial app state", async () => {
  const urlEl = await screen.getByRole("textbox", { name: /url/ });
  const feedbackEl = await screen.getByTestId("form-feedback");
  const feedsEl = await screen.getByTestId("feeds");
  const postsEl = await screen.getByTestId("posts");

  expect(urlEl).toHaveValue("");
  expect(feedbackEl).toHaveTextContent("");
  expect(feedsEl).toHaveTextContent("");
  expect(postsEl).toHaveTextContent("");
});

test("invalid rss url", async () => {
  const submitEl = await screen.getByRole("button", { name: /add/ });
  const urlEl = await screen.getByRole("textbox", { name: /url/ });
  const feedbackEl = await screen.getByTestId("form-feedback");

  await userEvent.type(urlEl, "invalid_url");
  await userEvent.click(submitEl);

  expect(urlEl).toHaveClass("is-invalid");
  expect(feedbackEl).toHaveTextContent(/url is invalid/i);
});

test("existed rss url", async () => {
  const submitEl = await screen.getByRole("button", { name: /add/ });
  const urlEl = await screen.getByRole("textbox", { name: /url/ });
  const feedbackEl = await screen.getByTestId("form-feedback");

  await userEvent.type(urlEl, rssUrl1.toString());
  await userEvent.click(submitEl);

  await waitFor(async () => {
    await screen.getByText(/rss has been loaded/i);
  });

  await userEvent.clear(urlEl);
  await userEvent.type(urlEl, rssUrl1.toString());
  await userEvent.click(submitEl);

  expect(urlEl).toHaveClass("is-invalid");
  expect(feedbackEl).toHaveTextContent(/rss already exists/i);
});

test("valid rss urls", async () => {
  const submitEl = await screen.getByRole("button", { name: /add/ });
  const urlEl = await screen.getByRole("textbox", { name: /url/ });
  const feedbackEl = await screen.getByTestId("form-feedback");
  const feedsEl = await screen.getByTestId("feeds");
  const postsEl = await screen.getByTestId("posts");

  await userEvent.type(urlEl, rssUrl1.toString());
  await userEvent.click(submitEl);

  expect(submitEl).toBeDisabled();

  await waitFor(() => {
    expect(feedbackEl).toHaveTextContent(/rss has been loaded/i);
  });

  await userEvent.clear(urlEl);
  await userEvent.type(urlEl, rssUrl2.toString());
  await userEvent.click(submitEl);

  await waitFor(() => {
    expect(feedsEl).toMatchSnapshot();
    expect(postsEl).toMatchSnapshot();
  });
});

test("post preview open", async () => {
  const submitEl = await screen.getByRole("button", { name: /add/ });
  const urlEl = await screen.getByRole("textbox", { name: /url/ });
  const postsEl = await screen.getByTestId("posts");
  const modalEl = await screen.getByTestId("modal");

  await userEvent.type(urlEl, rssUrl1.toString());
  await userEvent.click(submitEl);

  await waitFor(async () => {
    await screen.getByText(/rss has been loaded/i);
  });

  await userEvent.click(screen.getAllByRole("button", { name: /preview/i })[0]);

  await waitFor(() => {
    expect(modalEl).toHaveClass("show");
    expect(modalEl).toMatchSnapshot();
    expect(postsEl).toMatchSnapshot();
  });
});
