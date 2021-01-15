import "bootstrap/dist/css/bootstrap.css";
import i18next from "i18next";
import * as yup from "yup";

export default async () => {
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
