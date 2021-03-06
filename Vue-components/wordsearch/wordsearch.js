/*
 * wordsearch.js v0.1
 * Copyright 47rooks.com 2017
 * Released under MIT License.
 *
 * wordsearch requires vue.js and grapheme-splitter.js to be loaded before it.
 */
Vue.component('f7-wordsearch', {
  template: '<table id="puzzleTable" border="1" v-html="grid"></table>',
  data: function() {
    return {
      inputWords: null,
      rtl: false,
      gData: null,
      rowLen: 0,
      metrics: null
    }
  },
  computed: {
    grid: function() {
      // create the grid
      // This is the implementation of the wordsearch
      // generation.
      var s = '<tr>';
      if (this.gData) {
        for (var i=0; i < this.gData.length; i++) {
          if (i > 0 && i % this.rowLen === 0) {
            s = s + '</tr>';
            if (i < this.gData.length) {
              s = s + '<tr>';
            }
          }
          s = s + '<td>' + this.gData[i] + '</td>';
        }
        return s;
      } else {
        return "<tr><td>No data</td></tr>";
      }
    }
  },
  methods: {
    scramble: function(words, rtl) {
      this.inputWords = words;
      this.rtl = rtl;

      var rc = create_wordsearch(this.inputWords,
                                 this.rtl);
      this.gData = rc.grid;
      this.rowLen = rc.size;
      this.metrics = rc.metrics;
      // DEBUG
      console.log('length of grid = ' + this.gData.length);
      console.log('Metrics ', this.metrics);
    }
  }
});

function create_wordsearch(words, rtl) {

  // Sort the words list by descending order of number of graphemes
  var sp = new GraphemeSplitter();
  words.sort(function(a, b) {
    return sp.countGraphemes(b) -
           sp.countGraphemes(a);
  });

  // DEBUG
  for (var i = 0; i < words.length; i++) {
    console.log(sp.splitGraphemes(words[i]));
  }

  // Set the initial grid size as a square with rows and columns set to the longest word.
  var rows = sp.splitGraphemes(words[0]).length;
  var cols = rows;
  var allGraphemes = [];

  // Initialize the metrics
  var metrics = { num_words: words.length,
                  size: cols,
                  numSquares: cols * cols,
                  numEmpty: 0,
                  horizontal: 0,
                  vertical: 0,
                  diagonal: 0,
                  crossingWords: 0,
                  nonCrossingWords: 0,
                  averageWordLength: 0.0,
                  stdevWordLength: 0.0,
                };
  // DEBUG
  console.log('rows=' + rows + ', cols=' + cols);

  /*
   * grid is [{ row: Y,
               col: X,
               gr: grapheme
             }, .... ]
           {
             loc: X_Y,
             gr: grapheme
           }
           grid[ rows * length of row + cols ] = grapheme
           row 0 is the top row and they count up as they go down.
           col 0 is the left most and they count up as they go right.
   */
  var grid = [];
  var wordLens = [], wordLenTotal = 0;

  for (var i = 0; i < words.length; i++) {
    var graphemes = sp.splitGraphemes(words[i]);
    var wordLen = graphemes.length;
    allGraphemes = allGraphemes.concat(graphemes);

    // Update metrics
    wordLens.push(wordLen);
    wordLenTotal += wordLen;

    // DEBUG
    console.log('placing ' + words[i]);
    /* Find the list of valid placements
     * Each placement is an object with four attributes:
     *    { sx, sy, ex, ey }
     */
    var placements = { crossing: [],
                       nonCrossing:[] };
    for (var j = 0; j < cols; j++) {
      for (var k = 0; k < rows; k++) {
        // Short circuit loop if the word will not fit
        var fVert = fitsVertically(rows, k, wordLen);
        var fHoriz = fitsHorizontally(j, rtl, wordLen,
                                      cols);
        if (!fVert && !fHoriz)
          continue;

        // Build up the directions list
        var directions = [];
        if (fVert)
          directions.push('down');
        if (fHoriz)
          directions.push(rtl ? 'left' : 'right');
        if (fVert && fHoriz)
          directions.push(rtl ? 'leftDiag'
                                : 'rightDiag');
        // DEBUG
        console.log('directions: ' + directions);
        // Find a starting square that is either empty or has the same letter as the initial letter of this word
        var loc = coordsToIndex(j, k, cols);
        console.log('loc(col, row, index)=(' +
                    j + ', ' + k + ', ' + loc + ')');
        if (grid[loc] == null ||
            (grid[loc] != null &&
             grid[loc] === words[i][0])) {
          // Found a valid starting place for this word
          var sx = j, sy = k;

          // Check all possible directions for placement.
          for (var m = 0; m < directions.length; m++) {
            var fits = false, ex = 0, ey = 0;
            switch(directions[m]) {
              case 'right':
                ex = sx + wordLen - 1;
                ey = sy;
                fits = checkNoConflict(sx, sy,
                                     ex, ey,
                                     cols, grid,
                                     graphemes);
                break;
              case 'rightDiag':
                ex = sx + wordLen - 1;
                ey = sy + wordLen - 1;
                fits = checkNoConflict(sx, sy,
                                     ex, ey,
                                     cols, grid,
                                     graphemes);
                break;
              case 'left':
                ex = sx - wordLen + 1;
                ey = sy;
                fits = checkNoConflict(sx, sy,
                                     ex, ey,
                                     cols, grid,
                                     graphemes);
                break;
              case 'leftDiag':
                ex = sx - wordLen + 1;
                ey = sy + wordLen - 1;
                fits = checkNoConflict(sx, sy,
                                     ex, ey,
                                     cols, grid,
                                     graphemes);
                break;
              case 'down':
                ex = sx;
                ey = sy + wordLen - 1;
                fits = checkNoConflict(sx, sy,
                                     ex, ey,
                                     cols, grid,
                                     graphemes);
                break;
            }

            // Create a placement entry and store it
            if (fits.noConflict) {
              if (fits.crossings > 0) {
                placements.crossing.push({ sx: sx,
                                           sy: sy,
                                           ex: ex,
                                           ey: ey });
              } else {
                placements.nonCrossing.push({ sx: sx,
                                              sy: sy,
                                              ex: ex,
                                              ey: ey });
              }
            }
          }
        }
      }
    }  // end of finding all possible placements for a word

    // Choose a placement at random and put it into the grid
    var p = null;
    if (placements.crossing.length > 0) {
      console.log('num crossing placements=' + placements.crossing.length);
      var r = Math.floor(Math.random() * placements.crossing.length);
      console.log(r);
      var p = placements.crossing[r];

      metrics.crossingWords++;
    } else {
      console.log('num non-crossing placements=' + placements.nonCrossing.length);
      var r = Math.floor(Math.random() * placements.nonCrossing.length);
      console.log(r);
      var p = placements.nonCrossing[r];

      metrics.nonCrossingWords++;
    }
    if (p) {
      // DEBUG
      console.log('Placement for ' + words[i] + ' is :');
      console.log(p);
      placeOnGrid(grid, p, cols, graphemes);
      // update placement metrics
      if (p.sx === p.ex) {
        metrics.vertical++;
      } else if (p.sy === p.ey) {
        metrics.horizontal++;
      } else {
        metrics.diagonal++;
      }
    } else {
      console.log('no placement possible for ' +
                  words[i]);
    }
  } // end of loop through word list

  /* Loop through the grid and place random graphemes from
   * the source word list
   */
  for (var i=0; i < rows * cols; i++) {
    console.log('i=' + i + 'grid[i]=' + grid[i]);
    if (grid[i] == null) {
      var r = Math.floor(Math.random() * allGraphemes.length);
      console.log('got a null ' + r);
      grid[i] = allGraphemes[r];
      metrics.numEmpty++;
    }
  }

  // Update metrics
  var mean = wordLenTotal / words.length;
  var sumOfSquares = 0.0;
  for (var i=0; i < wordLens.length; i++) {
    sumOfSquares += Math.pow(wordLens[i] - mean, 2);
  }
  metrics.averageWordLength = mean;
  metrics.stdevWordLength = Math.sqrt(sumOfSquares / mean);
  return { grid: grid, size: cols, metrics: metrics };
}

/* Check if the word will fit or not.
 * This is the case is the starting point is closer
 * to the edge or bottom of the grid than the
 * length of the word (number of graphemes).
 */
function fitsVertically(rows, y, len) {
  return rows - y >= len;
}

function fitsHorizontally(x, rtl, len, cols) {
  return (!rtl) ? (cols - x >= len)
                : (x + 1 >= len);
}

/*
 * Check that the graphemes can be placed between the
 * start and end coordinates without conflicting in
 * any location.
 * Returns true if there are no conflicts, false
 * otherwise. If true it will also return whether there is
 * an intersection with an existing word.
 */
function checkNoConflict(sx, sy,
                         ex, ey,
                         rowLen, grid,
                         graphemes) {
  var x = sx, y = sy;
  var crossings = 0;
  for (var i = 0; i < graphemes.length; i++) {
    if (grid[coordsToIndex(x, y, rowLen)] != null) {
      if (grid[coordsToIndex(x, y, rowLen)] !== graphemes[i]) {
        return false;
      } else {
        crossings++;
      }
    }
    x = ex > sx ? x + 1 : sx > ex ? x - 1: x;
    y = sy != ey ? y + 1: y;
  }
  return { noConflict: true, crossings: crossings };
}

/* Convert a grid coordinate to an array index given the
 * coordinates and the row length.
 */
function coordsToIndex(x, y, rowLen) {
  return y * rowLen + x;
}

function placeOnGrid(grid, loc, rowLen, graphemes) {
  var sx = loc.sx;
  var sy = loc.sy;
  var ex = loc.ex;
  var ey = loc.ey;
  var x = sx, y = sy;
  for (var i = 0; i < graphemes.length; i++) {
    grid[coordsToIndex(x, y, rowLen)] = graphemes[i];
    x = ex > sx ? x + 1 : sx > ex ? x - 1: x;
    y = sy != ey ? y + 1: y;
  }
}
