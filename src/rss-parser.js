const domparser = new DOMParser();

export default (data) => {
  try {
    const parsed = domparser.parseFromString(data, 'text/xml');

    return {
      title: parsed.querySelector('title').textContent,
      description: parsed.querySelector('description').textContent,
      posts: [...parsed.querySelectorAll('item')].map((post) => ({
        id: post.querySelector('guid').textContent,
        title: post.querySelector('title').textContent,
        description: post.querySelector('description').textContent,
        link: post.querySelector('link').textContent,
      })),
    };
  } catch (e) {
    e.isParsingError = true;
    throw e;
  }
};
