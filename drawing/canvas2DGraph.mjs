import { paintNodeGraph } from "./paintNodeGraph.mjs";

export function canvas2DGraph(
  canvas,
  config,
  { subscribe },
  paintFn = paintNodeGraph,
  paintOptions = { autoAlign: "CENTER" },
  { onHover, onHoverEnd, onClick, updateState } = {}
) {
  let zoomFactor = 1.0;
  let panOffset = [0, 0];
  let currentLock = false;
  let state = null;
  subscribe(updated => {
    state = updated;
  });
  const context = canvas.getContext("2d", { alpha: false });
  // Get the DPR and size of the canvas
  var dpr = 1; // window.devicePixelRatio;
  var rect = canvas.getBoundingClientRect();

  // Set the "actual" size of the canvas
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;

  // Scale the context to ensure correct drawing operations
  context.scale(dpr, dpr);

  // Set the "drawn" size of the canvas
  // canvas.style.width = rect.width + "px";
  // canvas.style.height = rect.height + "px";

  const mouseCursor = {
    hits: [],
    position: [0, 0]
  };

  const onMouseMove = (event) => {
    canvas.style.cursor = "default";
    if (mouseCursor.hits.length > 0) {
      const element = mouseCursor.hits[0];
      onHover && onHover(element);
    } else {
      onHoverEnd && onHoverEnd();
    }
    let x = event.clientX + document.body.scrollLeft - canvas.offsetLeft;
    // x *= canvas.width / window.innerWidth;
    // x -= panOffset[0];
    let y = event.clientY + document.body.scrollTop - canvas.offsetTop;
    // y *= canvas.height / window.innerHeight;
    // y -= panOffset[1];
    mouseCursor.position = [
      x + window.scrollX,
      y + window.scrollY
    ];
    mouseCursor.hits = [];
  };
  canvas.addEventListener("mousemove", onMouseMove);

  const onMouseDown = () => {
    if (mouseCursor.hits[0]) {
      let element = mouseCursor.hits[0];
      state.selectedElementId = element.id;
      updateState && updateState(current => ({ ...current, selectedElementId: element.id }));
      onClick && onClick(element);
    }
  }
  canvas.addEventListener("mousedown", onMouseDown);

  let debugInfo = {
    fps: 0,
  };

  let center = [0, 0];
  let lastWidth = canvas.width;
  let lastHeight = canvas.height;
  let lastChanged = false;
  let stopped = false;
  var times = [];
  if (canvas.width !== canvas.parentElement.clientWidth) {
    canvas.width = canvas.parentElement.clientWidth;
  }
  function animate() {
    switch(paintOptions.autoAlign) {
    case "TOP_TO_BOTTOM":
      if (canvas.height < canvas.parentElement.clientHeight) {
        canvas.height = Math.max(lastHeight, canvas.parentElement.clientHeight);
      }
      if (lastChanged) {
        lastChanged = false;
        canvas.height = lastHeight;
        canvas.parentElement.style.overflowY = "scroll";
        if (!currentLock) {
          canvas.parentElement.scrollTo(0, canvas.parentElement.scrollHeight);
          // TODO: Add smooth scrolling
          /* canvas.parentElement.scrollBy({
              left: 0,
              top: canvas.parentElement.scrollHeight,
              behavior: "smooth"
            }); */
        }
      }
      break;
    }

    context.fillStyle = "#FFF";
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.scale(zoomFactor / dpr, zoomFactor / dpr);
    let xOffset = panOffset[0];
    let yOffset = panOffset[1];
    switch(paintOptions.autoAlign) {
    case "TOP_TO_BOTTOM":
      xOffset = panOffset[0] + center[0]/2 - lastWidth/2;
      yOffset = 10;
      break;
    case "CENTER":
      xOffset = panOffset[0] + center[0]/2 - lastWidth/2;
      yOffset = panOffset[1] + center[1]/2 - lastHeight/2;
      break;
    }
    context.translate(xOffset, yOffset);

    const [w, h] = paintFn(context, state, mouseCursor, paintOptions);
    center = [canvas.width/2, canvas.height/2];

    const now = performance.now();
    while (times.length > 0 && times[0] <= now - 1000) {
      times.shift();
    }
    times.push(now);
    debugInfo.fps = times.length;

    context.translate(-xOffset, -yOffset);
    context.scale(dpr * 1/zoomFactor, dpr * 1/zoomFactor);

    if (w !== lastWidth) {
      lastWidth = w;
      lastChanged = true;
    }
    if (h !== lastHeight) {
      lastHeight = h;
      lastChanged = true;
    }
    /* if (lastChanged) {
      lastChanged = false;
      // canvas.width = w;
      // canvas.height = h;
    } */

    if (!stopped) requestAnimationFrame(animate);
  }
  animate();

  return {
    context,
    debugInfo,
    zoom: (factor) => {
      zoomFactor = factor || 1.0;
      // context.canvas.height *= zoomFactor;
    },
    pan: (offset) => {
      panOffset = offset;
    },
    setLock: (lock) => {
      currentLock = lock;
    },
    remove: () => {
      stopped = true;
      context.fillStyle = "#FFF";
      context.fillRect(0, 0, 640, 480);

      canvas.removeEventListener("mousedown", onMouseDown);
      canvas.removeEventListener("mousemove", onMouseMove);
    }
  }
}

