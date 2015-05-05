window.makeSheetMusic = function(abcSong) {

  var KEY_TO_MIDI_NUMBER = {
    'q': 0,
    'a': 1,
    'z': 2,
    '2': 14,
    'w': 3,
    's': 4,
    'x': 5,
    '3': 17,
    'e': 6,
    'd': 7,
    'c': 8,
    '4': 20,
    'r': 9,
    'f': 10,
    'v': 11,
    '5': 23,
    't': 12,
    'g': 13,
    'b': 14,
    '6': 26,
    'y': 15,
    'h': 16,
    'n': 17,
    '7': 29,
    'u': 18,
    'j': 19,
    'm': 20,
    '8': 32,
    'i': 21,
    'k': 22,
    ',': 23,
    '9': 35,
    'o': 24,
    'l': 25,
    '.': 26,
    '0': 38,
    'p': 27,
    ';': 28,
    '/': 29,
    '-': 41,
    '[': 30,
    '\'': 31
  };

  var beatTimeSong = window.convertAbcToBeatTimeFormat(window.parser(abcSong));
  var notes = beatTimeSong.notes;

  var midiNumberToBayanKey = {};

  var keys = Object.keys(KEY_TO_MIDI_NUMBER);
  for (var i = 0; i < keys.length; i++) {
    var midiNumber = 60 + KEY_TO_MIDI_NUMBER[keys[i]];
    var key = keys[i];
    midiNumberToBayanKey[midiNumber] = key;
  }

  var sheetMusic = [];
  for (var i = 0; i < notes.length; i++) {
    var note = notes[i];
    sheetMusic.push({
      char: midiNumberToBayanKey[note.noteNumber],
      x: note.start,
      y: note.noteNumber - 60,
      width: note.end - note.start
    });
  }

  return sheetMusic;
};
