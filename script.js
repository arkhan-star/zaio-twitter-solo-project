document.addEventListener("DOMContentLoaded", function () {
  const sidebar = document.querySelector(".aside-right");
  if (!sidebar) return;

  let lastScrollY = window.scrollY;
  let currentTop = 0;

  function update() {
    const sidebarH = sidebar.offsetHeight;
    const viewportH = window.innerHeight;

    if (sidebarH <= viewportH) {
      sidebar.style.top = "0px";
      lastScrollY = window.scrollY;
      return;
    }

    const maxNegative = -(sidebarH - viewportH);
    const delta = window.scrollY - lastScrollY;

    currentTop = Math.max(maxNegative, Math.min(0, currentTop - delta));
    sidebar.style.top = currentTop + "px";
    lastScrollY = window.scrollY;
  }

  window.addEventListener("scroll", update);
  window.addEventListener("resize", update);

  // Video Modal Player
  var modal = document.getElementById("video-modal");
  var modalVideo = document.getElementById("modal-video");
  var closeBtn = modal.querySelector(".close-btn");
  var muteBtn = modal.querySelector(".mute-btn");
  var progressBar = modal.querySelector(".video-progress");
  var progressFill = modal.querySelector(".video-progress-fill");

  function openVideoModal(src) {
    modalVideo.src = src;
    modalVideo.muted = true;
    muteBtn.textContent = "\uD83D\uDD07";
    muteBtn.setAttribute("aria-label", "Unmute");
    progressFill.style.width = "0%";
    modal.hidden = false;
    document.body.style.overflow = "hidden";
    modalVideo.play().catch(function () {
      closeVideoModal();
    });
  }

  function closeVideoModal() {
    modalVideo.pause();
    modalVideo.removeAttribute("src");
    modalVideo.load();
    modal.hidden = true;
    document.body.style.overflow = "";
  }

  // Play button click (delegated)
  document.addEventListener("click", function (e) {
    var playBtn = e.target.closest(".play-button");
    if (!playBtn) return;
    e.preventDefault();
    e.stopPropagation();
    var media = playBtn.closest(".post-media");
    var src = media && media.dataset.videoSrc;
    if (src) openVideoModal(src);
  });

  // Close button
  closeBtn.addEventListener("click", function (e) {
    e.stopPropagation();
    closeVideoModal();
  });

  // Backdrop click to close
  modal.querySelector(".video-modal-backdrop").addEventListener("click", closeVideoModal);

  // ESC key to close
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !modal.hidden) closeVideoModal();
  });

  // Click video to toggle play/pause
  modalVideo.addEventListener("click", function (e) {
    e.stopPropagation();
    if (modalVideo.paused) {
      modalVideo.play();
    } else {
      modalVideo.pause();
    }
  });

  // Mute toggle
  muteBtn.addEventListener("click", function (e) {
    e.stopPropagation();
    modalVideo.muted = !modalVideo.muted;
    muteBtn.textContent = modalVideo.muted ? "\uD83D\uDD07" : "\uD83D\uDD0A";
    muteBtn.setAttribute("aria-label", modalVideo.muted ? "Unmute" : "Mute");
  });

  // Progress bar update
  modalVideo.addEventListener("timeupdate", function () {
    if (modalVideo.duration) {
      progressFill.style.width = (modalVideo.currentTime / modalVideo.duration) * 100 + "%";
    }
  });

  // Seek on progress bar click
  progressBar.addEventListener("click", function (e) {
    e.stopPropagation();
    var rect = progressBar.getBoundingClientRect();
    var pct = (e.clientX - rect.left) / rect.width;
    modalVideo.currentTime = pct * modalVideo.duration;
  });

  // Handle video load error (missing file)
  modalVideo.addEventListener("error", function () {
    if (!modal.hidden) closeVideoModal();
  });

  // More menu toggle
  var moreBtn = document.getElementById("more-toggle-btn");
  var moreMenu = document.getElementById("more-menu");

  if (moreBtn && moreMenu) {
    moreBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      moreMenu.classList.toggle("open");
    });

    document.addEventListener("click", function (e) {
      if (!moreMenu.contains(e.target)) {
        moreMenu.classList.remove("open");
      }
    });
  }
});
