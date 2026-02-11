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
