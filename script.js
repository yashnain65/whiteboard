// ---------- DATA ----------
let slides = [];
let currentSlideIndex = 0;
let isDrawing = false;
let drawMode = true;
let lastX = 0, lastY = 0;

const canvas = document.getElementById('boardCanvas');
const ctx = canvas.getContext('2d');
let painting = false;

// Pen settings
let penColor = '#0000ff';
let penSize = 3;

// Text boxes per slide
let textBoxes = [];

// DOM elements
const slidesPanelDiv = document.getElementById('slidesPanel');
const addSlideBtn = document.getElementById('addSlideBtn');
const deleteSlideBtn = document.getElementById('deleteSlideBtn');
const drawModeBtn = document.getElementById('drawModeBtn');
const textModeBtn = document.getElementById('textModeBtn');
const clearBoardBtn = document.getElementById('clearBoardBtn');
const penColorInput = document.getElementById('penColor');
const penSizeInput = document.getElementById('penSize');
const exportImageBtn = document.getElementById('exportImageBtn');

// ---------- HELPER: Resize canvas ----------
function resizeCanvas() {
    const container = document.getElementById('canvasContainer');
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    redrawCurrentSlide();
}

// ---------- Save current slide drawing as dataURL ----------
function saveCurrentDrawing() {
    if (slides[currentSlideIndex]) {
        slides[currentSlideIndex].canvasData = canvas.toDataURL();
        slides[currentSlideIndex].textBoxes = JSON.parse(JSON.stringify(textBoxes));
    }
}

// ---------- Redraw current slide ----------
function redrawCurrentSlide() {
    if (!slides[currentSlideIndex]) return;

    const img = new Image();
    img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        drawAllTextBoxes();
    };
    img.src = slides[currentSlideIndex].canvasData || '';
    if (!slides[currentSlideIndex].canvasData) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawAllTextBoxes();
    }

    if (slides[currentSlideIndex].textBoxes) {
        textBoxes = JSON.parse(JSON.stringify(slides[currentSlideIndex].textBoxes));
    } else {
        textBoxes = [];
    }
    drawAllTextBoxes();
}

// Draw all text boxes on canvas container
function drawAllTextBoxes() {
    document.querySelectorAll('.text-box').forEach(el => el.remove());

    const container = document.getElementById('canvasContainer');
    textBoxes.forEach((box, idx) => {
        const textDiv = document.createElement('div');
        textDiv.className = 'text-box';
        textDiv.contentEditable = "true";
        textDiv.innerText = box.text;
        textDiv.style.left = box.x + 'px';
        textDiv.style.top = box.y + 'px';
        textDiv.style.width = box.width + 'px';
        textDiv.style.height = box.height + 'px';
        textDiv.setAttribute('data-id', box.id);

        textDiv.addEventListener('blur', (e) => {
            const id = parseInt(e.target.getAttribute('data-id'));
            const tb = textBoxes.find(t => t.id === id);
            if (tb) tb.text = e.target.innerText;
            saveCurrentDrawing();
        });

        // Drag functionality
        let isDragging = false;
        let startX, startY, origLeft, origTop;
        textDiv.addEventListener('mousedown', (e) => {
            if (e.target === textDiv || e.target.parentElement === textDiv) {
                isDragging = true;
                startX = e.clientX;
                startY = e.clientY;
                origLeft = parseInt(textDiv.style.left);
                origTop = parseInt(textDiv.style.top);
                e.preventDefault();
            }
        });

        window.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            let dx = e.clientX - startX;
            let dy = e.clientY - startY;
            textDiv.style.left = (origLeft + dx) + 'px';
            textDiv.style.top = (origTop + dy) + 'px';
            const tb = textBoxes.find(t => t.id === box.id);
            if (tb) {
                tb.x = origLeft + dx;
                tb.y = origTop + dy;
            }
            saveCurrentDrawing();
        });

        window.addEventListener('mouseup', () => {
            isDragging = false;
        });

        // Resize handle
        const handle = document.createElement('div');
        handle.className = 'resize-handle';
        textDiv.appendChild(handle);
        let isResizing = false;
        handle.addEventListener('mousedown', (e) => {
            isResizing = true;
            e.stopPropagation();
            let startW = parseInt(textDiv.style.width);
            let startH = parseInt(textDiv.style.height);
            let startMouseX = e.clientX;
            let startMouseY = e.clientY;

            const resizeMove = (moveEvent) => {
                let newW = startW + (moveEvent.clientX - startMouseX);
                let newH = startH + (moveEvent.clientY - startMouseY);
                if (newW > 50) textDiv.style.width = newW + 'px';
                if (newH > 30) textDiv.style.height = newH + 'px';
                const tb = textBoxes.find(t => t.id === box.id);
                if (tb) {
                    tb.width = parseInt(textDiv.style.width);
                    tb.height = parseInt(textDiv.style.height);
                }
                saveCurrentDrawing();
            };
            const resizeUp = () => {
                isResizing = false;
                window.removeEventListener('mousemove', resizeMove);
                window.removeEventListener('mouseup', resizeUp);
            };
            window.addEventListener('mousemove', resizeMove);
            window.addEventListener('mouseup', resizeUp);
        });

        container.appendChild(textDiv);
    });
}

// Add new text box
function addNewTextBox() {
    const newId = Date.now();
    const newBox = {
        id: newId,
        x: 100,
        y: 100,
        text: "Double click to edit",
        width: 150,
        height: 50
    };
    textBoxes.push(newBox);
    drawAllTextBoxes();
    saveCurrentDrawing();
}

// ---------- DRAWING FUNCTIONS ----------
function startDrawing(e) {
    if (!drawMode) return;
    painting = true;
    const pos = getMousePos(e);
    lastX = pos.x;
    lastY = pos.y;
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(lastX, lastY);
    ctx.stroke();
}

function draw(e) {
    if (!painting || !drawMode) return;
    const pos = getMousePos(e);
    const currentX = pos.x;
    const currentY = pos.y;
    ctx.strokeStyle = penColor;
    ctx.lineWidth = penSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(currentX, currentY);
    ctx.stroke();
    lastX = currentX;
    lastY = currentY;
}

function stopDrawing() {
    painting = false;
    saveCurrentDrawing();
}

function getMousePos(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    let clientX, clientY;
    if (e.touches) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
    } else {
        clientX = e.clientX;
        clientY = e.clientY;
    }
    let x = (clientX - rect.left) * scaleX;
    let y = (clientY - rect.top) * scaleY;
    x = Math.min(Math.max(0, x), canvas.width);
    y = Math.min(Math.max(0, y), canvas.height);
    return { x, y };
}

function clearBoard() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    saveCurrentDrawing();
}

// ---------- SLIDE MANAGEMENT ----------
function addNewSlide() {
    saveCurrentDrawing();
    const newSlide = {
        canvasData: '',
        textBoxes: []
    };
    slides.push(newSlide);
    currentSlideIndex = slides.length - 1;
    renderSlideThumbnails();
    loadSlide(currentSlideIndex);
}

function deleteCurrentSlide() {
    if (slides.length === 1) {
        alert("You need at least one slide!");
        return;
    }
    slides.splice(currentSlideIndex, 1);
    if (currentSlideIndex >= slides.length) currentSlideIndex = slides.length - 1;
    renderSlideThumbnails();
    loadSlide(currentSlideIndex);
}

function loadSlide(index) {
    saveCurrentDrawing();
    currentSlideIndex = index;
    resizeCanvas();
    renderSlideThumbnails();
}

function renderSlideThumbnails() {
    slidesPanelDiv.innerHTML = '';
    slides.forEach((slide, idx) => {
        const thumb = document.createElement('div');
        thumb.className = 'slide-thumb';
        if (idx === currentSlideIndex) thumb.classList.add('active-slide');
        thumb.innerHTML = `Slide ${idx + 1}`;
        thumb.onclick = () => loadSlide(idx);
        slidesPanelDiv.appendChild(thumb);
    });
}

// ---------- MODE TOGGLE ----------
drawModeBtn.addEventListener('click', () => {
    drawMode = true;
    drawModeBtn.classList.add('active');
    textModeBtn.classList.remove('active');
    canvas.style.cursor = 'crosshair';
});

textModeBtn.addEventListener('click', () => {
    drawMode = false;
    textModeBtn.classList.add('active');
    drawModeBtn.classList.remove('active');
    canvas.style.cursor = 'text';
    addNewTextBox();
});

// ---------- EVENT LISTENERS ----------
canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseleave', stopDrawing);

canvas.addEventListener('touchstart', startDrawing);
canvas.addEventListener('touchmove', draw);
canvas.addEventListener('touchend', stopDrawing);

addSlideBtn.addEventListener('click', addNewSlide);
deleteSlideBtn.addEventListener('click', deleteCurrentSlide);
clearBoardBtn.addEventListener('click', clearBoard);
penColorInput.addEventListener('change', (e) => penColor = e.target.value);
penSizeInput.addEventListener('input', (e) => penSize = parseInt(e.target.value));

exportImageBtn.addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = `slide_${currentSlideIndex+1}.png`;
    link.href = canvas.toDataURL();
    link.click();
});

window.addEventListener('resize', () => {
    saveCurrentDrawing();
    resizeCanvas();
});

// ---------- INITIALIZATION ----------
function init() {
    slides = [{ canvasData: '', textBoxes: [] }];
    currentSlideIndex = 0;
    resizeCanvas();
    renderSlideThumbnails();
    drawMode = true;
    penColor = '#0000ff';
    penSize = 3;
}

init();
