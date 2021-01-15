/* eslint-disable no-use-before-define */
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap/dist/js/bootstrap.bundle.js";
import i18next from "i18next";
import * as yup from "yup";
import onChange from "on-change";
import axios from "axios";
import _ from "lodash";
import render from "./view.js";
import parseRss from "./rss-parser.js";

const formatRssUrl = (url) =>
  `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;

const initApp = async () => {
  await i18next.init({
    lng: "en",
    debug: false,
    resources: {
      en: {
        translation: {
          feeds: "Feeds",
          posts: "Posts",
          preview: "Preview",
          rss_loaded: "Rss has been loaded",
          rss_exists: "Rss already exists",
          url_required: "URL is required",
          url_invalid: "URL is invalid",
        },
      },
    },
  });

  yup.setLocale({
    string: {
      required: i18next.t("url_required"),
      url: i18next.t("url_invalid"),
    },
  });
};

const runApp = () => {
  const appState = {
    rssForm: {
      isValid: true,
      state: "filling",
      fields: {
        url: "",
      },
      errors: {},
    },
    feeds: [],
    posts: [],
    uiState: {
      openedPostId: null,
      openedPostsIds: [],
    },
  };

  const validationSchema = yup.object().shape({
    url: yup.string().required().url(),
  });

  const validate = (fields, feeds) => {
    if (feeds.find((feed) => feed.url === fields.url)) {
      return { url: new Error(i18next.t("rss_exists")) };
    }

    try {
      validationSchema.validateSync(fields, { abortEarly: false });
      return {};
    } catch (e) {
      return _.keyBy(e.inner, "path");
    }
  };

  const root = document.getElementById("root");
  const rssFormEl = root.querySelector('[data-component="rss-form"]');

  const watchedState = onChange(appState, (path, value, prevValue) =>
    render(watchedState, path, value, prevValue)
  );

  const pollFeeds = (url, timeoutId) => {
    clearTimeout(timeoutId);

    const poolingTimeoutId = setTimeout(() => {
      axios
        .get(url)
        .then(({ data }) => parseRss(data))
        .then((parsed) => {
          const newPosts = _.differenceBy(
            parsed.posts,
            watchedState.posts,
            "title"
          );
          watchedState.posts = newPosts.concat(watchedState.posts);
        })
        .then(() => {
          pollFeeds(url, poolingTimeoutId);
        });
    }, 5000);
  };

  rssFormEl.addEventListener("submit", (ev) => {
    ev.preventDefault();

    const { fields } = watchedState.rssForm;
    const formData = new FormData(ev.target);
    fields.url = formData.get("url");

    const errors = validate(fields, watchedState.feeds);
    watchedState.rssForm.errors = errors;
    watchedState.rssForm.isValid = _.isEmpty(errors);

    if (watchedState.rssForm.isValid) {
      watchedState.rssForm.state = "pending";

      axios
        .get(formatRssUrl(fields.url))
        .then(({ data }) => parseRss(data.contents))
        .then((parsed) => {
          watchedState.feeds = [{ ...parsed.feed, url: fields.url }].concat(
            watchedState.feeds
          );
          watchedState.posts = parsed.posts.concat(watchedState.posts);
          watchedState.rssForm.state = "fulfilled";

          pollFeeds(fields.url);
        })
        .catch((error) => {
          watchedState.rssForm.errors = {
            apiError: error,
          };

          watchedState.rssForm.state = "rejected";
        });
    }
  });
};

export default async () => {
  await initApp();
  runApp();
};
