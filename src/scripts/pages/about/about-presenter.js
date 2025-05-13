import AboutPage from './about-page';

const AboutPresenter = {
  async init(container) {
    const page = new AboutPage();
    container.innerHTML = await page.render();
    await page.afterRender?.();
  },
};

export default AboutPresenter;
