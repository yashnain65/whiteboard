// Initialize Fabric Canvas
const canvas = new fabric.Canvas('board', {
    width: window.innerWidth - 70,
    height: window.innerHeight - 60,
    isDrawingMode: true
});

// Settings variables
const colorPicker = document.getElementById('colorPicker');
const widthSlider = document.getElementById('widthSlider');

// Sync Brush Settings
canvas.freeDrawingBrush.color = colorPicker.value;
canvas.freeDrawingBrush.width = parseInt(widthSlider.value);

colorPicker.oninput = () => {
    canvas.freeDrawingBrush.color = colorPicker.value;
};

widthSlider.oninput = () => {
    canvas.freeDrawingBrush.width = parseInt(widthSlider.value);
};

// Tool Selection Logic
function deactivateAll() {
    canvas.isDrawingMode = false;
    document.querySelectorAll('.sidebar button').forEach(btn => btn.classList.remove('active'));
}

document.getElementById('penTool').onclick = function() {
    deactivateAll();
    canvas.isDrawingMode = true;
    this.classList.add('active');
};

document.getElementById('selectTool').onclick = function() {
    deactivateAll();
    this.classList.add('active');
};

document.getElementById('rectTool').onclick = function() {
    deactivateAll();
    const rect = new fabric.Rect({
        left: 100, top: 100, fill: 'transparent', 
        stroke: colorPicker.value, strokeWidth: parseInt(widthSlider.value),
        width: 100, height: 100
    });
    canvas.add(rect);
    this.classList.add('active');
};

document.getElementById('circleTool').onclick = function() {
    deactivateAll();
    const circle = new fabric.Circle({
        left: 150, top: 150, radius: 50,
        fill: 'transparent', stroke: colorPicker.value, strokeWidth: parseInt(widthSlider.value)
    });
    canvas.add(circle);
    this.classList.add('active');
};

document.getElementById('textTool').onclick = function() {
    deactivateAll();
    const text = new fabric.IText('Double click to type', {
        left: 100, top: 100, fill: colorPicker.value, fontSize: 24
    });
    canvas.add(text);
    this.classList.add('active');
};

document.getElementById('eraserTool').onclick = function() {
    deactivateAll();
    // Fabric.js simple eraser: Draw with background color
    canvas.isDrawingMode = true;
    canvas.freeDrawingBrush.color = '#ffffff';
    this.classList.add('active');
};

document.getElementById('clearBtn').onclick = () => {
    if(confirm("Clear everything?")) canvas.clear();
};

document.getElementById('saveBtn').onclick = () => {
    const dataURL = canvas.toDataURL({ format: 'png', quality: 1 });
    const link = document.createElement('a');
    link.download = 'whiteboard-export.png';
    link.href = dataURL;
    link.click();
};

// Handle window resize
window.onresize = () => {
    canvas.setDimensions({ width: window.innerWidth - 70, height: window.innerHeight - 60 });
};
