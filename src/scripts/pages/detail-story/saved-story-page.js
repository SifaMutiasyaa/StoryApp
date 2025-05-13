export default class SavedStoryPage {
    async render() {
      return `
        <section class="home-page">
          <div class="container">
            <h1 tabindex="0" class="section-title">
              <i class="fas fa-save"></i> Saved Stories (Offline)
            </h1>
  
            <div id="loading-saved" class="loading-state">
              <div class="spinner"></div>
              <p>Loading saved stories...</p>
            </div>
  
            <div id="saved-list" class="story-list-grid"></div>
          </div>
        </section>
  
        <style>
          /* Sama seperti style di HomePage agar konsisten */
          .home-page {
            padding: 2rem 0;
          }
  
          .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 1rem;
          }
  
          .section-title {
            font-size: 2rem;
            margin-bottom: 2rem;
            text-align: center;
            color: var(--text-dark);
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
          }
  
          .story-list-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 2rem;
          }
  
          .story-card {
            background-color: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: var(--shadow-md);
            transition: transform 0.3s ease;
            animation: fadeInUp 0.6s ease forwards;
            opacity: 0;
            display: flex;
            flex-direction: column;
          }
  
          .story-card:hover {
            transform: translateY(-5px);
            box-shadow: var(--shadow-lg);
          }
  
          .story-card img {
            width: 100%;
            height: 200px;
            object-fit: cover;
          }
  
          .story-content {
            padding: 1rem;
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
            flex-grow: 1;
          }
  
          .story-content h3 {
            font-size: 1.25rem;
            color: var(--text-dark);
          }
  
          .story-content p {
            font-size: 0.95rem;
            color: var(--text-muted);
            display: -webkit-box;
            -webkit-line-clamp: 3;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
  
          .story-content .story-time {
            font-size: 0.85rem;
            color: #888;
          }
  
          .card-buttons {
            margin-top: auto;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
  
          .btn-detail,
          .delete-btn {
            background-color: var(--accent);
            color: white;
            padding: 0.4rem 0.8rem;
            border-radius: 6px;
            font-size: 0.9rem;
            font-weight: bold;
            text-decoration: none;
            cursor: pointer;
            transition: background-color 0.3s ease;
          }
  
          .delete-btn {
            background-color: #e74c3c;
          }
  
          .btn-detail:hover {
            background-color: var(--accent-dark);
          }
  
          .delete-btn:hover {
            background-color: #c0392b;
          }
  
          .loading-state {
            display: none;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 2rem;
          }
  
          .spinner {
            width: 40px;
            height: 40px;
            border: 4px solid rgba(0, 0, 0, 0.1);
            border-top: 4px solid var(--accent);
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }

           .location-info {
          font-size: 0.8rem;
          color: #666;
          margin: 0.5rem 0;
          display: flex;
          align-items: center;
          gap: 0.3rem;
        }
        
        .location-info i {
          font-size: 0.9rem;
        }
  
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
  
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        </style>
      `;
    }
    async afterRender() {
    const listContainer = document.getElementById('saved-list');
    const loading = document.getElementById('loading-saved');
    loading.style.display = 'flex';

    try {
      const { default: IDBHelper } = await import('../../utils/idb.js');
      const stories = await IDBHelper.getAllStories();
      loading.style.display = 'none';

      if (stories.length === 0) {
        listContainer.innerHTML = '<p class="text-center">No saved stories found.</p>';
        return;
      }

      listContainer.innerHTML = stories.map((story) => {
        const formattedDate = new Date(story.createdAt).toLocaleString();
        const hasLocation = story.lat && story.lon;
        const coordText = hasLocation ? 
          `${story.lat.toFixed(5)}, ${story.lon.toFixed(5)}` : 
          'No location data';

        return `
          <div class="story-card" tabindex="0">
            <img src="${story.offlineImage}" alt="${story.name}" loading="lazy" />
            <div class="story-content">
              <h3>${story.name}</h3>
              <p>${story.description}</p>
              
              <div class="location-info">
                <i class="fas fa-map-marker-alt"></i>
                <span>${coordText}</span>
              </div>
              
              <div class="card-info-footer">
                <span class="story-time">${formattedDate}</span>
                <button data-id="${story.id}" class="delete-btn">🗑️ Delete</button>
              </div>
            </div>
          </div>
        `;
      }).join('');

      listContainer.addEventListener('click', async (e) => {
        if (e.target.classList.contains('delete-btn')) {
          const id = e.target.getAttribute('data-id');
          await IDBHelper.deleteStory(id);
          e.target.closest('.story-card').remove();
        }
      });
    } catch (e) {
      console.error(e);
      loading.style.display = 'none';
      listContainer.innerHTML = '<p class="text-center">Failed to load saved stories.</p>';
    }
  }
}