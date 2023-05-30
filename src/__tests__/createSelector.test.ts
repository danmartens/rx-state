import { createSelector } from '../createSelector';

type State = Readonly<{
  posts: Readonly<{
    [id: string]: Readonly<{
      id: string;
      title: string;
    }>;
  }>;
}>;

describe('createSelector', () => {
  test('with no input selectors', () => {
    const state: State = {
      posts: {
        1: { id: '1', title: 'First Post' },
      },
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
});
