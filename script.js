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

  // --- AI Post Creation ---
  var postInput = document.querySelector(".what-is-happening .post-user-info input");
  var postSubmitBtn = document.getElementById("post-submit-btn");
  var whatIsHappening = document.querySelector(".what-is-happening");

  function escapeHTML(str) {
    var div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  async function generateImage(promptText) {
    var url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent";

    var response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": GEMINI_API_KEY
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: "Generate an image: " + promptText }] }],
        generationConfig: { responseModalities: ["TEXT", "IMAGE"] }
      })
    });

    if (!response.ok) {
      throw new Error("Gemini API error: " + response.status);
    }

    var data = await response.json();
    var candidates = data.candidates;
    if (candidates && candidates.length > 0) {
      var parts = candidates[0].content.parts;
      for (var i = 0; i < parts.length; i++) {
        if (parts[i].inlineData) {
          return "data:" + parts[i].inlineData.mimeType + ";base64," + parts[i].inlineData.data;
        }
      }
    }

    throw new Error("No image returned from Gemini API");
  }

  function createPostElement(text, imageDataUrl) {
    var postReel = document.createElement("div");
    postReel.className = "post-reel user-post";

    postReel.innerHTML =
      '<div class="post-reel-header">' +
        '<img src="assets/profile.jpg" alt="Profile Picture" class="post-profile-pic">' +
        '<div class="post-user-info">' +
          '<span class="post-display-name">Al-Ridhaa Khan</span>' +
          '<span class="post-handle">@alridhaa_</span>' +
          '<span class="post-time">&middot; now</span>' +
        '</div>' +
        '<button class="delete-post-btn" aria-label="Delete post">&times;</button>' +
      '</div>' +
      '<p class="post-content">' + escapeHTML(text) + '</p>' +
      '<div class="post-media">' +
        '<img src="' + imageDataUrl + '" alt="AI Generated Image">' +
      '</div>' +
      '<div class="post-reel-footer">' +
        '<div class="post-action"><img src="assets/post-container/comment.svg" alt="Comment Icon"><span>0</span></div>' +
        '<div class="post-action"><img src="assets/post-container/repost.svg" alt="Repost Icon"><span>0</span></div>' +
        '<div class="post-action"><img src="assets/post-container/like.svg" alt="Like Icon"><span>0</span></div>' +
        '<div class="post-action"><img src="assets/post-container/view.svg" alt="Analytics Icon"><span>0</span></div>' +
        '<div class="post-action icon-only"><img src="assets/post-container/bookmark.svg" alt="Bookmark Icon"></div>' +
        '<div class="post-action icon-only"><img src="assets/post-container/share.svg" alt="Share Icon"></div>' +
      '</div>';

    return postReel;
  }

  if (postSubmitBtn && postInput) {
    postSubmitBtn.addEventListener("click", async function () {
      var text = postInput.value.trim();
      if (!text) return;

      postSubmitBtn.disabled = true;
      postSubmitBtn.textContent = "Posting...";

      try {
        var imageDataUrl = await generateImage(text);
        var newPost = createPostElement(text, imageDataUrl);
        whatIsHappening.insertAdjacentElement("afterend", newPost);
        postInput.value = "";
      } catch (err) {
        console.error("Failed to create post:", err);
        alert("Failed to generate image. Please try again.");
      } finally {
        postSubmitBtn.disabled = false;
        postSubmitBtn.textContent = "Post";
      }
    });
  }

  // Delete user posts (delegated)
  document.addEventListener("click", function (e) {
    var deleteBtn = e.target.closest(".delete-post-btn");
    if (!deleteBtn) return;

    var postReel = deleteBtn.closest(".post-reel.user-post");
    if (postReel) {
      postReel.remove();
    }
  });
});
