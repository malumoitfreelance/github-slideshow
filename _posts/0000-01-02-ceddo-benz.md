---
layout: slide
title: "Ceddo Benz"
---

<style>
  .music-app {
    font-family: "Helvetica Neue", Arial, sans-serif;
    color: #f8f9fb;
    background: linear-gradient(135deg, #1d1f2f, #2b1d3c);
    border-radius: 18px;
    padding: 24px;
    max-width: 960px;
  }

  .music-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
    flex-wrap: wrap;
  }

  .music-title {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .music-title h2 {
    margin: 0;
    font-size: 28px;
  }

  .music-title p {
    margin: 0;
    color: #c7c8d3;
  }

  .badge {
    display: inline-flex;
    align-items: center;
    padding: 4px 10px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.1);
    color: #ffd3a0;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .subscribe-button {
    background: #ffb347;
    color: #1a1b22;
    border: none;
    border-radius: 999px;
    padding: 10px 16px;
    font-weight: 600;
    cursor: pointer;
  }

  .track-list {
    margin-top: 24px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .track-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
    padding: 14px 16px;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.08);
  }

  .track-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .track-title {
    font-weight: 600;
  }

  .track-meta {
    font-size: 13px;
    color: #c7c8d3;
  }

  .track-actions {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .track-actions button {
    background: #2f89fc;
    color: #fff;
    border: none;
    border-radius: 999px;
    padding: 8px 14px;
    cursor: pointer;
  }

  .sticky-player {
    margin-top: 28px;
    background: rgba(0, 0, 0, 0.35);
    padding: 16px;
    border-radius: 14px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .sticky-player strong {
    font-size: 16px;
  }

  .error {
    color: #ffb3b3;
    font-weight: 600;
  }
</style>

<div id="ceddo-app" class="music-app">Chargement...</div>

<script>
  (() => {
    const app = document.getElementById("ceddo-app");
    const state = {
      subscription: { active: false },
      tracks: [],
      artist: {
        name: "Ceddo Benz",
        genre: "Afro Rap",
        location: "Paris, FR"
      },
      currentTrack: null,
      error: null
    };

    const audioEl = document.createElement("audio");
    audioEl.controls = true;

    const el = (tag, className, text) => {
      const node = document.createElement(tag);
      if (className) {
        node.className = className;
      }
      if (text) {
        node.textContent = text;
      }
      return node;
    };

    const getStreamUrl = (track) => {
      if (state.subscription.active) {
        return track.full_stream_url || track.preview_url || "";
      }
      return track.preview_url || "";
    };

    const playTrack = (track) => {
      const streamUrl = getStreamUrl(track);
      if (!streamUrl) {
        return;
      }
      state.currentTrack = track;
      audioEl.src = streamUrl;
      audioEl.play().catch(() => {});
      render();
    };

    const ArtistHeader = () => {
      const header = el("div", "music-header");
      const titleWrap = el("div", "music-title");
      titleWrap.appendChild(el("h2", null, state.artist.name));
      titleWrap.appendChild(el("p", null, `${state.artist.genre} · ${state.artist.location}`));

      const statusWrap = el("div");
      if (!state.subscription.active) {
        statusWrap.appendChild(el("span", "badge", "Full locked"));
        statusWrap.appendChild(el("button", "subscribe-button", "S’abonner"));
      } else {
        statusWrap.appendChild(el("span", "badge", "Accès complet"));
      }

      header.appendChild(titleWrap);
      header.appendChild(statusWrap);
      return header;
    };

    const TrackItem = (track, index) => {
      const item = el("div", "track-item");
      const info = el("div", "track-info");
      info.appendChild(el("div", "track-title", `${index + 1}. ${track.title || "Titre inconnu"}`));
      info.appendChild(el("div", "track-meta", track.duration || "3:12"));
      if (!state.subscription.active) {
        info.appendChild(el("span", "badge", "Full locked"));
      }

      const actions = el("div", "track-actions");
      const playButton = el("button", null, state.subscription.active ? "Écouter" : "Écouter l’extrait");
      playButton.addEventListener("click", () => playTrack(track));
      actions.appendChild(playButton);

      if (!state.subscription.active) {
        actions.appendChild(el("button", "subscribe-button", "S’abonner"));
      }

      item.appendChild(info);
      item.appendChild(actions);
      return item;
    };

    const TrackList = () => {
      const list = el("div", "track-list");
      state.tracks.forEach((track, index) => {
        list.appendChild(TrackItem(track, index));
      });
      return list;
    };

    const StickyPlayer = () => {
      const player = el("div", "sticky-player");
      if (!state.currentTrack) {
        player.appendChild(el("strong", null, "Aucun titre en lecture"));
        player.appendChild(el("span", null, "Sélectionnez un morceau pour démarrer."));
      } else {
        player.appendChild(el("strong", null, state.currentTrack.title || "Titre inconnu"));
        if (!state.subscription.active) {
          player.appendChild(el("span", "badge", "Full locked"));
        }
      }
      player.appendChild(audioEl);
      return player;
    };

    const render = () => {
      app.innerHTML = "";
      if (state.error) {
        app.appendChild(el("div", "error", state.error));
        return;
      }
      app.appendChild(ArtistHeader());
      app.appendChild(TrackList());
      app.appendChild(StickyPlayer());
    };

    const loadData = async () => {
      try {
        const [tracksResponse, subscriptionResponse] = await Promise.all([
          fetch("/music/ceddo-benz/tracks"),
          fetch("/subscription/status")
        ]);
        const tracksData = await tracksResponse.json();
        const subscriptionData = await subscriptionResponse.json();

        state.subscription = subscriptionData || { active: false };
        state.tracks = Array.isArray(tracksData)
          ? tracksData
          : tracksData.tracks || [];
        state.artist = tracksData.artist || tracksData.artist_profile || state.artist;
        render();
      } catch (error) {
        state.error = "Impossible de charger les titres pour l’instant.";
        render();
      }
    };

    render();
    loadData();
  })();
</script>
