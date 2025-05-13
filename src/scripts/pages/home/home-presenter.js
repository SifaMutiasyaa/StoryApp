import StoryApi from '../../data/api';
import Auth from '../../utils/auth';

export default class HomePresenter {
  async showStories() {
    const container = document.getElementById('stories-container');
    const loadingEl = document.getElementById('loading-home');
    const token = Auth.getToken();

    if (!token) {
      container.innerHTML = '<p class="text-center">Please login to see stories.</p>';
      return;
    }

    loadingEl.style.display = 'flex';

    try {
      const data = await StoryApi.getStories({ token });
      loadingEl.style.display = 'none';

      if (data.listStory.length > 0) {
        container.innerHTML = data.listStory
          .map((story, index) => {
            if (!story.id || typeof story.id !== 'string') return '';

            const formattedDate = new Date(story.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            });

            return `
              <article class="story-card" style="animation-delay: ${index * 0.1}s">
                <img src="${story.photoUrl || 'https://via.placeholder.com/400x200?text=No+Image'}" 
                     alt="Story by ${story.name}">
                <div class="story-content">
                  <h2>${story.name}</h2>
                  <p>${story.description.slice(0, 100)}${story.description.length > 100 ? '...' : ''}</p>
                  <small style="color: var(--text-muted); font-size: 0.85rem;">📅 ${formattedDate}</small>
                  <a href="#/detail/${story.id}" class="btn-detail">View Detail</a>
                </div>
              </article>
            `;
          })
          .join('');
      } else {
        container.innerHTML = '<p class="text-center">No stories available.</p>';
      }
    } catch (err) {
      loadingEl.style.display = 'none';
      container.innerHTML = `
        <div class="error-message">
          <p class="text-center">Error loading stories: ${err.message}</p>
        </div>
      `;
      console.error('Error loading stories:', err);
    }
  }
}
