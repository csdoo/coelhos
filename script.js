(() => {
    const hero = document.querySelector(".section--top");
    const canvas = document.querySelector("#drawingCanvas");

    if (!hero || !canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const rabbit = new Image();
    rabbit.decoding = "async";

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const animationDuration = 240;
    const stamps = [];

    let imageReady = false;
    let lastPoint = null;
    let heroWidth = 0;
    let animationFrame = null;

    function resizeCanvas() {
        const bounds = hero.getBoundingClientRect();
        const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);

        heroWidth = bounds.width;
        canvas.width = Math.round(bounds.width * pixelRatio);
        canvas.height = Math.round(bounds.height * pixelRatio);

        // Desenha em pixels CSS, mantendo nitidez em telas de alta densidade.
        context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
        lastPoint = null;
        render(performance.now());
    }

    function render(now) {
        const bounds = hero.getBoundingClientRect();
        context.clearRect(0, 0, bounds.width, bounds.height);

        let hasActiveAnimation = false;

        for (const stamp of stamps) {
            const progress = prefersReducedMotion.matches
                ? 1
                : Math.min((now - stamp.createdAt) / animationDuration, 1);

            // Zoom suave: começa um pouco menor e chega ao tamanho original.
            const easedProgress = 1 - Math.pow(1 - progress, 3);
            const scale = 0.88 + (0.12 * easedProgress);

            if (progress < 1) hasActiveAnimation = true;

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

        if (hasActiveAnimation) {
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

    function drawRabbit(event) {
        // O efeito é para mouse/caneta; evita desenhar ao rolar com o dedo.
        if (!imageReady || event.pointerType === "touch") return;

        const bounds = canvas.getBoundingClientRect();
        const x = event.clientX - bounds.left;
        const y = event.clientY - bounds.top;

        if (x < 0 || y < 0 || x > bounds.width || y > bounds.height) return;

        const rabbitWidth = Math.min(260, Math.max(150, heroWidth * 0.17));
        const rabbitHeight = rabbitWidth * (rabbit.naturalHeight / rabbit.naturalWidth);
        const minimumDistance = Math.max(120, rabbitWidth * 0.62);

        if (lastPoint) {
            const distance = Math.hypot(x - lastPoint.x, y - lastPoint.y);
            if (distance < minimumDistance) return;
        }

        stamps.push({
            x,
            y,
            width: rabbitWidth,
            height: rabbitHeight,
            createdAt: performance.now()
        });

        // Evita que a lista de desenhos cresça indefinidamente.
        if (stamps.length > 300) stamps.shift();

        lastPoint = { x, y };
        scheduleRender();
    }

    rabbit.addEventListener("load", () => {
        imageReady = true;
    }, { once: true });

    rabbit.src = "imagem/coelho.png";

    hero.addEventListener("pointermove", drawRabbit, { passive: true });
    hero.addEventListener("pointerleave", () => {
        lastPoint = null;
    }, { passive: true });

    window.addEventListener("resize", resizeCanvas, { passive: true });
    resizeCanvas();
})();