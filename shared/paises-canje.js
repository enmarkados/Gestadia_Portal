// ============================================================
// Países canjeables (guía DGT §4) + documentos/campos extra por
// país (§2.2.4 y §5.4). Módulo de datos puro (sin Node/React).
// `paisCanje` se guarda por `clave`. Paraguay NO lleva campo
// (el Nº de Computación lo obtiene la gestoría de OPACI).
// ============================================================

const CONVENIO = [
  { clave: 'andorra', nombre: 'Andorra' },
  { clave: 'argelia', nombre: 'Argelia', camposExtra: [
    { clave: 'wilaya', label: 'Wilaya de expedición' },
    { clave: 'daira', label: 'Daira de expedición' },
  ] },
  { clave: 'argentina', nombre: 'Argentina', documentosExtra: [
    { clave: 'historial_apostillado', label: 'Historial de conducción apostillado (La Haya)' },
  ] },
  { clave: 'bolivia', nombre: 'Bolivia', camposExtra: [
    { clave: 'lugar_expedicion', label: 'Lugar de expedición (departamento)' },
  ] },
  { clave: 'brasil', nombre: 'Brasil' },
  { clave: 'chile', nombre: 'Chile' },
  { clave: 'colombia', nombre: 'Colombia' },
  { clave: 'corea-del-sur', nombre: 'Corea del Sur', documentosExtra: [
    { clave: 'traduccion_oficial', label: 'Traducción oficial del permiso' },
  ] },
  { clave: 'costa-rica', nombre: 'Costa Rica' },
  { clave: 'ecuador', nombre: 'Ecuador' },
  { clave: 'el-salvador', nombre: 'El Salvador' },
  { clave: 'filipinas', nombre: 'Filipinas', documentosExtra: [
    { clave: 'pasaporte', label: 'Pasaporte' },
  ] },
  { clave: 'georgia', nombre: 'Georgia' },
  { clave: 'guatemala', nombre: 'Guatemala' },
  { clave: 'honduras', nombre: 'Honduras' },
  { clave: 'japon', nombre: 'Japón', documentosExtra: [
    { clave: 'traduccion_verificacion', label: 'Traducción y verificación del permiso' },
  ] },
  { clave: 'macedonia-del-norte', nombre: 'Macedonia del Norte' },
  { clave: 'marruecos', nombre: 'Marruecos' },
  { clave: 'moldavia', nombre: 'Moldavia' },
  { clave: 'monaco', nombre: 'Mónaco' },
  { clave: 'nicaragua', nombre: 'Nicaragua', camposExtra: [
    { clave: 'lugar_expedicion', label: 'Lugar de expedición' },
  ] },
  { clave: 'nueva-zelanda', nombre: 'Nueva Zelanda' },
  { clave: 'panama', nombre: 'Panamá' },
  { clave: 'paraguay', nombre: 'Paraguay' },
  { clave: 'peru', nombre: 'Perú' },
  { clave: 'reino-unido', nombre: 'Reino Unido e Irlanda del Norte', documentosExtra: [
    { clave: 'check_code', label: 'Check Code actualizado (DVLA)' },
  ] },
  { clave: 'republica-dominicana', nombre: 'República Dominicana', camposExtra: [
    { clave: 'lugar_expedicion', label: 'Lugar de expedición (formato antiguo)' },
  ] },
  { clave: 'serbia', nombre: 'Serbia' },
  { clave: 'suiza', nombre: 'Suiza' },
  { clave: 'tunez', nombre: 'Túnez' },
  { clave: 'turquia', nombre: 'Turquía' },
  { clave: 'ucrania', nombre: 'Ucrania' },
  { clave: 'uruguay', nombre: 'Uruguay' },
];

const UE = [
  ['alemania', 'Alemania'], ['austria', 'Austria'], ['belgica', 'Bélgica'], ['bulgaria', 'Bulgaria'],
  ['chipre', 'Chipre'], ['croacia', 'Croacia'], ['dinamarca', 'Dinamarca'], ['eslovaquia', 'Eslovaquia'],
  ['eslovenia', 'Eslovenia'], ['estonia', 'Estonia'], ['finlandia', 'Finlandia'], ['francia', 'Francia'],
  ['grecia', 'Grecia'], ['hungria', 'Hungría'], ['irlanda', 'Irlanda'], ['islandia', 'Islandia'],
  ['italia', 'Italia'], ['letonia', 'Letonia'], ['liechtenstein', 'Liechtenstein'], ['lituania', 'Lituania'],
  ['luxemburgo', 'Luxemburgo'], ['malta', 'Malta'], ['noruega', 'Noruega'], ['paises-bajos', 'Países Bajos'],
  ['polonia', 'Polonia'], ['portugal', 'Portugal'], ['republica-checa', 'República Checa'], ['rumania', 'Rumanía'],
  ['suecia', 'Suecia'],
].map(([clave, nombre]) => ({ clave, nombre }));

function normalizar(p, tipo) {
  return { documentosExtra: [], camposExtra: [], ...p, tipo };
}

export const PAISES = Object.fromEntries([
  ...CONVENIO.map((p) => normalizar(p, 'convenio')),
  ...UE.map((p) => normalizar(p, 'ue')),
].map((p) => [p.clave, p]));

// Para el desplegable: agrupado y ordenado alfabéticamente por nombre.
export function paisesOrdenados() {
  const orden = (a, b) => a.nombre.localeCompare(b.nombre, 'es');
  return {
    convenio: Object.values(PAISES).filter((p) => p.tipo === 'convenio').sort(orden),
    ue: Object.values(PAISES).filter((p) => p.tipo === 'ue').sort(orden),
  };
}
