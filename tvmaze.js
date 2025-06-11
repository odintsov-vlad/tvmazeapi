"use strict";




const $showsList = $("#shows-list");
const $episodesArea = $("#episodes-area");
const $searchForm = $("#search-form");
const $query = $("#search-query");
const $episodesList = $("#episodes-list");

const DEFAULT_IMAGE_URL = "https://tinyurl.com/tv-missing";

async function getShowCount() {
  try {
    const result = await axios.get(`https://api.tvmaze.com/shows`);
    const showCount = result.data.length;
    console.log(showCount);
  } catch (error) {
    console.error(`Mistake whilst getting the data`, error);
  }
}
getShowCount();

/* Запит на пошук шоу по ключовому слову */
async function getShowsByTerm(query) {
  const res = await axios.get(`https://api.tvmaze.com/search/shows?q=${query}`);
    const showCount = res.data.length;
    console.log(showCount);
  return res.data.map((result) => {
    const show = result.show;

    return {
      id: show.id,
      name: show.name,
      summary: show.summary || "No summary available.",
      image: show.image?.medium || DEFAULT_IMAGE_URL,
    };
  });
}

/** Рендер списку шоу в DOM */
function populateShows(shows) {
  $showsList.empty();

  for (let show of shows) {
    const $col = $(`
      <div class="col-md-6 col-lg-4">
        <div class="card h-100" data-show-id="${show.id}">
          <img src="${show.image}" class="card-img-top" alt="${show.name}">
          <div class="card-body d-flex flex-column">
            <h5 class="card-title">${show.name}</h5>
            <div class="card-text">${show.summary}</div>
            <button class="btn btn-primary mt-auto Show-getEpisodes">See Episodes</button>
          </div>
        </div>
      </div>
    `);

    $showsList.append($col);
  }
}

/** Обробка пошуку */
async function searchForShowAndDisplay() {
  const term = $query.val();
  const shows = await getShowsByTerm(term);

  $episodesArea.addClass("d-none");
  populateShows(shows);
}

$searchForm.on("submit", async function (event) {
  event.preventDefault();
  await searchForShowAndDisplay();
});

/** Запит списку епізодів конкретного шоу */
async function getEpisodesOfShow(showId) {
  const res = await axios.get(
    `https://api.tvmaze.com/shows/${showId}/episodes`
  );

  return res.data.map((episode) => ({
    id: episode.id,
    name: episode.name,
    season: episode.season,
    number: episode.number,
  }));
}

/** Рендер епізодів у список */
function populateEpisodes(episodes) {
  $episodesList.empty();

  for (let episode of episodes) {
    const $item = $(`
      <li class="list-group-item">
        ${episode.name} (Season ${episode.season}, Episode ${episode.number})
      </li>
    `);
    $episodesList.append($item);
  }

  $episodesArea.removeClass("d-none");
}

/** Обробник кнопки "See Episodes" */
$showsList.on("click", ".Show-getEpisodes", async function (event) {
  const $card = $(event.target).closest(".card");
  const showId = $card.data("show-id");

  const episodes = await getEpisodesOfShow(showId);
  populateEpisodes(episodes);
});
