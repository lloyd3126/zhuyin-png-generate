document.addEventListener('DOMContentLoaded', function () {
  // 基礎工具函式
  function cmToPx(cm, dpi = 72) {
    if (typeof cm !== 'number' || isNaN(cm)) {
      throw new TypeError('輸入的公分值必須是一個有效的數字。');
    }
    if (typeof dpi !== 'number' || isNaN(dpi) || dpi <= 0) {
      throw new TypeError('DPI 必須是一個大於零的有效數字。');
    }
    return cm * (dpi / 2.54);
  }

  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  function showFloatingAlert(message) {
    const alertElement = document.querySelector('.floating-alert');
    alertElement.textContent = message;
    alertElement.style.display = 'block';

    setTimeout(() => {
      alertElement.classList.add('fade-out');
      setTimeout(() => {
        alertElement.style.display = 'none';
        alertElement.classList.remove('fade-out');
      }, 500);
    }, 3000);
  }

  // 取得所有需要的元素
  const copyImageBtn = document.getElementById('copy-image-btn');
  const downloadImageBtn = document.getElementById('download-image-btn');
  const boldBtn = document.getElementById('bold-btn');
  const textarea1 = document.getElementById('textarea-1');
  const textarea2 = document.getElementById('textarea-2');
  const textarea3 = document.getElementById('textarea-3');
  const text1 = document.getElementById('text-1');
  const text2 = document.getElementById('text-2');
  const text3 = document.getElementById('text-3');
  const colorInput = document.getElementById('color-input');
  const captureElement = document.getElementById('capture');

  // 初始化顏色和樣式
  colorInput.value = '#754226';
  text1.style.color = colorInput.value;
  text2.style.color = colorInput.value;
  text3.style.color = colorInput.value;

  // 樣式處理相關函式
  let styleMap = {};

  function parseColorDefinitions(text) {
    const styleMap = {};
    let currentStyle = null;

    text.split('\n').forEach((line) => {
      line = line.trim();
      if (!line) return;

      const idMatch = line.match(/^#([\w-]+)\s+(\w+):$/);
      if (idMatch) {
        currentStyle = {
          id: idMatch[1],
          style: idMatch[2],
        };
        if (!styleMap[currentStyle.style]) {
          styleMap[currentStyle.style] = {};
        }
        if (!styleMap[currentStyle.style].idSpecific) {
          styleMap[currentStyle.style].idSpecific = {};
        }
      } else if (line.endsWith(':')) {
        currentStyle = {
          style: line.slice(0, -1).trim(),
        };
        if (!styleMap[currentStyle.style]) {
          styleMap[currentStyle.style] = {};
        }
      } else if (currentStyle) {
        const [property, value] = line.split(':').map((s) => s.trim());
        if (property && value) {
          if (currentStyle.id) {
            styleMap[currentStyle.style].idSpecific[currentStyle.id] = {
              ...styleMap[currentStyle.style].idSpecific[currentStyle.id],
              [property]: value,
            };
          } else {
            styleMap[currentStyle.style][property] = value;
          }
        }
      }
    });
    return styleMap;
  }

  function processColorTags(text, isText2 = false, elementId = null) {
    let processedText = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    let lines = processedText.split('\n');

    lines = lines.map((line) => {
      let processedLine = line;

      if (elementId === 'text-2') {
        processedLine = processedLine.replace(/\.\.\./g, '…');
      }

      if (elementId === 'text-3') {
        const rTagRegex = /<r>(.*?)<\/r>/g;
        let taggedLine = processedLine;
        const tags = [];
        let index = 0;

        taggedLine = processedLine.replace(rTagRegex, (match, content) => {
          const placeholder = `__TAG${index}__`;
          tags.push({ placeholder, content: match });
          index++;
          return placeholder;
        });

        const processedChars = taggedLine
          .split('')
          .map((char) => {
            const isChinese = /[\u4e00-\u9fa5]/.test(char);
            const isVariant = /[\uE0100-\uE01EF]/.test(char);
            const isPlaceholder = char.startsWith('_');
            return isPlaceholder || isChinese || isVariant ? char : '　';
          })
          .join('');

        processedLine = processedChars.replace(/　+/g, '　');

        tags.forEach(({ placeholder, content }) => {
          processedLine = processedLine.replace(placeholder, content);
        });
      }

      Object.keys(styleMap).forEach((styleName) => {
        const style = styleMap[styleName];
        let styleProperties = { ...style };

        if (style.idSpecific && style.idSpecific[elementId]) {
          styleProperties = {
            ...styleProperties,
            ...style.idSpecific[elementId],
          };
        }

        delete styleProperties.idSpecific;

        const styleString = Object.entries(styleProperties)
          .map(([prop, value]) => `${prop}: ${value}`)
          .join(';');

        const regex = new RegExp(
          `<${styleName}>([\\s\\S]*?)</${styleName}>`,
          'g'
        );
        processedLine = processedLine.replace(
          regex,
          `<span style="${styleString}">$1</span>`
        );
      });

      processedLine = processedLine.replace(
        /<#([#a-zA-Z0-9]{3,6})>([\s\\S]*?)<\/#\1>/g,
        '<span style="color: #$1">$2</span>'
      );

      processedLine = processedLine.replace(/>([^<]+)</g, '><span>$1</span><');
      processedLine = processedLine.replace(/^([^<]+)</, '<span>$1</span><');
      processedLine = processedLine.replace(/>([^<]+)$/, '><span>$1</span>');
      processedLine = processedLine.replace(/^([^<]+)$/, '<span>$1</span>');

      return `<p>${processedLine}</p>`;
    });

    let result = lines.join('');

    if (elementId === 'text-3') {
      const matches = result.match(/<p>.*?<\/p>/g);
      if (matches && matches.length >= 2) {
        const lastTwo = matches.slice(-2);
        const merged = lastTwo[0].slice(0, -4) + lastTwo[1].slice(3);
        result =
          result.slice(0, -(lastTwo[0].length + lastTwo[1].length)) + merged;
      }
    }

    return result;
  }

  // 圖片處理相關函式
  async function captureImage() {
    return html2canvas(captureElement, {
      scale: 4,
      backgroundColor: null,
    });
  }

  function getTargetHeight() {
    const text2Content = document.getElementById('text-2').innerHTML;
    const lineCount = (text2Content.match(/<p>/g) || []).length;

    switch (lineCount) {
      case 1:
        return 0.93;
      case 2:
        return 1.69;
      case 3:
        return 2.42;
      case 4:
        return 3.15;
      case 5:
        return 3.9;
      case 6:
        return 5.14;
      default:
        return 5.14;
    }
  }

  function resizeCanvas(canvas) {
    const targetHeightCm = getTargetHeight();
    const targetHeightPx = cmToPx(targetHeightCm, 72) * 4;
    const scale = targetHeightPx / canvas.height;
    const targetWidthPx = canvas.width * scale;

    const resizedCanvas = document.createElement('canvas');
    resizedCanvas.width = targetWidthPx;
    resizedCanvas.height = targetHeightPx;
    const ctx = resizedCanvas.getContext('2d');
    ctx.drawImage(canvas, 0, 0, targetWidthPx, targetHeightPx);

    return resizedCanvas;
  }

  async function copyImage() {
    try {
      const canvas = await captureImage();
      const resizedCanvas = resizeCanvas(canvas);

      resizedCanvas.toBlob(async (blob) => {
        try {
          const item = new ClipboardItem({ 'image/png': blob });
          await navigator.clipboard.write([item]);
          showFloatingAlert('圖片已成功複製到剪貼簿！');
        } catch (error) {
          console.error('複製到剪貼簿失敗:', error);
          downloadImageFromBlob(blob);
          showFloatingAlert('無法直接複製到剪貼簿，已自動下載圖片。');
        }
      }, 'image/png');
    } catch (error) {
      console.error('截圖失敗:', error);
      showFloatingAlert('截圖失敗，請檢查瀏覽器控制台以獲取更多資訊。');
    }
  }

  async function downloadImage() {
    try {
      const canvas = await captureImage();
      const resizedCanvas = resizeCanvas(canvas);

      resizedCanvas.toBlob((blob) => {
        downloadImageFromBlob(blob);
        showFloatingAlert('圖片已成功下載！');
      }, 'image/png');
    } catch (error) {
      console.error('下載失敗:', error);
      showFloatingAlert('下載失敗，請檢查瀏覽器控制台以獲取更多資訊。');
    }
  }

  function downloadImageFromBlob(blob) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'image.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // 更新文字元素
  function updateTextElements(initial = false) {
    styleMap = parseColorDefinitions(textarea3.value);
    const value1 = textarea1.value;
    const value2 = textarea2.value;

    text1.innerHTML = processColorTags(value1, false, 'text-1');
    text2.innerHTML = processColorTags(value1, false, 'text-2');
    text3.innerHTML = processColorTags(value1, false, 'text-3');
  }

  // 初始化文字內容
  textarea3.value = `#text-2 r:
color: #f23924
font-family: 'NotoSansTC-Medium'

#text-3 r:
color: #f23924`;

  textarea1.value = `一󠇡<r>個󠇡</r>
銀<r>行</r>
重年
牛仔褲`;

  textarea2.value = textarea1.value;

  // 更新初始狀態
  updateTextElements(true);

  // 事件監聽器
  const debouncedCapture = debounce(copyImage, 500);

  copyImageBtn.addEventListener('click', copyImage);
  downloadImageBtn.addEventListener('click', downloadImage);

  colorInput.addEventListener('input', function () {
    text1.style.color = this.value;
    text2.style.color = this.value;
    text3.style.color = this.value;
  });

  boldBtn.addEventListener('click', function () {
    const textarea = document.getElementById('textarea-1');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);

    if (selectedText) {
      const newText =
        textarea.value.substring(0, start) +
        `<r>${selectedText}</r>` +
        textarea.value.substring(end);

      textarea.value = newText;
      textarea2.value = newText;
      updateTextElements();
      debouncedCapture();
    }
  });

  textarea1.addEventListener('input', function () {
    textarea2.value = textarea1.value;
    updateTextElements();
    debouncedCapture();
  });

  textarea2.addEventListener('input', function () {
    updateTextElements();
    debouncedCapture();
  });

  textarea3.addEventListener('input', function () {
    updateTextElements();
    debouncedCapture();
  });
});
