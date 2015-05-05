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
window.SongPlayer = (function() {

  var bpm;
  var notes;
  var firstBeatAt;
  var currentlyPlayingNotes;
  var nextStartingNoteIndex;
  var synth;
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

  var tick = function() {
    if (isStopped) {
      return;
    }

    var beatIndex = calculateBeatIndex();

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

    /* check if song ended */
    var songEnded = (nextStartingNoteIndex === notes.length) && (currentlyPlayingNotes.length) === 0;
    if (songEnded) {
      // done!
    } else {
      window.requestAnimationFrame(tick);
    }

  };

  var p = {};

  p.playSong = function(song) {
    isStopped = false;
    firstBeatAt = null;
    bpm = song.bpm;
    notes = song.notes;
    synth = new window.Synth();
    nextStartingNoteIndex = 0;
    currentlyPlayingNotes = [];
    playingNotesDict = {};
    for (var i = 0; i < notes.length; i++) {
      playingNotesDict[notes[i].noteNumber] = 0;
    }
    if (song.offset) {
      window.setTimeout(tick, song.offset);
    } else {
      tick();
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

  return p;

})();
