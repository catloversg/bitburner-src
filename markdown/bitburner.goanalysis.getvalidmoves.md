<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [bitburner](./bitburner.md) &gt; [GoAnalysis](./bitburner.goanalysis.md) &gt; [getValidMoves](./bitburner.goanalysis.getvalidmoves.md)

## GoAnalysis.getValidMoves() method

Shows if each point on the board is a valid move for the player.

The true/false validity of each move can be retrieved via the X and Y coordinates of the move. `const validMoves = ns.go.analysis.getValidMoves();`

`const moveIsValid = validMoves[x][y];`

Note that the \[0\]\[0\] point is shown on the bottom-left on the visual board (as is traditional), and each string represents a vertical column on the board. In other words, the printed example above can be understood to be rotated 90 degrees clockwise compared to the board UI as shown in the IPvGO subnet tab.

**Signature:**

```typescript
getValidMoves(): boolean[][];
```
**Returns:**

boolean\[\]\[\]

## Remarks

RAM cost: 8 GB (This is intentionally expensive; you can derive this info from just getBoardState() )

