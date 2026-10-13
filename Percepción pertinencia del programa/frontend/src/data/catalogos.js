// Catálogos cerrados. Generados desde la hoja de cálculo de municipios/instituciones y
// universidades/programas. Todo Caldas; en Manizales solo las 12 instituciones aprobadas. DUPLICADOS en backend/Code.js (UNIVERSIDADES / INSTITUCIONES):
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

export const INSTITUCIONES_POR_MUNICIPIO = {
  "Aguadas": [
    "El Edén",
    "Encimadas",
    "La Mermita",
    "Rioarriba",
    "San Antonio de Arma",
    "Viboral"
  ],
  "Anserma": [
    "Alto Nubia",
    "El Horro",
    "Gómez Fernandez",
    "Jerónimo de Tejelo",
    "Juan XXIII",
    "Ocuzca",
    "San Pedro"
  ],
  "Aranzazu": [
    "Alegrías",
    "Juan Crisóstomo Osorio",
    "Pío XI"
  ],
  "Belalcázar": [
    "El Águila",
    "El Madroño",
    "San Isidro"
  ],
  "Chinchiná": [
    "Eduardo Gómez Arrubla",
    "El Trébol",
    "Naranjal"
  ],
  "Filadelfia": [
    "Antonio Nariño",
    "Crisanto Luque",
    "Filadelfia"
  ],
  "La Dorada": [
    "Buenavista",
    "El Japón",
    "Guarinocito",
    "Purnio"
  ],
  "La Merced": [
    "La Felisa",
    "Llanadas"
  ],
  "Manizales": [
    "Giovanni Montini",
    "Granada",
    "José Antonio Galán",
    "La Cabaña",
    "La Linda",
    "La Trinidad",
    "La Violeta",
    "Maltería",
    "María Goretti",
    "Miguel Antonio Caro",
    "San Peregrino",
    "Seráfico San Antonio de Padua"
  ],
  "Manzanares": [
    "Aguabonita",
    "Gregorio Gutiérrez González",
    "José Antonio Galán",
    "Llanadas",
    "Manzanares",
    "Romeral"
  ],
  "Marmato": [
    "Cabras",
    "El Llano",
    "General Ramón Marín",
    "Marmato",
    "Rafael Pombo"
  ],
  "Marquetalia": [
    "Antonio María Hincapié",
    "El Placer",
    "La Quiebra",
    "Patio Bonito"
  ],
  "Marulanda": [
    "Efrén Cardona Chica",
    "Montebonito"
  ],
  "Neira": [
    "Aguacatal",
    "El Roble",
    "Llanogrande",
    "Pío XII",
    "Pueblo Rico",
    "San Luis"
  ],
  "Norcasia": [
    "La Estrella"
  ],
  "Pácora": [
    "Francisco José de Caldas",
    "La Milagrosa",
    "Las Coles",
    "Mariscal Robledo"
  ],
  "Palestina": [
    "Cartagena",
    "José María Carbonell",
    "Santágueda"
  ],
  "Pensilvania": [
    "Camilo Olimpo Cardona",
    "Daniel María López Rodríguez",
    "Francisco Julian Olaya",
    "Guacas",
    "John F. Kennedy",
    "La Rioja",
    "Pablo VI",
    "Santa Rita"
  ],
  "Riosucio": [
    "Florencia",
    "Nuestra Señora de Fátima"
  ],
  "Risaralda": [
    "Francisco José de Caldas",
    "Gabriel García Márquez",
    "Quiebra de Santa Barbara"
  ],
  "Salamina": [
    "El Perro",
    "Luis Felipe Gutiérrez Loaiza",
    "San Félix"
  ],
  "Samaná": [
    "Dulce Nombre",
    "El Bosque",
    "El Silencio",
    "Encimadas",
    "Félix Naranjo",
    "Pío XII",
    "Rancho Largo"
  ],
  "San José": [
    "La Libertad"
  ],
  "Supía": [
    "Hojas Anchas",
    "Obispo",
    "Supía"
  ],
  "Victoria": [
    "Cañaveral",
    "Isaza"
  ],
  "Villamaría": [
    "Colombia",
    "Fortunato Gaviria Botero",
    "Partidas",
    "Pío XII"
  ],
  "Viterbo": [
    "El Socorro"
  ]
}

export const MUNICIPIOS = Object.keys(INSTITUCIONES_POR_MUNICIPIO)
export const UNIVERSIDADES = Object.keys(PROGRAMAS_POR_UNIVERSIDAD)
