# Wordsearch

This snippet is a Vue component for constructing, and eventually playing, wordsearches in a browsers. It is all Unicode based and can handle RTL and LTR languages.

At present this is just a demo with fixed data. When integrated into a larger application this component could take data from a cut and paste from a text, or from a REST API call to a data source.

The layout algorithm is a new one, different from the one in my Python version in my [puzzles repo](https://github.com/47rooks/puzzles).

Statistics support will be added to provide information on such things as percentage grid covered, number of unplaceable words, the ability to permit auto-expansion of the grid size when words cannot be placed, numbers of words placed in each direction, some measure of evenness of layout and so on. These measures will help improve the algorithm.

Game play will be added with timing and scoring.

## Layout Algorithm

The layout algorithm is revised from the Python version to improve the balance in the layout. The Python wordsearch tends to layout words with a strong influence from the main diagonal of the grid. This results in mostly horizontal layout about the diagonal, diagonal layout on the diagonal and vertical layout below. In addition most blank space occurs in the lower right stretching up the right side and along the bottom towards the left, and the opposite for RTL layouts. This because the layout proceeds radiating out from the top left (top right in RTL) corner down and to the right (left in RTL). This layout while effective enough results in little intersection of words and a very predictable disposition of words, leading to easier solving.

The new layout algorithm here attempt instead to be more randomized and to consider more possibilities rather than choosing the first acceptable placement for a word. Thus this algorithm proceeds by finding all possible placements, without conflicts, for the current word given the current state of the grid. It then chooses one at random. It then goes on to the next word. As the placement proceeds there are fewer acceptable choices as placement becomes more constrained.

In the Python algorithm layout proceeds until all words are placed and the grid size is determined by the shape of the grid when all words are placed. They are mostly almost square for a reasonable number of words. Here the grid size is constrained (the side length is the length of the longest word, measure in graphemes. See [UAX 29](http://unicode.org/reports/tr29/#Introduction) ) and placement for a word may fail. Of course tweaks might be made to retry placement with a larger grid size if the number of successfully placed words is too low.
