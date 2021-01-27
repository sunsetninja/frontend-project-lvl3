import i18next from 'i18next';

const renderFeeds = ({ feeds }) => {
  const root = document.getElementById('root');
  const feedsEl = root.querySelector('[data-component="feeds"]');

  feedsEl.innerHTML = `
    <h2>${i18next.t('feeds')}</h2>
    <ul class="list-group mb-5">
  ${feeds
    .map(
      (feed) => `
          <li class="list-group-item">
            <h3>${feed.title}</h3>
            <p>${feed.description}</p>
          </li>
      `,
    )
    .join('')}
    </ul>
  `;
};

const renderPost = (post, openedPostsIds) => `
<li class="list-group-item d-flex justify-content-between align-items-start">
  <a href="${post.link}" class="${
  openedPostsIds.includes(post.id) ? 'fw-normal font-weight-normal' : 'fw-bold font-weight-bold'
}" data-id="2" target="_blank" rel="noopener noreferrer">
    ${post.title}
  </a>
  <button type="button" class="btn btn-primary btn-sm" data-id=${post.id} data-bs-toggle="modal"
    data-bs-target="#modal">
    ${i18next.t('preview')}
  </button>
</li>
`;
const renderPosts = ({ posts, onPostClick, openedPostsIds }) => {
  const root = document.getElementById('root');
  const postsEl = root.querySelector('[data-component="posts"]');

  postsEl.innerHTML = `
    <h2>${i18next.t('posts')}</h2>
    <ul class="list-group">
      ${posts.map((post) => renderPost(post, openedPostsIds)).join('')}
    </ul>
  `;

  postsEl.querySelectorAll('[data-bs-toggle="modal"').forEach((button) => {
    button.addEventListener('click', () => {
      onPostClick(button.dataset.id);
    });
  });
};

export default (state, path, value, prevValue) => {
  const root = document.getElementById('root');
  const modal = document.querySelector('[data-component="modal"]');
  const rssFormEl = root.querySelector('[data-component="rss-form"]');

  if (path.includes('rssForm.state')) {
    const fieldEl = rssFormEl.elements.url;
    const feedbackEl = root.querySelector('[data-element="form-feedback"]');
    const rssSubmitEl = rssFormEl.querySelector('[type="submit"]');

    switch (value) {
      case 'pending':
        rssSubmitEl.setAttribute('disabled', true);
        fieldEl.setAttribute('readonly', true);
        break;
      case 'fulfilled':
        rssSubmitEl.removeAttribute('disabled');
        fieldEl.removeAttribute('readonly');
        feedbackEl.classList.remove('text-danger');
        feedbackEl.classList.add('text-success');
        feedbackEl.textContent = i18next.t('rss_loaded');
        rssFormEl.reset();
        break;
      case 'rejected':
        rssSubmitEl.removeAttribute('disabled');
        fieldEl.removeAttribute('readonly');
        feedbackEl.classList.remove('text-success');
        feedbackEl.classList.add('text-danger');
        feedbackEl.textContent = state.rssForm.errors.rssError;
        break;
      default:
        break;
    }
  }

  if (path.includes('rssForm.errors')) {
    const fieldEl = rssFormEl.elements.url;
    const feedbackEl = root.querySelector('[data-element="form-feedback"]');
    const { url: urlError } = value;

    if (prevValue.url && !urlError) {
      fieldEl.classList.remove('is-invalid');
      feedbackEl.classList.remove('text-danger');
      feedbackEl.textContent = '';
    }

    if (urlError) {
      fieldEl.classList.add('is-invalid');
      feedbackEl.classList.remove('text-success');
      feedbackEl.classList.add('text-danger');
      feedbackEl.textContent = urlError;
    }
  }

  if (path.includes('feed')) {
    renderFeeds({ feeds: value });
  }

  if (path.includes('posts') || path.includes('openedPostsIds')) {
    renderPosts({
      posts: state.posts,
      openedPostsIds: state.uiState.openedPostsIds,
      onPostClick: (postId) => {
        state.uiState.openedPostId = postId;
        state.uiState.openedPostsIds = [...state.uiState.openedPostsIds, postId];
      },
    });
  }

  if (path.includes('uiState.openedPostId')) {
    const modalTitle = modal.querySelector('[data-element="modal-title"');
    const modalBody = modal.querySelector('[data-element="modal-body"');
    const modalFullArticleLink = modal.querySelector('[data-element="modal-full-article-link"');
    const activePost = state.posts.find(({ id }) => id === value);

    modalTitle.textContent = activePost.title;
    modalBody.textContent = activePost.description;
    modalFullArticleLink.setAttribute('href', activePost.link);
  }
};
