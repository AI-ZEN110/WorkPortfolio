/* ============================================
   Theme toggle: light / dark, remembered
   between visits via localStorage.
   (The initial theme itself is already set by
   the inline script in <head>, before this file
   even loads, to avoid a flash of the wrong theme.)
   ============================================ */

const themeToggle = document.getElementById('themeToggle');

themeToggle.addEventListener('click', () => {
  const isLight = document.documentElement.getAttribute('data-theme') === 'light';
  const next = isLight ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
});


/* ============================================
   Scroll-reveal: fades/slides elements into
   place the first time they enter the viewport.
   Uses IntersectionObserver so nothing is checked
   on every scroll tick (better performance than
   doing this by hand with scroll events).
   ============================================ */

const revealEls = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      // Only needs to happen once per element, so stop watching it
      revealObserver.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.15,        // trigger once ~15% of the element is visible
  rootMargin: '0px 0px -40px 0px', // reveal slightly before it's fully on-screen
});

revealEls.forEach((el) => revealObserver.observe(el));


/* ============================================
   Scroll-spy: highlights the current section
   in the top nav as the user scrolls.
   ============================================ */

// Grab every nav link in the header, and every <section id="..."> in <main>
const navLinks = document.querySelectorAll('header.nav nav a');
const sections = document.querySelectorAll('main section[id]');

function setActiveLink() {
  // Default to the first section (in case we're at the very top of the page)
  let currentSectionId = sections[0].id;

  // Walk through each section and check how far the user has scrolled.
  // 140px offset accounts for the sticky header height, so a section
  // is marked "active" a little before it hits the very top of the screen.
  sections.forEach((section) => {
    if (window.scrollY >= section.offsetTop - 140) {
      currentSectionId = section.id;
    }
  });

  // Add/remove the "active" class on nav links to match the current section
  navLinks.forEach((link) => {
    const isActive = link.getAttribute('href') === '#' + currentSectionId;
    link.classList.toggle('active', isActive);
  });
}

// Re-run on every scroll event...
window.addEventListener('scroll', setActiveLink);

// ...and once immediately on page load, so the correct link
// is already highlighted before the user scrolls at all.
setActiveLink();


/* ============================================
   Mobile nav: hamburger button open/close
   ============================================ */

const menuToggle = document.getElementById('menuToggle');
const mobileNav = document.getElementById('navLinks');

menuToggle.addEventListener('click', () => {
  // Toggle the "open" look of the hamburger icon (turns into an X)
  const isOpen = menuToggle.classList.toggle('open');
  // Toggle the dropdown panel itself
  mobileNav.classList.toggle('mobile-menu-open');
  // Keep this in sync for screen readers
  menuToggle.setAttribute('aria-expanded', isOpen);
});

// Auto-close the mobile menu once a link is tapped,
// so it doesn't stay open after navigating to a section.
mobileNav.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    menuToggle.classList.remove('open');
    mobileNav.classList.remove('mobile-menu-open');
    menuToggle.setAttribute('aria-expanded', 'false');
  });
});


/* ============================================
   Scroll-to-top button
   ============================================ */

const scrollTopBtn = document.getElementById('scrollTopBtn');

window.addEventListener('scroll', () => {
  // Only show the button once the visitor has scrolled past the hero
  scrollTopBtn.classList.toggle('visible', window.scrollY > 500);
});

scrollTopBtn.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});


/* ============================================
   Contact form — sends real email via EmailJS
   ============================================
   SETUP (do this once):
   1. Create a free account at emailjs.com
   2. Add Gmail as an Email Service  -> copy the Service ID
   3. Create an Email Template        -> copy the Template ID
   4. Account -> General              -> copy your Public Key
   5. Paste all three below. That's it — no backend needed.
*/

const EMAILJS_PUBLIC_KEY = 'h-D7kKj-_DlBBiyNL';
const EMAILJS_SERVICE_ID = 'service_3v1pj1j';
const EMAILJS_TEMPLATE_ID = 'template_qsge5hr';

emailjs.init(EMAILJS_PUBLIC_KEY);

const contactForm = document.getElementById('contactForm');

contactForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const nameField = document.getElementById('cf-name');
  const emailField = document.getElementById('cf-email');
  const messageField = document.getElementById('cf-message');

  const nameError = document.getElementById('cf-name-error');
  const emailError = document.getElementById('cf-email-error');
  const messageError = document.getElementById('cf-message-error');
  const status = document.getElementById('cf-status');
  const submitBtn = contactForm.querySelector('button[type="submit"]');

  // Clear old messages before re-checking
  nameError.textContent = '';
  emailError.textContent = '';
  messageError.textContent = '';
  status.textContent = '';

  let isValid = true;
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (nameField.value.trim() === '') {
    nameError.textContent = 'Please enter your name.';
    isValid = false;
  }

  if (!emailPattern.test(emailField.value.trim())) {
    emailError.textContent = 'Please enter a valid email address.';
    isValid = false;
  }

  if (messageField.value.trim() === '') {
    messageError.textContent = 'Please write a short message.';
    isValid = false;
  }

  if (!isValid) return;

  // Let any other listeners (e.g. firebase-config.js) know a valid
  // submission came in, so they can save it without duplicating
  // this validation logic.
  document.dispatchEvent(new CustomEvent('contactFormValid', {
    detail: {
      name: nameField.value.trim(),
      email: emailField.value.trim(),
      message: messageField.value.trim(),
    },
  }));

  // All fields check out — send it through EmailJS to your Gmail
  submitBtn.disabled = true;
  status.textContent = 'Sending…';

  emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
    from_name: nameField.value.trim(),
    from_email: emailField.value.trim(),
    message: messageField.value.trim(),
  })
    .then(() => {
      status.textContent = 'Message sent — thanks for reaching out!';
      contactForm.reset();
    })
    .catch((error) => {
      console.error('EmailJS error:', error);
      status.textContent = 'Something went wrong. Please email me directly instead.';
    })
    .finally(() => {
      submitBtn.disabled = false;
    });
});
