# Wordsearch

This snippet is a Vue component for constructing, and eventually playing, wordsearches in a browsers. It is all Unicode based and can handle RTL and LTR languages.

At present this is just a demo with fixed data. When integrated into a larger application this component could take data from a cut and paste from a text, or from a REST API call to a data source.

The layout algorithm is a new one, different from the one in my Python version in my [puzzles repo](https://github.com/47rooks/puzzles).

Statistics support will be added to provide information on such things as percentage grid covered, number of unplaceable words, the ability to permit auto-expansion of the grid size when words cannot be placed, numbers of words placed in each direction, some measure of evenness of layout and so on. These measures will help improve the algorithm.

Game play will be added with timing and scoring.

## Layout Algorithm
