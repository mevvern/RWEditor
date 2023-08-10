# RWEditor
A rain world level editor remade from the ground up with javascript and html/css

## Current Features
* not much
* saving a level you created
* creating a level
* all "geometry" tiles from the original editor

## Planned Features (short-term)
* importing and exporting levels in the original editor's format
* editing graphical tiles
* editing effects

## Planned Features (long-term)
* a more accurate preview of placed graphical tiles with properly rendered depth and stuff
* palette previews
* a downloadable version for automatic level importing, file listing, etc

# How to use the editor
## General
* To get a blank level, refresh the page

## Tools
### paint
places the chosen tile at the mouse's location... what else could i say :3
### erase
erases the clicked tile. will only erase the currently selected tile type and nothing else
### box fill
replaces a box of your choosing with the tile of your choosing
### box erase
erases a box of your choosing. this method of erasing affects all tile types, not just the currently selected one.
### selection
allows you to select a box shaped area of the level for copying and pasting.
### ruler
measures the distance in tiles between a point you clicked on and the point you dragged the mouse to
### camera editor
this tool is currently unused
### play area editor
allows you to edit the size of the play area by clicking on the top left or bottom right corners of the play area (the play area is denoted by the red border)

## Layers
### Work Layer Selection
This selection determines which layer your edits will affect. You can only have one selected layer at a time, sorry!!!
### Layer Visibility
If a button is selected here, it means the layer is visible. if a layer is invisible you can't edit it

## Import a Level
### currently does nothing

## Editor Settings
### Reset View
Resets the view to the default, useful if you moved the view too far and dont know where the level is
### Hide Grid
guess what this does lol
### Replace Air
Toggles whether or not to replace a level's tiles with a selection's air (air means a grid cell is empty)

## Level Settings
### Change Level Size
Sets the size of the level. can currently only be changed in multiples of screens (a screen is 72 tiles wide and 43 tiles tall). it will add the space to the botton or right of the level
### Level Name
idk what this does it just appeared here one day after i had a bad dream

## Shortcuts
### save 
* ctrl-s

to save a level you must rename from the default name. there is only one save slot currently
### load
* ctrl+L

to load a level. this will permanently delete whatever you didn't save, so be careful!
### copy
* ctrl-c
### paste
* ctrl-v
### cut
* ctrl-x
### delete
* del
### place selection
* enter