(() => {
    const hero = document.querySelector(".section--top");
    const canvas = document.querySelector("#drawingCanvas");

    if (!hero || !canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const rabbit = new Image();
    rabbit.decoding = "async";

    let imageReady = false;
    let lastPoint = null;
    let heroWidth = 0;

    function resizeCanvas() {
        const bounds = hero.getBoundingClientRect();
        const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);

        heroWidth = bounds.width;
        canvas.width = Math.round(bounds.width * pixelRatio);
        canvas.height = Math.round(bounds.height * pixelRatio);

        // Desenha em pixels CSS, mantendo nitidez em telas de alta densidade.
        context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
        lastPoint = null;
    }

    function drawRabbit(event) {
        // O efeito é para mouse/caneta; evita desenhar ao rolar com o dedo.
        if (!imageReady || event.pointerType === "touch") return;

        const bounds = canvas.getBoundingClientRect();
        const x = event.clientX - bounds.left;
        const y = event.clientY - bounds.top;

        if (x < 0 || y < 0 || x > bounds.width || y > bounds.height) return;

        const rabbitWidth = Math.min(260, Math.max(150, heroWidth * 0.17));
        const aspectRatio = rabbit.naturalHeight / rabbit.naturalWidth;
        const rabbitHeight = rabbitWidth * aspectRatio;
        const minimumDistance = Math.max(120, rabbitWidth * 0.62);

        if (lastPoint) {
            const distance = Math.hypot(x - lastPoint.x, y - lastPoint.y);
            if (distance < minimumDistance) return;
        }

        // Centraliza cada coelho no cursor. O próprio banner recorta as bordas.
        context.drawImage(
            rabbit,
            x - rabbitWidth / 2,
            y - rabbitHeight / 2,
            rabbitWidth,
            rabbitHeight
        );

        lastPoint = { x, y };
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
