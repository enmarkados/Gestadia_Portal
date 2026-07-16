import nodemailer from 'nodemailer';
import { config } from '../config.js';
import { db } from '../db.js';

const transporter = config.smtp.enabled
  ? nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.port === 465,
      auth: { user: config.smtp.user, pass: config.smtp.pass },
    })
  : null;

export async function sendEmail(to, subject, html) {
  if (!transporter) {
    const links = [...html.matchAll(/href="([^"]+)"/g)].map((m) => `  → ${m[1]}`).join('\n');
    console.log(`\n[email:demo] Para: ${to}\nAsunto: ${subject}\n${html.replace(/<[^>]+>/g, '')}\n${links}\n`);
    return;
  }
  const info = await transporter.sendMail({ from: config.smtp.from, to, subject, html });
  const preview = nodemailer.getTestMessageUrl(info);
  if (preview) console.log(`[email] enviado a ${to} · vista previa (Ethereal): ${preview}`);
}

/** Crea una notificación en el portal y la envía por email. */
export async function notifyUser(user, { titulo, cuerpo, expedienteId = null, email = true }) {
  await db.notificacion.create({
    data: { userId: user.id, expedienteId, titulo, cuerpo },
  });
  if (email) {
    await sendEmail(
      user.email,
      titulo,
      `<p>Hola ${user.nombre},</p><p>${cuerpo}</p>
       <p><a href="${config.baseUrl}/portal/mis-servicios">Ver en mi área de cliente</a></p>
       <p>— El equipo de Gestadia</p>`
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
