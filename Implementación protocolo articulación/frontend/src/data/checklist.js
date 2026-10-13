// Copia oficial de "LISTA DE CHEQUEO DE USO Y APROPIACIÓN INSTITUCIONAL – COMUNIDAD DE CAMBIO".
// No parafrasear. La fila "Gestión de acuerdos" aparece repetida en el Word: se deja una sola vez.

export const TITULO = 'Lista de chequeo de uso y apropiación institucional'
export const SUBTITULO = 'Comunidad de Cambio'

export const RESPUESTAS = [
  { valor: 'SI', etiqueta: 'Sí', corta: 'Sí' },
  { valor: 'PARCIAL', etiqueta: 'Parcial', corta: 'Parcial' },
  { valor: 'NO', etiqueta: 'No', corta: 'No' },
  { valor: 'NA', etiqueta: 'No aplica', corta: 'N/A' },
]

export const CRITERIOS = [
  {
    clave: 'c01',
    componente: 'Articulación institucional',
    criterio: 'El proyecto La Universidad en el Campo está incorporado en el PEI y se refleja en la gestión institucional.',
    pista: 'PEI / actas / plan institucional',
  },
  {
    clave: 'c02',
    componente: 'Liderazgo',
    criterio: 'Existe un docente líder que dinamiza y hace seguimiento al proceso de articulación.',
    pista: 'Actas, cronograma, registros de seguimiento',
  },
  {
    clave: 'c03',
    componente: 'Escuela Nueva',
    criterio: 'En las jornadas universitarias se evidencian prácticas de Escuela Nueva y aprendizaje activo.',
    pista: 'Observación de clase / guía / registro fotográfico',
  },
  {
    clave: 'c04',
    componente: 'Guías de interaprendizaje',
    criterio: 'Las guías son utilizadas como mediación pedagógica y no únicamente como material entregado.',
    pista: 'Guías diligenciadas / producciones de estudiantes',
  },
  {
    clave: 'c05',
    componente: 'Gobierno estudiantil',
    criterio: 'El gobierno estudiantil funciona y asume responsabilidades durante las jornadas de La Universidad en el Campo.',
    pista: 'Actas / formatos / roles / evidencias',
  },
  {
    clave: 'c06',
    componente: 'Currículo–contexto',
    criterio: 'Los aprendizajes se relacionan con situaciones, necesidades o oportunidades del territorio.',
    pista: 'Actividades / productos / proyectos',
  },
  {
    clave: 'c07',
    componente: 'PPP',
    criterio: 'Los Proyectos Pedagógicos Productivos son utilizados como escenarios para aplicar competencias y aprendizajes.',
    pista: 'Portafolios / modelos de negocio / productos',
  },
  {
    clave: 'c08',
    componente: 'Seguimiento a estudiantes',
    criterio: 'La IE utiliza información de asistencia, rendimiento o alertas para identificar estudiantes que requieren acompañamiento.',
    pista: 'Reportes / fichas / actas / seguimiento',
  },
  {
    clave: 'c09',
    componente: 'Permanencia',
    criterio: 'Ante una alerta, la IE activa acciones de acompañamiento y registra los acuerdos realizados.',
    pista: 'Registro de llamadas / actas / compromisos',
  },
  {
    clave: 'c10',
    componente: 'Familia',
    criterio: 'La IE desarrolla acciones concretas para vincular a las familias al acompañamiento de la trayectoria educativa.',
    pista: 'Convocatorias / actas / evidencias de participación',
  },
  {
    clave: 'c11',
    componente: 'Articulación con universidad',
    criterio: 'Existe comunicación y coordinación efectiva entre IE, padrino y universidad para resolver situaciones académicas o de permanencia.',
    pista: 'Actas / correos / registros de acuerdos',
  },
  {
    clave: 'c12',
    componente: 'Gestión de acuerdos',
    criterio: 'Los compromisos establecidos en visitas anteriores presentan seguimiento y evidencias de avance.',
    pista: 'Informe anterior / matriz de compromisos',
  },
  {
    clave: 'c13',
    componente: 'Comunidad de Cambio',
    criterio: 'La IE utiliza los espacios de la Comunidad de Cambio para analizar situaciones, compartir aprendizajes y definir acciones de mejora.',
    pista: 'Actas / productos / acuerdos',
  },
  {
    clave: 'c14',
    componente: 'Mejoramiento',
    criterio: 'La IE puede demostrar al menos un cambio realizado a partir del acompañamiento recibido.',
    pista: 'Antes/después / producto / decisión documentada',
  },
]

export const HALLAZGO = {
  hallazgo: { etiqueta: 'Hallazgo', ayuda: '¿Qué está funcionando o qué brecha se identifica?' },
  accion: { etiqueta: 'Acción de mejora acordada', ayuda: '¿Qué se debe transformar?' },
  responsable: { etiqueta: 'Responsable', ayuda: '¿Quién lo hará?' },
  fecha: { etiqueta: 'Fecha de verificación', ayuda: '¿Cuándo se verificará?' },
}

export const NIVELES = [
  { valor: 'Consolidado', definicion: 'se usa y existe evidencia.' },
  { valor: 'En desarrollo', definicion: 'existe la práctica, pero su uso es irregular o requiere fortalecimiento.' },
  { valor: 'Inicial', definicion: 'existe de manera formal, pero no se evidencia apropiación.' },
  { valor: 'No evidenciado', definicion: 'no se identifica uso durante la visita.' },
]

export const MAX_ARCHIVOS_POR_CRITERIO = 8
