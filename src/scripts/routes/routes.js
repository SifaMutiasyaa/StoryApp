import HomePage from '../pages/home/home-page';
import AboutPresenter from '../pages/about/about-presenter';
import AddStoryPage from '../pages/add-story/add-story-page';
import AddStoryPresenter from '../pages/add-story/add-story-presenter';
import LoginPage from '../pages/login/login-page';
import RegisterPage from '../pages/register/register-page';
import DetailStoryPage from '../pages/detail-story/detail-story-page';
import SavedStoriesPage from '../pages/detail-story/saved-story-page';
import ProfilePage from '../pages/profile/profile-page';

const routes = {
  '/': HomePage,
  '/about': AboutPresenter,
  '/add-story': AddStoryPage, // Tetap gunakan Page saja
  '/login': LoginPage,
  '/register': RegisterPage,
  '/detail/:id': DetailStoryPage,
  '/profile': ProfilePage,
  '/saved': SavedStoriesPage,
  
};

export default routes;