import { v4 as uuidv4 } from "uuid";

const domparser = new DOMParser();

export default (data) => {
  const parsed = domparser.parseFromString(data, "text/xml");
  const feedId = uuidv4();

  return {
    feed: {
      id: feedId,
      title: parsed.querySelector("title").textContent,
      description: parsed.querySelector("description").textContent,
    },
    posts: [...parsed.querySelectorAll("item")].map((post) => ({
      id: uuidv4(),
      feedId,
      title: post.querySelector("title").textContent,
      description: post.querySelector("description").textContent,
    })),
  };
};
