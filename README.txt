JUNGLE JOHN'S

PLAY
  Double-click jungle-johns.html. It opens in your browser. Nothing to install.
  Saves happen at the end of each in-game day.

RENAME THE STORE
  Open source/src/data.js in Notepad. Near the top:
    storeName: "Jungle John's",
    ownerName: "Jungle John",
  Change those, then rebuild (below). Or ask Claude to do it.

REBUILD AFTER CHANGING SOURCE
  Needs Python. In this folder:  python source/build.py
  Makes source/dist.html. Copy it over jungle-johns.html.

TEST
  In the source folder:  python run_tests.py
  Builds, runs every test, ends with ALL GREEN or RED: <names>.

WHAT'S WHERE (source/src)
  data.js    store name, aisles, prices, upgrades, fests, customer lines
  art.js     shelves, props, customers
  art2.js    the boss sprite, pixel font, signs
  world.js   store layout
  game.js    rules: customers, money, time, tasks
  music.js   the generated music (built from Slimehedron)
  audio.js   sound effects + picks which music plays where
  render.js  drawing
  ui.js      menus and HUD
  main.js    controls and start-up

CONTROLS
  WASD / arrows move. R takes skates off (walk, no sliding) and puts them back on.
  On a phone: the WALK / SKATE button.

LICENSE
  See LICENSE.txt. All rights reserved, yours. music.js reuses your own
  Slimehedron code, so its GPL doesn't apply here. Font and drum credits are in there.
