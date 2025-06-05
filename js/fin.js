document.addEventListener('DOMContentLoaded', () => {
    const inputTextarea = document.getElementById('inputText');
    const outputTextarea = document.getElementById('outputText');
    const inputLabel = document.getElementById('inputLabel');
    const outputLabel = document.getElementById('outputLabel');
    const convertButton = document.getElementById('convertButton');
    const copyButton = document.getElementById('copyButton');
    const switchModeButton = document.getElementById('switchModeButton');
    const statusMessage = document.getElementById('statusMessage');

    let isFinglishToPersianMode = false; // false = فارسی به فینگلیش، true = فینگلیش به فارسی

    // نگاشت کاراکترهای فارسی به فینگلیش
    const persianToFinglishMap = {
        'ا': 'a', 'ب': 'b', 'پ': 'p', 'ت': 't', 'ث': 's', 'ج': 'j', 'چ': 'ch', 'ح': 'h', 'خ': 'kh',
        'د': 'd', 'ذ': 'z', 'ر': 'r', 'ز': 'z', 'ژ': 'zh', 'س': 's', 'ش': 'sh', 'ص': 's', 'ض': 'z',
        'ط': 't', 'ظ': 'z', 'ع': 'a', 'غ': 'gh', 'ف': 'f', 'ق': 'gh', 'ک': 'k', 'گ': 'g', 'ل': 'l',
        'م': 'm', 'ن': 'n', 'و': 'v', 'ه': 'h', 'ی': 'y', 'آ': 'aa', 'ء': '', // همزه
        'ئ': 'e', 'ؤ': 'o', 'ة': 't', // تای مربوطه
        'ّ': '', 'ٰ': '', 'ٔ': '', 'ٓ': '', '‌': '', // علائم نگارشی و نیم فاصله
        'اً': 'an', 'هٔ': 'e', 'ۀ': 'eh', // کلمات خاص
        'ژ': 'zh',
        '۰': '0', '۱': '1', '۲': '2', '۳': '3', '۴': '4', '۵': '5', '۶': '6', '۷': '7', '۸': '8', '۹': '9',
        '؟': '?', '.': '.', ',': ',', '!': '!', '؛': ';', '،': ',', 'ء': '', 'ـ': '-', '…': '...',
        '؟': '?', '،': ',', '؛': ';', '٪': '%', '﷼': 'Rial', '٬': ',',
        ' ': ' ', '\n': '\n', '\t': '\t' // فاصله، اینتر، تب
    };

    // نگاشت فینگلیش به فارسی (یک نگاشت ساده و ممکن است کامل نباشد)
    const finglishToPersianMap = {
        'aa': 'آ', 'a': 'ا', 'b': 'ب', 'p': 'پ', 't': 'ت', 's': 'س', 'j': 'ج', 'ch': 'چ', 'h': 'ح', 'kh': 'خ',
        'd': 'د', 'z': 'ز', 'r': 'ر', 'zh': 'ژ', 'sh': 'ش', 'gh': 'غ', 'f': 'ف', 'k': 'ک', 'g': 'گ',
        'l': 'ل', 'm': 'م', 'n': 'ن', 'v': 'و', 'o': 'و', 'e': 'ه', 'y': 'ی',
        '0': '۰', '1': '۱', '2': '۲', '3': '۳', '4': '۴', '5': '۵', '6': '۶', '7': '۷', '8': '۸', '9': '۹',
        '?': '؟', '.': '.', ',': '،', '!': '!', ';': '؛', '-': 'ـ', '...': '…',
        ' ': ' ', '\n': '\n', '\t': '\t'
    };

    // تابع تبدیل فارسی به فینگلیش
    function convertPersianToFinglish(text) {
        let result = '';
        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            const finglishChar = persianToFinglishMap[char];
            if (finglishChar !== undefined) {
                result += finglishChar;
            } else {
                result += char; // اگر کاراکتر در نگاشت نبود، همان را اضافه کن
            }
        }
        return result;
    }

    // تابع تبدیل فینگلیش به فارسی (این تابع پیچیده‌تر است و به بهبود نیاز دارد)
    function convertFinglishToPersian(text) {
        let result = '';
        let i = 0;
        // نگاشت‌های چند کاراکتری را قبل از نگاشت‌های تک کاراکتری بررسی می‌کنیم
        const orderedKeys = Object.keys(finglishToPersianMap).sort((a, b) => b.length - a.length);

        while (i < text.length) {
            let matched = false;
            for (const key of orderedKeys) {
                if (text.substring(i, i + key.length).toLowerCase() === key.toLowerCase()) {
                    result += finglishToPersianMap[key];
                    i += key.length;
                    matched = true;
                    break;
                }
            }
            if (!matched) {
                // اگر هیچ تطابقی پیدا نشد، کاراکتر فعلی را اضافه کن
                result += text[i];
                i++;
            }
        }
        return result;
    }

    // تابع برای به‌روزرسانی UI بر اساس حالت فعلی
    function updateUIForMode() {
        if (isFinglishToPersianMode) {
            inputLabel.textContent = 'متن فینگلیش (برای تبدیل به فارسی):';
            outputLabel.textContent = 'متن فارسی:';
            inputTextarea.placeholder = 'متن فینگلیش خود را اینجا وارد کنید...';
            outputTextarea.placeholder = 'فارسی تبدیل شده اینجا نمایش داده می‌شود...';
            switchModeButton.textContent = 'تغییر حالت: فینگلیش به فارسی';
            
            // تنظیم جهت متن
            inputTextarea.style.direction = 'ltr';
            inputTextarea.style.textAlign = 'left';
            outputTextarea.style.direction = 'rtl';
            outputTextarea.style.textAlign = 'right';

        } else {
            inputLabel.textContent = 'متن فارسی (برای تبدیل به فینگلیش):';
            outputLabel.textContent = 'متن فینگلیش:';
            inputTextarea.placeholder = 'متن فارسی خود را اینجا وارد کنید...';
            outputTextarea.placeholder = 'فینگلیش تبدیل شده اینجا نمایش داده می‌شود...';
            switchModeButton.textContent = 'تغییر حالت: فارسی به فینگلیش';

            // تنظیم جهت متن
            inputTextarea.style.direction = 'rtl';
            inputTextarea.style.textAlign = 'right';
            outputTextarea.style.direction = 'ltr';
            outputTextarea.style.textAlign = 'left';
        }
        // کادرها را پاک کن
        inputTextarea.value = '';
        outputTextarea.value = '';
        statusMessage.textContent = '';
    }

    // رویداد برای دکمه تبدیل
    convertButton.addEventListener('click', () => {
        const inputText = inputTextarea.value.trim();
        if (inputText) {
            let result;
            if (isFinglishToPersianMode) {
                result = convertFinglishToPersian(inputText);
                statusMessage.textContent = 'تبدیل فینگلیش به فارسی با موفقیت انجام شد.';
            } else {
                result = convertPersianToFinglish(inputText);
                statusMessage.textContent = 'تبدیل فارسی به فینگلیش با موفقیت انجام شد.';
            }
            outputTextarea.value = result;
        } else {
            outputTextarea.value = '';
            statusMessage.textContent = 'لطفاً متن برای تبدیل وارد کنید.';
        }
    });

    // رویداد برای دکمه کپی
    copyButton.addEventListener('click', () => {
        outputTextarea.select();
        outputTextarea.setSelectionRange(0, 99999); // برای موبایل
        navigator.clipboard.writeText(outputTextarea.value)
            .then(() => {
                statusMessage.textContent = 'متن کپی شد!';
            })
            .catch(err => {
                console.error('Failed to copy text: ', err);
                statusMessage.textContent = 'خطا در کپی متن.';
            });
    });

    // رویداد برای دکمه سوییچ حالت
    switchModeButton.addEventListener('click', () => {
        isFinglishToPersianMode = !isFinglishToPersianMode; // تغییر حالت
        updateUIForMode(); // به‌روزرسانی UI
    });

    // در شروع، UI را بر اساس حالت پیش‌فرض (فارسی به فینگلیش) تنظیم کن
    updateUIForMode();
});