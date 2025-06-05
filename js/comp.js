// js/comp.js

document.addEventListener('DOMContentLoaded', () => {
    console.log('ابزار فشرده‌سازی و تغییر سایز زیتول بارگذاری شد.');

    const imageUpload = document.getElementById('imageUpload');
    const fileNameDisplay = document.getElementById('fileName');
    const originalImagePreview = document.getElementById('originalImage');
    const compressedImagePreview = document.getElementById('compressedImage');
    const processButton = document.getElementById('processButton');
    const downloadButton = document.getElementById('downloadButton');
    const statusMessage = document.getElementById('statusMessage');
    const imagePreviewContainer = document.getElementById('imagePreview');
    const compressionQualitySlider = document.getElementById('compressionQuality');
    const qualityValueDisplay = document.getElementById('qualityValue');
    const compressionSettingsDiv = document.getElementById('compressionSettings');
    const uploadArea = document.getElementById('uploadArea');

    // المان‌های جدید برای نمایش حجم
    const sizeComparisonDiv = document.getElementById('sizeComparison');
    const originalSizeValueSpan = document.getElementById('originalSizeValue');
    const compressedSizeValueSpan = document.getElementById('compressedSizeValue');

    // المان‌های مودال
    const imageModal = document.getElementById('imageModal');
    const modalImage = document.getElementById('img01');
    const modalCaption = document.getElementById('caption');
    const closeButton = document.querySelector('.close-button');


    let uploadedFile = null;
    let compressedBlob = null; // برای نگهداری Blob تصویر فشرده شده

    // به‌روزرسانی مقدار کیفیت اسلایدر
    compressionQualitySlider.addEventListener('input', () => {
        qualityValueDisplay.textContent = compressionQualitySlider.value;
    });

    const handleFile = (file) => {
        uploadedFile = file;
        compressedBlob = null; // با انتخاب فایل جدید، Blob فشرده شده رو ریست کن

        if (uploadedFile && uploadedFile.type.startsWith('image/')) { // مطمئن شو که فایل عکس هست
            fileNameDisplay.textContent = `فایل انتخاب شده: ${uploadedFile.name}`;
            statusMessage.textContent = ''; // پاک کردن پیام خطا
            downloadButton.style.display = 'none'; // دکمه دانلود رو مخفی کن
            sizeComparisonDiv.style.display = 'none'; // نمایش مقایسه حجم رو مخفی کن

            // نمایش تصویر اصلی
            const reader = new FileReader();
            reader.onload = (e) => {
                originalImagePreview.src = e.target.result;
                originalImagePreview.style.display = 'block';
                compressedImagePreview.style.display = 'none'; // فشرده شده رو مخفی کن
                processButton.style.display = 'block'; // دکمه پردازش رو نشون بده
                compressionSettingsDiv.style.display = 'block'; // تنظیمات فشرده‌سازی رو نشون بده
                imagePreviewContainer.style.justifyContent = 'center'; // فقط یک تصویر وسط باشه
                processButton.textContent = 'فشرده‌سازی تصویر'; // متن دکمه
            };
            reader.readAsDataURL(uploadedFile);

        } else {
            uploadedFile = null; // فایل نامعتبر
            fileNameDisplay.textContent = 'فایلی انتخاب نشده است یا فرمت آن پشتیبانی نمی‌شود.';
            statusMessage.textContent = 'لطفاً یک فایل تصویری (JPEG, PNG, GIF, BMP, WebP) انتخاب کنید.';
            originalImagePreview.style.display = 'none';
            compressedImagePreview.style.display = 'none';
            processButton.style.display = 'none';
            downloadButton.style.display = 'none';
            compressionSettingsDiv.style.display = 'none';
            sizeComparisonDiv.style.display = 'none'; // نمایش مقایسه حجم رو مخفی کن
        }
    };

    // رویداد تغییر فایل برای Input
    imageUpload.addEventListener('change', (event) => {
        if (event.target.files.length > 0) {
            handleFile(event.target.files[0]);
        }
    });

    // --- رویدادهای درگ اند دراپ ---
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, preventDefaults, false);
        document.body.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        uploadArea.addEventListener(eventName, () => uploadArea.classList.add('drag-over'), false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, () => uploadArea.classList.remove('drag-over'), false);
    });

    uploadArea.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;

        if (files.length > 0) {
            handleFile(files[0]);
        } else {
            statusMessage.textContent = 'لطفاً یک فایل تصویری را رها کنید.';
        }
    }, false);


    // --- بقیه کدهای منطق فشرده‌سازی ---
    processButton.addEventListener('click', async () => {
        if (!uploadedFile) {
            statusMessage.textContent = 'لطفاً ابتدا یک فایل تصویر را انتخاب کنید.';
            return;
        }

        statusMessage.textContent = 'در حال فشرده‌سازی تصویر... لطفا منتظر بمانید.';
        processButton.disabled = true;
        downloadButton.style.display = 'none';
        sizeComparisonDiv.style.display = 'none';

        try {
            const quality = parseFloat(compressionQualitySlider.value) / 100;
            const imageType = uploadedFile.type;

            const img = new Image();
            img.src = originalImagePreview.src;

            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                canvas.width = img.naturalWidth;
                canvas.height = img.naturalHeight;

                ctx.drawImage(img, 0, 0);

                canvas.toBlob((blob) => {
                    if (blob) {
                        compressedBlob = blob;
                        const compressedImageUrl = URL.createObjectURL(blob);
                        compressedImagePreview.src = compressedImageUrl;
                        
                        originalImagePreview.style.display = 'block';
                        compressedImagePreview.style.display = 'block'; 
                        imagePreviewContainer.style.justifyContent = 'space-around';

                        // محاسبه و نمایش مقایسه حجم (فقط اصلی و فشرده شده)
                        originalSizeValueSpan.textContent = formatBytes(uploadedFile.size);
                        compressedSizeValueSpan.textContent = formatBytes(blob.size);
                        
                        sizeComparisonDiv.style.display = 'flex'; // نمایش کادرهای حجم

                        statusMessage.textContent = 'تصویر با موفقیت فشرده شد!';
                        downloadButton.style.display = 'inline-block';

                    } else {
                        statusMessage.textContent = 'خطا در فشرده‌سازی تصویر.';
                        compressedImagePreview.style.display = 'none';
                        originalImagePreview.style.display = 'block';
                        imagePreviewContainer.style.justifyContent = 'center';
                    }
                    processButton.disabled = false;
                }, imageType, quality);
            };
            img.onerror = () => {
                statusMessage.textContent = 'خطا در بارگذاری تصویر برای فشرده‌سازی.';
                processButton.disabled = false;
            };

        } catch (error) {
            console.error('خطا در فشرده‌سازی:', error);
            statusMessage.textContent = `خطا در پردازش تصویر: ${error.message}.`;
            compressedImagePreview.style.display = 'none';
            originalImagePreview.style.display = 'block';
            imagePreviewContainer.style.justifyContent = 'center';
            processButton.disabled = false;
        }
    });

    function formatBytes(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }

    downloadButton.addEventListener('click', () => {
        if (compressedBlob) {
            const url = URL.createObjectURL(compressedBlob);
            const a = document.createElement('a');
            a.href = url;
            const originalFileName = uploadedFile.name.split('.').slice(0, -1).join('.');
            const fileExtension = uploadedFile.name.split('.').pop();
            a.download = `zitool-compressed-${originalFileName}.${fileExtension}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } else {
            statusMessage.textContent = 'هیچ تصویر فشرده شده‌ای برای دانلود وجود ندارد.';
        }
    });


    // --- منطق مودال ---
    originalImagePreview.addEventListener('click', () => {
        if (originalImagePreview.style.display === 'block') {
            imageModal.style.display = 'block';
            modalImage.src = originalImagePreview.src;
            modalCaption.textContent = 'تصویر اصلی';
        }
    });

    compressedImagePreview.addEventListener('click', () => {
        if (compressedImagePreview.style.display === 'block') {
            imageModal.style.display = 'block';
            modalImage.src = compressedImagePreview.src;
            modalCaption.textContent = 'تصویر فشرده شده';
        }
    });

    closeButton.addEventListener('click', () => {
        imageModal.style.display = 'none';
    });

    // بستن مودال با کلیک در خارج از عکس
    imageModal.addEventListener('click', (e) => {
        if (e.target === imageModal) {
            imageModal.style.display = 'none';
        }
    });

    // بستن مودال با فشردن Esc
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && imageModal.style.display === 'block') {
            imageModal.style.display = 'none';
        }
    });

});