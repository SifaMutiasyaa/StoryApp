export default class AboutPage {
  async render() {
    return `
      <style>
        .about-page {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 70vh;
          padding: 1rem;
          animation: fadeInPage 1s ease-in-out forwards;
        }

        .about-card {
          background-color: #ffffff;
          padding: 2rem 3rem;
          border-radius: 20px;
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
          max-width: 800px;
          text-align: center;
          animation: slideUp 1s ease-out forwards;
          opacity: 0;
          transform: translateY(40px);
        }

        .about-card h1 {
          color: #60B5FF;
          font-size: 2.4rem;
          margin-bottom: 1.2rem;
        }

        .about-card p {
          color: #333;
          font-size: 1.1rem;
          line-height: 1.7;
          margin-bottom: 1.2rem;
        }

        .about-card strong {
          color: #FF9149;
        }

        .about-card em {
          color: #60B5FF;
          font-style: normal;
          font-weight: bold;
        }

        .about-illustration {
          width: 240px;
          margin: 0 auto 2rem;
          border-radius: 12px;
          box-shadow: 0 6px 18px rgba(0, 0, 0, 0.1);
          animation: zoomIn 0.9s ease forwards;
        }

        @keyframes fadeInPage {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes zoomIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @media screen and (max-width: 768px) {
          .about-card {
            padding: 2rem;
          }

          .about-card h1 {
            font-size: 1.8rem;
          }

          .about-card p {
            font-size: 1rem;
          }

          .about-illustration {
            width: 100%;
            max-width: 200px;
          }
        }
      </style>

      <section class="about-page">
        <div class="about-card">
          <h1 tabindex="0">About This App</h1>
          <img 
            src="images/story.png" 
            alt="Illustration" 
            class="about-illustration" 
          />
          <p>
            <strong>StoryApp</strong> is a platform that allows users to share their moments through stories and photos.
          </p>
          <p>
            This app is part of the <em>Dicoding Front-End Expert</em> submission, built with accessibility, responsiveness, and user-centric design in mind.
          </p>
        </div>
      </section>
    `;
  }

  async afterRender() {
    // Jika ingin ada logic interaktif, bisa ditambahkan di sini.
  }
}
