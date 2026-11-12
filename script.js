(() => {
    const hero = document.querySelector(".section--top");
    const canvas = document.querySelector("#drawingCanvas");
    if (!hero || !canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const rabbit = new Image();
    rabbit.decoding = "async";

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const entranceDuration = 260;
    const stamps = [];

    let imageReady = false;
    let lastPoint = null;
    let pointer = null;
    let heroWidth = 0;
    let animationFrame = null;

    function resizeCanvas() {
        const bounds = hero.getBoundingClientRect();
        const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
        heroWidth = bounds.width;
        canvas.width = Math.round(bounds.width * pixelRatio);
        canvas.height = Math.round(bounds.height * pixelRatio);
        context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
        lastPoint = null;
        scheduleRender();
    }

    function render(now) {
        const bounds = hero.getBoundingClientRect();
        context.clearRect(0, 0, bounds.width, bounds.height);
        let needsAnotherFrame = false;

        for (const stamp of stamps) {
            const progress = prefersReducedMotion.matches
                ? 1
                : Math.min((now - stamp.createdAt) / entranceDuration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const entranceScale = 0.82 + 0.18 * eased;

            const isHovered = pointer &&
                Math.abs(pointer.x - stamp.x) < stamp.width * 0.42 &&
                Math.abs(pointer.y - stamp.y) < stamp.height * 0.42;

            const targetHoverScale = isHovered ? 1.09 : 1;
            stamp.hoverScale += (targetHoverScale - stamp.hoverScale) * 0.22;

            if (progress < 1 || Math.abs(stamp.hoverScale - targetHoverScale) > 0.005) {
                needsAnotherFrame = true;
            }

            const scale = entranceScale * stamp.hoverScale;
            const width = stamp.width * scale;
            const height = stamp.height * scale;

            context.drawImage(
                rabbit,
                stamp.x - width / 2,
                stamp.y - height / 2,
                width,
                height
            );
        }

        if (needsAnotherFrame) {
            animationFrame = window.requestAnimationFrame(render);
        } else {
            animationFrame = null;
        }
    }

    function scheduleRender() {
        if (animationFrame === null) {
            animationFrame = window.requestAnimationFrame(render);
        }
    }

    function handlePointerMove(event) {
        if (event.pointerType === "touch") return;

        const bounds = canvas.getBoundingClientRect();
        const x = event.clientX - bounds.left;
        const y = event.clientY - bounds.top;
        if (x < 0 || y < 0 || x > bounds.width || y > bounds.height) return;

        pointer = { x, y };
        scheduleRender();

        if (!imageReady) return;

        const rabbitWidth = Math.min(260, Math.max(150, heroWidth * 0.17));
        const rabbitHeight = rabbitWidth * (rabbit.naturalHeight / rabbit.naturalWidth);
        const minimumDistance = Math.max(120, rabbitWidth * 0.62);

        if (lastPoint && Math.hypot(x - lastPoint.x, y - lastPoint.y) < minimumDistance) {
            return;
        }

        stamps.push({
            x,
            y,
            width: rabbitWidth,
            height: rabbitHeight,
            createdAt: performance.now(),
            hoverScale: 1
        });

        if (stamps.length > 300) stamps.shift();
        lastPoint = { x, y };
        scheduleRender();
    }

    rabbit.addEventListener("load", () => {
        imageReady = true;
    }, { once: true });

    rabbit.src = "imagem/coelho.png";

    hero.addEventListener("pointermove", handlePointerMove, { passive: true });
    hero.addEventListener("pointerleave", () => {
        lastPoint = null;
        pointer = null;
        scheduleRender();
    }, { passive: true });

    window.addEventListener("resize", resizeCanvas, { passive: true });
    resizeCanvas();
})();