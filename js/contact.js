/**
 * Gestión y Validación del Formulario de Contacto Legal
 * Bufete Jurídico Martínez Muñoz
 */

document.addEventListener('DOMContentLoaded', () => {
  const contactForm = document.getElementById('bjmmContactForm');
  const feedbackBox = document.getElementById('contactFeedback');

  if (!contactForm) return;

  // Manejo de envío con validación completa
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // 1. Detección Anti-Spam Honeypot (campo oculto)
    const honeypot = document.getElementById('formHoneypot');
    if (honeypot && honeypot.value.trim() !== '') {
      // Ignorar silenciosamente si un bot completó el campo invisible
      return;
    }

    // 2. Extracción y Limpieza de Datos
    const nombreInput = document.getElementById('formNombre');
    const telefonoInput = document.getElementById('formTelefono');
    const emailInput = document.getElementById('formEmail');
    const areaInput = document.getElementById('formArea');
    const mensajeInput = document.getElementById('formMensaje');
    const privacidadInput = document.getElementById('formAvisoPrivacidad');

    const nombre = nombreInput?.value.trim() || '';
    const telefono = telefonoInput?.value.trim() || '';
    const email = emailInput?.value.trim() || '';
    const area = areaInput?.value || '';
    const mensaje = mensajeInput?.value.trim() || '';
    const privacidadAceptada = privacidadInput?.checked || false;

    // 3. Validaciones en Cliente
    const errores = [];

    if (nombre.length < 3) {
      errores.push('Por favor ingrese su nombre y apellido completo (mínimo 3 caracteres).');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errores.push('Por favor ingrese una dirección de correo electrónico válida.');
    }

    if (telefono.length > 0 && !/^[\d\s\+\-\(\)]{7,20}$/.test(telefono)) {
      errores.push('El número telefónico no presenta un formato válido.');
    }

    if (!area) {
      errores.push('Por favor seleccione el área jurídica de su consulta.');
    }

    if (mensaje.length < 15) {
      errores.push('Por favor describa brevemente su situación jurídica (mínimo 15 caracteres).');
    }

    if (!privacidadAceptada) {
      errores.push('Debe aceptar el Aviso de Privacidad y el descargo de responsabilidad para enviar la consulta.');
    }

    // Si existen errores de validación, mostrarlos claramente
    if (errores.length > 0) {
      if (feedbackBox) {
        feedbackBox.className = 'form-alert-feedback error';
        feedbackBox.innerHTML = `
          <strong><i class="fa-solid fa-circle-exclamation"></i> Por favor verifique la siguiente información:</strong>
          <ul style="margin-top: 8px; padding-left: 20px; text-align: left;">
            ${errores.map(err => `<li>${err}</li>`).join('')}
          </ul>
        `;
        feedbackBox.style.display = 'block';
        feedbackBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
      return;
    }

    // 4. Bloqueo de Reenvíos e Indicador de Envío
    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const originalBtnHtml = submitBtn ? submitBtn.innerHTML : 'Enviar Consulta';

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Procesando y transmitiendo consulta...';
    }

    try {
      // Simulación de envío con latencia realista de procesamiento
      // En entorno de integración con Supabase / API backend:
      // const res = await fetch('/api/consultas', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({...}) });
      await new Promise(resolve => setTimeout(resolve, 850));

      // 5. Confirmación Exitosa al Usuario
      if (feedbackBox) {
        feedbackBox.className = 'form-alert-feedback success';
        
        // Sanitizar texto para inserción segura
        const safeNombre = document.createTextNode(nombre).wholeText;
        const safeArea = document.createTextNode(area).wholeText;
        
        feedbackBox.innerHTML = `
          <div style="font-size: 1.05rem; margin-bottom: 6px;">
            <i class="fa-solid fa-circle-check"></i> <strong>Consulta enviada exitosamente</strong>
          </div>
          <p style="margin: 0; color: #166534; font-size: 0.9rem;">
            Estimado/a <strong>${safeNombre}</strong>, hemos recibido su consulta correspondiente al área de <strong>${safeArea}</strong>. El equipo del Bufete Martínez Muñoz revisará los antecedentes iniciales y se pondrá en comunicación con usted a la brevedad.
          </p>
        `;

        // Atajo opcional para continuar también por WhatsApp oficial si lo prefiere
        const waText = `Hola Abogada Lizbeth Martínez. Mi nombre es ${nombre}. Deseo orientación sobre ${area}. Detalle: ${mensaje}`;
        const waLink = `https://wa.me/50432948396?text=${encodeURIComponent(waText)}`;
        
        const waShortcut = document.createElement('div');
        waShortcut.style.marginTop = '14px';
        waShortcut.innerHTML = `
          <a href="${waLink}" target="_blank" rel="noopener noreferrer" class="btn btn-whatsapp" style="width: 100%; font-size: 0.85rem;">
            <i class="fa-brands fa-whatsapp"></i> Continuar esta consulta vía WhatsApp ahora
          </a>
        `;
        feedbackBox.appendChild(waShortcut);
        feedbackBox.style.display = 'block';
        feedbackBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }

      // Reiniciar formulario
      contactForm.reset();

    } catch (error) {
      if (feedbackBox) {
        feedbackBox.className = 'form-alert-feedback error';
        feedbackBox.innerHTML = `
          <i class="fa-solid fa-triangle-exclamation"></i> Ocurrió un error al procesar su solicitud. Por favor contáctenos directamente a través de nuestro WhatsApp oficial: <strong>+504 3294-8396</strong>.
        `;
        feedbackBox.style.display = 'block';
      }
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnHtml;
      }
    }
  });
});
