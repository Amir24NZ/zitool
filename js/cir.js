document.addEventListener('DOMContentLoaded', () => {
    const uploadArea = document.getElementById('uploadArea');
    const imageUpload = document.getElementById('imageUpload');
    const fileNameDisplay = document.getElementById('fileName');
    const imageProcessingArea = document.getElementById('imageProcessingArea');
    const imageCanvas = document.getElementById('imageCanvas');
    const ctx = imageCanvas.getContext('2d');
    const cropButton = document.getElementById('cropButton');
    const downloadButton = document.getElementById('downloadButton');
    const statusMessage = document.getElementById('statusMessage');

    let originalImage = new Image();
    let isDragging = false;
    let lastX, lastY; // For dragging
    let initialPinchDistance = 0; // For pinch-to-zoom
    let initialScale = 1; // For pinch-to-zoom
    let imageX = 0; // Current x position of the image on canvas
    let imageY = 0; // Current y position of the image on canvas
    let scale = 1; // Current scale of the image
    const canvasSize = 300; // Fixed size for the square canvas for cropping (can be adjusted)
    let croppedDataURL = null; // To store the Data URL after cropping

    // Set initial canvas dimensions
    imageCanvas.width = canvasSize;
    imageCanvas.height = canvasSize;

    // --- Utility Functions ---
    function showElement(element) {
        element.style.display = 'block';
    }

    function hideElement(element) {
        element.style.display = 'none';
    }

    function updateStatus(message, type = 'info') {
        statusMessage.textContent = message;
        statusMessage.className = `status-message ${type}`;
    }

    function getEventCoords(e) {
        if (e.touches && e.touches.length > 0) {
            // For single touch, return first touch
            if (e.touches.length === 1) {
                return { x: e.touches[0].clientX, y: e.touches[0].clientY };
            }
            // For two touches, return midpoint
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            return {
                x: (touch1.clientX + touch2.clientX) / 2,
                y: (touch1.clientY + touch2.clientY) / 2
            };
        }
        return { x: e.clientX, y: e.clientY };
    }

    function getPinchDistance(e) {
        if (e.touches && e.touches.length === 2) {
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            return Math.sqrt(
                Math.pow(touch2.clientX - touch1.clientX, 2) +
                Math.pow(touch2.clientY - touch1.clientY, 2)
            );
        }
        return 0;
    }

    // --- Image Loading and Drawing ---
    function loadImage(file) {
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                originalImage.onload = () => {
                    // Reset image position and scale
                    imageX = 0;
                    imageY = 0;
                    scale = 1;
                    croppedDataURL = null; // Clear previous cropped image
                    
                    // Fit image to canvas or vice versa, ensuring it covers the circle
                    const aspectRatio = originalImage.width / originalImage.height;
                    
                    if (aspectRatio > 1) { // Landscape or wider
                        scale = canvasSize / originalImage.height;
                        if (originalImage.width * scale < canvasSize) {
                            scale = canvasSize / originalImage.width;
                        }
                    } else { // Portrait or taller
                        scale = canvasSize / originalImage.width;
                        if (originalImage.height * scale < canvasSize) {
                            scale = canvasSize / originalImage.height;
                        }
                    }
                    
                    // Center the image initially
                    imageX = (canvasSize - originalImage.width * scale) / 2;
                    imageY = (canvasSize - originalImage.height * scale) / 2;
                    
                    drawImage();
                    showElement(imageProcessingArea);
                    hideElement(downloadButton); // Hide download button until cropped
                    updateStatus('تصویر با موفقیت بارگذاری شد. می‌توانید آن را جابجا یا زوم کنید.');
                };
                originalImage.src = e.target.result;
            };
            reader.readAsDataURL(file);
        } else {
            updateStatus('فایل انتخاب شده تصویر نیست.', 'error');
            fileNameDisplay.textContent = 'فایلی انتخاب نشده است.';
            hideElement(imageProcessingArea);
        }
    }

    function drawImage() {
        ctx.clearRect(0, 0, imageCanvas.width, imageCanvas.height); // Clear canvas

        // Save context state for clipping
        ctx.save();
        
        // Draw the circle mask
        const centerX = canvasSize / 2;
        const centerY = canvasSize / 2;
        const radius = canvasSize / 2;
        
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip(); // Clip everything outside the circle

        // Draw the image
        ctx.drawImage(originalImage, imageX, imageY, originalImage.width * scale, originalImage.height * scale);

        // Restore context state (remove clipping)
        ctx.restore();

        // Draw the circle outline for visual guide
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius - 1, 0, Math.PI * 2, true); // Slightly smaller circle for outline
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)'; // White outline
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    // --- Drag and Drop functionality (Desktop) ---
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.stopPropagation();
        uploadArea.classList.add('drag-over');
        updateStatus('فایل را رها کنید.');
    });

    uploadArea.addEventListener('dragleave', (e) => {
        e.preventDefault();
        e.stopPropagation();
        uploadArea.classList.remove('drag-over');
        updateStatus('');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation();
        uploadArea.classList.remove('drag-over');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            fileNameDisplay.textContent = files[0].name;
            loadImage(files[0]);
        }
    });

    // --- File Input Change ---
    imageUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            fileNameDisplay.textContent = file.name;
            loadImage(file);
        } else {
            fileNameDisplay.textContent = 'فایلی انتخاب نشده است.';
            hideElement(imageProcessingArea);
            updateStatus('');
        }
    });

    // --- Canvas Interaction (Dragging and Pinch-to-Zoom) ---
    imageCanvas.addEventListener('mousedown', (e) => {
        if (!originalImage.src) return;
        isDragging = true;
        lastX = e.clientX;
        lastY = e.clientY;
        imageCanvas.style.cursor = 'grabbing';
        e.preventDefault();
    });

    imageCanvas.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const dx = e.clientX - lastX;
        const dy = e.clientY - lastY;
        imageX += dx;
        imageY += dy;
        lastX = e.clientX;
        lastY = e.clientY;
        drawImage();
        e.preventDefault();
    });

    imageCanvas.addEventListener('mouseup', () => {
        isDragging = false;
        imageCanvas.style.cursor = 'grab';
    });

    imageCanvas.addEventListener('mouseleave', () => {
        isDragging = false;
        imageCanvas.style.cursor = 'grab';
    });

    // Touch events for mobile (Dragging and Pinch-to-Zoom)
    imageCanvas.addEventListener('touchstart', (e) => {
        if (!originalImage.src) return;
        e.preventDefault(); // Prevent scrolling and default browser touch actions

        if (e.touches.length === 1) { // Single touch for dragging
            isDragging = true;
            lastX = e.touches[0].clientX;
            lastY = e.touches[0].clientY;
            imageCanvas.style.cursor = 'grabbing';
        } else if (e.touches.length === 2) { // Two touches for pinch-to-zoom
            isDragging = false; // Disable dragging when pinching
            initialPinchDistance = getPinchDistance(e);
            initialScale = scale;
        }
    });

    imageCanvas.addEventListener('touchmove', (e) => {
        if (!originalImage.src) return;
        e.preventDefault();

        if (e.touches.length === 1 && isDragging) { // Single touch for dragging
            const currentX = e.touches[0].clientX;
            const currentY = e.touches[0].clientY;
            const dx = currentX - lastX;
            const dy = currentY - lastY;
            imageX += dx;
            imageY += dy;
            lastX = currentX;
            lastY = currentY;
            drawImage();
        } else if (e.touches.length === 2 && initialPinchDistance > 0) { // Two touches for pinch-to-zoom
            const currentPinchDistance = getPinchDistance(e);
            const pinchRatio = currentPinchDistance / initialPinchDistance;
            
            // Calculate new scale
            let newScale = initialScale * pinchRatio;

            // Optional: Limit zoom levels
            newScale = Math.max(0.1, Math.min(5, newScale)); // Example: min 0.1, max 5

            // Adjust image position to zoom around the center of the pinch
            const canvasRect = imageCanvas.getBoundingClientRect();
            const touchMidX = (e.touches[0].clientX + e.touches[1].clientX) / 2 - canvasRect.left;
            const touchMidY = (e.touches[0].clientY + e.touches[1].clientY) / 2 - canvasRect.top;

            imageX = touchMidX - ((touchMidX - imageX) / scale) * newScale;
            imageY = touchMidY - ((touchMidY - imageY) / scale) * newScale;
            
            scale = newScale;
            drawImage();
        }
    });

    imageCanvas.addEventListener('touchend', (e) => {
        isDragging = false;
        initialPinchDistance = 0;
        imageCanvas.style.cursor = 'grab';
    });

    imageCanvas.addEventListener('touchcancel', (e) => {
        isDragging = false;
        initialPinchDistance = 0;
        imageCanvas.style.cursor = 'grab';
    });


    // --- Cropping Functionality ---
    cropButton.addEventListener('click', () => {
        if (!originalImage.src) {
            updateStatus('لطفاً ابتدا یک تصویر را آپلود کنید.', 'warning');
            return;
        }

        // Create a new canvas for the final cropped image
        const croppedCanvas = document.createElement('canvas');
        croppedCanvas.width = canvasSize;
        croppedCanvas.height = canvasSize;
        const croppedCtx = croppedCanvas.getContext('2d');

        // Draw the circular clip path
        const centerX = canvasSize / 2;
        const centerY = canvasSize / 2;
        const radius = canvasSize / 2;

        croppedCtx.beginPath();
        croppedCtx.arc(centerX, centerY, radius, 0, Math.PI * 2, true);
        croppedCtx.closePath();
        croppedCtx.clip();

        // Draw the image onto the new canvas, respecting current position and scale
        croppedCtx.drawImage(originalImage, imageX, imageY, originalImage.width * scale, originalImage.height * scale);

        // Store the Data URL
        croppedDataURL = croppedCanvas.toDataURL('image/png');
        
        // Show download button
        showElement(downloadButton);
        updateStatus('تصویر با موفقیت برش داده شد! می‌توانید آن را دانلود کنید.');
    });
    
    // --- Download Functionality ---
    downloadButton.addEventListener('click', function(e) {
        e.preventDefault(); // Prevent default link behavior initially

        if (!croppedDataURL) {
            updateStatus('لطفاً ابتدا تصویر را برش دهید.', 'warning');
            return;
        }
        triggerDownload(croppedDataURL, 'cropped_circle_image.png');
        updateStatus('تصویر در حال دانلود است...');
    });

    // Function to trigger download (robust for various browsers)
    function triggerDownload(dataUrl, filename) {
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = filename;
        document.body.appendChild(a); // Append to body is crucial for some browsers
        a.click(); // Simulate click
        document.body.removeChild(a); // Clean up the temporary element
    }

    // Initial state
    hideElement(imageProcessingArea);
});