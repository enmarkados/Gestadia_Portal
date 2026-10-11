import nodemailer from 'nodemailer';
import { config } from '../config.js';
import { db } from '../db.js';
import { pushService } from './push/runtime.js';
import { noticeEmail } from './email-templates.js';

const transporter = config.smtp.enabled
  ? nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.port === 465,
      auth: { user: config.smtp.user, pass: config.smtp.pass },
    })
  : null;

export async function sendEmail(to, subject, message) {
  if (!transporter) {
    throw new Error('Correo no disponible: SMTP no configurado');
  }
  const { html, text, attachments } = message;
  await transporter.sendMail({ from: config.smtp.from, replyTo: 'info@gestadia.com', to, subject, html, text, attachments });
}

/** Crea una notificación en el portal y la envía por email. */
export async function notifyUser(user, { titulo, cuerpo, expedienteId = null, email = true }) {
  const notice = await pushService.notify({userId: user.id, expedienteId, titulo, cuerpo});
  if (!notice) return;
  if (email) {
    await sendEmail(
      user.email,
      titulo,
      noticeEmail({ baseUrl: config.baseUrl, nombre: user.nombre, titulo, cuerpo })
    );
  }
}

/** Cambia el estado de un expediente, registra el evento y avisa al cliente. */
export async function transitionExpediente(expediente, nuevoEstado, { nota = null, faseZoho = null, avisar = true } = {}) {
  if (expediente.estado === nuevoEstado && !faseZoho) return expediente;

  const updated = await db.expediente.update({
    where: { id: expediente.id },
    data: { estado: nuevoEstado, ...(faseZoho ? { faseZoho } : {}) },
    include: { user: true },
  });
  await db.eventoExpediente.create({
    data: { expedienteId: expediente.id, estado: nuevoEstado, nota },
  });

  if (avisar) {
    const mensajes = {
      pagado: 'Hemos recibido tu pago. Ya puedes subir la documentación desde tu área de cliente.',
      documentacion_pendiente: 'Necesitamos documentación para continuar con tu trámite. Súbela desde tu área de cliente.',
      en_gestion: 'Tu trámite está en gestión. Te avisaremos en cuanto haya novedades.',
      presentado: 'Tu trámite ha sido presentado ante la administración. Quedamos a la espera de resolución.',
      completado: '¡Tu trámite se ha completado! Encontrarás la documentación final en tu área de cliente.',
      incidencia: 'Hay una incidencia con tu trámite. Nuestro equipo se pondrá en contacto contigo.',
    };
    await notifyUser(updated.user, {
      titulo: `Actualización de tu expediente ${updated.nPedido}`,
      cuerpo: nota || mensajes[nuevoEstado] || 'Tu expediente se ha actualizado.',
      expedienteId: updated.id,
    });
  }
  return updated;
}
