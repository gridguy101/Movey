const TMDB_TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJiYmRmYTVjNzMyMTc2NzFmNjgxY2JlZThlYjlhZjUxMiIsIm5iZiI6MTc0NDQzODg0OS45MzIsInN1YiI6IjY3ZmEwNjQxZGU1ZTRkZWM2MmFkYTJiMCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.PmOMFeH2cb4LxnvzyMkCq3nVMnBY4aX5l_xZ9Q4CzgA";

const searchForm = document.getElementById("searchForm");
const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchButton");
const filterSelect = document.getElementById("filterSelect");

const resultsSection = document.getElementById("results");
const playerSection = document.getElementById("playerSection");
const playerContainer = document.getElementById("playerContainer");

searchForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const query = searchInput.value.trim();
  const filter = filterSelect.value;

  if (!query) return;

  // Clear previous content
  playerContainer.innerHTML = "";
  playerSection.classList.add("hidden");
  resultsSection.innerHTML = "Loading...";

  fetch(`https://api.themoviedb.org/3/search/multi?query=${encodeURIComponent(query)}`, {
    headers: {
      Authorization: `Bearer ${TMDB_TOKEN}`,
    },
  })
    .then((res) => {
      if (!res.ok) throw new Error("Fetch failed");
      return res.json();
    })
    .then((data) => {
      resultsSection.innerHTML = "";

      if (!data.results || data.results.length === 0) {
        resultsSection.innerHTML = "<p>No results found.</p>";
        return;
      }

      data.results.forEach((item) => {
        const isMovie = item.media_type === "movie";
        const isTV = item.media_type === "tv";

        if ((filter === "movie" && !isMovie) || (filter === "tv" && !isTV)) return;

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
          // Clear previous content
          playerContainer.innerHTML = "";
          playerSection.classList.remove("hidden");
          resultsSection.before(playerSection);

          if (isMovie) {
            const embedUrl = `https://vidfast.pro/movie/${id}`;
            playerContainer.innerHTML = `
              <iframe src="${embedUrl}" sandbox="allow-same-origin allow-scripts" allowfullscreen></iframe>
            `;
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
                playerContainer.appendChild(selectorDiv);

                const playerFrame = document.createElement("iframe");
                playerFrame.setAttribute("sandbox", "allow-same-origin allow-scripts");
                playerFrame.setAttribute("allowfullscreen", true);
                playerContainer.appendChild(playerFrame);

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

                // Set up season list
                const seasons = tvData.seasons.filter(s => s.season_number > 0);
                seasonSelect.innerHTML = seasons
                  .map(s => `<option value="${s.season_number}">Season ${s.season_number}</option>`)
                  .join("");

                seasonSelect.addEventListener("change", () => {
                  loadEpisodes(seasonSelect.value);
                });

                goBtn.addEventListener("click", () => {
                  const season = seasonSelect.value;
                  const episode = episodeSelect.value;
                  const embedUrl = `https://vidfast.pro/tv/${id}/${season}/${episode}`;
                  playerFrame.src = embedUrl;
                });

                // Load Season 1 / Episode 1 by default
                const defaultSeason = seasons[0]?.season_number || 1;
                seasonSelect.value = defaultSeason;

                loadEpisodes(defaultSeason, () => {
                  const firstEp = episodeSelect.value;
                  const embedUrl = `https://vidfast.pro/tv/${id}/${defaultSeason}/${firstEp}`;
                  playerFrame.src = embedUrl;
                });
              });
          }

          window.scrollTo({ top: 0, behavior: "smooth" });
        });

        resultsSection.appendChild(card);
      });
    })
    .catch((err) => {
      console.error("Search error:", err);
      resultsSection.innerHTML = "<p>Error fetching results.</p>";
    });
});
