// js/cf.js

document.addEventListener('DOMContentLoaded', () => {
    console.log('ابزار انتخابگر رنگ زیتول بارگذاری شد.');

    const imageUpload = document.getElementById('imageUpload');
    const fileNameDisplay = document.getElementById('fileName');
    const uploadArea = document.getElementById('uploadArea');
    const statusMessage = document.getElementById('statusMessage');
    const imageDisplayArea = document.getElementById('imageDisplayArea');
    const imageCanvas = document.getElementById('imageCanvas');
    const ctx = imageCanvas.getContext('2d');
    const colorPreview = document.getElementById('colorPreview');
    const hexCodeSpan = document.getElementById('hexCode');
    const rgbCodeSpan = document.getElementById('rgbCode');
    const hslCodeSpan = document.getElementById('hslCode');
    const copyButtons = document.querySelectorAll('.copy-button');

    let uploadedImage = null;

    const handleFile = (file) => {
        uploadedImage = null; // ریست کردن تصویر قبلی
        colorPreview.style.backgroundColor = '#ffffff'; // ریست رنگ پیش‌نمایش
        hexCodeSpan.textContent = '--';
        rgbCodeSpan.textContent = '--';
        hslCodeSpan.textContent = '--';

        if (file && file.type.startsWith('image/')) {
            fileNameDisplay.textContent = `فایل انتخاب شده: ${file.name}`;
            statusMessage.textContent = ''; // پاک کردن پیام خطا

            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    uploadedImage = img;
                    // تنظیم ابعاد canvas بر اساس تصویر
                    imageCanvas.width = img.naturalWidth;
                    imageCanvas.height = img.naturalHeight;
                    ctx.drawImage(img, 0, 0);
                    imageDisplayArea.style.display = 'flex'; // نمایش بخش تصویر و اطلاعات رنگ
                };
                img.onerror = () => {
                    statusMessage.textContent = 'خطا در بارگذاری تصویر.';
                    imageDisplayArea.style.display = 'none';
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        } else {
            fileNameDisplay.textContent = 'فایلی انتخاب نشده است یا فرمت آن پشتیبانی نمی‌شود.';
            statusMessage.textContent = 'لطفاً یک فایل تصویری (JPEG, PNG, GIF, BMP, WebP) انتخاب کنید.';
            imageDisplayArea.style.display = 'none';
        }
    };

    // رویداد تغییر فایل برای Input
    imageUpload.addEventListener('change', (event) => {
        if (event.target.files.length > 0) {
            handleFile(event.target.files[0]);
        }
    });

    // --- رویدادهای درگ اند دراپ (کپی شده از comp.js) ---
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

    // --- منطق اصلی انتخاب رنگ با کلیک/تاچ روی Canvas ---
    imageCanvas.addEventListener('click', (e) => {
        if (!uploadedImage) {
            statusMessage.textContent = 'لطفاً ابتدا یک تصویر آپلود کنید.';
            return;
        }

        // محاسبه مختصات X و Y با توجه به مقیاس Canvas
        const rect = imageCanvas.getBoundingClientRect();
        const scaleX = imageCanvas.width / rect.width;
        const scaleY = imageCanvas.height / rect.height;

        const x = Math.floor((e.clientX - rect.left) * scaleX);
        const y = Math.floor((e.clientY - rect.top) * scaleY);

        // گرفتن اطلاعات پیکسل
        const pixel = ctx.getImageData(x, y, 1, 1).data;
        const r = pixel[0]; // Red
        const g = pixel[1]; // Green
        const b = pixel[2]; // Blue
        // const a = pixel[3]; // Alpha (اگر نیاز بود)

        // نمایش رنگ
        const hex = rgbToHex(r, g, b);
        const rgb = `RGB(${r}, ${g}, ${b})`;
        const hsl = rgbToHsl(r, g, b);

        colorPreview.style.backgroundColor = hex;
        hexCodeSpan.textContent = hex;
        rgbCodeSpan.textContent = rgb;
        hslCodeSpan.textContent = hsl;

        statusMessage.textContent = `رنگ در مختصات (${x}, ${y}) انتخاب شد.`;
    });

    // --- توابع تبدیل رنگ ---
    function rgbToHex(r, g, b) {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
    }

    function rgbToHsl(r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;

        let max = Math.max(r, g, b);
        let min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;

        if (max === min) {
            h = s = 0; // achromatic
        } else {
            let d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }

            h /= 6;
        }

        h = Math.round(h * 360);
        s = Math.round(s * 100);
        l = Math.round(l * 100);

        return `HSL(${h}, ${s}%, ${l}%)`;
    }

    // --- منطق کپی کردن کد رنگ ---
    copyButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetId = button.dataset.copy;
            const textToCopy = document.getElementById(targetId).textContent;

            // تلاش برای استفاده از navigator.clipboard API
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(textToCopy)
                    .then(() => {
                        statusMessage.textContent = `${textToCopy} با موفقیت کپی شد!`;
                        setTimeout(() => statusMessage.textContent = '', 2000);
                    })
                    .catch(err => {
                        console.warn('Failed to copy with navigator.clipboard, falling back to execCommand:', err);
                        // اگر navigator.clipboard کار نکرد، از روش قدیمی استفاده کن
                        fallbackCopyTextToClipboard(textToCopy);
                    });
            } else {
                // اگر navigator.clipboard پشتیبانی نشد، از روش قدیمی استفاده کن
                fallbackCopyTextToClipboard(textToCopy);
            }
        });
    });

    // تابع جایگزین برای کپی کردن متن (Legacy method)
    function fallbackCopyTextToClipboard(text) {
        let textArea = document.createElement("textarea");
        textArea.value = text;

        // این textarea را خارج از دید قرار دهید
        textArea.style.position = "fixed";
        textArea.style.top = "0";
        textArea.style.left = "0";
        textArea.style.width = "2em";
        textArea.style.height = "2em";
        textArea.style.padding = "0";
        textArea.style.border = "none";
        textArea.style.outline = "none";
        textArea.style.boxShadow = "none";
        textArea.style.background = "transparent";

        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
            let successful = document.execCommand('copy');
            let msg = successful ? 'با موفقیت کپی شد!' : 'کپی کردن ناموفق بود.';
            statusMessage.textContent = `${text} ${msg}`;
            setTimeout(() => statusMessage.textContent = '', 2000);
        } catch (err) {
            console.error('Fallback: Oops, unable to copy', err);
            statusMessage.textContent = 'خطا در کپی کردن کد. (روش قدیمی)';
        }

        document.body.removeChild(textArea);
    }


    // اسکرول به بخش ابزارها در صورت وجود هش #tools در URL (از comp.js کپی شده)
    document.addEventListener("DOMContentLoaded", function () {
        const hash = window.location.hash;
        if (hash === "#tools") {
            const target = document.querySelector(hash);
            if (target) {
                window.scrollTo(0, 0);
                setTimeout(() => {
                    target.scrollIntoView({ behavior: "smooth" });
                }, 300);
            }
        }
    });
});