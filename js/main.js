/**
 * Funcionalidad Global y Navegación Responsive
 * Bufete Jurídico Martínez Muñoz
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Control del Menú Móvil
  const menuToggle = document.getElementById('menuToggle');
  const navLinks = document.getElementById('navLinks');

  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      navLinks.classList.toggle('active');
      const icon = menuToggle.querySelector('i');
      if (navLinks.classList.contains('active')) {
        icon.classList.remove('fa-bars');
        icon.classList.add('fa-xmark');
      } else {
        icon.classList.remove('fa-xmark');
        icon.classList.add('fa-bars');
      }
    });

    // Cerrar menú al hacer clic en cualquier enlace
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        const icon = menuToggle.querySelector('i');
        if (icon) {
          icon.classList.remove('fa-xmark');
          icon.classList.add('fa-bars');
        }
      });
    });
  }

  // 2. Sistema de Acordeón para FAQ
  const faqItems = document.querySelectorAll('.faq-card-item');
  faqItems.forEach(item => {
    const btn = item.querySelector('.faq-btn-header');
    const content = item.querySelector('.faq-content-body');

    if (btn && content) {
      btn.addEventListener('click', () => {
        const isOpen = item.classList.contains('active');

        // Cerrar otros acordeones
        faqItems.forEach(other => {
          other.classList.remove('active');
          const otherBody = other.querySelector('.faq-content-body');
          if (otherBody) otherBody.style.maxHeight = null;
        });

        // Abrir si estaba cerrado
        if (!isOpen) {
          item.classList.add('active');
          content.style.maxHeight = content.scrollHeight + 'px';
        }
      });
    }
  });

  // 3. Efecto de Scroll en Header
  const header = document.querySelector('.main-header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.style.boxShadow = '0 8px 25px rgba(17, 29, 41, 0.15)';
    } else {
      header.style.boxShadow = '0 4px 20px rgba(17, 29, 41, 0.08)';
    }
  });
});
