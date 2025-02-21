// script.js
let isDragging = false;
let startX = 0;
let startY = 0;
let cropX = 0;
let cropY = 0;
let cropWidth = 0;
let cropHeight = 0;
let scaleFactor = 1;
let originalImage = null;

const sourceCanvas = document.getElementById('sourceCanvas');
const cropCanvas = document.getElementById('cropCanvas');
const ctx = sourceCanvas.getContext('2d');
const cropCtx = cropCanvas.getContext('2d');

document.getElementById('aspectRatio').addEventListener('change', function() {
    initCrop();
});

document.getElementById('imageInput').addEventListener('change', function(e) {
    if (e.target.files[0]) {
        const reader = new FileReader();
        reader.onload = (event) => {
            originalImage = new Image();
            originalImage.onload = () => {
                const maxSize = 800;
                let width = originalImage.width;
                let height = originalImage.height;

                if (width > height && width > maxSize) {
                    scaleFactor = maxSize / width;
                    width = maxSize;
                    height = height * scaleFactor;
                } else if (height > maxSize) {
                    scaleFactor = maxSize / height;
                    height = maxSize;
                    width = width * scaleFactor;
                }

                sourceCanvas.width = width;
                sourceCanvas.height = height;
                cropCanvas.width = width;
                cropCanvas.height = height;

                ctx.drawImage(originalImage, 0, 0, width, height);
                initCrop();
            };
            originalImage.src = event.target.result;
        };
        reader.readAsDataURL(e.target.files[0]);
    }
});

function initCrop() {
    if (!originalImage) return;

    const ratio = document.getElementById('aspectRatio').value;
    const [ratioW, ratioH] = ratio === 'free' 
        ? [sourceCanvas.width, sourceCanvas.height] 
        : ratio.split(/[:/]/).map(Number);

    const targetAspect = ratio === 'free' 
        ? sourceCanvas.width / sourceCanvas.height 
        : ratioW / ratioH;

    const imageAspect = sourceCanvas.width / sourceCanvas.height;

    if (imageAspect > targetAspect) {
        cropHeight = sourceCanvas.height;
        cropWidth = cropHeight * targetAspect;
    } else {
        cropWidth = sourceCanvas.width;
        cropHeight = cropWidth / targetAspect;
    }

    cropX = (sourceCanvas.width - cropWidth) / 2;
    cropY = (sourceCanvas.height - cropHeight) / 2;

    updateCropOverlay();
    setupDragEvents();
}

function updateCropOverlay() {
    cropCtx.clearRect(0, 0, cropCanvas.width, cropCanvas.height);
    cropCtx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    cropCtx.fillRect(0, 0, cropCanvas.width, cropCanvas.height);
    cropCtx.clearRect(cropX, cropY, cropWidth, cropHeight);
}

function setupDragEvents() {
    sourceCanvas.onmousedown = (e) => {
        isDragging = true;
        const rect = sourceCanvas.getBoundingClientRect();
        startX = e.clientX - rect.left - cropX;
        startY = e.clientY - rect.top - cropY;
    };

    sourceCanvas.onmousemove = (e) => {
        if (!isDragging) return;
        
        const rect = sourceCanvas.getBoundingClientRect();
        const newX = e.clientX - rect.left - startX;
        const newY = e.clientY - rect.top - startY;

        cropX = Math.max(0, Math.min(newX, sourceCanvas.width - cropWidth));
        cropY = Math.max(0, Math.min(newY, sourceCanvas.height - cropHeight));
        
        updateCropOverlay();
    };

    sourceCanvas.onmouseup = () => isDragging = false;
    sourceCanvas.onmouseleave = () => isDragging = false;
}

function downloadImage() {
    if (!originalImage) return;

    // Рассчитываем координаты для оригинального изображения
    const originalCropX = cropX / scaleFactor;
    const originalCropY = cropY / scaleFactor;
    const originalCropWidth = cropWidth / scaleFactor;
    const originalCropHeight = cropHeight / scaleFactor;

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = originalCropWidth;
    tempCanvas.height = originalCropHeight;
    const tempCtx = tempCanvas.getContext('2d');
    
    tempCtx.drawImage(
        originalImage,
        originalCropX, originalCropY, originalCropWidth, originalCropHeight,
        0, 0, originalCropWidth, originalCropHeight
    );

    const link = document.createElement('a');
    link.download = 'cropped-image.jpg';
    link.href = tempCanvas.toDataURL('image/jpeg', 0.9);
    link.click();
}