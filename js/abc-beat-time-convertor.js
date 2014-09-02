'use strict';

window.convertAbcToBeatTimeFormat = function(parsedAbc, bpm) {

  var measures = parsedAbc.song[0][0];
  var notes = [];
  var currentBeat = 0;
  var defaultNoteLength = parsedAbc.header.note_length;
  var defaultNoteLengthInBeats = 1;

  var getNoteNumber = function(noteString) {
    var noteStrings = [
      'C,', 'C#,', 'D,', 'D#,', 'E,', 'F,', 'F#,', 'G,', 'G#,', 'A,', 'A#,', 'B,',
      'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B',
      'c', 'c#', 'd', 'd#', 'e', 'f', 'f#', 'g', 'g#', 'a', 'a#', 'b',
      'c\'', 'c#\'', 'd\'', 'd#\'', 'e\'', 'f\'', 'f#\'', 'g\'', 'g#\'', 'a\'', 'a#\'', 'b\''
    ];
    var index = noteStrings.indexOf(noteString);
    if (index === -1) {
      return -1;
    } else {
      return index + 48;
    }
  };

  var addNotes = function(notes, songNotes, currentBeat, defaultNoteLength, defaultNoteLengthInBeats, isTuple) {
    var totalLengthInBeats = 0;
    for (var k = 0; k < notes.length; k++) {
      var note = notes[k];
      if (note.type === 'tuple') {
        totalLengthInBeats += addNotes(note.notes, songNotes, currentBeat, defaultNoteLength, defaultNoteLengthInBeats, true);
      } else {
        var lengthInBeats = defaultNoteLengthInBeats * (note.duration / defaultNoteLength);
        totalLengthInBeats += lengthInBeats;
        var noteNumber = getNoteNumber(note.note);
        if (noteNumber !== -1) {
          if (note.accidental === 'sharp') {
            noteNumber += 1;
          }
          var noteObject = {
            noteNumber: noteNumber,
            start: currentBeat,
            end: currentBeat + lengthInBeats
          };
          songNotes.push(noteObject);
        }
        if (isTuple) {
          currentBeat += lengthInBeats;
        }
      }
    }
    return totalLengthInBeats;
  };



  if (bpm === undefined) {
    bpm = 320;
  }
  for (var i = 0; i < measures.length; i++) {
    var chords = measures[i].chords;
    currentBeat = 8 * i;
    for (var j = 0; j < chords.length; j++) {
      var chordNotes = chords[j].notes;
      currentBeat += addNotes(chordNotes, notes, currentBeat, defaultNoteLength, defaultNoteLengthInBeats);
    }
  }
  return {
    bpm: bpm,
    notes: notes
  };

};
