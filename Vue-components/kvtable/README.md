# Key Value Table

This component is designed to render a JS object containing a heading and an array of key value pairs where the key must be a string. There is no limitation on the value though I have not tested all combinations yet. As the keys in the table data are not real keys in an object there is no requirement for them to be unique but it may not make great sense if there are duplicates.

## Object Structure

The JSON structure looks like this :

```
var metrics = {
                heading: "Wordsearch Metrics",
                kv: [
                  { k: "Number of words", v: 12 },
                  { k: "Size", v: 10 },
                  { k: "Number of squares", v: 100 },
                  { k: "Number of empty squares", v: 27 },
                  { k: "Horiontal words", v: 5 },
                  { k: "Vertical words", v: 4 },
                  { k: "Diagonal words", v: 3 },
                  { k: "Crossing words", v: 6 },
                  { k: "Non-crossing words", v: 6 },
                  { k: "Average word length", v: 7.23 },
                  { k: "Std deviation of word length", v: 3.456 },
                ]
              };
```
