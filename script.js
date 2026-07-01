const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector(".site-nav");
const bookingForm = document.querySelector("#booking-form");
const bookingMessage = document.querySelector("#booking-message");
const reservationModal = document.querySelector("#reservation-modal");
const reservationModalForm = document.querySelector("#reservation-modal-form");
const reservationModalMessage = document.querySelector("#reservation-modal-message");
const reservationModalClose = document.querySelector(".reservation-modal__close");
const lightbox = document.querySelector("#lightbox");
const lightboxImage = lightbox?.querySelector("img");
const lightboxClose = document.querySelector(".lightbox__close");
const dateTrigger = document.querySelector("#date-trigger");
const dateTriggerText = document.querySelector("#date-trigger-text");
const bookingCalendar = document.querySelector("#booking-calendar");
const calendarTitle = document.querySelector("#calendar-title");
const calendarGrid = document.querySelector("#calendar-grid");
const calendarClear = document.querySelector("#calendar-clear");
const calendarDone = document.querySelector("#calendar-done");
const calendarPrev = document.querySelector("[data-calendar-prev]");
const calendarNext = document.querySelector("[data-calendar-next]");
const arrivalInput = document.querySelector("#booking-arrival");
const departureInput = document.querySelector("#booking-departure");
const guestsInput = document.querySelector("#booking-guests");
const guestsValue = document.querySelector("#guests-value");
const guestsMinus = document.querySelector("[data-guests-minus]");
const guestsPlus = document.querySelector("[data-guests-plus]");
const roomSelect = document.querySelector("#booking-room");
const roomPicker = document.querySelector("[data-room-picker]");
const roomPickerTrigger = document.querySelector("#room-picker-trigger");
const roomPickerText = document.querySelector("#room-picker-text");
const roomPickerHint = { textContent: "" };
const roomPickerOptions = document.querySelector("#room-picker-options");
const roomOptionButtons = document.querySelectorAll("[data-room-value]");
const breakfastInput = document.querySelector("#booking-breakfast");
const breakfastToggle = document.querySelector(".breakfast-toggle");
const breakfastPrice = document.querySelector("#breakfast-price");
const modalMessageSummary = document.querySelector("#modal-message-summary");
const tripPhotoRotators = document.querySelectorAll("[data-trip-photo-rotator]");
const reviewRotators = document.querySelectorAll("[data-review-rotator]");
const currencyButtons = document.querySelectorAll("[data-currency]");
const currencyPriceElements = document.querySelectorAll("[data-price-czk]");

const WEB3FORMS_URL = "https://api.web3forms.com/submit";
const EUR_RATE_CZK = 24.17;

const FIELD_LIMITS = {
  name: 120,
  email: 180,
  phone: 40,
  note: 1000,
};

const MAX_GUESTS = 20;
const ROOM_HINTS = {
  "Dvoulůžkový pokoj": "2 osoby / 600 Kč za noc",
  "Třílůžkový pokoj": "3 osoby / 750 Kč za noc",
  "Čtyřlůžkový pokoj": "4 osoby / 1 000 Kč za noc",
};
const getStoredCurrency = () => {
  try {
    return window.localStorage.getItem("preferredCurrency") === "eur" ? "eur" : "czk";
  } catch (error) {
    return "czk";
  }
};

let activeCurrency = getStoredCurrency();

const formatCzkPrice = (value) => `${Number(value).toLocaleString("cs-CZ")} Kč`;

const formatEurPrice = (value) => `${Math.ceil(Number(value) / EUR_RATE_CZK).toLocaleString("cs-CZ")} €`;

const getBreakfastTotal = () => {
  const guests = Number(guestsInput.value || 1);
  const dailyPrice = Number(breakfastPrice.dataset.priceCzk || 0);
  return dailyPrice * Math.max(1, guests);
};

const getPriceLabel = (element, options = {}) => {
  const value = Number(element.dataset.priceCzk || 0);
  const prefix = options.prefix ?? (activeCurrency === "eur" ? element.dataset.priceEurPrefix : element.dataset.pricePrefix) ?? "";
  const suffix = options.suffix ?? element.dataset.priceSuffix ?? "";
  const price = activeCurrency === "eur" ? formatEurPrice(value) : formatCzkPrice(value);

  return [prefix, price, suffix].filter(Boolean).join(" ");
};

const getBreakfastLabel = () => {
  const prefix = breakfastPrice.dataset.pricePrefix || "+";
  const price = activeCurrency === "eur" ? formatEurPrice(getBreakfastTotal()) : formatCzkPrice(getBreakfastTotal());
  return `${prefix}${price} / den`;
};

const updateCurrencyPrices = () => {
  currencyPriceElements.forEach((element) => {
    if (element === breakfastPrice) {
      return;
    }

    element.textContent = getPriceLabel(element);
  });

  currencyButtons.forEach((button) => {
    const isActive = button.dataset.currency === activeCurrency;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
};

const getCleanPath = () => {
  if (window.location.protocol === "file:") {
    return window.location.pathname;
  }

  const pathParts = window.location.pathname.split("/").filter(Boolean);
  const isProjectPages = window.location.hostname.endsWith("github.io") && pathParts.length > 0;

  return isProjectPages ? `/${pathParts[0]}/` : "/";
};

const keepUrlClean = () => {
  if (!window.history.replaceState) {
    return;
  }

  try {
    window.history.replaceState(null, "", getCleanPath());
  } catch (error) {
    // Local file previews may reject history changes. Production keeps the clean "/" URL.
  }
};

const getScrollOffset = (targetId) => {
  const headerHeight = document.querySelector(".site-header")?.getBoundingClientRect().height || 0;
  const isBookingTarget = targetId === "rezervace" || targetId === "booking-form";
  const breathingRoom = isBookingTarget ? 18 : 12;

  return headerHeight + breathingRoom;
};

const scrollToTarget = (targetId, shouldFocus = false) => {
  const target = document.getElementById(targetId);

  if (!target) {
    return;
  }

  const targetTop = target.getBoundingClientRect().top + window.pageYOffset;
  const scrollTop = Math.max(0, targetTop - getScrollOffset(targetId));

  window.scrollTo({ top: scrollTop, behavior: "smooth" });
  keepUrlClean();

  if (shouldFocus && (targetId === "rezervace" || targetId === "booking-form")) {
    window.setTimeout(() => {
      dateTrigger.focus();
    }, 350);
  }
};

const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const addDays = (date, days) => {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
};

const today = new Date();
today.setHours(0, 0, 0, 0);

arrivalInput.min = formatDate(today);
departureInput.min = formatDate(addDays(today, 1));

let calendarMonth = new Date(today.getFullYear(), today.getMonth(), 1);

const parseInputDate = (value) => {
  if (!value) {
    return null;
  }

  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
};

const formatDisplayDate = (value) => {
  const date = parseInputDate(value);
  if (!date) {
    return "";
  }

  return date.toLocaleDateString("cs-CZ", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
  });
};

const updateDateTriggerText = () => {
  if (arrivalInput.value && departureInput.value) {
    dateTriggerText.textContent = `${formatDisplayDate(arrivalInput.value)} – ${formatDisplayDate(departureInput.value)}`;
    return;
  }

  if (arrivalInput.value) {
    dateTriggerText.textContent = `${formatDisplayDate(arrivalInput.value)} – vyberte odjezd`;
    return;
  }

  dateTriggerText.textContent = "Vyberte příjezd a odjezd";
};

const isSameDate = (first, second) => first && second && formatDate(first) === formatDate(second);

const isDateBetween = (date, start, end) => start && end && date > start && date < end;

const hasCompleteDateRange = () => Boolean(arrivalInput.value && departureInput.value);

const renderCalendar = () => {
  const monthName = calendarMonth.toLocaleDateString("cs-CZ", {
    month: "long",
    year: "numeric",
  });
  calendarTitle.textContent = monthName.charAt(0).toUpperCase() + monthName.slice(1);
  calendarGrid.replaceChildren();

  const firstDay = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const gridStart = new Date(firstDay);
  gridStart.setDate(firstDay.getDate() - startOffset);
  const selectedArrival = parseInputDate(arrivalInput.value);
  const selectedDeparture = parseInputDate(departureInput.value);

  for (let index = 0; index < 42; index += 1) {
    const date = addDays(gridStart, index);
    const button = document.createElement("button");
    button.type = "button";
    button.className = "date-day";
    button.textContent = String(date.getDate());
    button.dataset.date = formatDate(date);

    if (date.getMonth() !== calendarMonth.getMonth()) {
      button.classList.add("is-muted");
    }

    if (date < today) {
      button.disabled = true;
    }

    if (isSameDate(date, selectedArrival)) {
      button.classList.add("is-selected", "is-start");
      button.dataset.label = "příjezd";
    }

    if (isSameDate(date, selectedDeparture)) {
      button.classList.add("is-selected", "is-end");
      button.dataset.label = "odjezd";
    }

    if (isDateBetween(date, selectedArrival, selectedDeparture)) {
      button.classList.add("is-in-range");
    }

    button.addEventListener("click", () => {
      selectCalendarDate(button.dataset.date);
    });
    calendarGrid.append(button);
  }
};

const openCalendar = () => {
  bookingCalendar.hidden = false;
  dateTrigger.setAttribute("aria-expanded", "true");
  renderCalendar();
};

const closeCalendar = () => {
  bookingCalendar.hidden = true;
  dateTrigger.setAttribute("aria-expanded", "false");
};

const requestCalendarClose = (showMessage = false) => {
  if (hasCompleteDateRange()) {
    closeCalendar();
    return;
  }

  openCalendar();

  if (showMessage) {
    setFormMessage(bookingMessage, "Vyberte prosím datum příjezdu i odjezdu.", true);
  }
};

const selectCalendarDate = (dateValue) => {
  bookingMessage.textContent = "";

  if (!arrivalInput.value || (arrivalInput.value && departureInput.value) || dateValue <= arrivalInput.value) {
    arrivalInput.value = dateValue;
    departureInput.value = "";
  } else {
    departureInput.value = dateValue;
  }

  updateDepartureMin();
  validateDates();
  updateDateTriggerText();
  renderCalendar();

  if (hasCompleteDateRange()) {
    window.setTimeout(closeCalendar, 180);
  }
};

const setFormMessage = (element, text, isError = false) => {
  element.textContent = text;
  element.classList.toggle("is-error", isError);
};

const updateDepartureMin = () => {
  if (!arrivalInput.value) {
    departureInput.min = formatDate(addDays(today, 1));
    return;
  }

  const minDeparture = formatDate(addDays(new Date(arrivalInput.value), 1));
  departureInput.min = minDeparture;

  if (departureInput.value && departureInput.value <= arrivalInput.value) {
    departureInput.value = "";
  }

  updateDateTriggerText();
};

const validateDates = (requireComplete = false) => {
  departureInput.setCustomValidity("");

  if (!arrivalInput.value || !departureInput.value) {
    if (requireComplete) {
      setFormMessage(bookingMessage, "Vyberte prosím datum příjezdu i odjezdu.", true);
      return false;
    }
    return true;
  }

  if (departureInput.value <= arrivalInput.value) {
    departureInput.setCustomValidity("Datum odjezdu musí být později než datum příjezdu.");
    setFormMessage(bookingMessage, "Datum odjezdu musí být později než datum příjezdu.", true);
    return false;
  }

  return true;
};

const validateFieldLengths = () => {
  const formData = new FormData(reservationModalForm);

  return Object.entries(FIELD_LIMITS).every(([field, maxLength]) => {
    const value = String(formData.get(field) || "");
    return value.length <= maxLength;
  });
};

const validateGuests = () => {
  const guests = Number(guestsInput.value);
  return Number.isInteger(guests) && guests >= 1 && guests <= MAX_GUESTS;
};

const setGuests = (value) => {
  const guests = Math.max(1, Math.min(MAX_GUESTS, value));
  guestsInput.value = String(guests);
  guestsValue.textContent = String(guests);
  guestsMinus.disabled = guests <= 1;
  guestsPlus.disabled = guests >= MAX_GUESTS;

  if (breakfastPrice) {
    updateBreakfastState();
  }
};

const updateBreakfastState = () => {
  const selected = breakfastInput.checked;
  breakfastToggle.classList.toggle("is-selected", selected);
  breakfastPrice.textContent = getBreakfastLabel();
};

const openRoomPicker = () => {
  roomPickerOptions.hidden = false;
  roomPickerTrigger.setAttribute("aria-expanded", "true");
};

const closeRoomPicker = () => {
  roomPickerOptions.hidden = true;
  roomPickerTrigger.setAttribute("aria-expanded", "false");
};

const setRoomChoice = (value) => {
  roomSelect.value = value;
  roomPickerText.textContent = value || "Vyberte pokoj";
  roomPickerHint.textContent = ROOM_HINTS[value] || "2 až 4 osoby";
  roomPickerTrigger.classList.toggle("is-selected", Boolean(value));
  roomPickerTrigger.setAttribute("aria-invalid", "false");

  roomOptionButtons.forEach((button) => {
    const isSelected = button.dataset.roomValue === value;
    button.classList.toggle("is-selected", isSelected);
    button.setAttribute("aria-selected", String(isSelected));
  });
};

const validateRoom = (requireComplete = false) => {
  if (roomSelect.value) {
    return true;
  }

  if (requireComplete) {
    setFormMessage(bookingMessage, "Vyberte prosím typ pokoje.", true);
    roomPickerTrigger.setAttribute("aria-invalid", "true");
    openRoomPicker();
  }

  return false;
};

const fillModalBookingFields = () => {
  document.querySelector("#modal-arrival").value = arrivalInput.value;
  document.querySelector("#modal-departure").value = departureInput.value;
  document.querySelector("#modal-guests").value = guestsInput.value;
  document.querySelector("#modal-room").value = roomSelect.value;
  document.querySelector("#modal-breakfast").value = breakfastInput.checked ? `Ano, ${getBreakfastLabel()}` : "Ne";
};

const updateMessageSummary = () => {
  const elements = reservationModalForm.elements;
  const note = String(elements.note.value || "").trim() || "Bez poznámky";
  const breakfast = breakfastInput.checked ? `Ano, ${getBreakfastLabel()}` : "Ne";

  modalMessageSummary.value = [
    "Nová poptávka rezervace",
    "",
    `Jméno a příjmení: ${elements.name.value}`,
    `E-mail: ${elements.email.value}`,
    `Telefon: ${elements.phone.value}`,
    `Datum příjezdu: ${arrivalInput.value}`,
    `Datum odjezdu: ${departureInput.value}`,
    `Počet osob: ${guestsInput.value}`,
    `Typ pokoje: ${roomSelect.value}`,
    `Snídaně: ${breakfast}`,
    `Poznámka: ${note}`,
    "",
    "Upozornění:",
    "Toto není automaticky potvrzená rezervace. Host čeká na potvrzení dostupnosti ze strany penzionu.",
  ].join("\n");
};

const openReservationModal = () => {
  fillModalBookingFields();
  reservationModal.classList.add("is-open");
  reservationModal.setAttribute("aria-hidden", "false");
  reservationModalMessage.textContent = "";
  reservationModalMessage.classList.remove("is-error");
  reservationModalForm.elements.name.focus();
};

const closeReservationModal = () => {
  reservationModal.classList.remove("is-open");
  reservationModal.setAttribute("aria-hidden", "true");
};

navToggle.addEventListener("click", () => {
  const expanded = navToggle.getAttribute("aria-expanded") === "true";
  navToggle.setAttribute("aria-expanded", String(!expanded));
  siteNav.classList.toggle("is-open");
});

siteNav.addEventListener("click", (event) => {
  if (event.target.matches("a")) {
    navToggle.setAttribute("aria-expanded", "false");
    siteNav.classList.remove("is-open");
  }
});

document.addEventListener("click", (event) => {
  const link = event.target.closest("[data-scroll-target]");

  if (!link) {
    return;
  }

  event.preventDefault();
  const targetId = link.dataset.scrollTarget;
  scrollToTarget(targetId, targetId === "rezervace");
});

guestsMinus.addEventListener("click", () => setGuests(Number(guestsInput.value) - 1));
guestsPlus.addEventListener("click", () => setGuests(Number(guestsInput.value) + 1));

breakfastInput.addEventListener("change", updateBreakfastState);

currencyButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeCurrency = button.dataset.currency === "eur" ? "eur" : "czk";

    try {
      window.localStorage.setItem("preferredCurrency", activeCurrency);
    } catch (error) {
    }

    updateCurrencyPrices();
    updateBreakfastState();
  });
});

dateTrigger.addEventListener("click", () => {
  if (bookingCalendar.hidden) {
    openCalendar();
  } else {
    requestCalendarClose(true);
  }
});

calendarPrev.addEventListener("click", () => {
  calendarMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1);
  renderCalendar();
});

calendarNext.addEventListener("click", () => {
  calendarMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1);
  renderCalendar();
});

calendarClear.addEventListener("click", () => {
  arrivalInput.value = "";
  departureInput.value = "";
  updateDepartureMin();
  updateDateTriggerText();
  renderCalendar();
});

calendarDone.addEventListener("click", () => {
  requestCalendarClose(true);
});

document.addEventListener("click", (event) => {
  if (!bookingCalendar.hidden && !event.target.closest(".booking-date")) {
    requestCalendarClose(false);
  }

  if (!roomPickerOptions.hidden && !event.target.closest("[data-room-picker]")) {
    closeRoomPicker();
  }
});

arrivalInput.addEventListener("change", () => {
  bookingMessage.textContent = "";
  updateDepartureMin();
  validateDates();
});

departureInput.addEventListener("change", () => {
  bookingMessage.textContent = "";
  validateDates();
});

bookingForm.addEventListener("input", () => {
  if (bookingMessage.classList.contains("is-error")) {
    bookingMessage.textContent = "";
    bookingMessage.classList.remove("is-error");
  }
});

document.querySelectorAll("[data-room-choice]").forEach((link) => {
  link.addEventListener("click", () => {
    setRoomChoice(link.dataset.roomChoice);
    bookingMessage.textContent = "";
    bookingMessage.classList.remove("is-error");
  });
});

roomPickerTrigger.addEventListener("click", () => {
  if (roomPickerOptions.hidden) {
    openRoomPicker();
  } else {
    closeRoomPicker();
  }
});

roomOptionButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setRoomChoice(button.dataset.roomValue);
    closeRoomPicker();
    bookingMessage.textContent = "";
    bookingMessage.classList.remove("is-error");
  });
});

tripPhotoRotators.forEach((rotator) => {
  const photos = Array.from(rotator.querySelectorAll("img"));

  if (photos.length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }

  let activePhotoIndex = Math.max(0, photos.findIndex((photo) => photo.classList.contains("is-active")));

  window.setInterval(() => {
    photos[activePhotoIndex].classList.remove("is-active");
    activePhotoIndex = (activePhotoIndex + 1) % photos.length;
    photos[activePhotoIndex].classList.add("is-active");
  }, 3500);
});

reviewRotators.forEach((rotator) => {
  const reviews = Array.from(rotator.querySelectorAll(".review-card"));

  if (reviews.length < 2) {
    return;
  }

  let activeReviewIndex = reviews.findIndex((review) => review.classList.contains("is-active"));
  activeReviewIndex = activeReviewIndex >= 0 ? activeReviewIndex : 0;

  const getVisibleReviewCount = () => {
    if (window.matchMedia("(max-width: 640px)").matches) {
      return 1;
    }

    if (window.matchMedia("(max-width: 900px)").matches) {
      return Math.min(2, reviews.length);
    }

    return Math.min(3, reviews.length);
  };

  const showReviewGroup = () => {
    const visibleReviewCount = getVisibleReviewCount();
    reviews.forEach((review) => review.classList.remove("is-active"));

    for (let offset = 0; offset < visibleReviewCount; offset += 1) {
      reviews[(activeReviewIndex + offset) % reviews.length].classList.add("is-active");
    }
  };

  showReviewGroup();

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }

  window.addEventListener("resize", showReviewGroup);

  window.setInterval(() => {
    activeReviewIndex = (activeReviewIndex + 1) % reviews.length;
    showReviewGroup();
  }, 5200);
});

bookingForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  updateDepartureMin();

  if (!validateDates(true) || !validateGuests() || !validateRoom(true) || !bookingForm.checkValidity()) {
    bookingForm.reportValidity();
    if (!bookingMessage.textContent) {
      setFormMessage(bookingMessage, "Zkontrolujte prosím povinná pole ve formuláři.", true);
    }
    return;
  }

  bookingMessage.textContent = "";
  bookingMessage.classList.remove("is-error");
  openReservationModal();
});

reservationModalForm.addEventListener("input", () => {
  if (reservationModalMessage.classList.contains("is-error")) {
    reservationModalMessage.textContent = "";
    reservationModalMessage.classList.remove("is-error");
  }
});

reservationModalForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  fillModalBookingFields();
  updateMessageSummary();

  if (!validateDates(true) || !validateGuests() || !validateFieldLengths() || !reservationModalForm.checkValidity()) {
    reservationModalForm.reportValidity();
    if (!reservationModalMessage.textContent) {
      setFormMessage(reservationModalMessage, "Zkontrolujte prosím kontaktní údaje a GDPR souhlas.", true);
    }
    return;
  }

  const button = reservationModalForm.querySelector("button[type='submit']");
  button.disabled = true;
  button.textContent = "Odesílám...";

  try {
    const formData = new FormData(reservationModalForm);
    const payload = Object.fromEntries(formData);
    const response = await fetch(WEB3FORMS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });
    const result = await response.json().catch(() => ({ success: false }));

    if (!response.ok || !result.success) {
      throw new Error(result.message || "Odeslání se nezdařilo.");
    }

    bookingForm.reset();
    reservationModalForm.reset();
    setGuests(2);
    setRoomChoice("");
    updateBreakfastState();
    updateDepartureMin();
    updateDateTriggerText();
    closeReservationModal();
    setFormMessage(bookingMessage, "Děkujeme, vaše poptávka byla odeslána. Brzy vás budeme kontaktovat s potvrzením dostupnosti.");
  } catch (error) {
    setFormMessage(reservationModalMessage, "Poptávku se nepodařilo odeslat. Zkuste to prosím znovu nebo nás kontaktujte přímo e-mailem či telefonicky.", true);
  } finally {
    button.disabled = false;
    button.textContent = "Odeslat poptávku rezervace";
  }
});

reservationModalClose.addEventListener("click", closeReservationModal);

reservationModal.addEventListener("click", (event) => {
  if (event.target === reservationModal) {
    closeReservationModal();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && reservationModal.classList.contains("is-open")) {
    closeReservationModal();
  }

  if (event.key === "Escape" && !roomPickerOptions.hidden) {
    closeRoomPicker();
    roomPickerTrigger.focus();
  }
});

document.querySelectorAll(".gallery__item").forEach((button) => {
  button.addEventListener("click", () => {
    const image = button.querySelector("img");
    lightboxImage.src = image.src;
    lightboxImage.alt = image.alt;
    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
  });
});

lightboxClose.addEventListener("click", () => {
  lightbox.classList.remove("is-open");
  lightbox.setAttribute("aria-hidden", "true");
});

lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox) {
    lightboxClose.click();
  }
});

setGuests(2);
setRoomChoice(roomSelect.value);
updateCurrencyPrices();
updateBreakfastState();
updateDateTriggerText();

let initialScrollTarget = "";

try {
  initialScrollTarget = window.sessionStorage.getItem("scrollTarget") || "";
  window.sessionStorage.removeItem("scrollTarget");
} catch (error) {
}

if (!initialScrollTarget && window.location.hash) {
  initialScrollTarget = window.location.hash.slice(1);
}

keepUrlClean();

if (initialScrollTarget) {
  window.setTimeout(() => {
    scrollToTarget(initialScrollTarget, initialScrollTarget === "rezervace" || initialScrollTarget === "booking-form");
  }, 120);
}


