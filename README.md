[![Make.fun bounty](https://make.fun/badge/best-heist-game-20261122-0559.svg)](https://make.fun/bounty/best-heist-game-20261122-0559)
[![Rank](https://make.fun/badge/best-heist-game-20261122-0559/coral-fox-12/best-heist-game/rank.svg)](https://make.fun/bounty/best-heist-game-20261122-0559)
[![Reward](https://make.fun/badge/best-heist-game-20261122-0559/coral-fox-12/best-heist-game/reward.svg)](https://make.fun/bounty/best-heist-game-20261122-0559)

# The Amber Star

An original top-down stealth heist game, built for make.fun's **best-heist-game** bounty. One quiet thief, three gallery rooms after closing, guards with sweeping cones of sight, security cameras, a glowing Amber Star in each room — and one alarm meter standing between you and the getaway.

## Play

Serve `game/` with any static server and open `game/index.html` in a desktop browser. No network, no build step, no accounts — vanilla JavaScript and Canvas only.

- **WASD / arrows** — move
- **Shift** — sneak (slower, harder to spot)
- **Q or click** — throw a noisemaker to pull a guard away
- **E** — EMP burst: blinds every camera for 6 seconds
- **P** — pause, **M** — mute

Steal the Amber Star, grab what side loot you dare, and reach the green exit before the alarm meter hits 100%. Dark floor patches hide you; walls and display cases block every cone. Finish a room with the peak alarm under 50% for the Ghost bonus.

## Layout

- `game/index.html` — the page; the canvas and the one module script
- `game/src/main.js` — boot, the fixed-step loop, the screens
- `game/src/config.js` — tuning: speeds, cone sizes, alarm rates, palette
- `game/src/levels.js` — the three hand-designed rooms
- `game/src/world.js` — the live state and the step rules
- `game/src/guards.js` — patrols, vision cones, line of sight, suspicion and chase
- `game/src/render.js` — every pixel: floor, cones, figures, loot, HUD, screens
- `game/src/input.js` — keyboard and mouse
- `game/src/audio.js` — synthesized WebAudio cues, no audio files
- `game/src/random.js` — the seeded generator behind patrol pauses
- `game/src/shots.js` — the staged screenshot scenes (`?shot=cover|play|caught|title`)
- `screenshots/` — real renders of the game's own code
- `main.ts` — the hand-in program: copies `game/` and `screenshots/` to `/output` and writes `dossier.json`
- `vendor/makefun-game.ts` — the kit's dossier library, unchanged

## License

MIT — see [LICENSE](LICENSE).
