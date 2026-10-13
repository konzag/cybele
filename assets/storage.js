// ============================================================
//  storage.js — Ασφαλής αποθήκευση για το παιχνίδι της Κυβελίτσας
//
//  Γεια σου Κυβελίτσα! Ο browser έχει ένα μικρό «συρτάρι» που λέγεται
//  localStorage. Εκεί κρατάμε το βιβλίο σου με τα αυτοκόλλητα, για να
//  τα βρίσκεις ξανά την επόμενη φορά που θα παίξεις.
//  Μερικές φορές όμως το συρτάρι:
//    - είναι κλειδωμένο (π.χ. σε ιδιωτικό παράθυρο),
//    - είναι γεμάτο,
//    - έχει μέσα χαλασμένα πράγματα.
//  Οι συναρτήσεις εδώ δοκιμάζουν προσεκτικά (try/catch) και, αν κάτι
//  πάει στραβά, το παιχνίδι συνεχίζει κανονικά αντί να «σπάσει».
//
//  ΚΑΝΟΝΑΣ: μόνο αυτό το αρχείο αγγίζει το localStorage.
// ============================================================

(function () {
  'use strict';

  // Το «όνομα του συρταριού» για τα αυτοκόλλητα.
  var STICKER_KEY = 'cybele.stickers.v1';
  // Πόσα αυτοκόλλητα χωράει το βιβλίο (5 σειρές των 10, για να μετράμε).
  var MAX_STICKERS = 50;

  // Διάβασε μια τιμή και μετάτρεψέ την από JSON.
  // Αν λείπει ή είναι χαλασμένη, δώσε πίσω την τιμή `fallback`.
  function readJson(key, fallback) {
    try {
      var raw = window.localStorage.getItem(key);
      if (raw === null) return fallback;
      var value = JSON.parse(raw);
      return value === null || value === undefined ? fallback : value;
    } catch (e) {
      return fallback;
    }
  }

  // Γράψε μια τιμή ως JSON. Επιστρέφει true αν πέτυχε, false αν όχι.
  function writeJson(key, value) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.warn('Δεν μπόρεσα να αποθηκεύσω το', key, e);
      return false;
    }
  }

  // Δώσε μου τα αυτοκόλλητα (μια λίστα με emoji, π.χ. ['👾', '🐸']).
  // Κρατάμε μόνο μικρά κείμενα, για να μη μπει κάτι παράξενο.
  function getStickers() {
    var list = readJson(STICKER_KEY, []);
    if (!Array.isArray(list)) return [];
    return list
      .filter(function (s) { return typeof s === 'string' && s.length > 0 && s.length <= 8; })
      .slice(0, MAX_STICKERS);
  }

  // Κόλλησε ένα καινούργιο αυτοκόλλητο. Όταν το βιβλίο γεμίσει,
  // δεν χωράνε άλλα (ένας μεγάλος μπορεί να το αδειάσει).
  // Επιστρέφει τη νέα λίστα.
  function addSticker(emoji) {
    var list = getStickers();
    if (list.length < MAX_STICKERS) list.push(String(emoji));
    writeJson(STICKER_KEY, list);
    return list;
  }

  // Άδειασε το βιβλίο (το κουμπί για τους μεγάλους).
  function clearStickers() {
    try {
      window.localStorage.removeItem(STICKER_KEY);
    } catch (e) {
      // κλειδωμένο συρτάρι: δεν πειράζει
    }
  }

  // Τα κάνουμε διαθέσιμα ως CybeleStorage.xxx
  window.CybeleStorage = {
    STICKER_KEY: STICKER_KEY,
    MAX_STICKERS: MAX_STICKERS,
    readJson: readJson,
    writeJson: writeJson,
    getStickers: getStickers,
    addSticker: addSticker,
    clearStickers: clearStickers,
  };
})();
