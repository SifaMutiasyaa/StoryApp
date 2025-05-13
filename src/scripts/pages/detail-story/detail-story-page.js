// detail-story-page.js (View)
import DetailStoryPresenter from '../detail-story/detail-story-presenter';

export default class DetailStoryPage {
  constructor() {
    this.presenter = new DetailStoryPresenter();
  }

  async render() {
    return `
      <style>
        .container {
          max-width: 960px;
          margin: 60px auto;
          padding: 2rem;
          background: linear-gradient(135deg, #AFDDFF 0%, #FFFECB 100%);
          border-radius: 12px;
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.1);
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          animation: fadeIn 0.5s ease-in-out;
        }

        h1 {
          text-align: center;
          color: #333;
          margin-bottom: 2rem;
        }

        .story-wrapper {
          display: flex;
          flex-wrap: wrap;
          gap: 2rem;
        }

        .map-wrapper, .photo-wrapper {
          flex: 1;
          min-width: 300px;
        }

        #map {
          height: 300px;
          border-radius: 10px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
        }

        .photo-wrapper img {
          width: 100%;
          height: 300px;
          object-fit: cover;
          border-radius: 10px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
        }

        .story-meta {
          margin-top: 1.5rem;
          background-color: #ffffff;
          padding: 1.5rem;
          border-radius: 10px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
        }

        .story-meta h2 {
          margin-bottom: 1rem;
          color: #60B5FF;
        }

        .story-meta p {
          margin-bottom: 0.8rem;
          color: #444;
          line-height: 1.6;
        }

        .badge {
          display: inline-block;
          background: #FF9149;
          color: white;
          padding: 4px 10px;
          border-radius: 5px;
          font-size: 0.85rem;
          margin-right: 8px;
          font-weight: bold;
        }

        .btn {
          display: inline-block;
          margin-top: 1.5rem;
          padding: 10px 20px;
          background-color: #60B5FF;
          color: #fff;
          border: none;
          border-radius: 6px;
          text-decoration: none;
          font-weight: bold;
          transition: background-color 0.3s ease, transform 0.2s ease;
        }

        .btn:hover {
          background-color: #409fe6;
          transform: scale(1.03);
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media screen and (max-width: 768px) {
          .story-wrapper {
            flex-direction: column;
          }
        }
      </style>
      <section class="container">
        <h1 tabindex="0">Story Detail</h1>
        <div class="story-wrapper">
          <div class="map-wrapper">
            <div id="map"></div>
          </div>
          <div class="photo-wrapper" id="photo-section"></div>
        </div>
        <div id="story-detail" class="story-meta">
          <p>Loading story...</p>
        </div>
      </section>
    `;
  }

  async afterRender() {
    this.presenter.handlePageLoad();
  }
}
