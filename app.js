(function () {
  "use strict";
  var items = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -35px 0px" });
    items.forEach(function (item) { observer.observe(item); });
  } else {
    items.forEach(function (item) { item.classList.add("visible"); });
  }
  // Hide the fixed scene narration once the parchment chapters enter view.
  var chronicle = document.querySelector(".chronicle");
  if (chronicle && "IntersectionObserver" in window) {
    var chronicleObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        document.body.classList.toggle("chronicle-active", entry.isIntersecting);
      });
    }, { threshold: 0.01, rootMargin: "0px 0px -12% 0px" });
    chronicleObserver.observe(chronicle);
  }

  document.querySelectorAll('.nav-links a, .begin-voyage, .colophon a').forEach(function (link) {
    link.addEventListener("click", function (event) {
      var target = document.querySelector(link.getAttribute("href"));
      if (target) {
        event.preventDefault();
        target.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
      }
    });
  });
})();
