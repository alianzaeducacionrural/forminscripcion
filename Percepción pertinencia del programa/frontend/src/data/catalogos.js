// Catálogos cerrados. Generados desde la hoja de cálculo de municipios/instituciones y
// universidades/programas. Solo instituciones de Manizales (las que atendemos). DUPLICADOS en backend/Code.js (UNIVERSIDADES / INSTITUCIONES):
// si cambian, actualizar ambos y luego `clasp push`.
// Exclusiones pedidas: IES CINOC; Microcredenciales de la Católica; Universidad de
// Manizales solo con programas en modalidad combinada.

export const PROGRAMAS_POR_UNIVERSIDAD = {
  "Universidad Autónoma de Manizales": [
    "Técnico Profesional en Control Industrial",
    "Técnico Profesional en Mantenimiento Mecánico",
    "Técnico Profesional en Programación de Computadores"
  ],
  "Universidad Católica de Manizales": [
    "Técnico Profesional en Análisis de Alimentos",
    "Técnico Profesional en Internet de las Cosas",
    "Técnico Profesional en Operación de Empresas Turísticas",
    "Técnico Profesional en Procesamiento Agroindustrial",
    "Tecnólogo Profesional en Operación de Empresas Turísticas"
  ],
  "Universidad de Caldas": [
    "Técnico Profesional en Formulación e Implementación de Proyectos Agropecuarios",
    "Técnico Profesional en Producción Agrícola",
    "Técnico Profesional en Producción Cafetera",
    "Técnico Profesional en Saneamiento Ambiental",
    "Tecnólogo Profesional en Gestión Ambiental"
  ],
  "Universidad de Manizales": [
    "Técnico Profesional en Archivística (modalidad combinada)",
    "Técnico Profesional en Atención al Cliente (modalidad combinada)",
    "Técnico Profesional en Configuración de Servicios para Comercio Electrónico (modalidad combinada)",
    "Técnico Profesional en Gestión Comercial del Sector Agropecuario (modalidad combinada)"
  ]
}

export const INSTITUCIONES = [
  "Adolfo Hoyos Ocampo",
  "Giovanni Montini",
  "Granada",
  "José Antonio Galán",
  "La Cabaña",
  "La Linda",
  "La Palma",
  "La Trinidad",
  "La Violeta",
  "Maltería",
  "María Goretti",
  "Miguel Antonio Caro",
  "Rafael Pombo",
  "San Peregrino",
  "Seráfico San Antonio de Padua"
]

export const UNIVERSIDADES = Object.keys(PROGRAMAS_POR_UNIVERSIDAD)
