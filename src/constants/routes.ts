type Slug = | 'home';

export type Route = {
  path: string,
  name: string,
};

type Routes = Record<Slug, Route>;

export const routes: Routes = {
  home: {
    path: '/',
    name: 'Home',
  },
};
