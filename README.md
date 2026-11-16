# flaker
web floormap drawing app

## run
```
npm install
npm start
```
then open http://localhost:3000

## controls
- `1` vertex mode
- `2` edge mode
- `3` door / window mode
- `4` furniture mode
- `e` place a vertex, a door / window on the nearest wall, or the selected furniture
- in furniture mode, pick an item from the side menu first
- `r` rotate selected furniture 45 degrees clockwise
- `shift` + `r` rotate selected furniture 45 degrees counterclockwise
- `f` connect the selected vertices with walls
- click a vertex in vertex mode, or a wall in edge mode, to select it
- `shift` or `ctrl` + click to add or remove from the selection
- drag a selected vertex or furniture item to move it
- walls move with their vertices
- `delete` remove the selected vertices, furniture, or walls
- `escape` clear the selection
- switching modes clears the selection
- scroll the mouse wheel to zoom in / out around the cursor
- middle-drag to pan around the floor plan
- `+` / `-` to zoom in / out, `0` to reset the view
