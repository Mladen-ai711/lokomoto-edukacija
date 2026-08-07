(() => {
  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  if (reducedMotion || !("IntersectionObserver" in window)) return;

  const root = document.documentElement;
  const animated = new Set();

  const prepare = (selector, effect = "up", stagger = 0) => {
    document.querySelectorAll(selector).forEach((element, index) => {
      if (animated.has(element)) return;

      element.classList.add("scroll-reveal", `reveal-${effect}`);
      element.style.setProperty(
        "--reveal-delay",
        `${Math.min(index * stagger, 320)}ms`,
      );
      animated.add(element);
    });
  };

  prepare(".facts-bar > div", "up", 55);
  prepare(".section-heading", "up");
  prepare(".problem-card", "up", 90);
  prepare(".manifesto-mark", "scale");
  prepare(".manifesto > div", "up");
  prepare(".manifesto > p", "right");
  prepare(".system-photo", "clip");
  prepare(".phase", "up", 90);
  prepare(".compare-before", "left");
  prepare(".compare-arrow", "scale");
  prepare(".compare-after", "right");
  prepare(".outcomes-intro", "up");
  prepare(".outcome", "right", 55);
  prepare(".day-one", "left");
  prepare(".day-two", "right");
  prepare(".media-intro", "up");
  prepare(".media-grid figure", "clip", 90);
  prepare(".practice-image", "clip");
  prepare(".practice-copy > *", "up", 70);
  prepare(".instructor-photo", "clip");
  prepare(".instructor-title", "up");
  prepare(".instructor-statement", "right");
  prepare(".deliverables-grid article", "up", 65);
  prepare(".faq-title", "up");
  prepare(".offer-copy", "left");
  prepare(".price-card", "right");

  root.classList.add("motion-ready");

  const revealElement = (element) => {
    element.classList.add("is-visible");
    element.addEventListener(
      "transitionend",
      () => element.classList.add("reveal-complete"),
      { once: true },
    );
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        revealElement(entry.target);
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.12,
      rootMargin: "0px 0px -10% 0px",
    },
  );

  const clippedGroups = new Map();

  animated.forEach((element) => {
    if (!element.classList.contains("reveal-clip")) {
      observer.observe(element);
      return;
    }

    const trigger = element.parentElement;
    if (!clippedGroups.has(trigger)) clippedGroups.set(trigger, []);
    clippedGroups.get(trigger).push(element);
  });

  const clippedObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        clippedGroups.get(entry.target).forEach(revealElement);
        clippedObserver.unobserve(entry.target);
      });
    },
    {
      threshold: 0.08,
      rootMargin: "0px 0px -8% 0px",
    },
  );

  clippedGroups.forEach((elements, trigger) => clippedObserver.observe(trigger));

  document.addEventListener("focusin", (event) => {
    const hiddenParent = event.target.closest(".scroll-reveal");
    if (hiddenParent) hiddenParent.classList.add("is-visible");
  });

  const parallaxItems = [
    [document.querySelector(".manifesto"), document.querySelector(".manifesto-bg"), 0.055],
    [document.querySelector(".practice-image"), document.querySelector(".practice-image img"), 0.035],
  ].filter(([section, media]) => section && media);

  parallaxItems.forEach(([, media]) => media.classList.add("parallax-media"));

  let frameRequested = false;
  const updateParallax = () => {
    parallaxItems.forEach(([section, media, speed]) => {
      const rect = section.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) return;

      const sectionCenter = rect.top + rect.height / 2;
      const offset = Math.max(
        -28,
        Math.min(28, (window.innerHeight / 2 - sectionCenter) * speed),
      );
      media.style.setProperty("--parallax-y", `${offset.toFixed(2)}px`);
    });
    frameRequested = false;
  };

  const requestParallaxUpdate = () => {
    if (frameRequested) return;
    frameRequested = true;
    window.requestAnimationFrame(updateParallax);
  };

  window.addEventListener("scroll", requestParallaxUpdate, { passive: true });
  window.addEventListener("resize", requestParallaxUpdate);
  updateParallax();
})();
