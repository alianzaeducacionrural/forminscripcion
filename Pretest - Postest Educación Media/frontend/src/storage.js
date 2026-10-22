/** Fábrica de un borrador en localStorage bajo una clave versionada propia,
 * con lecturas/escrituras protegidas por try/catch (modo privado, cuota llena, etc.). */
export function createDraftStore(key) {
  return {
    loadDraft() {
      try {
        const raw = window.localStorage.getItem(key);
        if (!raw) return null;
        return JSON.parse(raw);
      } catch {
        return null;
      }
    },
    saveDraft(draft) {
      try {
        window.localStorage.setItem(key, JSON.stringify(draft));
      } catch {
        // no crítico — se pierde el autoguardado, no el envío
      }
    },
    clearDraft() {
      try {
        window.localStorage.removeItem(key);
      } catch {
        // no-op
      }
    },
  };
}
