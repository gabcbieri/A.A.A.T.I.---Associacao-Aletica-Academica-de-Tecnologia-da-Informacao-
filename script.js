const menuToggle = document.querySelector('.menu-toggle');
const menuSidebar = document.querySelector('.menu-sidebar');

function setMenuState(isOpen) {
  menuSidebar.classList.toggle('active', isOpen);
  menuToggle.style.display = isOpen ? 'none' : '';
  menuToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
}

menuToggle.addEventListener('click', (event) => {
  event.stopPropagation();
  setMenuState(!menuSidebar.classList.contains('active'));
});

document.addEventListener('click', (event) => {
  if (!menuSidebar.classList.contains('active')) {
    return;
  }

  if (!menuSidebar.contains(event.target)) {
    setMenuState(false);
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && eventoModal && eventoModal.classList.contains('active')) {
    closeEventoModal();
    return;
  }

  if (event.key === 'Escape' && menuSidebar.classList.contains('active')) {
    setMenuState(false);
    menuToggle.focus();
  }
});

menuSidebar.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    setMenuState(false);
  });
});

document.querySelectorAll('a[target="_blank"]').forEach((link) => {
  const currentRel = link.getAttribute('rel') || '';
  const relParts = new Set(currentRel.split(/\s+/).filter(Boolean));
  relParts.add('noopener');
  relParts.add('noreferrer');
  link.setAttribute('rel', Array.from(relParts).join(' '));
});

const heroImage = document.querySelector('.inicio-img');
if (heroImage) {
  heroImage.setAttribute('loading', 'eager');
  heroImage.setAttribute('fetchpriority', 'high');
  heroImage.setAttribute('decoding', 'async');
}

document.querySelectorAll('img:not(.inicio-img)').forEach((image) => {
  if (!image.hasAttribute('loading')) {
    image.setAttribute('loading', 'lazy');
  }
  image.setAttribute('decoding', 'async');
});

const faqItems = document.querySelectorAll('.faq-lista details');

faqItems.forEach((item) => {
  item.addEventListener('toggle', () => {
    if (!item.open) {
      return;
    }

    faqItems.forEach((otherItem) => {
      if (otherItem !== item) {
        otherItem.open = false;
      }
    });
  });
});

const sobreVideoBtn = document.querySelector('.sobre-video-btn');
const sobreVideoContainer = document.querySelector('#sobre-video-container');

if (sobreVideoBtn && sobreVideoContainer) {
  sobreVideoBtn.addEventListener('click', () => {
    const isOpen = !sobreVideoContainer.hasAttribute('hidden');

    if (isOpen) {
      sobreVideoContainer.setAttribute('hidden', '');
      sobreVideoBtn.setAttribute('aria-expanded', 'false');
      sobreVideoBtn.textContent = 'Clique aqui!';
      return;
    }

    sobreVideoContainer.removeAttribute('hidden');
    sobreVideoBtn.setAttribute('aria-expanded', 'true');
    sobreVideoBtn.textContent = 'Ocultar vídeo';
    sobreVideoContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}

const eventoModal = document.querySelector('#evento-modal');
const eventoCards = document.querySelectorAll('.evento-detalhes');
const eventoTitulo = document.querySelector('#evento-modal-titulo');
const eventoDescricao = document.querySelector('#evento-modal-descricao');
const eventoData = document.querySelector('#evento-modal-data');
const eventoLocal = document.querySelector('#evento-modal-local');
const eventoGoogleLink = document.querySelector('#evento-google-link');
const eventoIcsLink = document.querySelector('#evento-ics-link');
const closeModalTriggers = document.querySelectorAll('[data-close-modal]');
let eventoIcsObjectUrl = '';

function toUtcCalendarString(date) {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

function parseLocalDateTime(value) {
  if (!value || typeof value !== 'string') {
    return null;
  }

  const parts = value.split('T');
  if (parts.length !== 2) {
    return null;
  }

  const dateParts = parts[0].split('-').map((part) => Number(part));
  const timeParts = parts[1].split(':').map((part) => Number(part));

  if (dateParts.length !== 3 || timeParts.length < 2) {
    return null;
  }

  const [year, month, day] = dateParts;
  const [hour, minute] = timeParts;

  if (![year, month, day, hour, minute].every(Number.isFinite)) {
    return null;
  }

  return new Date(year, month - 1, day, hour, minute, 0);
}

function escapeIcsText(value) {
  return String(value || '')
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;');
}

function formatDateTimeRange(startDate, endDate) {
  const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
  const timeFormatter = new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  });

  const sameDay = startDate.toDateString() === endDate.toDateString();
  if (sameDay) {
    return `${dateFormatter.format(startDate)} | ${timeFormatter.format(startDate)} - ${timeFormatter.format(endDate)}`;
  }
  return `${dateFormatter.format(startDate)} ${timeFormatter.format(startDate)} até ${dateFormatter.format(endDate)} ${timeFormatter.format(endDate)}`;
}

function closeEventoModal() {
  if (!eventoModal) {
    return;
  }
  eventoModal.classList.remove('active');
  eventoModal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
}

function openEventoModalFromCard(card) {
  if (!eventoModal || !eventoTitulo || !eventoDescricao || !eventoData || !eventoLocal || !eventoGoogleLink || !eventoIcsLink) {
    return;
  }

  const title = card.dataset.eventTitle || 'Evento Insano';
  const description = card.dataset.eventDescription || 'Confira os detalhes do evento.';
  const location = card.dataset.eventLocation || 'Local a definir';
  const startRaw = card.dataset.eventStart || '';
  const endRaw = card.dataset.eventEnd || '';
  const startDate = parseLocalDateTime(startRaw);
  const endDate = parseLocalDateTime(endRaw);
  const hasValidDates =
    !!startDate &&
    !!endDate &&
    !Number.isNaN(startDate.getTime()) &&
    !Number.isNaN(endDate.getTime()) &&
    endDate > startDate;

  eventoTitulo.textContent = title;
  eventoDescricao.textContent = description;
  eventoData.textContent = hasValidDates
    ? `Data e horário: ${formatDateTimeRange(startDate, endDate)}`
    : 'Data e horário: em breve';
  eventoLocal.textContent = `Local: ${location}`;

  if (hasValidDates) {
    const googleParams = new URLSearchParams({
      action: 'TEMPLATE',
      text: title,
      details: description,
      location,
      dates: `${toUtcCalendarString(startDate)}/${toUtcCalendarString(endDate)}`
    });
    eventoGoogleLink.href = `https://calendar.google.com/calendar/render?${googleParams.toString()}`;
    eventoGoogleLink.style.pointerEvents = '';
    eventoGoogleLink.style.opacity = '';

    if (eventoIcsObjectUrl) {
      URL.revokeObjectURL(eventoIcsObjectUrl);
    }

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Atletica Insano//Eventos//PT-BR',
      'BEGIN:VEVENT',
      `UID:${Date.now()}@insano`,
      `DTSTAMP:${toUtcCalendarString(new Date())}`,
      `DTSTART:${toUtcCalendarString(startDate)}`,
      `DTEND:${toUtcCalendarString(endDate)}`,
      `SUMMARY:${escapeIcsText(title)}`,
      `DESCRIPTION:${escapeIcsText(description)}`,
      `LOCATION:${escapeIcsText(location)}`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const icsBlob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    eventoIcsObjectUrl = URL.createObjectURL(icsBlob);
    eventoIcsLink.href = eventoIcsObjectUrl;
    eventoIcsLink.setAttribute('download', `${title.toLowerCase().replace(/\s+/g, '-')}.ics`);
    eventoIcsLink.style.pointerEvents = '';
    eventoIcsLink.style.opacity = '';
  } else {
    eventoGoogleLink.href = '#';
    eventoGoogleLink.style.pointerEvents = 'none';
    eventoGoogleLink.style.opacity = '0.6';
    eventoIcsLink.href = '#';
    eventoIcsLink.style.pointerEvents = 'none';
    eventoIcsLink.style.opacity = '0.6';
  }

  eventoModal.classList.add('active');
  eventoModal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
}

eventoCards.forEach((card) => {
  card.addEventListener('click', () => openEventoModalFromCard(card));
  const statusTag = card.querySelector('.evento-status');
  if (statusTag) {
    statusTag.style.cursor = 'pointer';
    statusTag.addEventListener('click', (event) => {
      event.stopPropagation();
      openEventoModalFromCard(card);
    });
  }
  card.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openEventoModalFromCard(card);
    }
  });
});

closeModalTriggers.forEach((trigger) => {
  trigger.addEventListener('click', closeEventoModal);
});

document.addEventListener('click', (event) => {
  const card = event.target.closest('.evento-detalhes');
  if (!card) {
    return;
  }
  openEventoModalFromCard(card);
});

const inscricaoForm = document.querySelector('.sejainsano-form');
const nextInsanoInput = document.querySelector('#next-insano');

if (inscricaoForm) {
  if (nextInsanoInput) {
    const basePath = window.location.pathname.replace(/[^/]*$/, '');
    const safeOrigin = window.location.origin && window.location.origin !== 'null' ? window.location.origin : '';
    nextInsanoInput.value = safeOrigin ? `${safeOrigin}${basePath}obrigado.html` : 'obrigado.html';
  }

  const requiredFields = Array.from(inscricaoForm.querySelectorAll('[required]'));

  function getErrorElement(field) {
    const key = field.id || field.name;
    let errorElement = inscricaoForm.querySelector(`[data-error-for="${key}"]`);

    if (!errorElement) {
      errorElement = document.createElement('p');
      errorElement.className = 'erro-campo';
      errorElement.dataset.errorFor = key;

      if (field.type === 'checkbox') {
        const wrapper = field.closest('.check-termo');
        if (wrapper) {
          wrapper.insertAdjacentElement('afterend', errorElement);
        }
      } else {
        field.insertAdjacentElement('afterend', errorElement);
      }
    }

    return errorElement;
  }

  function setFieldError(field, message) {
    const errorElement = getErrorElement(field);
    errorElement.textContent = message;
    field.classList.add('is-invalid');
    field.setAttribute('aria-invalid', 'true');
  }

  function clearFieldError(field) {
    const errorElement = getErrorElement(field);
    errorElement.textContent = '';
    field.classList.remove('is-invalid');
    field.removeAttribute('aria-invalid');
  }

  function validateField(field) {
    const value = (field.value || '').trim();
    const fieldId = field.id;

    if (field.type === 'checkbox') {
      if (!field.checked) {
        setFieldError(field, 'Voce precisa confirmar este campo.');
        return false;
      }

      clearFieldError(field);
      return true;
    }

    if (value === '') {
      setFieldError(field, 'Preencha este campo.');
      return false;
    }

    if (fieldId === 'email-insano') {
      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      if (!emailOk) {
        setFieldError(field, 'Digite um e-mail valido.');
        return false;
      }
    }

    if (fieldId === 'whats-insano') {
      const digits = value.replace(/\D/g, '');
      if (digits.length < 10 || digits.length > 13) {
        setFieldError(field, 'Digite um WhatsApp valido com DDD.');
        return false;
      }
    }

    if (fieldId === 'nome-insano' && value.length < 5) {
      setFieldError(field, 'Informe o nome completo.');
      return false;
    }

    if (fieldId === 'curso-insano') {
      const allowedCursos = Array.from(field.options).map((opt) => opt.value).filter(Boolean);
      if (!allowedCursos.includes(field.value)) {
        setFieldError(field, 'Selecione um curso valido.');
        return false;
      }
    }

    if (fieldId === 'periodo-insano') {
      const allowedPeriodos = Array.from(field.options).map((opt) => opt.value).filter(Boolean);
      if (!allowedPeriodos.includes(field.value)) {
        setFieldError(field, 'Selecione um periodo valido.');
        return false;
      }
    }

    if (fieldId === 'diretoria-insano') {
      const allowedDiretorias = Array.from(field.options).map((opt) => opt.value).filter(Boolean);
      if (!allowedDiretorias.includes(field.value)) {
        setFieldError(field, 'Selecione uma diretoria valida.');
        return false;
      }
    }

    clearFieldError(field);
    return true;
  }

  requiredFields.forEach((field) => {
    const eventName = field.tagName.toLowerCase() === 'select' || field.type === 'checkbox' ? 'change' : 'input';
    field.addEventListener(eventName, () => {
      validateField(field);
    });
  });

  inscricaoForm.addEventListener('submit', (event) => {
    const hasInvalidField = requiredFields.some((field) => !validateField(field));
    if (hasInvalidField) {
      event.preventDefault();
      return;
    }

    const submitButton = inscricaoForm.querySelector('.sejainsano-btn');
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = 'Enviando...';
    }
  });
}

const revealSelectors = [
  '.sobre-container',
  '.esportes-container',
  '.projetos-titulo',
  '.projeto-card',
  '.parcerias-container',
  '.socio-container',
  '.sejainsano-container',
  '.loja-container',
  '.eventos-container',
  '.diretoria-container',
  '.faq-container',
  '.contato-container'
];

const revealElements = document.querySelectorAll(revealSelectors.join(', '));
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!prefersReducedMotion && revealElements.length > 0) {
  revealElements.forEach((element, index) => {
    element.classList.add('reveal-on-scroll');
    element.style.setProperty('--reveal-delay', `${Math.min(index * 40, 240)}ms`);
  });

  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.14,
      rootMargin: '0px 0px -8% 0px'
    }
  );

  revealElements.forEach((element) => {
    revealObserver.observe(element);
  });
} else {
  revealElements.forEach((element) => {
    element.classList.add('is-visible');
  });
}
