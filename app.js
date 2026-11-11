const PLACEHOLDER_BY_TYPE = {
  Apartamento: "assets/placeholders/apartamento.svg",
  Apartaestudio: "assets/placeholders/apartaestudio.svg",
  Casa: "assets/placeholders/casa.svg",
  Terreno: "assets/placeholders/terreno.svg",
  "Edificio de oficinas": "assets/placeholders/apartamento.svg",
};
const FEATURE_LABELS = {
  balcony: "Balcón / terraza",
  parking: "Parqueadero",
  elevator: "Ascensor",
  security: "Vigilancia",
};

const byId = (id) => document.getElementById(id);
const make = (tag, className, text) => {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
};

function safeAssetPath(path) {
  return typeof path === "string" && /^assets\/[a-zA-Z0-9_./-]+$/.test(path) && !path.includes("..")
    ? path
    : null;
}

function formatPrice(price) {
  if (typeof price !== "number" || !Number.isFinite(price)) return "Precio por confirmar";
  return `$ ${new Intl.NumberFormat("es-CO", { maximumFractionDigits: 0 }).format(price)}`;
}

function formatArea(area) {
  return new Intl.NumberFormat("es-CO", { maximumFractionDigits: 1 }).format(area);
}

function cardPriceLabel(listing) {
  if (typeof listing.price !== "number" && typeof listing.rentPrice !== "number") return "Precio por confirmar";
  if (typeof listing.rentPrice === "number" && typeof listing.price === "number") {
    return `Venta ${formatPrice(listing.price)} · arriendo ${formatPrice(listing.rentPrice)}/mes`;
  }
  const price = formatPrice(listing.price ?? listing.rentPrice);
  if (listing.operation === "Arriendo" || typeof listing.rentPrice === "number" || listing.priceIncludesAdmin) {
    return `${price}/mes${listing.priceIncludesAdmin ? " · administración incluida" : ""}`;
  }
  return price;
}

function mediaImage(path, alt, className = "", fallbackPath = null) {
  const safePath = safeAssetPath(path);
  if (!safePath) return null;
  const image = make("img", className);
  image.src = safePath;
  image.alt = alt;
  image.loading = "lazy";
  image.decoding = "async";
  const safeFallback = safeAssetPath(fallbackPath);
  if (safeFallback && safeFallback !== safePath) {
    image.addEventListener("error", () => {
      image.src = safeFallback;
      image.alt = `Imagen referencial de ${alt}`;
      image.closest(".card-visual")?.classList.add("is-placeholder");
    }, { once: true });
  }
  return image;
}

function listingCard(listing) {
  const link = make("a", "listing-card");
  link.href = `ficha-${listing.id}.html`;
  link.setAttribute("aria-label", `${listing.type}, código ${listing.id}. Abrir ficha.`);
  const visual = make("div", `card-visual${listing.cover?.includes("placeholders/") ? " is-placeholder" : ""}`);
  const placeholder = PLACEHOLDER_BY_TYPE[listing.type] || PLACEHOLDER_BY_TYPE.Apartamento;
  const cover = listing.cover || placeholder;
  const image = mediaImage(cover, listing.title || listing.type, "card-image", placeholder);
  if (image) visual.append(image);
  const hasPhotos = [...(listing.horizontalPhotos || []), ...(listing.verticalPhotos || []), ...(listing.squarePhotos || [])].length > 0;
  const badge = make("span", "status-badge", listing.cover?.includes("placeholders/") ? "Imagen referencial" : "Fotografías disponibles");
  visual.append(badge);

  const body = make("div", "card-body");
  const meta = make("div", "card-meta");
  meta.append(make("span", "listing-code", listing.id), make("span", "listing-type", listing.type));
  if (listing.operation) meta.append(make("span", "listing-operation", listing.operation));
  body.append(meta);
  body.append(make("h3", "card-title", listing.title || listing.type));
  body.append(make("p", "card-description", listing.description || "Descripción no disponible."));
  body.append(make("p", "card-info", listing.zone || "Zona por confirmar"));
  const specs = [];
  if (typeof listing.area === "number") specs.push(`${listing.areaLabel || "Área"} ${formatArea(listing.area)} m²`);
  if (typeof listing.lotArea === "number" && listing.lotArea !== listing.area) specs.push(`Lote ${formatArea(listing.lotArea)} m²`);
  if (typeof listing.bedrooms === "number") specs.push(`${listing.bedrooms} hab.`);
  if (typeof listing.bathrooms === "number") {
    specs.push(`${formatArea(listing.bathrooms)} ${listing.bathrooms === 1 ? "baño" : "baños"}`);
  }
  if (typeof listing.parking === "number") specs.push(`${listing.parking} parqueaderos`);
  else if (typeof listing.parking === "string") specs.push(`Parqueadero ${listing.parking.toLowerCase()}`);
  if (specs.length) {
    const specList = make("ul", "card-specs");
    specs.forEach((spec) => specList.append(make("li", "card-spec", spec)));
    body.append(specList);
  }
  if (typeof listing.administration === "number") {
    body.append(make("p", "card-admin", `Administración ${formatPrice(listing.administration)} / mes`));
  }
  const footer = make("div", "card-footer");
  footer.append(make("span", "card-price", cardPriceLabel(listing)));
  footer.append(make("span", "card-arrow", "Ver ficha →"));
  body.append(footer);
  link.append(visual, body);
  return link;
}

function populateSelect(select, values, placeholder) {
  if (!select) return;
  const current = select.value;
  select.replaceChildren(new Option(placeholder, ""));
  values.forEach((value) => select.add(new Option(value, value)));
  select.value = values.includes(current) ? current : "";
}

function sortListings(listings, order) {
  const result = [...listings];
  const numberLast = (value) => (typeof value === "number" && Number.isFinite(value) ? value : Number.POSITIVE_INFINITY);
  if (order === "type") {
    result.sort((a, b) => a.type.localeCompare(b.type, "es") || a.id.localeCompare(b.id));
  } else if (order === "price-low") {
    result.sort((a, b) => numberLast(a.price) - numberLast(b.price) || a.id.localeCompare(b.id));
  } else if (order === "area-high") {
    result.sort((a, b) => {
      const areaA = typeof a.area === "number" && Number.isFinite(a.area) ? a.area : null;
      const areaB = typeof b.area === "number" && Number.isFinite(b.area) ? b.area : null;
      if (areaA === null && areaB !== null) return 1;
      if (areaB === null && areaA !== null) return -1;
      return (areaB ?? 0) - (areaA ?? 0) || a.id.localeCompare(b.id);
    });
  } else {
    result.sort((a, b) => a.id.localeCompare(b.id, "es", { numeric: true }));
  }
  return result;
}

function filterListings(listings) {
  const query = (byId("query")?.value || "").trim().toLocaleLowerCase("es");
  const type = byId("type-filter")?.value || "";
  const zone = byId("zone-filter")?.value || "";
  const operation = byId("operation-filter")?.value || "";
  const minPrice = Number(byId("price-min")?.value);
  const maxPrice = Number(byId("price-max")?.value);
  const minArea = Number(byId("area-min")?.value);
  const minBedrooms = Number(byId("bedrooms-min")?.value);
  const minBathrooms = Number(byId("bathrooms-min")?.value);
  const featureFilters = [...document.querySelectorAll(".feature-filter input:checked:not(:disabled)")].map((input) => input.value);

  return listings.filter((listing) => {
    const searchText = `${listing.id} ${listing.type} ${listing.title} ${listing.zone || ""} ${listing.description || ""}`.toLocaleLowerCase("es");
    if (query && !searchText.includes(query)) return false;
    if (type && listing.type !== type) return false;
    if (zone && listing.zone !== zone) return false;
    if (operation && listing.operation !== operation) return false;
    if (Number.isFinite(minPrice) && byId("price-min").value && (listing.price == null || listing.price < minPrice)) return false;
    if (Number.isFinite(maxPrice) && byId("price-max").value && (listing.price == null || listing.price > maxPrice)) return false;
    if (Number.isFinite(minArea) && byId("area-min").value && (listing.area == null || listing.area < minArea)) return false;
    if (Number.isFinite(minBedrooms) && byId("bedrooms-min").value && (listing.bedrooms == null || listing.bedrooms < minBedrooms)) return false;
    if (Number.isFinite(minBathrooms) && byId("bathrooms-min").value && (listing.bathrooms == null || listing.bathrooms < minBathrooms)) return false;
    if (featureFilters.some((feature) => !Array.isArray(listing.features) || !listing.features.includes(feature))) return false;
    return true;
  });
}

function renderCatalog(listings) {
  const grid = byId("listing-grid");
  const empty = byId("empty-state");
  if (!grid || !empty) return;

  const filtered = sortListings(filterListings(listings), byId("sort-order")?.value);
  grid.replaceChildren(...filtered.map(listingCard));
  empty.hidden = filtered.length !== 0;
  byId("filter-status").textContent = `${filtered.length} ${filtered.length === 1 ? "inmueble" : "inmuebles"} en el catálogo`;
}

function detailField(label, value, formatter = (item) => String(item)) {
  if (value === null || value === undefined || value === "") return null;
  const item = make("div", "detail-field");
  item.append(make("dt", "", label), make("dd", "", formatter(value)));
  return item;
}

function mediaSection(title, paths, orientation) {
  if (!Array.isArray(paths) || paths.length === 0) return null;
  const section = make("section", `media-section media-${orientation}`);
  section.append(make("div", "media-heading", title));

  const carousel = make("div", "carousel");
  carousel.setAttribute("role", "group");
  carousel.setAttribute("aria-label", `${title} (carrusel)`);
  const viewport = make("div", "carousel-viewport");
  const track = make("div", "carousel-track");
  paths.forEach((path, index) => {
    const figure = make("figure", "media-figure carousel-slide");
    const image = mediaImage(path, `${title}, imagen ${index + 1}`, "gallery-image");
    if (!image) return;
    figure.append(image);
    track.append(figure);
  });
  if (!track.childElementCount) return null;
  viewport.append(track);
  carousel.append(viewport);

  const total = track.childElementCount;
  if (total > 1) {
    const prev = make("button", "carousel-button carousel-prev", "‹");
    prev.type = "button";
    prev.setAttribute("aria-label", `Imagen anterior de ${title}`);
    const next = make("button", "carousel-button carousel-next", "›");
    next.type = "button";
    next.setAttribute("aria-label", `Imagen siguiente de ${title}`);
    const counter = make("p", "carousel-counter", `1 / ${total}`);
    counter.setAttribute("aria-live", "polite");

    const update = () => {
      const step = viewport.clientWidth || 1;
      const index = Math.min(total - 1, Math.max(0, Math.round(viewport.scrollLeft / step)));
      counter.textContent = `${index + 1} / ${total}`;
      prev.disabled = index <= 0;
      next.disabled = index >= total - 1;
    };
    prev.addEventListener("click", () => viewport.scrollBy({ left: -viewport.clientWidth, behavior: "smooth" }));
    next.addEventListener("click", () => viewport.scrollBy({ left: viewport.clientWidth, behavior: "smooth" }));
    viewport.addEventListener("scroll", () => window.requestAnimationFrame(update), { passive: true });
    window.addEventListener("resize", update);
    update();

    carousel.append(prev, next, counter);
  }

  section.append(carousel);
  return section;
}

function planSection(plans) {
  if (!Array.isArray(plans) || plans.length === 0) return null;
  const section = make("section", "media-section media-plan");
  section.append(make("div", "media-heading", "Planos y documentación técnica"));
  const grid = make("div", "plan-grid");
  plans.forEach((plan, index) => {
    const path = typeof plan === "string" ? plan : plan.path;
    const label = typeof plan === "string" ? `Plano ${index + 1}` : (plan.title || `Plano ${index + 1}`);
    if (!safeAssetPath(path)) return;
    const figure = make("figure", "plan-item");
    const image = mediaImage(path, label, "gallery-image plan-image");
    if (!image) return;
    figure.append(image, make("figcaption", "plan-caption", label));
    grid.append(figure);
  });
  if (!grid.childElementCount) return null;
  section.append(grid);
  return section;
}

function renderDetail(listings) {
  const root = byId("detail-content");
  if (!root) return;
  const id = document.body.dataset.listingId || new URLSearchParams(window.location.search).get("id");
  const listing = listings.find((item) => item.id === id);
  if (!listing) {
    root.append(make("section", "not-found", "No encontramos esta ficha. Revisa el código o vuelve al catálogo."));
    document.title = "Ficha no disponible | Catálogo";
    return;
  }

  document.title = `${listing.id} | Ficha de inmueble`;
  const intro = make("section", "detail-intro");
  const titleBlock = make("div", "detail-title-block");
  titleBlock.append(make("p", "eyebrow", `FICHA / ${listing.id}`));
  titleBlock.append(make("h1", "", listing.title || listing.type));
  titleBlock.append(make("p", "detail-location", listing.zone || "Ubicación por confirmar"));
  intro.append(titleBlock);
  root.append(intro);

  const cover = make("section", "detail-cover");
  const placeholder = PLACEHOLDER_BY_TYPE[listing.type] || PLACEHOLDER_BY_TYPE.Apartamento;
  const image = mediaImage(listing.cover || placeholder, listing.title || listing.type, "detail-cover-image", placeholder);
  if (image) cover.append(image);
  cover.append(make("span", "cover-caption", listing.cover?.includes("placeholders/")
    ? `${listing.type} · Imagen referencial`
    : `${listing.type} · ${listing.id}`));
  root.append(cover);

  if (listing.negocio && listing.negocio.aceptaCoBroker) {
    const broker = make("section", "detail-broker");
    broker.append(make("p", "eyebrow", "MODALIDAD DE VENTA"));
    broker.append(make("p", "detail-broker-text", listing.negocio.texto || ""));
    root.append(broker);
  }

  const summary = make("section", "detail-summary");
  const description = listing.description?.trim();
  const descriptionBlock = make("div", "description-block");
  descriptionBlock.append(make("p", "eyebrow", "DESCRIPCIÓN"));
  descriptionBlock.append(make("h2", "", description || "Descripción no disponible"));
  if (!description) {
    descriptionBlock.append(make("p", "muted", "No hay una descripción disponible para esta ficha."));
  }
  summary.append(descriptionBlock);

  const specs = make("div", "specs-block");
  specs.append(make("p", "eyebrow", "CARACTERÍSTICAS"));
  const dl = make("dl", "specs-list");
  const fields = [
    detailField("Tipo de inmueble", listing.type),
    detailField("Operación", listing.operation),
    detailField(listing.areaLabel || "Área", listing.area, (value) => `${formatArea(value)} m²`),
    detailField("Área privada", listing.privateArea, (value) => `${formatArea(value)} m²`),
    detailField("Área del lote", listing.lotArea, (value) => `${formatArea(value)} m²`),
    detailField("Piso", listing.floor),
    detailField("Habitaciones", listing.bedrooms),
    detailField("Baños", listing.bathrooms, formatArea),
    detailField("Parqueadero", listing.parking, (value) => value === true ? "Sí" : value === false ? "No" : String(value)),
    detailField("Administración", listing.administration, (value) => `${formatPrice(value)} / mes`),
  ].filter(Boolean);
  if (fields.length) dl.append(...fields);
  else dl.append(make("div", "muted", "Las características se incorporarán una vez verificadas."));
  specs.append(dl);
  if (typeof listing.price === "number") {
    const priceLabel = listing.operation === "Arriendo" ? "Canon de arriendo" : listing.operation === "Venta y arriendo" ? "Precio de venta" : "Precio";
    specs.append(make("p", "detail-price", `${priceLabel}: ${formatPrice(listing.price)}${listing.operation === "Arriendo" || listing.priceIncludesAdmin ? " / mes" : ""}`));
  }
  if (typeof listing.rentPrice === "number") specs.append(make("p", "detail-price", `Canon de arriendo: ${formatPrice(listing.rentPrice)} / mes`));
  if (typeof listing.price !== "number" && typeof listing.rentPrice !== "number") {
    specs.append(make("p", "detail-price", "Precio por confirmar"));
  }
  summary.append(specs);
  root.append(summary);
  if (Array.isArray(listing.features) && listing.features.length) {
    const features = make("section", "detail-features");
    features.append(make("p", "eyebrow", "CARACTERÍSTICAS ADICIONALES"));
    const tags = make("ul", "feature-tags");
    listing.features.forEach((feature) => {
      const label = FEATURE_LABELS[feature] || feature;
      tags.append(make("li", "feature-tag", label));
    });
    features.append(tags);
    root.append(features);
  }

  const galleries = make("div", "galleries");
  [
    ["Fotografías horizontales", listing.horizontalPhotos, "horizontal"],
    ["Fotografías verticales", listing.verticalPhotos, "vertical"],
    ["Fotografías cuadradas", listing.squarePhotos, "square"],
  ].forEach(([title, paths, orientation]) => {
    const section = mediaSection(title, paths, orientation);
    if (section) galleries.append(section);
  });
  if (galleries.childElementCount) root.append(galleries);

  const plans = planSection(listing.plans);
  if (plans) root.append(plans);

  if (Array.isArray(listing.videos) && listing.videos.length) {
    const videoSection = make("section", "video-section");
    videoSection.append(make("p", "eyebrow", "VIDEO"));
    videoSection.append(make("h2", "", "Recorrido audiovisual"));
    const grid = make("div", "video-grid");
    listing.videos.forEach((path) => {
      const safePath = safeAssetPath(path);
      if (!safePath) return;
      const video = make("video", "property-video");
      video.controls = true;
      video.preload = "metadata";
      video.src = safePath;
      grid.append(video);
    });
    if (grid.childElementCount) videoSection.append(grid);
    root.append(videoSection);
  } else if (listing.videosPendingReview) {
    const videoSection = make("section", "video-section video-pending");
    videoSection.append(make("p", "eyebrow", "VIDEO"));
    videoSection.append(make("h2", "", "Video omitido"));
    videoSection.append(make("p", "", listing.videosWithheldReason || "El material requiere una revisión adicional antes de poder publicarse."));
    root.append(videoSection);
  }

  const notice = make("aside", "draft-notice");
  notice.append(make("span", "notice-icon", "i"));
  notice.append(make("p", "", "La disponibilidad, el precio y las condiciones del inmueble deben confirmarse antes de cualquier gestión."));
  root.append(notice);
}

function initialize() {
  try {
    const listings = window.PROPERTY_LISTINGS;
    if (!Array.isArray(listings)) throw new Error("El inventario tiene un formato no válido.");
    if (document.body.dataset.page === "catalog") {
      const types = [...new Set(listings.map((item) => item.type).filter(Boolean))].sort((a, b) => a.localeCompare(b, "es"));
      const zones = [...new Set(listings.map((item) => item.zone).filter((value) => typeof value === "string" && value.trim()))].sort((a, b) => a.localeCompare(b, "es"));
      const operations = [...new Set(listings.map((item) => item.operation).filter(Boolean))].sort((a, b) => a.localeCompare(b, "es"));
      populateSelect(byId("type-filter"), types, "Todos los tipos");
      populateSelect(byId("zone-filter"), zones, "Todas las zonas");
      populateSelect(byId("operation-filter"), operations, "Venta o arriendo");
      document.querySelectorAll(".feature-filter input").forEach((input) => {
        input.disabled = !listings.some((listing) => Array.isArray(listing.features) && listing.features.includes(input.value));
      });
      const filters = byId("filters");
      filters.addEventListener("submit", (event) => {
        event.preventDefault();
        renderCatalog(listings);
      });
      filters.addEventListener("input", () => renderCatalog(listings));
      filters.addEventListener("change", () => renderCatalog(listings));
      filters.addEventListener("reset", () => window.setTimeout(() => renderCatalog(listings), 0));
      byId("sort-order").addEventListener("change", () => renderCatalog(listings));
      byId("empty-clear").addEventListener("click", () => {
        filters.reset();
        byId("query").focus();
      });
      renderCatalog(listings);
    } else {
      renderDetail(listings);
    }
  } catch (error) {
    console.error(error);
    const message = "No se pudo cargar el inventario. Verifica los archivos del catálogo y vuelve a intentar.";
    const target = byId("listing-grid") || byId("detail-content");
    if (target) target.append(make("p", "load-error", message));
    const status = byId("filter-status");
    if (status) status.textContent = message;
  }
}

initialize();
