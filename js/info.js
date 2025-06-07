// js/info.js

document.addEventListener('DOMContentLoaded', () => {
    console.log('صفحه اطلاعات و تغییرات زیتول بارگذاری شد.');

    const changelogContainer = document.getElementById('changelogContainer');
    const statusMessage = document.getElementById('statusMessage');

    // تابع برای تبدیل تاریخ میلادی به شمسی و فرمت ساعت
    function convertToJalali(gregorianDate) {
        const options = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false, // 24-hour format
            timeZone: 'Asia/Tehran' // منطقه زمانی ایران
        };
        // استفاده از Intl.DateTimeFormat برای فرمت دهی تاریخ و ساعت شمسی
        return new Intl.DateTimeFormat('fa-IR', options).format(gregorianDate);
    }

    // آرایه‌ای از تغییرات
    const changelogData = [
        {
            date: new Date('2025-06-07T16:00:00Z'), // تاریخ و ساعت به وقت UTC یا استاندارد
            changes: `
                <h3>اضافه شدن ابزار جدید: تولیدکننده عکس تک‌رنگ</h3>
                <ul>
                    <li>قابلیت تولید عکس‌های تک‌رنگ با ابعاد دلخواه بر اساس کد رنگ ورودی (HEX, RGB, HSL) افزوده شد.</li>
                    <li>امکان دانلود عکس تولید شده در فرمت‌های PNG و JPEG فراهم گردید.</li>
                </ul>
            `
        },
        {
            date: new Date('2025-06-06T10:30:00Z'),
            changes: `
                <h3>بروزرسانی ابزار انتخابگر رنگ از تصویر</h3>
                <ul>
                    <li>رفع مشکل کپی کردن کد رنگ‌ها (HEX, RGB, HSL) در کلیپ‌بورد با بهبود منطق کپی.</li>
                    <li>بهبود نمایش پیام‌های وضعیت برای عملیات کپی.</li>
                </ul>
                <h3>بهبودهای عمومی</h3>
                <ul>
                    <li>افزایش سرعت بارگذاری برخی اسکریپت‌ها.</li>
                    <li>بهبود ریسپانسیو بودن فوتر در دستگاه‌های موبایل.</li>
                </ul>
            `
        },
        {
            date: new Date('2025-06-05T14:45:00Z'),
            changes: `
                <h3>ابزار جدید: انتخابگر رنگ از تصویر</h3>
                <ul>
                    <li>ابزار جدیدی برای آپلود تصویر و انتخاب رنگ از هر نقطه آن اضافه شد.</li>
                    <li>نمایش کد رنگ‌های انتخاب شده در فرمت‌های HEX, RGB و HSL.</li>
                    <li>قابلیت درگ اند دراپ (کشیدن و رها کردن) برای آپلود تصاویر.</li>
                </ul>
                <h3>طراحی و رابط کاربری</h3>
                <ul>
                    <li>یکپارچه‌سازی طراحی تمامی صفحات با هدر و فوتر زیتول.</li>
                    <li>بهبود تجربه کاربری در بخش آپلود فایل.</li>
                </ul>
            `
        },
        {
            date: new Date('2025-06-01T09:00:00Z'),
            changes: `
                <h3>راه‌اندازی اولیه زیتول</h3>
                <ul>
                    <li>معرفی پلتفرم ابزارهای کاربردی زیتول.</li>
                    <li>ارائه اولین ابزار: فشرده‌سازی و تغییر سایز تصاویر.</li>
                    <li>قابلیت تنظیم کیفیت فشرده‌سازی.</li>
                    <li>نمایش مقایسه حجم تصویر اصلی و فشرده شده.</li>
                    <li>امکان دانلود تصویر فشرده شده.</li>
                </ul>
            `
        },
        // می‌توانید تغییرات جدید را اینجا اضافه کنید
        // {
        //     date: new Date('YYYY-MM-DDTHH:mm:ssZ'),
        //     changes: `
        //         <h3>عنوان تغییر</h3>
        //         <ul>
        //             <li>شرح جزئیات تغییر ۱</li>
        //             <li>شرح جزئیات تغییر ۲</li>
        //         </ul>
        //     `
        // }
    ];

    // تابع برای ایجاد یک آیتم تغییر در صفحه
    function createChangelogItem(data) {
        const changelogItem = document.createElement('div');
        changelogItem.classList.add('changelog-item');

        const dateSpan = document.createElement('span');
        dateSpan.classList.add('changelog-date');
        // تبدیل تاریخ و ساعت به شمسی
        dateSpan.textContent = convertToJalali(data.date);

        const contentDiv = document.createElement('div');
        contentDiv.classList.add('changelog-content');
        contentDiv.innerHTML = data.changes; // استفاده از innerHTML برای قرار دادن HTML

        changelogItem.appendChild(dateSpan);
        changelogItem.appendChild(contentDiv);
        return changelogItem;
    }

    // افزودن تمامی تغییرات به کانتینر
    if (changelogData.length > 0) {
        changelogData.forEach(item => {
            changelogContainer.appendChild(createChangelogItem(item));
        });
    } else {
        statusMessage.textContent = 'هیچ اطلاعاتی برای نمایش وجود ندارد.';
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