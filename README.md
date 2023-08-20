# RWEditor
A rain world level editor remade from the ground up with javascript and html/css. link to my editor: https://mevvern.github.io/RWEditor

## Current Features
* importing a project file from the original editor
* saving a level you created (not exporting to the original editor!!!)
* creating a new level
* all "geometry" tiles from the original editor

## Planned Features (short-term)
* exporting levels in the original editor's format
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
### where to get the level files
the basegame's project files can be found at the bottom of this page, to be downloaded alongside the original editor: https://store.steampowered.com/news/app/312520/view/3671033323706467799

The project files for the game are located at *\Official Level Editor Downpour\LevelEditorProjects\World. currently,  my editor is limited to reading and editing geometry only.

have fun and poke around in there!
### Export a Level
Level exporting is currently not implemented, but will be in the future
### Disclaimer
I currently cannot guarantee that my editor can open all project files without issue. if you need a functioning editor, use the official one I linked above

## Editor Settings
### Reset View
Resets the view to the default, useful if you moved the view too far and dont know where the level is
### Hide Grid
guess what this does lol
### Auto Slope
(currently does nothing despite what I've written here) toggles whether or not to automatically decide the facing of a placed slope based on surrounding tiles. if toggled off, slope can be changed with the space bar
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

to save a level to browser storage. There is only one save slot currently
### load
* ctrl+L

to load a level from browser storage. this will permanently delete whatever you didn't save, so be careful!
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