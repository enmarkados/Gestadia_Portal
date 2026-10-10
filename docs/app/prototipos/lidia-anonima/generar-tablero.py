"""Genera documentación visual estática, sin backend ni efecto sobre la APP."""
from pathlib import Path
import json,html,textwrap
root=Path(__file__).parent
main=[
('inicio','Inicio de LidIA','Puede consultar sin cuenta ni datos personales. El enlace directo omite Inicio.','Abrir canje','consulta'),
('consulta','Consulta sin cuenta','El texto libre no se interpreta como nombre. La sesión conserva el recorrido.','Comenzar revisión','preguntas'),
('preguntas','Preguntas sobre el canje','Primero se comprueban los requisitos. No se pide nombre, teléfono ni email.','Completar revisión','resultado'),
('resultado','Resultado de la revisión','Estado favorable ilustrativo: debe venir del resultado completo y versionado del agente, no de un país aislado.','Quiero que me contacte un gestor','contactar'),
('contactar','Contacto del gestor','Sólo tras el resultado suficiente y la voluntad de contacto se explica para qué se piden los datos.','Dejar mis datos','datos-contacto'),
('datos-contacto','Datos para el gestor','Nombre y teléfono O email, con propósito y confirmación. Se solicita como visitante.','Solicitar contacto; comprobar ACK','envio-pendiente'),
('recibido','Solicitud recibida','No hace falta cuenta para que el gestor contacte. Guardar el chat en una cuenta se ofrece después.','Guardar en mi cuenta (opcional)','registro'),
('registro','Cuenta opcional','Registro o acceso para guardar el mismo chat. Cancelar no cancela ni reenvía la solicitud recibida.','Crear cuenta','verificar'),
('verificar','Verificar el email','Cuenta verificada Y control de instalación original antes de vincular. No genera otra solicitud.','Verificar y volver','vinculando'),
('vinculando','Vincular el mismo chat','Cuenta y acceso original comprobados; conserva sesión y solicitud. Recupera la misma operación.','Comprobar','retomado'),
('retomado','Misma conversación','La cuenta permite recuperar el historial desde otros dispositivos. La solicitud al gestor sigue siendo la misma.','Ver conversaciones','mensajes'),
('mensajes','Mensajes con cuenta','Fila compacta con búsqueda, nombre, fechas y estado. Nueva conversación se inicia aquí, no debajo del chat.','Abrir conversación','retomado'),
]
alts=[
('acceso','Ya tengo cuenta','Accede sin crear otra cuenta. Vincula el mismo chat sin reenviar la solicitud al gestor.','Entrar','vinculando'),
('cancelado','Seguir sin cuenta','Cancelar registro conserva el chat y la solicitud ya recibida. El gestor puede contactar igualmente.','Ver conversaciones','mensajes-visitante'),
('caducado','Enlace caducado','La cuenta es opcional: el enlace vencido no borra el chat ni cancela la solicitud al gestor.','Volver al chat','recibido'),
('revision','Revisión incompleta','No se piden datos personales ni se ofrece contacto por un resultado insuficiente. Se continúa revisando.','Seguir revisando','preguntas'),
('instalar','APP sin instalar','Instalar y reabrir explícitamente el mismo enlace. No se presume continuación automática tras la tienda.','Abrir APP','consulta'),
('restricciones','Trámites o gestor directo','Atrás vuelve al origen guardado. Inicio sólo si falta origen; acceso protegido.','Volver','origen'),
('recuperacion','Recuperar el acceso','Recuperación externa y retorno al acceso de la misma conversación. La solicitud ya recibida no depende de ello.','Volver al acceso','acceso'),
('mensajes-visitante','Mensajes sin cuenta','Sólo chats de esta instalación. Nueva conversación está en Mensajes. Cuenta opcional para otros dispositivos.','Reabrir estado conservado','estado-chat'),
('envio-pendiente','Solicitud pendiente','Sin ACK, sin recibida. Recuperar la misma operación; no reenviar ni cambiar su identidad.','Comprobar el mismo envío','envio-pendiente'),
('resultado-negativo','Resultado negativo','Explicación sin contacto. Salir o aportar nueva evidencia voluntaria, sin repetir automáticamente.','Ver otros servicios','servicios'),
('vinculo-bloqueado','Vínculo bloqueado','Sin instalación original, no se vincula ni abre el historial. Cuenta o contacto no bastan.','Ir a LidIA','inicio'),
]
def items(rows,kind):
 return [dict(id=a,numero=f'{i+1:02}' if kind=='principal' else f'A{i+1}',title=b,caption=c,action=d,dest=e,kind=kind,image=f'capturas/propuesta-{a}.jpg') for i,(a,b,c,d,e) in enumerate(rows)]
references=[dict(id='actual-inicio',title='Inicio actual',caption='Captura de la demo de app/main, sin integración remota.',image='capturas/actual-inicio.jpg',kind='actual'),dict(id='actual-chat-lidia',title='Chat LidIA actual',caption='Referencia de cabecera, burbujas negras y compositor.',image='capturas/actual-chat-lidia.jpg',kind='actual'),dict(id='actual-acceso',title='Acceso actual',caption='Referencia de formulario, foco, ojo y controles.',image='capturas/actual-acceso.jpg',kind='actual')]
(root/'pantallas.json').write_text(json.dumps({'main':items(main,'principal'),'alternatives':items(alts,'alternativa'),'references':references},ensure_ascii=False,indent=2)+'\n')
# SVG de documentación: nodos y conectores, nunca assets sustitutivos de la interfaz.
w,h=1440,1575
svg=[f'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="{w}" height="{h}" viewBox="0 0 {w} {h}" role="img" aria-labelledby="title desc">', '<title id="title">Pantallas y flujo de LidIA sin cuenta, sólo APP</title><desc id="desc">Recorrido principal, acceso existente, cancelación, enlace caducado, recuperación, instalación y solicitud de llamada.</desc>', '<defs><marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#858b95"/></marker></defs>', '<rect width="100%" height="100%" fill="#f7f7f7"/>', '<style>text{font-family:Arial,sans-serif;fill:#2c2c2c}.title{font-size:28px;font-weight:700}.sub{font-size:16px;fill:#636b78}.nt{font-size:17px;font-weight:700}.small{font-size:14px;fill:#636b78}.step{font-size:13px;font-weight:700;fill:#a52f23}.edge{fill:none;stroke:#858b95;stroke-width:2;marker-end:url(#arrow)}</style>', '<text x="40" y="52" class="title">LidIA sin cuenta: pantallas y flujo</text>', '<text x="40" y="83" class="sub">Propuesta para aprobar · Sólo APP · Misma conversación antes y después del registro</text>']
xs=[40,395,750,1105]; ys=[135,345,555]; positions={}
for idx,row in enumerate(main):
 id,title,caption,action,dest=row; x=xs[idx%4];y=ys[idx//4];positions[id]=(x,y)
 svg += [f'<a xlink:href="../pantalla.html?s={id}" target="_blank"><rect x="{x}" y="{y}" width="295" height="135" rx="14" fill="white" stroke="{ "#c0392b" if idx in [1,5,6,10] else "#d5d7dc"}" stroke-width="{2 if idx in [1,5,6,10] else 1}"/>',f'<text x="{x+18}" y="{y+27}" class="step">{idx+1:02}</text>',f'<text x="{x+18}" y="{y+54}" class="nt">{html.escape(title)}</text>']
 for li,t in enumerate(textwrap.wrap(action,32)):svg.append(f'<text x="{x+18}" y="{y+85+li*21}" class="small">{html.escape(t)}</text>')
 svg.append('</a>')
# Lectura continua de izquierda a derecha; retornos de fila por margen inferior.
for i in range(11):
 a=main[i][0];b=main[i+1][0];x,y=positions[a];xx,yy=positions[b]
 if i%4<3:path=f'M{x+295},{y+67} H{xx-9}'
 else:path=f'M{x+148},{y+135} V{y+167} H{xx+148} V{yy-9}'
 svg.append(f'<path class="edge" d="{path}"/>')
svg += ['<text x="410" y="504" class="small">06 → A9 → 07 sólo tras ACK durable</text>', '<text x="750" y="536" class="small">07 ya recibida; 08 a 11 son opcionales</text>', '<text x="65" y="125" class="small">Deeplink con APP instalada: entrada directa a 02</text>', '<text x="55" y="710" class="small">09 → 10 sólo con cuenta verificada Y control de instalación original; sin origen: A11.</text>', '<text x="55" y="730" class="small">Sin cuenta: A8 Mensajes de instalación. Con cuenta: 12 Mensajes conserva el mismo chat (11).</text>']
svg += ['<text x="40" y="770" class="nt">Alternativas y retornos</text>','<text x="40" y="798" class="small">La cuenta es opcional. Cancelar el alta no cancela ni reenvía la solicitud recibida.</text>']
for idx,(id,title,caption,action,dest) in enumerate(alts):
 x=xs[idx%4];y=835+(idx//4)*185
 svg += [f'<a xlink:href="../pantalla.html?s={id}" target="_blank"><rect x="{x}" y="{y}" width="295" height="150" rx="14" fill="white" stroke="#d5d7dc"/>',f'<text x="{x+16}" y="{y+28}" class="step">A{idx+1}</text>',f'<text x="{x+16}" y="{y+55}" class="nt">{html.escape(title)}</text>']
 for li,t in enumerate(textwrap.wrap(caption,37)[:3]):svg.append(f'<text x="{x+16}" y="{y+80+li*19}" class="small">{html.escape(t)}</text>')
 svg.append('</a>')
svg += ['<rect x="40" y="1395" width="1360" height="130" rx="14" fill="#181818"/>','<text x="62" y="1427" style="fill:white;font-size:18px;font-weight:700">Tres reglas que se mantienen</text>','<text x="62" y="1458" style="fill:#e5e7eb;font-size:16px">1. Primero requisitos e intención de contacto. Nombre y teléfono o email se piden sólo para el gestor.</text>','<text x="62" y="1484" style="fill:#e5e7eb;font-size:16px">2. La solicitud se confirma como visitante. La cuenta se ofrece después para conservar el mismo chat.</text>','<text x="62" y="1510" style="fill:#e5e7eb;font-size:16px">3. Los flujos Zoho convierten lead a contacto/trato; Cerrado ganado habilita trámites. Solicitud no es cita.</text>','</svg>']
(root/'exportaciones/01-flujo-pantallas.svg').write_text('\n'.join(svg)+'\n')
