// Global Variables
let slides = [];
let currentSlideIndex = 0;
let currentMode = 'draw'; // draw, text, shape
let currentShape = 'rectangle';
let history = [];
let historyIndex = -1;
let zoomLevel = 1;

// Canvas Elements
const canvas = document.getElementById('mainCanvas');
const ctx = canvas.getContext('2d');
let painting = false;
let lastX = 0, lastY = 0;

// Settings
let penColor = '#2196F3';
let penSize = 3;
let textColor = '#000000';
let fontSize = 16;

// Text Boxes
let textBoxes = [];

// DOM Elements
const slidesList = document.getElementById('slidesList');
const drawBtn = document.getElementById('drawBtn');
const textBtn = document.getElementById('textBtn');
const shapeBtn = document.getElementById('shapeBtn');
const imageBtn = document.getElementById('imageBtn');
const mathBtn = document.getElementById('mathBtn');
const undoBtn = document.getElementById('undoBtn');
const redoBtn = document.getElementById('redoBtn');
const clearBtn = document.getElementById('clearBtn');
const presentBtn = document.getElementById('presentBtn');
const exportBtn = document.getElementById('exportBtn');
const saveBtn = document.getElementById('saveBtn');
const newSlideBtn = document.getElementById('newSlideBtn');
const deleteSlideBtn = document.getElementById('deleteSlideBtn');
const duplicateSlideBtn = document.getElementById('duplicateSlideBtn');
const penColorInput = document.getElementById('penColor');
const penSizeInput = document.getElementById('penSize');
const sizeValue = document.getElementById('sizeValue');
const bgType = document.getElementById('bgType');
const fontSizeInput = document.getElementById('fontSize');
const textColorInput = document.getElementById('textColor');
const zoomInBtn = document.getElementById('zoomInBtn');
const zoomOutBtn = document.getElementById('zoomOutBtn');
const resetZoomBtn = document.getElementById('resetZoomBtn');
const shapesPanel = document.getElementById('shapesPanel');
const darkModeToggle = document.getElementById('darkModeToggle');
const teacherModeBtn = document.getElementById('teacherModeBtn');
const studentModeBtn = document.getElementById('studentModeBtn');

// Initialize
function init() {
    // Add default slide
    slides = [{
        id: Date.now(),
        canvasData: null,
        textBoxes: [],
        background: 'white'
    }];
    currentSlideIndex = 0;
    
    resizeCanvas();
    setupEventListeners();
    setupKeyboardShortcuts();
    updateUI();
    saveToHistory();
}

// Resize Canvas
function resizeCanvas() {
    const container = document.getElementById('canvasContainer');
    canvas.width = container.clientWidth * 0.9;
    canvas.height = container.clientHeight * 0.9;
    canvas.style.transform = `scale(${zoomLevel})`;
    canvas.style.transformOrigin = 'top left';
    redrawCurrentSlide();
}

// Redraw Current Slide
function redrawCurrentSlide() {
    if (!slides[currentSlideIndex]) return;
    
    // Apply background
    applyBackground();
    
    // Load drawing
    if (slides[currentSlideIndex].canvasData) {
        const img = new Image();
        img.onload = () => {
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        };
        img.src = slides[currentSlideIndex].canvasData;
    }
    
    // Load text boxes
    if (slides[currentSlideIndex].textBoxes) {
        textBoxes = slides[currentSlideIndex].textBoxes;
        drawAllTextBoxes();
    }
}

// Apply Background
function applyBackground() {
    const bg = slides[currentSlideIndex].background || bgType.value;
    
    switch(bg) {
        case 'white':
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            break;
        case 'grid':
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.strokeStyle = '#ddd';
            ctx.lineWidth = 0.5;
            for (let i = 0; i < canvas.width; i += 20) {
                ctx.beginPath();
                ctx.moveTo(i, 0);
                ctx.lineTo(i, canvas.height);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(0, i);
                ctx.lineTo(canvas.width, i);
                ctx.stroke();
            }
            break;
        case 'lined':
            ctx.fillStyle = '#FFF9C4';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.strokeStyle = '#2196F3';
            ctx.lineWidth = 0.5;
            for (let i = 30; i < canvas.height; i += 30) {
                ctx.beginPath();
                ctx.moveTo(0, i);
                ctx.lineTo(canvas.width, i);
                ctx.stroke();
            }
            break;
        case 'dark':
            ctx.fillStyle = '#1a1a2e';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            break;
    }
}

// Drawing Functions
function startDrawing(e) {
    if (currentMode !== 'draw') return;
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
    if (!painting || currentMode !== 'draw') return;
    const pos = getMousePos(e);
    ctx.strokeStyle = penColor;
    ctx.lineWidth = penSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    lastX = pos.x;
    lastY = pos.y;
}

function stopDrawing() {
    if (painting) {
        painting = false;
        saveCurrentDrawing();
        saveToHistory();
    }
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

// Save Current Drawing
function saveCurrentDrawing() {
    slides[currentSlideIndex].canvasData = canvas.toDataURL();
    slides[currentSlideIndex].textBoxes = JSON.parse(JSON.stringify(textBoxes));
    slides[currentSlideIndex].background = bgType.value;
    updateSlidePreview();
}

// Save to History (Undo/Redo)
function saveToHistory() {
    history = history.slice(0, historyIndex + 1);
    history.push(JSON.parse(JSON.stringify(slides)));
    historyIndex++;
}

function undo() {
    if (historyIndex > 0) {
        historyIndex--;
        slides = JSON.parse(JSON.stringify(history[historyIndex]));
        currentSlideIndex = Math.min(currentSlideIndex, slides.length - 1);
        redrawCurrentSlide();
        renderSlidesList();
        updateUI();
    }
}

function redo() {
    if (historyIndex < history.length - 1) {
        historyIndex++;
        slides = JSON.parse(JSON.stringify(history[historyIndex]));
        currentSlideIndex = Math.min(currentSlideIndex, slides.length - 1);
        redrawCurrentSlide();
        renderSlidesList();
        updateUI();
    }
}

// Slide Management
function addNewSlide() {
    saveCurrentDrawing();
    const newSlide = {
        id: Date.now(),
        canvasData: null,
        textBoxes: [],
        background: bgType.value
    };
    slides.push(newSlide);
    currentSlideIndex = slides.length - 1;
    renderSlidesList();
    redrawCurrentSlide();
    saveToHistory();
    updateUI();
}

function deleteSlide() {
    if (slides.length === 1) {
        alert("Cannot delete the only slide!");
        return;
    }
    slides.splice(currentSlideIndex, 1);
    if (currentSlideIndex >= slides.length) currentSlideIndex = slides.length - 1;
    renderSlidesList();
    redrawCurrentSlide();
    saveToHistory();
    updateUI();
}

function duplicateSlide() {
    const clonedSlide = JSON.parse(JSON.stringify(slides[currentSlideIndex]));
    clonedSlide.id = Date.now();
    slides.splice(currentSlideIndex + 1, 0, clonedSlide);
    currentSlideIndex++;
    renderSlidesList();
    redrawCurrentSlide();
    saveToHistory();
    updateUI();
}

function switchSlide(index) {
    saveCurrentDrawing();
    currentSlideIndex = index;
    redrawCurrentSlide();
    renderSlidesList();
    updateUI();
}

// Render Slides List
function renderSlidesList() {
    slidesList.innerHTML = '';
    slides.forEach((slide, idx) => {
        const slideDiv = document.createElement('div');
        slideDiv.className = `slide-item ${idx === currentSlideIndex ? 'active' : ''}`;
        slideDiv.innerHTML = `
            <div class="slide-number">Slide ${idx + 1}</div>
            <div class="slide-preview">${slide.textBoxes.length ? '📝 Text' : '🖌️ Drawing'}</div>
            <div class="slide-actions">
                <button class="icon-btn" onclick="switchSlide(${idx})"><i class="fas fa-eye"></i></button>
            </div>
        `;
        slideDiv.onclick = () => switchSlide(idx);
        slidesList.appendChild(slideDiv);
    });
}

function updateSlidePreview() {
    renderSlidesList();
}

// Text Box Functions
function addTextBox() {
    const newId = Date.now();
    const newBox = {
        id: newId,
        x: 100,
        y: 100,
        text: 'Edit this text',
        width: 200,
        height: 60,
        fontSize: fontSize,
        color: textColor
    };
    textBoxes.push(newBox);
    drawAllTextBoxes();
    saveCurrentDrawing();
    saveToHistory();
}

function drawAllTextBoxes() {
    document.querySelectorAll('.text-box').forEach(el => el.remove());
    const container = document.getElementById('canvasContainer');
    
    textBoxes.forEach(box => {
        const textDiv = document.createElement('div');
        textDiv.className = 'text-box';
        textDiv.contentEditable = 'true';
        textDiv.innerText = box.text;
        textDiv.style.left = box.x + 'px';
        textDiv.style.top = box.y + 'px';
        textDiv.style.width = box.width + 'px';
        textDiv.style.height = box.height + 'px';
        textDiv.style.fontSize = box.fontSize + 'px';
        textDiv.style.color = box.color;
        textDiv.style.position = 'absolute';
        textDiv.style.background = 'white';
        textDiv.style.border = '1px dashed #4F46E5';
        textDiv.style.padding = '8px';
        textDiv.style.borderRadius = '4px';
        textDiv.style.cursor = 'move';
        textDiv.setAttribute('data-id', box.id);
        
        // Make text box draggable
        makeDraggable(textDiv, box);
        
        // Save on edit
        textDiv.addEventListener('blur', (e) => {
            const id = parseInt(e.target.getAttribute('data-id'));
            const tb = textBoxes.find(t => t.id === id);
            if (tb) tb.text = e.target.innerText;
            saveCurrentDrawing();
        });
        
        container.appendChild(textDiv);
    });
}

function makeDraggable(element, box) {
    let isDragging = false;
    let startX, startY, origLeft, origTop;
    
    element.addEventListener('mousedown', (e) => {
        if (e.target === element || element.contains(e.target)) {
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            origLeft = parseInt(element.style.left);
            origTop = parseInt(element.style.top);
            e.preventDefault();
        }
    });
    
    window.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        element.style.left = (origLeft + dx) + 'px';
        element.style.top = (origTop + dy) + 'px';
        box.x = origLeft + dx;
        box.y = origTop + dy;
        saveCurrentDrawing();
    });
    
    window.addEventListener('mouseup', () => {
        isDragging = false;
    });
}

// Clear Board
function clearBoard() {
    if (confirm('Clear entire board? This cannot be undone.')) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        applyBackground();
        textBoxes = [];
        drawAllTextBoxes();
        saveCurrentDrawing();
        saveToHistory();
    }
}

// Export as PDF
async function exportAsPDF() {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF('landscape');
    
    for (let i = 0; i < slides.length; i++) {
        if (i > 0) pdf.addPage();
        
        // Create temporary canvas for slide
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        const tempCtx = tempCanvas.getContext('2d');
        
        // Draw slide content
        if (slides[i].canvasData) {
            const img = new Image();
            img.src = slides[i].canvasData;
            await new Promise(resolve => {
                img.onload = () => {
                    tempCtx.drawImage(img, 0, 0);
                    resolve();
                };
            });
        }
        
        pdf.addImage(tempCanvas.toDataURL(), 'PNG', 10, 10, 280, 190);
    }
    
    pdf.save('presentation.pdf');
}

// Export as Image
function exportAsImage() {
    const link = document.createElement('a');
    link.download = `slide_${currentSlideIndex + 1}.png`;
    link.href = canvas.toDataURL();
    link.click();
}

// Save Project to LocalStorage
function saveProject() {
    const project = {
        slides: slides,
        timestamp: new Date().toISOString(),
        version: '1.0'
    };
    localStorage.setItem('eduboard_project', JSON.stringify(project));
    alert('Project saved successfully!');
}

// Load Project from LocalStorage
function loadProject() {
    const saved = localStorage.getItem('eduboard_project');
    if (saved) {
        const project = JSON.parse(saved);
        slides = project.slides;
        currentSlideIndex = 0;
        renderSlidesList();
        redrawCurrentSlide();
        saveToHistory();
        alert('Project loaded!');
    } else {
        alert('No saved project found!');
    }
}

// Presentation Mode
function startPresentation() {
    const modal = document.getElementById('presentModal');
    const presentCanvas = document.getElementById('presentCanvas');
    const presentCtx = presentCanvas.getContext('2d');
    let currentPresentIndex = 0;
    
    presentCanvas.width = 800;
    presentCanvas.height = 600;
    
    function loadPresentSlide(index) {
        if (slides[index] && slides[index].canvasData) {
            const img = new Image();
            img.onload = () => {
                presentCtx.drawImage(img, 0, 0, presentCanvas.width, presentCanvas.height);
            };
            img.src = slides[index].canvasData;
        }
        document.getElementById('slideCounter').innerText = `Slide ${index + 1} of ${slides.length}`;
    }
    
    loadPresentSlide(currentPresentIndex);
    modal.classList.remove('hidden');
    
    document.getElementById('prevSlideBtn').onclick = () => {
        if (currentPresentIndex > 0) {
            currentPresentIndex--;
            loadPresentSlide(currentPresentIndex);
        }
    };
    
    document.getElementById('nextSlideBtn').onclick = () => {
        if (currentPresentIndex < slides.length - 1) {
            currentPresentIndex++;
            loadPresentSlide(currentPresentIndex);
        }
    };
    
    document.getElementById('closePresentBtn').onclick = () => {
        modal.classList.add('hidden');
    };
    
    document.getElementById('exitPresentBtn').onclick = () => {
        modal.classList.add('hidden');
    };
}

// Zoom Functions
function zoomIn() {
    zoomLevel = Math.min(zoomLevel + 0
