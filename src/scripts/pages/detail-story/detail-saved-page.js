export default class DetailSavedStory {
  async handlePageLoad() {
    const token = Auth.getToken();
    const container = document.getElementById('story-detail');
    const photoSection = document.getElementById('photo-section');

    if (!token) {
      container.innerHTML = '<p>Please login to see this page.</p>';
      return;
    }

    const url = window.location.hash;
    const storyId = url.split('/')[2];

    try {
      const { default: IDBHelper } = await import('../../utils/idb.js');
      const story = await IDBHelper.getAllStories().then(stories => stories.find(s => s.id === storyId));

      if (!story) {
        container.innerHTML = `<p>Story not found.</p>`;
        return;
      }

      photoSection.innerHTML = `
        <img src="${story.offlineImage}" alt="Photo of ${story.name}" />
      `;

      container.innerHTML = `
        <h2>${story.name}</h2>
        <p class="badge">📍 ${story.lat && story.lon ? `${story.lat.toFixed(3)}, ${story.lon.toFixed(3)}` : 'No Location'}</p>
        <p>${story.description}</p>
        <a href="#/" class="btn">← Back to Home</a>
      `;

    } catch (err) {
      console.error('Story load error:', err);
      container.innerHTML = `
        <p><strong>Failed to load story:</strong> ${err.message}</p>
        <a href="#/" class="btn">Back to Home</a>
      `;
    }
  }
}
