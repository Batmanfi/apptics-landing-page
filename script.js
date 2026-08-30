const video = document.querySelector("#testimonial-video");
const playButton = document.querySelector(".video-play");

if (video && playButton) {
  const syncButton = () => {
    const playing = !video.paused && !video.ended;
    playButton.classList.toggle("is-hidden", playing);
    playButton.setAttribute("aria-label", playing ? "Pause Rayan's testimonial" : "Play Rayan's testimonial");
  };

  playButton.addEventListener("click", async () => {
    if (video.paused || video.ended) {
      try {
        await video.play();
      } catch {
        video.controls = true;
      }
    } else {
      video.pause();
    }
    syncButton();
  });

  video.addEventListener("click", () => {
    if (!video.paused) video.pause();
  });
  video.addEventListener("play", syncButton);
  video.addEventListener("pause", syncButton);
  video.addEventListener("ended", syncButton);
}
