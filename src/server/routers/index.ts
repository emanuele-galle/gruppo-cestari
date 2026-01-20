import { router } from '../trpc';
import { newsRouter } from './news';
import { bandiRouter } from './bandi';
import { usersRouter } from './users';
import { contactsRouter } from './contacts';
import { portalRouter } from './portal';
import { projectsRouter } from './projects';
import { adminRouter } from './admin';

export const appRouter = router({
  news: newsRouter,
  bandi: bandiRouter,
  users: usersRouter,
  contacts: contactsRouter,
  portal: portalRouter,
  projects: projectsRouter,
  admin: adminRouter,
});

export type AppRouter = typeof appRouter;
