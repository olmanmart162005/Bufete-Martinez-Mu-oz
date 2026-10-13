/**
 * Gestión y Envío Asíncrono del Formulario de Contacto
 * Integración con Base de Datos Supabase en Tiempo Real
 * Bufete Jurídico Martínez Muñoz
 */

document.addEventListener('DOMContentLoaded', () => {
  const contactForm = document.getElementById('bjmmContactForm');
  const feedbackBox = document.getElementById('contactFeedback');

  if (!contactForm) return;

  // Configuración de Supabase
  const SUPABASE_URL = 'https://kioowgnzmmhqmzodtpum.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_ZDF770U7doR4bXg83EBf6g_YK-QI89U';

  // Mapeo de áreas visibles a slugs de la base de datos
  const AREA_SLUG_MAP = {
    'Derecho Civil': 'civil',
    'Derecho de Familia': 'familia',
    'Derecho Laboral': 'laboral',
    'Derecho Penal': 'penal',
    'Derecho Mercantil': 'mercantil',
    'Derecho Administrativo': 'administrativo',
    'Asuntos Notariales': 'notarial',
    'Trámites Jurídicos': 'tramites',
    'Litigios y Representación': 'litigios',
    'Asesoría Empresarial': 'empresarial',
    'Otra Consulta Legal': null
  };

  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // 1. Detección Anti-Spam Honeypot (campo oculto invisible a humanos)
    const honeypot = document.getElementById('formHoneypot');
    if (honeypot && honeypot.value.trim() !== '') {
      return; // Detener silenciosamente
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
      errores.push('Debe aceptar el Aviso de Privacidad y el descargo legal para enviar la consulta.');
    }

    if (errores.length > 0) {
      if (feedbackBox) {
        feedbackBox.className = 'form-alert-feedback error';
        feedbackBox.innerHTML = `
          <strong><i class="fa-solid fa-circle-exclamation"></i> Por favor verifique los siguientes campos:</strong>
          <ul style="margin-top: 8px; padding-left: 20px; text-align: left;">
            ${errores.map(err => `<li>${err}</li>`).join('')}
          </ul>
        `;
        feedbackBox.style.display = 'block';
        feedbackBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
      return;
    }

    // 4. Bloqueo de Reenvío e Indicador de Envío
    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const originalBtnHtml = submitBtn ? submitBtn.innerHTML : 'Enviar Consulta';

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Guardando y procesando consulta...';
    }

    try {
      const areaSlug = AREA_SLUG_MAP[area] || null;

      // Envío directo a la base de datos Supabase
      const response = await fetch(`${SUPABASE_URL}/rest/v1/consultas_contacto`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          nombre_completo: nombre,
          email: email,
          telefono: telefono || null,
          area_slug: areaSlug,
          mensaje: mensaje,
          aviso_privacidad_aceptado: true
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error al registrar en Supabase:', response.status, errorText);
        throw new Error(`Error en servidor (${response.status})`);
      }

      // 5. Confirmación Exitosa al Usuario
      if (feedbackBox) {
        feedbackBox.className = 'form-alert-feedback success';
        
        const safeNombre = document.createTextNode(nombre).wholeText;
        const safeArea = document.createTextNode(area).wholeText;
        
        feedbackBox.innerHTML = `
          <div style="font-size: 1.05rem; margin-bottom: 6px;">
            <i class="fa-solid fa-circle-check"></i> <strong>Consulta Registrada Exitosamente</strong>
          </div>
          <p style="margin: 0; color: #166534; font-size: 0.9rem; line-height: 1.6;">
            Estimado/a <strong>${safeNombre}</strong>, su solicitud referente a <strong>${safeArea}</strong> ha sido guardada en nuestro sistema de atención legal. La Abogada Lizbeth Nicolle Martínez Muñoz revisará los antecedentes iniciales y se comunicará con usted a la brevedad.
          </p>
        `;

        // Atajo opcional de WhatsApp para enviar copia directa
        const waText = `Hola Abogada Lizbeth Martínez. Mi nombre es ${nombre}. Acabo de enviar una consulta web sobre ${area}. Detalle: ${mensaje}`;
        const waLink = `https://wa.me/50432948396?text=${encodeURIComponent(waText)}`;
        
        const waShortcut = document.createElement('div');
        waShortcut.style.marginTop = '14px';
        waShortcut.innerHTML = `
          <a href="${waLink}" target="_blank" rel="noopener noreferrer" class="btn btn-whatsapp" style="width: 100%; font-size: 0.85rem;">
            <i class="fa-brands fa-whatsapp"></i> Enviar también copia por WhatsApp Oficial
          </a>
        `;
        feedbackBox.appendChild(waShortcut);
        feedbackBox.style.display = 'block';
        feedbackBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }

      contactForm.reset();

    } catch (error) {
      if (feedbackBox) {
        feedbackBox.className = 'form-alert-feedback error';
        feedbackBox.innerHTML = `
          <div style="font-size: 1rem; margin-bottom: 5px;">
            <i class="fa-solid fa-triangle-exclamation"></i> <strong>Inconveniente en la conexión</strong>
          </div>
          <p style="margin: 0; font-size: 0.9rem; color: #991B1B;">
            No se pudo completar el envío web en este instante. Por favor contáctenos directamente a través de nuestro WhatsApp oficial: <strong>+504 3294-8396</strong> o llamando a nuestro despacho.
          </p>
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
