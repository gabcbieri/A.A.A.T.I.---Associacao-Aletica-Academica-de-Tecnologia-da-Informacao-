const menuToggle = document.querySelector('.menu-toggle');
const menuSidebar = document.querySelector('.menu-sidebar');

function setMenuState(isOpen) {
  menuSidebar.classList.toggle('active', isOpen);
  menuToggle.style.display = isOpen ? 'none' : '';
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

menuSidebar.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    setMenuState(false);
  });
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
