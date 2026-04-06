const canvas = document.getElementById('paintCanvas');
const ctx = canvas.getContext('2d');

// Canvas size ko screen ke hisaab se set karna
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let painting = false;

function startPosition(e) {
    painting = true;
    draw(e);
}

function finishedPosition() {
    painting = false;
    ctx.beginPath();
}

function draw(e) {
    if (!painting) return;
    ctx.lineWidth = document.getElementById('lineWidth').value;
    ctx.lineCap = 'round';
    ctx.strokeStyle = document.getElementById('colorPicker').value;

    ctx.lineTo(e.clientX, e.clientY - 50); // -50 toolbar ki height ke liye
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(e.clientX, e.clientY - 50);
}

canvas.addEventListener('mousedown', startPosition);
canvas.addEventListener('mouseup', finishedPosition);
canvas.addEventListener('mousemove', draw);
