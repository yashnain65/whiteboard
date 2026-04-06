const canvas = new fabric.Canvas('mainCanvas', {
    width: window.innerWidth - 70,
    height: window.innerHeight - 60,
    isDrawingMode: false,
    preserveObjectStacking: true
});

// Settings Elements
const colorInput = document.getElementById('mainColor');
const sizeInput = document.getElementById('mainSize');
const canvasWrapper = document.getElementById('canvas-wrapper');

// 1. Initial Brush Config
canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
canvas.freeDrawingBrush.width = parseInt(sizeInput.value);
canvas.freeDrawingBrush.color = colorInput.value;

// 2. Tool Switching Logic
function resetTools() {
    canvas.isDrawingMode = false;
    document.querySelectorAll('.tool-btn').forEach(btn => btn.classList.remove('active'));
}

// Select Pointer
document.getElementById('selectPtr').onclick = function() {
    resetTools();
    this.classList.add('active');
};

// Pen/Brush
document.getElementById('brushBtn').onclick = function() {
    resetTools();
    canvas.isDrawingMode = true;
    this.classList.add('active');
};

// Rectangle
document.getElementById('rectBtn').onclick = function() {
    resetTools();
    const rect = new fabric.Rect({
        left: 200, top: 200, fill: 'transparent',
        stroke: colorInput.value, strokeWidth: parseInt(sizeInput.value),
        width: 150, height: 100
    });
    canvas.add(rect).setActiveObject(rect);
    this.classList.add('active');
};

// Circle
document.getElementById('circBtn').onclick = function() {
    resetTools();
    const circ = new fabric.Circle({
        left: 200, top: 200, radius: 60,
        fill: 'transparent', stroke: colorInput.value, 
        strokeWidth: parseInt(sizeInput.value)
    });
    canvas.add(circ).setActiveObject(circ);
    this.classList.add('active');
};

// Text Tool
document.getElementById('textBtn').onclick = function() {
    resetTools();
    const text = new fabric.IText('Type here...', {
        left: 200, top: 200, fill: colorInput.value,
        fontSize: 30
    });
    canvas.add(text).setActiveObject(text);
    this.classList.add('active');
};

// Delete Selected Object
document.getElementById('deleteBtn').onclick = function() {
    const activeObjects = canvas.getActiveObjects();
    if (activeObjects.length) {
        canvas.discardActiveObject();
        activeObjects.forEach((obj) => canvas.remove(obj));
    }
};

// Clear Everything
document.getElementById('clearAll').onclick = () => {
    if(confirm("Full board saaf kar dein?")) canvas.clear();
};

// Toggle Grid
document.getElementById('toggleGrid').onclick = () => {
    canvasWrapper.classList.toggle('no-grid');
};

// Real-time Update Settings
colorInput.onchange = () => {
    canvas.freeDrawingBrush.color = colorInput.value;
    const active = canvas.getActiveObject();
    if (active) {
        if (active.type === 'i-text') active.set('fill', colorInput.value);
        else active.set('stroke', colorInput.value);
        canvas.renderAll();
    }
};

sizeInput.oninput = () => {
    canvas.freeDrawingBrush.width = parseInt(sizeInput.value);
};

// Download PNG
document.getElementById('downloadPng').onclick = () => {
    const dataURL = canvas.toDataURL({ format: 'png', quality: 1.0 });
    const link = document.createElement('a');
    link.download = 'yash-whiteboard.png';
    link.href = dataURL;
    link.click();
};

// Handle Window Resize
window.addEventListener('resize', () => {
    canvas.setDimensions({ 
        width: window.innerWidth - 70, 
        height: window.innerHeight - 60 
    });
});
