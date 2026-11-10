# graphic_designs

## Next.js interactive gallery

Install dependencies and start the development server:

```bash
npm install
npm run dev
```

The interactive gallery is available at [http://localhost:3000](http://localhost:3000).
All original project image assets are in `public/` and are served locally. The
Insights, Nortiqa, and Tristone collections each appear in one card and rotate
through their images in a shuffled order every 3.5 seconds.

Drag to pan, scroll or use the on-screen controls to zoom, double-click to zoom
or reset, and click a card to view it larger. Open Gallery Settings (or press
`H`) to tune spacing, buffering, style, smooth flow, momentum, zoom, and overlay
behavior. Project cards are shuffled each time the gallery loads, and images
show an animated skeleton until their WebP file has loaded. Press Escape to
close an expanded image.

Create a production build with `npm run build`, then serve it with `npm start`.