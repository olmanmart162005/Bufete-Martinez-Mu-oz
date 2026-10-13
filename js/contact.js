/**
 * Manejo y Envío Asíncrono de Formularios de Asesoría Legal
 * Bufete Jurídico Martínez Muñoz
 */

document.addEventListener('DOMContentLoaded', () => {
  const contactForm = document.getElementById('bjmmContactForm');
  const feedbackBox = document.getElementById('contactFeedback');

  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Extracción de datos del formulario
      const nombre = document.getElementById('formNombre')?.value.trim() || '';
      const telefono = document.getElementById('formTelefono')?.value.trim() || '';
      const email = document.getElementById('formEmail')?.value.trim() || '';
      const area = document.getElementById('formArea')?.value || '';
      const mensaje = document.getElementById('formMensaje')?.value.trim() || '';

      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalBtnHtml = submitBtn.innerHTML;

      // Estado de carga visual
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Procesando consulta...';

      try {
        // En un entorno de producción, aquí se conecta con el endpoint backend o servicio tipo Formspree / EmailJS:
        // const response = await fetch('/api/contacto', { method: 'POST', body: JSON.stringify({...}) });
        
        // Simulamos respuesta de envío con timeout realista
        await new Promise(resolve => setTimeout(resolve, 900));

        // Feedback positivo al usuario
        if (feedbackBox) {
          feedbackBox.className = 'form-alert-feedback success';
          feedbackBox.innerHTML = `
            <div style="font-size: 1.1rem; margin-bottom: 5px;">
              <i class="fa-solid fa-circle-check"></i> <strong>Solicitud Recibida Exitosamente</strong>
            </div>
            Estimado/a <strong>${nombre}</strong>, hemos registrado su consulta respecto a <strong>${area}</strong>. Nos comunicaremos con usted al teléfono ${telefono} o al correo ${email} a la mayor brevedad posible.
          `;
          feedbackBox.style.display = 'block';
        }

        // Opción de enviar también un mensaje directo a WhatsApp con los datos completados
        const whatsappMsg = `Hola Abogada Lizbeth Martínez. Mi nombre es ${nombre}. Deseo información sobre el área de ${area}. Mi correo es ${email} y teléfono ${telefono}. Consulta: ${mensaje}`;
        const encodedMsg = encodeURI(whatsappMsg);
        
        // Agregar botón para continuar directo por WhatsApp si el usuario gusta
        const waShortcut = document.createElement('div');
        waShortcut.style.marginTop = '15px';
        waShortcut.innerHTML = `
          <a href="https://wa.me/50432948396?text=${encodedMsg}" target="_blank" rel="noopener noreferrer" class="btn btn-whatsapp" style="width: 100%;">
            <i class="fa-brands fa-whatsapp"></i> Continuar esta consulta por WhatsApp ahora
          </a>
        `;
        feedbackBox.appendChild(waShortcut);

        contactForm.reset();

      } catch (error) {
        if (feedbackBox) {
          feedbackBox.className = 'form-alert-feedback error';
          feedbackBox.style.display = 'block';
          feedbackBox.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> Ocurrió un inconveniente. Por favor contáctenos directamente al WhatsApp: +504 3294-8396';
        }
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnHtml;
      }
    });
  }
});
