// script.js
const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchButton");
const resultsSection = document.getElementById("results");
const playerSection = document.getElementById("playerSection");
const playerContainer = document.getElementById("playerContainer");
const filterSelect = document.createElement("select");
filterSelect.id = "filterSelect";
filterSelect.innerHTML = `
  <option value="all">All</option>
  <option value="movie">Movies</option>
  <option value="tv">TV Shows</option>
`;
searchButton.before(filterSelect);

const TMDB_TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJiYmRmYTVjNzMyMTc2NzFmNjgxY2JlZThlYjlhZjUxMiIsIm5iZiI6MTc0NDQzODg0OS45MzIsInN1YiI6IjY3ZmEwNjQxZGU1ZTRkZWM2MmFkYTJiMCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.PmOMFeH2cb4LxnvzyMkCq3nVMnBY4aX5l_xZ9Q4CzgA";

searchButton.addEventListener("click", () => {
  const query = searchInput.value.trim();
  const filter = filterSelect.value;
  if (!query) return;

  resultsSection.innerHTML = "Loading...";
  playerSection.classList.add("hidden");
  fetch(`https://api.themoviedb.org/3/search/multi?query=${encodeURIComponent(query)}`, {
    headers: {
      Authorization: `Bearer ${TMDB_TOKEN}`,
    },
  })
    .then((res) => res.json())
    .then((data) => {
      resultsSection.innerHTML = "";
      if (!data.results || data.results.length === 0) {
        resultsSection.innerHTML = "<p>No results found.</p>";
        return;
      }

      data.results.forEach((item) => {
        const isMovie = item.media_type === "movie";
        const isTV = item.media_type === "tv";

        if (
          (filter === "movie" && !isMovie) ||
          (filter === "tv" && !isTV)
        ) {
          return;
        }

        const id = item.id;
        const title = isMovie ? item.title : item.name;
        const poster = item.poster_path
          ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
          : "";

        const card = document.createElement("div");
        card.className = "result-card";
        card.innerHTML = `
          <img src="${poster}" alt="${title}" />
          <h3>${title}</h3>
        `;

        card.addEventListener("click", () => {
          if (isMovie) {
            const embedUrl = `https://vidsrc.xyz/embed/movie?tmdb=${id}`;
            playerContainer.innerHTML = `<iframe src="${embedUrl}" allowfullscreen></iframe>`;
            playerSection.classList.remove("hidden");
            resultsSection.before(playerSection);
          } else {
            fetch(`https://api.themoviedb.org/3/tv/${id}?append_to_response=seasons`, {
              headers: {
                Authorization: `Bearer ${TMDB_TOKEN}`,
              },
            })
              .then((res) => res.json())
              .then((tvData) => {
                const selectorDiv = document.createElement("div");
                selectorDiv.className = "selector-container";

                const seasonSelect = document.createElement("select");
                const episodeSelect = document.createElement("select");
                const goBtn = document.createElement("button");
                goBtn.textContent = "Play";

                selectorDiv.append("Season:", seasonSelect, "Episode:", episodeSelect, goBtn);

                playerContainer.innerHTML = "";
                playerContainer.appendChild(selectorDiv);
                const playerFrame = document.createElement("iframe");
                playerContainer.appendChild(playerFrame);

                playerSection.classList.remove("hidden");
                resultsSection.before(playerSection);

                const loadEpisodes = (seasonNum, callback) => {
                  fetch(`https://api.themoviedb.org/3/tv/${id}/season/${seasonNum}`, {
                    headers: {
                      Authorization: `Bearer ${TMDB_TOKEN}`,
                    },
                  })
                    .then((res) => res.json())
                    .then((seasonData) => {
                      episodeSelect.innerHTML = seasonData.episodes
                        .map(ep => `<option value="${ep.episode_number}">Ep ${ep.episode_number}</option>`) 
                        .join("");
                      if (callback) callback();
                    });
                };

                seasonSelect.innerHTML = tvData.seasons
                  .filter(season => season.season_number > 0)
                  .map(season => `<option value="${season.season_number}">Season ${season.season_number}</option>`) 
                  .join("");

                seasonSelect.addEventListener("change", () => {
                  loadEpisodes(seasonSelect.value);
                });

                goBtn.addEventListener("click", () => {
                  const season = seasonSelect.value;
                  const episode = episodeSelect.value;
                  const embedUrl = `https://vidsrc.xyz/embed/tv?tmdb=${id}&season=${season}&episode=${episode}`;
                  playerFrame.src = embedUrl;
                });

                loadEpisodes(seasonSelect.value = tvData.seasons.find(s => s.season_number > 0)?.season_number || 1, () => {
                  const embedUrl = `https://vidsrc.xyz/embed/tv?tmdb=${id}&season=${seasonSelect.value}&episode=${episodeSelect.value}`;
                  playerFrame.src = embedUrl;
                });
              });
          }

          window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        resultsSection.appendChild(card);
      });
    })
    .catch((err) => {
      console.error(err);
      resultsSection.innerHTML = "<p>Error fetching results.</p>";
    })});
