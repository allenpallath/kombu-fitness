# Kombu Fitness website

Static one-page site for **Kombu Fitness Centre** (കൊമ്പ്), Judgemukku, Thrikkakara, Kakkanad, Kochi.
Brand, photos and details come from [@kombu_fitness](https://www.instagram.com/kombu_fitness/).

- Plain HTML + vanilla JS (no framework, no build step needed to serve)
- SCSS source in `scss/`, compiled to `css/main.css` (commit the compiled file)
- Colours from the crest: black `#0b0b0a` and Kombu yellow `#ffd21f`
- Type: Big Shoulders Display (headlines), Archivo (body), Noto Sans Malayalam (subset to കൊമ്പ് only)

## Develop

```bash
npm install
npm run watch   # recompile SCSS on save
npm run serve   # http://localhost:4173
```

`npm run build` produces the minified `css/main.css`.

## Structure

```
index.html            page, meta tags, JSON-LD (ExerciseGym, WebSite, FAQPage)
scss/                 _tokens, _base, _components, _sections -> main.scss
css/main.css          compiled output
js/main.js            nav, scrollspy, live open/closed status (IST), challenge countdown, map facade
assets/img/           WebP photos from Instagram, logo, og-image.jpg (1200x630)
assets/icons/         favicon + touch icons
robots.txt, sitemap.xml, site.webmanifest
```

## Things to update by hand

- **Hours**: `HOURS` in `js/main.js`, the hours table and FAQ in `index.html`, and `openingHoursSpecification` in the JSON-LD.
- **November challenge**: dates live in `data-start` / `data-end` on `#challenge`. After the end date the section switches to a "next challenge" message automatically.
- **Photos**: Instagram only serves 640px images publicly. Swap in original high-res files from the gym when available (same filenames in `assets/img/`).
