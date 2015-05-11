'use strict';

/**
 * plays a song represented in the following format
 * {
     bpm: 80,
     notes: // an array of all the notes. must be sorted by start time
      [
        {
          // an int representing this note's number
          "noteNumber": 64,
          // a float representing when the note starts, measured in beats
          "start": 1.5,
          // a float representing when the note starts, measured in beats
          "end": 2.5
        }
      ],
     // optional. a delay before the song starts playing, in milliseconds
     offset: 1000
 * }
 *
 */
window.SongPlayer = function(song, synth) {

  var bpm;
  var notes;
  var firstBeatAt;
  var currentlyPlayingNotes;
  var nextStartingNoteIndex;
  var playingNotesDict;
  var isStopped;

  var calculateBeatIndex = function() {
    var t = (new Date()).getTime();
    if (firstBeatAt === null) {
      firstBeatAt = t;
      return 0;
    } else {
      t -= firstBeatAt;
      return (t / (60000 / bpm));
    }
  };

  var p = {};

  p.tick = function(beatIndex) {
    /* check for starting notes */
    while (nextStartingNoteIndex < notes.length) {
      var upcomingNote = notes[nextStartingNoteIndex];
      var noteStarted = beatIndex >= upcomingNote.start;
      if (noteStarted) {
        playingNotesDict[upcomingNote.noteNumber] += 1;
        // if (playingNotesDict[upcomingNote.noteNumber] === 1) {
        synth.noteOn(upcomingNote.noteNumber);
        // }
        currentlyPlayingNotes.push(upcomingNote);

        nextStartingNoteIndex++;
      } else {
        break;
      }
    }

    /* check for ending notes */
    for (var i = 0; i < currentlyPlayingNotes.length; i++) {
      var playingNote = currentlyPlayingNotes[i];
      var noteEnded = beatIndex >= playingNote.end;
      if (noteEnded) {
        playingNotesDict[playingNote.noteNumber] -= 1;
        if (playingNotesDict[playingNote.noteNumber] === 0) {
          synth.noteOff(playingNote.noteNumber);
        }
        currentlyPlayingNotes.splice(currentlyPlayingNotes.indexOf(playingNote), 1);
      }
    }
  };

  p.init = function() {
    isStopped = false;
    firstBeatAt = null;
    bpm = song.bpm;
    notes = song.notes;
    nextStartingNoteIndex = 0;
    currentlyPlayingNotes = [];
    playingNotesDict = {};
    for (var i = 0; i < notes.length; i++) {
      playingNotesDict[notes[i].noteNumber] = 0;
    }
  };

  p.stop = function() {
    isStopped = true;
    var noteNums = Object.keys(playingNotesDict);
    for (var i = 0; i < noteNums.length; i++) {
      if (playingNotesDict[noteNums[i]] > 0) {
        synth.noteOff(noteNums[i]);
      }
    }
  };

  p.init();

  return p;

};
