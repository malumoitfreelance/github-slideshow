const endpoints = {
  tracks: "/music/ceddo-benz/tracks",
  beats: "/beats",
};

const elements = {
  preview: {
    section: document.querySelector("[data-component='PreviewTracksGrid']"),
    grid: document.querySelector("[data-preview-grid]"),
    status: document.querySelector("[data-preview-status]"),
  },
  beats: {
    section: document.querySelector("[data-component='BeatsCarousel']"),
    carousel: document.querySelector("[data-beats-carousel]"),
    status: document.querySelector("[data-beats-status]"),
    filters: document.querySelector("[data-category-filters]"),
  },
  premium: {
    section: document.querySelector("[data-component='TopPremiumList']"),
    list: document.querySelector("[data-premium-list]"),
    status: document.querySelector("[data-premium-status]"),
  },
  nowPlaying: {
    title: document.querySelector("[data-now-playing]"),
    meta: document.querySelector("[data-now-playing-meta]"),
  },
  subscribeButtons: document.querySelectorAll("[data-action='subscribe']"),
  featuredButton: document.querySelector("[data-action='play-featured']"),
};

function setSectionState(section, statusEl, state, message = "") {
  section.dataset.state = state;
  statusEl.textContent = message;
}

function renderSkeletons(container, count) {
  container.innerHTML = Array.from({ length: count })
    .map(() => '<div class="skeleton skeleton-card"></div>')
    .join("");
}

function onPlayPreview(track) {
  if (!track) {
    return;
  }
  elements.nowPlaying.title.textContent = track.title;
  elements.nowPlaying.meta.textContent = `${track.artist || "Ceddo Benz"} · ${track.duration || "2:30"}`;
}

function onSubscribeCTA() {
  elements.nowPlaying.title.textContent = "Accès premium";
  elements.nowPlaying.meta.textContent = "Merci ! Vous êtes sur la liste des abonnés.";
}

function onCategoryFilter(category) {
  const buttons = elements.beats.filters.querySelectorAll(".filter");
  buttons.forEach((button) => {
    button.classList.toggle("active", button.dataset.category === category);
  });
  loadBeats(category);
}

function renderPreviewTracks(tracks) {
  if (!tracks.length) {
    elements.preview.grid.innerHTML = "";
    setSectionState(elements.preview.section, elements.preview.status, "empty", "Aucune track disponible pour le moment.");
    return;
  }

  elements.preview.grid.innerHTML = tracks
    .map((track) => {
      return `
        <article class="track-card">
          <h3>${track.title}</h3>
          <p class="muted">${track.artist || "Ceddo Benz"}</p>
          <p class="muted">${track.duration || "2:30"}</p>
          <button class="ghost" type="button" data-track-id="${track.id}">Lire le preview</button>
        </article>
      `;
    })
    .join("");

  setSectionState(elements.preview.section, elements.preview.status, "success", "");

  elements.preview.grid.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => {
      const track = tracks.find((item) => String(item.id) === button.dataset.trackId);
      onPlayPreview(track);
    });
  });
}

function renderPremiumList(tracks) {
  if (!tracks.length) {
    elements.premium.list.innerHTML = "";
    setSectionState(elements.premium.section, elements.premium.status, "empty", "Aucun contenu premium pour l'instant.");
    return;
  }

  elements.premium.list.innerHTML = tracks
    .map((track, index) => {
      return `
        <li class="premium-item">
          <div>
            <strong>${index + 1}. ${track.title}</strong>
            <p class="muted">${track.artist || "Ceddo Benz"}</p>
          </div>
          <span>${track.price || "Premium"}</span>
        </li>
      `;
    })
    .join("");

  setSectionState(elements.premium.section, elements.premium.status, "success", "");
}

function renderBeats(beats) {
  if (!beats.length) {
    elements.beats.carousel.innerHTML = "";
    setSectionState(elements.beats.section, elements.beats.status, "empty", "Aucun beat trouvé pour cette catégorie.");
    return;
  }

  elements.beats.carousel.innerHTML = beats
    .map((beat) => {
      return `
        <article class="beat-card">
          <h3>${beat.title}</h3>
          <p class="muted">${beat.category}</p>
          <p class="muted">${beat.bpm ? `${beat.bpm} BPM` : ""}</p>
          <button class="ghost" type="button">Découvrir</button>
        </article>
      `;
    })
    .join("");

  setSectionState(elements.beats.section, elements.beats.status, "success", "");
}

async function loadTracks() {
  renderSkeletons(elements.preview.grid, 4);
  renderSkeletons(elements.premium.list, 3);
  setSectionState(elements.preview.section, elements.preview.status, "loading", "Chargement des previews...");
  setSectionState(elements.premium.section, elements.premium.status, "loading", "Chargement des tops premium...");

  try {
    const response = await fetch(endpoints.tracks);
    if (!response.ok) {
      throw new Error("Impossible de charger les tracks.");
    }
    const payload = await response.json();
    const tracks = Array.isArray(payload) ? payload : payload.tracks || [];
    renderPreviewTracks(tracks);
    const premiumTracks = tracks.filter((track) => track.premium);
    renderPremiumList(premiumTracks);
  } catch (error) {
    elements.preview.grid.innerHTML = "";
    elements.premium.list.innerHTML = "";
    setSectionState(
      elements.preview.section,
      elements.preview.status,
      "error",
      "Impossible de charger les previews."
    );
    setSectionState(
      elements.premium.section,
      elements.premium.status,
      "error",
      "Impossible de charger les contenus premium."
    );
  }
}

async function loadBeats(category) {
  renderSkeletons(elements.beats.carousel, 5);
  setSectionState(elements.beats.section, elements.beats.status, "loading", "Chargement des beats...");

  const url = new URL(endpoints.beats, window.location.origin);
  if (category && category !== "all") {
    url.searchParams.set("category", category);
  }

  try {
    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error("Impossible de charger les beats.");
    }
    const payload = await response.json();
    const beats = Array.isArray(payload) ? payload : payload.beats || [];
    renderBeats(beats);
  } catch (error) {
    elements.beats.carousel.innerHTML = "";
    setSectionState(elements.beats.section, elements.beats.status, "error", "Impossible de charger les beats.");
  }
}

function bindActions() {
  elements.subscribeButtons.forEach((button) => {
    button.addEventListener("click", onSubscribeCTA);
  });

  if (elements.featuredButton) {
    elements.featuredButton.addEventListener("click", () => {
      onPlayPreview({
        title: "Preview du jour",
        artist: "Ceddo Benz",
        duration: "1:45",
      });
    });
  }

  elements.beats.filters.addEventListener("click", (event) => {
    const button = event.target.closest(".filter");
    if (!button) {
      return;
    }
    onCategoryFilter(button.dataset.category);
  });
}

bindActions();
loadTracks();
loadBeats("all");
