import 'bootstrap/dist/js/bootstrap.bundle.js';
import i18next from 'i18next';
import * as yup from 'yup';
import onChange from 'on-change';
import axios from 'axios';
import _ from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import render from './view.js';
import parseRss from './rss-parser.js';

const addProxy = (url) => {
  const urlWithProxy = new URL('/get', 'https://hexlet-allorigins.herokuapp.com');
  urlWithProxy.searchParams.set('url', url);
  urlWithProxy.searchParams.set('disableCache', 'true');
  return urlWithProxy.toString();
};

const initApp = () => {
  const i18Resources = {
    en: {
      translation: {
        feeds: 'Feeds',
        posts: 'Posts',
        preview: 'Preview',
        rss_loaded: 'Rss has been loaded',
        rss_exists: 'Rss already exists',
        rss_invalid: "This source doesn't contain valid rss",
        url_required: 'URL is required',
        url_invalid: 'Must be valid URL',
        network_error: 'Network error',
        unknown_error: 'Error, please try later',
      },
    },
  };

  return i18next
    .init({
      lng: 'en',
      debug: false,
      resources: i18Resources,
    })
    .then(() => {
      yup.setLocale({
        string: {
          required: i18next.t('url_required'),
          url: i18next.t('url_invalid'),
        },
      });
    });
};

const runApp = () => {
  const appState = {
    rssForm: {
      isValid: true,
      state: 'filling',
      fields: {
        url: '',
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
      return { url: i18next.t('rss_exists') };
    }

    try {
      validationSchema.validateSync(fields, { abortEarly: false });
      return {};
    } catch (e) {
      return e.inner.reduce((acc, { path, message }) => ({ ...acc, [path]: message }), {});
    }
  };

  const root = document.getElementById('root');
  const rssFormEl = root.querySelector('[data-component="rss-form"]');

  const watchedState = onChange(appState, (path, value, prevValue) => {
    render(watchedState, path, value, prevValue);
  });

  const pollPosts = (url, feedId, timeoutId) => {
    clearTimeout(timeoutId);

    const poolingTimeoutId = setTimeout(() => {
      axios
        .get(addProxy(url))
        .then(({ data }) => parseRss(data.contents))
        .then((parsed) => {
          const newPosts = _.differenceBy(parsed.posts, watchedState.posts, 'title');
          watchedState.posts = newPosts
            .map((post) => ({ ...post, feedId }))
            .concat(watchedState.posts);
        })
        .then(() => {
          pollPosts(url, feedId, poolingTimeoutId);
        });
    }, 5000);
  };

  const getErrorMessage = (error) => {
    if (error.isAxiosError) {
      return i18next.t('network_error');
    }
    if (error.isParsingError) {
      return i18next.t('rss_invalid');
    }
    return i18next.t('unknown_error');
  };

  rssFormEl.addEventListener('submit', (ev) => {
    ev.preventDefault();

    const { fields } = watchedState.rssForm;
    const formData = new FormData(ev.target);
    fields.url = formData.get('url');

    const errors = validate(fields, watchedState.feeds);
    watchedState.rssForm.errors = errors;
    watchedState.rssForm.isValid = _.isEmpty(errors);

    if (watchedState.rssForm.isValid) {
      watchedState.rssForm.state = 'pending';

      axios
        .get(addProxy(fields.url))
        .then(({ data }) => parseRss(data.contents))
        .then((parsed) => {
          const feed = {
            id: uuidv4(),
            title: parsed.title,
            description: parsed.description,
            url: fields.url,
          };

          watchedState.feeds = [feed].concat(watchedState.feeds);
          watchedState.posts = parsed.posts
            .map((post) => ({ ...post, feedId: feed.id }))
            .concat(watchedState.posts);
          watchedState.rssForm.state = 'fulfilled';

          pollPosts(fields.url, feed.id);
        })
        .catch((error) => {
          watchedState.rssForm.errors = {
            rssError: getErrorMessage(error),
          };

          watchedState.rssForm.state = 'rejected';
        });
    }
  });
};

export default () => {
  initApp().then(runApp);
};
