const canvas = document.querySelector('#drawingCanvas');
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const coelho = document.createElement ('img');

coelho.src = 'imagem/coelho.png';


const context = canvas.getContext('2d')

let lastX = 0;
let lastY = 0;

const handleMouseMove = (event) => {
    const left = event.clientX -200;
    const top = event.clientY -200;
    const distance = Math.hypot(left - lastX, top - lastY);

    if (distance > 200) {
        context.drawImage(coelho, left - 10, top - 10);

        lastX = left;
        lastY = top;
    }
}

canvas.addEventListener('mousemove', handleMouseMove);
