const canvas = document.getElementById('paintCanvas');
const ctx = canvas.getContext('2d');
const colorPicker = document.getElementById('colorPicker');
const lineWidth = document.getElementById('lineWidth');
const clearBtn = document.getElementById('clearBtn');
const eraserBtn = document.getElementById('eraserBtn');
const penBtn = document.getElementById('penBtn');
const downloadBtn = document.getElementById('downloadBtn');

// Canvas ko full screen set karna
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight - 60; // Toolbar ki height hata kar
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

let painting = false;
let isEraser = false;

// Drawing Functions
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

    // Mouse aur Touch dono ke coordinate handle karna
    const x = e.clientX || e.touches[0].clientX;
    const y = (e.clientY || e.touches[0].clientY) - 60;

    ctx.lineWidth = lineWidth.value;
    ctx.lineCap = 'round';
    
    if (isEraser) {
        ctx.strokeStyle = '#ffffff'; // Eraser matlab white color
    } else {
        ctx.strokeStyle = colorPicker.value;
    }

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
}

// Event Listeners for Mouse
canvas.addEventListener('mousedown', startPosition);
canvas.addEventListener('mouseup', finishedPosition);
canvas.addEventListener('mousemove', draw);

// Event Listeners for Touch (Mobile)
canvas.addEventListener('touchstart', (e) => { e.preventDefault(); startPosition(e); });
canvas.addEventListener('touchend', finishedPosition);
canvas.addEventListener('touchmove', (e) => { e.preventDefault(); draw(e); });

// Toolbar Actions
eraserBtn.addEventListener('click', () => {
    isEraser = true;
    eraserBtn.classList.add('active');
    penBtn.classList.remove('active');
});

penBtn.addEventListener('click', () => {
    isEraser = false;
    penBtn.classList.add('active');
    eraserBtn.classList.remove('active');
});

clearBtn.addEventListener('click', () => {
    if(confirm("Kya aap pura board saaf karna chahte hain?")) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
});

downloadBtn.addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = 'my-drawing.png';
    link.href = canvas.toDataURL();
    link.click();
});
