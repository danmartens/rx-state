import { createSelector } from '../createSelector';

type State = Readonly<{
  posts: Readonly<{
    [id: string]: Readonly<{
      id: string;
      title: string;
    }>;
  }>;

  comments: Readonly<{
    [id: string]: Readonly<{
      id: string;
      postId: string;
      content: string;
    }>;
  }>;
}>;

describe('createSelector', () => {
  test('with no input selectors', () => {
    const state: State = {
      posts: {
        1: { id: '1', title: 'First Post' },
      },
      comments: {},
    };

    const getPosts = createSelector((state: State) =>
      Object.values(state.posts)
    );

    expect(getPosts(state)).toEqual([state.posts['1']]);
    expect(getPosts(state)).toBe(getPosts(state));
  });

  test('with one input selector', () => {
    const state: State = {
      posts: {
        2: { id: '2', title: 'Second Post' },
        3: { id: '3', title: 'Third Post' },
        1: { id: '1', title: 'First Post' },
      },
      comments: {},
    };

    const getPosts = (state: State) => state.posts;

    const getSortedPosts = createSelector(getPosts, (posts) =>
      Object.values(posts).sort((postA, postB) =>
        postA.title.localeCompare(postB.title)
      )
    );

    expect(getSortedPosts(state)).toEqual([
      state.posts['1'],
      state.posts['2'],
      state.posts['3'],
    ]);

    expect(getSortedPosts(state)).toBe(getSortedPosts(state));
  });

  test('with two input selectors', () => {
    const state: State = {
      posts: {
        1: { id: '1', title: 'First Post' },
        2: { id: '2', title: 'Second Post' },
        3: { id: '3', title: 'Third Post' },
      },
      comments: {
        1: { id: '1', postId: '3', content: 'First comment' },
        2: { id: '2', postId: '1', content: 'Second comment' },
        3: { id: '3', postId: '1', content: 'Third comment' },
      },
    };

    const getPosts = jest.fn((state: State) => state.posts);
    const getComments = jest.fn((state: State) => state.comments);

    const getPostsAndComments = createSelector(
      getPosts,
      getComments,
      (posts, comments) =>
        Object.values(posts).map((post) => ({
          ...post,
          comments: Object.values(comments).filter(
            (comment) => comment.postId === post.id
          ),
        }))
    );

    expect(getPostsAndComments(state)).toEqual([
      {
        ...state.posts['1'],
        comments: [state.comments['2'], state.comments['3']],
      },
      {
        ...state.posts['2'],
        comments: [],
      },
      {
        ...state.posts['3'],
        comments: [state.comments['1']],
      },
    ]);

    expect(getPostsAndComments(state)).toBe(getPostsAndComments(state));

    expect(getPosts).toHaveBeenCalledTimes(1);
    expect(getComments).toHaveBeenCalledTimes(1);

    const nextState = { ...state };

    expect(getPostsAndComments(nextState)).toBe(getPostsAndComments(nextState));

    expect(getPosts).toHaveBeenCalledTimes(2);
    expect(getComments).toHaveBeenCalledTimes(2);
  });
});
