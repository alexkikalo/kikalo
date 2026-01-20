// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});

// Mobile menu toggle (add hamburger icon in HTML if needed)
const nav = document.querySelector('nav ul');
let menuOpen = false;

function toggleMenu() {
  menuOpen = !menuOpen;
  nav.classList.toggle('active', menuOpen);
}

// Optional: Close menu when clicking a link (for mobile)
document.querySelectorAll('nav a').forEach(link => {
  link.addEventListener('click', () => {
    if (menuOpen) toggleMenu();
  });
});

// Fade-in service items on scroll
const serviceItems = document.querySelectorAll('.service-item');

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('fade-in');
    }
  });
}, { threshold: 0.1 });

serviceItems.forEach(item => observer.observe(item));
