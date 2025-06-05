// js/script.js

// کدهای جاوا اسکریپت زیتول در اینجا قرار می‌گیرند

document.addEventListener('DOMContentLoaded', () => {
    console.log('صفحه زیتول با موفقیت بارگذاری شد و آماده تعامل است!');

    // مثال: اضافه کردن یک رویداد کلیک ساده به دکمه "شروع کنید"
    const startButton = document.querySelector('.hero-section button');
    if (startButton) {
        startButton.addEventListener('click', () => {
            alert('به دنیای ابزارهای زیتول خوش آمدید!');
            // می‌تونی اینجا اسکرول کنی به بخش ابزارها یا هر کار دیگه
        });
    }

    // مثال: اضافه کردن یک رویداد کلیک به آیتم‌های ابزار (اختیاری)
    const toolItems = document.querySelectorAll('.tool-item');
    toolItems.forEach(item => {
        item.addEventListener('click', () => {
            console.log(`روی ابزار "${item.textContent}" کلیک شد.`);
            // اینجا می‌تونی کاربر رو به صفحه ابزار مربوطه هدایت کنی
        });
    });

    // مثال: اضافه کردن رویداد به دکمه "پیشنهاد دهید"
    const suggestButton = document.querySelector('.cta-section button');
    if (suggestButton) {
        suggestButton.addEventListener('click', () => {
            alert('از پیشنهاد شما متشکریم! به زودی فرم ارسال پیشنهاد در دسترس خواهد بود.');
            // می‌تونی اینجا یک مودال (popup) برای فرم پیشنهاد باز کنی
        });
    }
});