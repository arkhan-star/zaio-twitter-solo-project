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
});
