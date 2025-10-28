/* ==================== HERO CAROUSEL (carrossel do topo) ==================== */
/* Troca automaticamente as imagens do banner principal a cada 5 segundos */
(function heroCarousel() {
  const heroImages = [
    "imagem/nti2024.png",
    "imagem/nti2025.jpg",
    "imagem/nti20252.png",
    "imagem/nti20242.png",
    "imagem/nti20253.png"
  ];

  let heroIndex = 0;
  const hero = document.querySelector(".hero");
  if (!hero) return;

  function changeHeroImage() {
    hero.style.backgroundImage = `url(${heroImages[heroIndex]})`;
    heroIndex = (heroIndex + 1) % heroImages.length;
  }

  changeHeroImage();
  setInterval(changeHeroImage, 5000);
})();

/* ==================== ABOUT CAROUSEL (carrossel da seção "Sobre") ==================== */
/* Faz o carrossel de imagens da seção "Sobre" funcionar com botões e auto-slide */
(function aboutCarousel() {
  const aboutTrack = document.querySelector(".about-img-carousel .carousel-track");
  const aboutPrev = document.querySelector(".about-img-carousel .carousel-btn.prev");
  const aboutNext = document.querySelector(".about-img-carousel .carousel-btn.next");
  if (!aboutTrack) return;

  const aboutImages = Array.from(aboutTrack.querySelectorAll("img"));
  let aboutIndex = 0;

  function updateAboutCarousel() {
    if (!aboutImages.length) return;
    const width = aboutImages[0].clientWidth || aboutImages[0].naturalWidth || 400;
    aboutTrack.style.transform = `translateX(-${aboutIndex * width}px)`;
  }

  if (aboutNext) aboutNext.addEventListener("click", () => {
    aboutIndex = (aboutIndex + 1) % aboutImages.length;
    updateAboutCarousel();
  });

  if (aboutPrev) aboutPrev.addEventListener("click", () => {
    aboutIndex = (aboutIndex - 1 + aboutImages.length) % aboutImages.length;
    updateAboutCarousel();
  });

  setInterval(() => {
    if (aboutImages.length) {
      aboutIndex = (aboutIndex + 1) % aboutImages.length;
      updateAboutCarousel();
    }
  }, 5000);

  window.addEventListener("resize", updateAboutCarousel);
  setTimeout(updateAboutCarousel, 120);
})();

/* ==================== TEAM CAROUSEL & FILTER (Carrossel de Estagiários) ==================== */
/* Exibe os estagiários, permite navegar com setas e filtrar por ano digitado */
(function teamCarousel() {
  const carousel = document.querySelector(".carousel");
  const track = document.querySelector(".carousel-track");
  const prevBtn = document.querySelector(".carousel-btn.prev");
  const nextBtn = document.querySelector(".carousel-btn.next");
  const anoInput = document.getElementById("ano-input");
  const anoBtn = document.getElementById("ano-btn");
  const showAllBtn = document.getElementById("show-all-btn");

  if (!carousel || !track) return;

  const originalMembers = Array.from(track.querySelectorAll(".member"));
  let visibleMembers = [...originalMembers];
  let currentIndex = 0;

  // Função para pegar o gap do CSS dinamicamente
  function getGapPx() {
    const cs = getComputedStyle(track);
    const gapStr = cs.gap || cs.gridGap || "16px";
    if (gapStr.endsWith("px")) return parseFloat(gapStr);
    if (gapStr.endsWith("rem")) {
      const rem = parseFloat(gapStr);
      return rem * parseFloat(getComputedStyle(document.documentElement).fontSize);
    }
    return parseFloat(gapStr) || 16;
  }

  // Renderiza os membros visíveis no carrossel
  function renderTrack() {
    track.innerHTML = "";
    if (!visibleMembers.length) {
      const p = document.createElement("p");
      p.className = "no-members";
      p.textContent = "Nenhum estagiário encontrado para este ano.";
      track.appendChild(p);
      disableNav(true);
      return;
    }
    visibleMembers.forEach(m => { m.style.display = ""; track.appendChild(m); });
    disableNav(false);
  }

  // Ativa/desativa botões de navegação
  function disableNav(state) {
    if (prevBtn) {
      prevBtn.disabled = !!state;
      prevBtn.style.opacity = state ? "0.45" : "0.95";
      prevBtn.style.cursor = state ? "not-allowed" : "pointer";
    }
    if (nextBtn) {
      nextBtn.disabled = !!state;
      nextBtn.style.opacity = state ? "0.45" : "0.95";
      nextBtn.style.cursor = state ? "not-allowed" : "pointer";
    }
  }

  // Atualiza posição do carrossel
  function updateCarousel() {
    if (!visibleMembers.length) { track.style.transform = "translateX(0)"; return; }
    if (track.children.length !== visibleMembers.length) renderTrack();

    const first = visibleMembers[0];
    if (!first) return;

    const rect = first.getBoundingClientRect();
    const cardWidth = rect.width || first.offsetWidth;
    if (!cardWidth || cardWidth < 1) { setTimeout(updateCarousel, 80); return; }

    const gap = getGapPx();
    const trackWidth = carousel.clientWidth;
    const visibleCards = Math.max(1, Math.floor((trackWidth + gap) / (cardWidth + gap)));
    const maxIndex = Math.max(visibleMembers.length - visibleCards, 0);

    if (currentIndex > maxIndex) currentIndex = maxIndex;
    if (currentIndex < 0) currentIndex = 0;

    const move = currentIndex * (cardWidth + gap);
    track.style.transform = `translateX(-${move}px)`;

    if (prevBtn) prevBtn.disabled = currentIndex <= 0;
    if (nextBtn) nextBtn.disabled = currentIndex >= maxIndex;
  }

  // Eventos das setas
  if (nextBtn) nextBtn.addEventListener("click", () => { currentIndex++; updateCarousel(); });
  if (prevBtn) prevBtn.addEventListener("click", () => { currentIndex--; updateCarousel(); });

  // Aplicar filtro por ano
  function applyFilter() {
    const ano = (anoInput && anoInput.value) ? anoInput.value.trim() : "";
    if (!ano) visibleMembers = [...originalMembers];
    else visibleMembers = originalMembers.filter(m => m.dataset && m.dataset.ano === ano);
    currentIndex = 0;
    renderTrack();
    updateCarousel();
  }

  if (anoBtn) anoBtn.addEventListener("click", applyFilter);
  if (anoInput) anoInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      applyFilter();
    }
  });

  if (showAllBtn) showAllBtn.addEventListener("click", () => {
    anoInput.value = "";
    visibleMembers = [...originalMembers];
    currentIndex = 0;
    renderTrack();
    updateCarousel();
  });

  window.addEventListener("resize", () => { setTimeout(updateCarousel, 100); });

  // Inicialização
  renderTrack();
  setTimeout(updateCarousel, 200);
})();

/* ==================== GALLERY LIGHTBOX ==================== */
/* Cria um efeito de clique em imagens da galeria para vê-las em destaque */
(function galleryLightbox() {
  const items = Array.from(document.querySelectorAll(".gallery-item"));
  if (!items.length) return;

  const lightbox = document.createElement("div");
  lightbox.className = "lightbox";
  const img = document.createElement("img");
  lightbox.appendChild(img);
  document.body.appendChild(lightbox);

  function open(src, alt = "") {
    img.src = src;
    img.alt = alt;
    lightbox.style.display = "flex";
    document.body.style.overflow = "hidden";
  }

  function close() {
    lightbox.style.display = "none";
    document.body.style.overflow = "";
  }

  items.forEach(it => it.addEventListener("click", () => open(it.src || it.getAttribute('src'), it.alt || "")));
  lightbox.addEventListener("click", (e) => { if (e.target === lightbox || e.target === img) close(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
})();

/* ==================== COUNTERS (contadores animados no hero) ==================== */
/* Anima números subindo quando a seção hero aparece na tela */
(function counters() {
  const counters = Array.from(document.querySelectorAll(".count"));
  if (!counters.length) return;

  function runCounter(el) {
    const target = parseInt(el.dataset.target || el.textContent, 10);
    const duration = 1500;
    let start = 0;
    const step = Math.max(1, Math.floor(target / (duration / 30)));

    const interval = setInterval(() => {
      start += step;
      if (start >= target) {
        el.textContent = target;
        clearInterval(interval);
      } else {
        el.textContent = start;
      }
    }, 30);
  }

  const hero = document.querySelector(".hero");
  if (!hero) return;

  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        counters.forEach(c => runCounter(c));
        obs.disconnect();
      }
    });
  }, { threshold: 0.3 });

  obs.observe(hero);
})();

/* ==================== NEWSLETTER MOCK ==================== */
/* Simula o envio de formulário de newsletter com validação simples */
(function newsletter() {
  const form = document.getElementById("newsletter-form");
  const msg = document.querySelector(".newsletter-msg");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("newsletter-email").value;

    if (!email || !email.includes("@")) {
      msg.textContent = "Por favor informe um e-mail válido.";
      msg.style.color = "#c53030";
      return;
    }

    msg.textContent = "Inscrito com sucesso! (simulação)";
    msg.style.color = "#065f9e";
    form.reset();
  });
})();
