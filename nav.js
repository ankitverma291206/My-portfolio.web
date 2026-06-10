/* nav.js — scroll reveal for all pages */
(function () {
  const els = document.querySelectorAll('.reveal');
  const obs = new IntersectionObserver(
    entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
    { rootMargin: '0px 0px -40px 0px' }
  );
  els.forEach(el => obs.observe(el));
})();
