var mm = require('@magenta/music/node/music_rnn');
const bodyParser = require('body-parser');

// hack required for getting magenta js to work for node
global.performance = Date;
global.fetch = require('node-fetch');

var reverseMidiMapping = new Map([
  [36, 'x'],
  [35, 'x'],
  [38, 'o'],
  [27, 'o'],
  [28, 'o'],
  [31, 'o'],
  [32, 'o'],
  [33, 'o'],
  [34, 'o'],
  [37, 'o'],
  [39, 'o'],
  [40, 'o'],
  [56, 'o'],
  [65, 'o'],
  [66, 'o'],
  [75, 'o'],
  [85, 'o'],
  [42, 'n'],
  [44, 'n'],
  [54, 'n'],
  [68, 'n'],
  [69, 'n'],
  [70, 'n'],
  [71, 'n'],
  [73, 'n'],
  [78, 'n'],
  [80, 'n'],
  [46, 'a'],
  [67, 'a'],
  [72, 'a'],
  [74, 'a'],
  [79, 'a'],
  [81, 'a'],
  [45, 'r'],
  [29, 'r'],
  [41, 'r'],
  [61, 'r'],
  [64, 'r'],
  [84, 'r'],
  [48, '-'],
  [47, '-'],
  [60, '-'],
  [63, '-'],
  [77, '-'],
  [86, '-'],
  [87, '-'],
  [50, 'p'],
  [30, 'p'],
  [43, 'p'],
  [62, 'p'],
  [76, 'p'],
  [83, 'p'],
  [49, 'H'],
  [55, 'H'],
  [57, 'H'],
  [58, 'H'],
  [51, 't'],
  [52, 't'],
  [53, 't'],
  [59, 't'],
  [82, 't']]);

var midiMapping = new Map([
  ['x', 36],
  ['o', 38],
  ['n', 42],
  ['a', 46],
  ['r', 41],
  ['-', 43],
  ['p', 45],
  ['H', 49],
  ['t', 51],
  [' ', -1]
]);


const rnn = new mm.MusicRNN('https://storage.googleapis.com/download.magenta.tensorflow.org/tfjs_checkpoints/music_rnn/drum_kit_rnn');
rnn.initialize()


const mapToFoxdot = (botDrumMap) => {
  let pattern = '';
  let count = 1;
  botDrumMap.forEach((value, key) => {
    pattern = `${pattern}p${count} >> play("`
    for (i = 0; i < value.length; i++) {
      if (value[i] == 0) {
        pattern += ' ';
      } else {
        pattern += key;
      }
    }
    pattern += '")\n';
    count++;
  })
  return pattern;
}

const stringToSequence = (patternData) => {
  //patterns = 'xx xx x. y y yy y.'
  var patterns = patternData.split(".");
  notes = [];

  patterns.forEach((pattern) => {
    for (let i = 0; i < pattern.length; i++) {
      let pitch = midiMapping.get(pattern[i])
      if (pitch === undefined) {
        //TODO: print this from midiMapping
        throw "[SPRUCEY ERROR]: invalid pattern input, use characters from the set x,o,n,a,r,-,"
      }
      if (pitch > 0) {
        notes.push({
          pitch: pitch,
          quantizedStartStep: i,
          quantizedEndStep: i + 1,
        })
      }
    }
  })


  let seedSeq = {
    totalQuantizedSteps: patterns.length,
    quantizationInfo: { stepsPerQuarter: 1 },
    notes: notes
  }

  return seedSeq
}

const getBotDrums = async (data) => {
  let stringMap = new Map();
  var length = data.length || 8;
  var randomness = data.randomness || 1.5;
  var pattern = data.pattern || "";

  let seedSeq = stringToSequence(pattern);

  let improvisedDrums = await rnn.continueSequence(seedSeq, parseFloat(length), parseFloat(randomness));

  //lets first make a new map
  let symbols = ['x', 'o', 'n', 'a', 'r', '-', 'p', 'H', 't']

  for (i = 0; i < symbols.length; i++) {
    stringMap.set(symbols[i], Array(parseFloat(length)).fill(0))
  }

  for (i = 0; i < improvisedDrums.notes.length; i++) {
    let x = reverseMidiMapping.get(improvisedDrums.notes[i].pitch)
    let arr = stringMap.get(x);
    arr[improvisedDrums.notes[i].quantizedStartStep] = 1;
  }
  return mapToFoxdot(stringMap);
}

const express = require('express');
const app = express();

let port = 7777;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json())
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

app.post('/sprucey', async (req, res) => {
  try {
    const drumPattern = await getBotDrums(req.body);
    res.status(200);
    res.write(drumPattern);
  } catch (e) {
    res.status(500);
    res.write(e);
  }
  res.send()
});
