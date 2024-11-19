// الحصول على الكاميرا
const video = document.getElementById('video');
const numbersList = document.getElementById('numbers-list');
const loadingIndicator = document.getElementById('loading-indicator');

// مصفوفة لتخزين الأرقام المستخلصة
let extractedNumbers = [];

// وظيفة للوصول إلى كاميرا الجهاز
async function startCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: true
        });
        video.srcObject = stream;
        video.play();
        processFrame();
    } catch (error) {
        alert("لم تتمكن من الوصول إلى الكاميرا: " + error.message);
    }
}

// وظيفة لمعالجة الصورة من الفيديو باستخدام Tesseract.js
let lastProcessedTime = 0;
const processInterval = 1000; // معالجته كل ثانية (1000 ميللي ثانية)

async function processFrame() {
    const currentTime = Date.now();
    if (currentTime - lastProcessedTime >= processInterval) {
        lastProcessedTime = currentTime;
        showLoadingIndicator();

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // رسم الإطار من الفيديو على اللوحة
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        try {
            const { data: { text } } = await Tesseract.recognize(canvas, 'eng');
            const numbers = extractNumbers(text);
            updateNumbersList(numbers);
        } catch (error) {
            console.error("حدث خطأ أثناء التعرف على النص:", error);
        }

        hideLoadingIndicator();
    }
    
    requestAnimationFrame(processFrame);
}

// دالة لاستخراج الأرقام فقط من النص
function extractNumbers(text) {
    const regex = /\d+/g;
    return text.match(regex) || [];
}

// دالة لتحديث قائمة الأرقام
function updateNumbersList(numbers) {
    numbers.forEach(num => {
        if (!extractedNumbers.includes(num)) {
            extractedNumbers.push(num);
            const listItem = document.createElement('li');
            listItem.textContent = num;
            numbersList.appendChild(listItem);
        }
    });
}

// دالة لإظهار مؤشر التحميل
function showLoadingIndicator() {
    loadingIndicator.style.display = 'block';
}


// دالة لإخفاء مؤشر التحميل
function hideLoadingIndicator() {
    loadingIndicator.style.display = 'none';
}

// دالة لحفظ الأرقام في ملف نصي
function saveNumbersToFile() {
    const numbersText = extractedNumbers.join('\n');
    const blob = new Blob([numbersText], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'extracted_numbers.txt';
    link.click();
}

// دالة لنسخ الأرقام إلى الحافظة
function copyNumbersToClipboard() {
    const numbersText = extractedNumbers.join('\n');
    navigator.clipboard.writeText(numbersText).then(() => {
        alert('تم نسخ الأرقام بنجاح!');
    });
}

// إضافة الأحداث للأزرار

document.getElementById('copy-button').addEventListener('click', copyNumbersToClipboard);
document.getElementById('save-button').addEventListener('click', saveNumbersToFile);

window.addEventListener('load', startCamera);  