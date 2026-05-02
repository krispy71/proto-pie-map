# Yamnaya — An Interactive Map of Indo-European Language Origins

An interactive animated map visualising the spread of Proto-Indo-European (PIE) languages
and peoples from ~4000 BCE to 500 CE, based on the archaeogenetic and comparative
linguistic research of Haak et al. (2015), Narasimhan et al. (2019), Librado et al. (2021),
David Reich, David Anthony, and others.

![Map screenshot placeholder](https://via.placeholder.com/800x400?text=PIE+Migration+Map)

## Features

- **Animated timeline** — play, pause, rewind, and scrub from 4000 BCE to 500 CE
- **22 cultures** with territories that grow, move, and shrink over time
- **14 animated migration paths** that draw themselves as the timeline advances
- **11 colour-coded language branches** — toggle each on/off via the legend
- **Ancient DNA notes** — click any territory for genetic ancestry context
- **39 historical events** in the bottom ticker
- **11 archaeological site markers** — key excavation sites toggle-able from map controls
- **Adjustable map display** — switch tile style, control map and overlay opacity
- **Bookmarkable URLs** — timeline year and branch filters are stored in the URL hash

## Running locally

Requires [Node.js](https://nodejs.org/) 18 or later.

```bash
git clone <repo-url>
cd proto-pie-map
npm install
npm start
```

Open [http://localhost:3020](http://localhost:3020).

To use a different port:

```bash
PORT=8080 npm start
```

## Running in Docker

Requires [Docker](https://docs.docker.com/get-docker/) (and optionally Docker Compose).

### With `docker run`

```bash
docker build -t proto-pie-map .
docker run -p 3020:3020 proto-pie-map
```

Then open [http://localhost:3020](http://localhost:3020).

### With Docker Compose

```bash
docker compose up --build
```

To change the host port:

```bash
PORT=8080 docker compose up --build
```

Stop:

```bash
docker compose down
```

## Controls

| Control | Action |
|---|---|
| ▶ / ⏸ | Play / pause the timeline |
| ⏮ | Rewind to 4000 BCE |
| − / + | Slow down / speed up playback |
| Time slider | Drag to any year in the range |
| Click a territory | Open detail panel with description and genetics note |
| Legend swatches | Click to show/hide individual language branches |
| Map style | Switch between five base map tile styles |
| Map opacity | Control how bright/dim the base map tiles appear (100% = fully visible tile labels and borders) |
| Overlay opacity | Control the transparency of territory circles and migration lines |

## Data sources

- Laura Spinney, *Proto: How One Ancient Language Went Global* (2024)
- David Reich, *Who We Are and How We Got Here* (2018)
- Wolfgang Haak et al., "Massive migration from the steppe" *Nature* 522 (2015)
- Iain Mathieson et al., "Genome-wide patterns of selection in 230 ancient Eurasians" *Nature* 528 (2015)
- Iosif Lazaridis et al., "The genetic history of the Southern Arc" *Science* 375 (2022)
- Vagheesh Narasimhan et al., "The formation of human populations in South and Central Asia" *Science* 365 (2019)
- Pablo Librado et al., "The origins and spread of domestic horses from the Western Eurasian steppes" *Nature* 598 (2021)
- Peter de Barros Damgaard et al., "137 ancient human genomes from across the Eurasian steppes" *Nature* 557 (2018)
- David Anthony, *The Horse, the Wheel, and Language* (Princeton, 2007)
- J.P. Mallory & D.Q. Adams, *The Oxford Introduction to Proto-Indo-European* (Oxford, 2006)

Coordinates and date ranges are approximations; territorial extents are schematic circles,
not historically precise polygons. Modern tile borders are shown for orientation only.

## Development

See [CLAUDE.md](CLAUDE.md) for architecture notes, data schema, and how to add new
cultures or migrations.

## License

MIT
