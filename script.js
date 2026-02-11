const menuToggle = document.querySelector('.menu-toggle');
const menuSidebar = document.querySelector('.menu-sidebar');

menuToggle.addEventListener('click', () => {
  menuSidebar.classList.toggle('active');
});
