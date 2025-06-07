// js/cp.js

document.addEventListener('DOMContentLoaded', () => {
    console.log('ابزار تولیدکننده عکس از رنگ زیتول بارگذاری شد.');

    const colorInput = document.getElementById('colorInput');
    const widthInput = document.getElementById('widthInput');
    const heightInput = document.getElementById('heightInput');
    const generateButton = document.getElementById('generateButton');
    const imagePreviewArea = document.getElementById('imagePreviewArea');
    const colorCanvas = document.getElementById('colorCanvas');
    const ctx = colorCanvas.getContext('2d');
    const downloadPngButton = document.getElementById('downloadPng');
    const downloadJpegButton = document.getElementById('downloadJpeg');
    const statusMessage = document.getElementById('statusMessage');

    const generateColorImage = () => {
        const color = colorInput.value.trim();
        const width = parseInt(widthInput.value, 10);
        const height = parseInt(heightInput.value, 10);

        if (!color) {
            statusMessage.textContent = 'لطفاً یک کد رنگ وارد کنید.';
            return;
        }
        if (isNaN(width) || width < 10 || width > 2000) {
            statusMessage.textContent = 'عرض تصویر باید بین 10 تا 2000 پیکسل باشد.';
            return;
        }
        if (isNaN(height) || height < 10 || height > 2000) {
            statusMessage.textContent = 'ارتفاع تصویر باید بین 10 تا 2000 پیکسل باشد.';
            return;
        }

        statusMessage.textContent = 'در حال تولید عکس...';
        imagePreviewArea.style.display = 'none';

        try {
            // تلاش برای تنظیم رنگ با استفاده از CSS style property
            // این روش اکثر فرمت‌های رنگی معتبر CSS (HEX, RGB, HSL) را تشخیص می‌دهد
            const tempDiv = document.createElement('div');
            tempDiv.style.backgroundColor = color;
            const computedColor = tempDiv.style.backgroundColor;

            if (!computedColor) {
                statusMessage.textContent = 'کد رنگ وارد شده نامعتبر است. لطفاً کد رنگ صحیح (مثلاً #FF0000, rgb(255,0,0), hsl(0,100%,50%)) وارد کنید.';
                return;
            }

            colorCanvas.width = width;
            colorCanvas.height = height;
            ctx.fillStyle = computedColor; // استفاده از رنگ محاسبه شده
            ctx.fillRect(0, 0, width, height);

            imagePreviewArea.style.display = 'flex';
            statusMessage.textContent = 'عکس با موفقیت تولید شد.';

        } catch (error) {
            console.error('خطا در تولید عکس:', error);
            statusMessage.textContent = 'خطا در تولید عکس: کد رنگ نامعتبر است.';
        }
    };

    generateButton.addEventListener('click', generateColorImage);

    downloadPngButton.addEventListener('click', () => {
        if (colorCanvas.width > 0 && colorCanvas.height > 0) {
            const dataURL = colorCanvas.toDataURL('image/png');
            const a = document.createElement('a');
            a.href = dataURL;
            a.download = `zitool-color-image-${widthInput.value}x${heightInput.value}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            statusMessage.textContent = 'عکس PNG دانلود شد.';
        } else {
            statusMessage.textContent = 'ابتدا عکس را تولید کنید.';
        }
    });

    downloadJpegButton.addEventListener('click', () => {
        if (colorCanvas.width > 0 && colorCanvas.height > 0) {
            // کیفیت JPEG را می‌توانید تغییر دهید (0.0 تا 1.0)
            const dataURL = colorCanvas.toDataURL('image/jpeg', 0.9);
            const a = document.createElement('a');
            a.href = dataURL;
            a.download = `zitool-color-image-${widthInput.value}x${heightInput.value}.jpeg`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            statusMessage.textContent = 'عکس JPEG دانلود شد.';
        } else {
            statusMessage.textContent = 'ابتدا عکس را تولید کنید.';
        }
    });

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