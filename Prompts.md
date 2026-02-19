1.

```
"Build a high-performance Infinite Canvas prototype using React and HTML5 Canvas (or PixiJS/Konva if you prefer). The goal is to replicate the core navigation feel of Excalidraw. Please implement the following:

Coordinate Systems: Distinguish between Screen Space (viewport) and World Space (the infinite plane). Create a utility to convert coordinates between the two.

Transformation State: Maintain a global camera state containing { x, y, scale }.

Interaction Logic:

Zoom: Implement 'Zoom at Mouse Cursor' (not just center-zoom) using the mouse wheel.

Pan: Implement panning via spacebar + click-drag or middle-mouse drag.

Infinite Grid: Render a dynamic grid background that scales and fades as the user zooms in/out.

Performance & Rendering: Use requestAnimationFrame for a smooth 60fps experience. Ensure the rendering logic only draws elements currently within the viewport (Culling).

Please provide the code using a custom hook (e.g., useInfiniteCanvas) to separate the math/logic from the React UI component."

make them as main page of ui package
```

2.
