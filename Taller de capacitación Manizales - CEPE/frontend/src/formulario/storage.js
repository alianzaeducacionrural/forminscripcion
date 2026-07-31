const STORAGE_KEY = 'inscripcion-metodologias-activas-v1';

export function loadDraft() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveDraft(draft) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  } catch {
    // almacenamiento no disponible (modo privado, cuota llena, etc.) — se pierde el autoguardado, no es crítico
  }
}

export function clearDraft() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // no-op
  }
}
