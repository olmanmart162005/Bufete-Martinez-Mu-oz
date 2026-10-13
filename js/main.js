/**
 * Funcionalidad Global y Accesibilidad
 * Bufete Jurídico Martínez Muñoz
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Control Accesible del Menú Móvil
  const menuToggle = document.getElementById('menuToggle');
  const navLinks = document.getElementById('navLinks');

  if (menuToggle && navLinks) {
    const toggleMenu = (open) => {
      const shouldOpen = open !== undefined ? open : !navLinks.classList.contains('active');
      navLinks.classList.toggle('active', shouldOpen);
      menuToggle.setAttribute('aria-expanded', shouldOpen ? 'true' : 'false');
      
      const icon = menuToggle.querySelector('i');
      if (icon) {
        if (shouldOpen) {
          icon.classList.remove('fa-bars');
          icon.classList.add('fa-xmark');
        } else {
          icon.classList.remove('fa-xmark');
          icon.classList.add('fa-bars');
        }
      }
    };

    menuToggle.addEventListener('click', () => toggleMenu());

    // Cerrar menú con tecla Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navLinks.classList.contains('active')) {
        toggleMenu(false);
        menuToggle.focus();
      }
    });

    // Cerrar menú al hacer clic en cualquier enlace interno
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        if (navLinks.classList.contains('active')) {
          toggleMenu(false);
        }
      });
    });
  }

  // 2. Sistema Accesible de Acordeón para Preguntas Frecuentes (FAQ)
  const faqItems = document.querySelectorAll('.faq-card-item');
  faqItems.forEach((item, index) => {
    const btn = item.querySelector('.faq-btn-header');
    const content = item.querySelector('.faq-content-body');

    if (btn && content) {
      // Atributos de accesibilidad iniciales
      btn.setAttribute('aria-expanded', 'false');
      btn.setAttribute('id', `faq-btn-${index}`);
      content.setAttribute('aria-labelledby', `faq-btn-${index}`);
      content.setAttribute('role', 'region');

      btn.addEventListener('click', () => {
        const isOpen = item.classList.contains('active');

        // Cerrar otros acordeones para mantener orden y claridad
        faqItems.forEach(other => {
          other.classList.remove('active');
          const otherBtn = other.querySelector('.faq-btn-header');
          const otherBody = other.querySelector('.faq-content-body');
          if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
          if (otherBody) otherBody.style.maxHeight = null;
        });

        // Abrir si no estaba activo
        if (!isOpen) {
          item.classList.add('active');
          btn.setAttribute('aria-expanded', 'true');
          content.style.maxHeight = content.scrollHeight + 'px';
        }
      });
    }
  });

  // 3. Efecto de Elevación de Cabecera al Desplazarse
  const header = document.querySelector('.main-header');
  if (header) {
    const handleScroll = () => {
      if (window.scrollY > 30) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
  }
});
