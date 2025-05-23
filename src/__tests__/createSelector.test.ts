import { createSelector } from '../createSelector';

type State = Readonly<{
  users: Readonly<{
    [id: string]: Readonly<{
      id: string;
      name: string;
    }>;
  }>;

  posts: Readonly<{
    [id: string]: Readonly<{
      id: string;
      authorId: string;
      title: string;
    }>;
  }>;

  comments: Readonly<{
    [id: string]: Readonly<{
      id: string;
      authorId: string;
      postId: string;
      content: string;
    }>;
  }>;
}>;

describe('createSelector', () => {
  test('with no input selectors', () => {
    const state: State = {
      users: {},
      posts: {
        1: { id: '1', authorId: '1', title: 'First Post' },
      },
      comments: {},
    };

    const getPosts = createSelector((state: State) =>
      Object.values(state.posts),
    );

    expect(getPosts(state)).toEqual([state.posts['1']]);
    expect(getPosts(state)).toBe(getPosts(state));
  });

  test('with one input selector', () => {
    const state: State = {
      users: {},
      posts: {
        2: { id: '2', authorId: '1', title: 'Second Post' },
        3: { id: '3', authorId: '1', title: 'Third Post' },
        1: { id: '1', authorId: '1', title: 'First Post' },
      },
      comments: {},
    };

    const getPosts = (state: State) => state.posts;

    const getSortedPosts = createSelector(getPosts, (posts) =>
      Object.values(posts).sort((postA, postB) =>
        postA.title.localeCompare(postB.title),
      ),
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
      users: {},
      posts: {
        1: { id: '1', authorId: '1', title: 'First Post' },
        2: { id: '2', authorId: '1', title: 'Second Post' },
        3: { id: '3', authorId: '1', title: 'Third Post' },
      },
      comments: {
        1: { id: '1', authorId: '1', postId: '3', content: 'First comment' },
        2: { id: '2', authorId: '1', postId: '1', content: 'Second comment' },
        3: { id: '3', authorId: '1', postId: '1', content: 'Third comment' },
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
            (comment) => comment.postId === post.id,
          ),
        })),
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

  test('with three input selectors', () => {
    const state: State = {
      users: {
        1: { id: '1', name: 'Jane Doe' },
      },
      posts: {
        1: { id: '1', authorId: '1', title: 'First Post' },
        2: { id: '2', authorId: '1', title: 'Second Post' },
        3: { id: '3', authorId: '1', title: 'Third Post' },
      },
      comments: {
        1: { id: '1', authorId: '1', postId: '3', content: 'First comment' },
        2: { id: '2', authorId: '1', postId: '1', content: 'Second comment' },
        3: { id: '3', authorId: '1', postId: '1', content: 'Third comment' },
      },
    };

    const getUsers = jest.fn((state: State) => state.users);
    const getPosts = jest.fn((state: State) => state.posts);
    const getComments = jest.fn((state: State) => state.comments);

    const getPostsAndCommentsWithUsers = createSelector(
      getUsers,
      getPosts,
      getComments,
      (users, posts, comments) =>
        Object.values(posts).map((post) => ({
          ...post,
          author: users[post.authorId],
          comments: Object.values(comments)
            .filter((comment) => comment.postId === post.id)
            .map((comment) => ({
              ...comment,
              author: users[comment.authorId],
            })),
        })),
    );

    expect(getPostsAndCommentsWithUsers(state)).toEqual([
      {
        ...state.posts['1'],
        author: state.users['1'],
        comments: [
          {
            ...state.comments['2'],
            author: state.users['1'],
          },
          {
            ...state.comments['3'],
            author: state.users['1'],
          },
        ],
      },
      {
        ...state.posts['2'],
        author: state.users['1'],
        comments: [],
      },
      {
        ...state.posts['3'],
        author: state.users['1'],
        comments: [
          {
            ...state.comments['1'],
            author: state.users['1'],
          },
        ],
      },
    ]);

    expect(getPostsAndCommentsWithUsers(state)).toBe(
      getPostsAndCommentsWithUsers(state),
    );

    expect(getUsers).toHaveBeenCalledTimes(1);
    expect(getPosts).toHaveBeenCalledTimes(1);
    expect(getComments).toHaveBeenCalledTimes(1);

    const nextState = { ...state };

    expect(getPostsAndCommentsWithUsers(nextState)).toBe(
      getPostsAndCommentsWithUsers(nextState),
    );

    expect(getUsers).toHaveBeenCalledTimes(2);
    expect(getPosts).toHaveBeenCalledTimes(2);
    expect(getComments).toHaveBeenCalledTimes(2);
  });
});
