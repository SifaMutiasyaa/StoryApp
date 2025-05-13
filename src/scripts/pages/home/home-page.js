import HomePresenter from './home-presenter';

export default class HomePage {
  constructor() {
    this.presenter = new HomePresenter();
  }

  async render() {
    return `
      <section class="home-page">
        <div class="container">
          <h1 tabindex="0" class="section-title">
            <i class="fas fa-book-open"></i> Explore Stories
          </h1>

          <div id="loading-home" class="loading-state">
            <div class="spinner"></div>
            <p>Loading stories...</p>
          </div>

          <div id="stories-container" class="story-list-grid"></div>
        </div>
      </section>

      <style>
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
          margin: 2rem 0;
        }

        .story-card {
          background-color: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: var(--shadow-md);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
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
          border-bottom: 1px solid #eee;
        }

        .story-content {
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          flex-grow: 1;
        }

        .story-content h2 {
          font-size: 1.25rem;
          margin: 0;
          color: var(--text-dark);
        }

        .story-content p {
          color: var(--text-muted);
          font-size: 0.95rem;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .btn-detail {
          margin-top: auto;
          align-self: flex-start;
          background-color: var(--accent);
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          font-weight: bold;
          text-decoration: none;
          transition: background-color 0.3s ease;
        }

        .btn-detail:hover {
          background-color: var(--accent-dark);
        }

        .loading-state {
          display: none;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          gap: 1rem;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid rgba(0, 0, 0, 0.1);
          border-top: 4px solid var(--accent);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .text-center {
          text-align: center;
        }

        @media (max-width: 768px) {
          .section-title {
            font-size: 1.5rem;
          }

          .story-list-grid {
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          }
        }
      </style>
    `;
  }

  async afterRender() {
    this.presenter.showStories();
  }
}
