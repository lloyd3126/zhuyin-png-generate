document.addEventListener('DOMContentLoaded', function () {
  const boldBtn = document.getElementById('bold-btn');

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
      textarea2.value = newText; // 同步更新 textarea-2
      updateTextElements();
      debouncedCapture();
    }
  });

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

  function autoResizeTextarea(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  }

  const textarea1 = document.getElementById('textarea-1');
  const textarea2 = document.getElementById('textarea-2');
  const textarea3 = document.getElementById('textarea-3');
  const text1 = document.getElementById('text-1');
  const text2 = document.getElementById('text-2');
  const text3 = document.getElementById('text-3');
  const copyImageBtn = document.getElementById('copy-image-btn');
  const colorInput = document.getElementById('color-input');

  colorInput.value = '#754226';
  text1.style.color = colorInput.value;
  text2.style.color = colorInput.value;
  text3.style.color = colorInput.value;

  colorInput.addEventListener('input', function () {
    text1.style.color = this.value;
    text2.style.color = this.value;
    text3.style.color = this.value;
  });

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

      // 如果是 text2，將 ... 替換為 …
      if (elementId === 'text-2') {
        processedLine = processedLine.replace(/\.\.\./g, '…');
      }

      // 如果是 text3，檢查每個字符
      if (elementId === 'text-3') {
        let newLine = '';
        let inTag = false;

        for (let i = 0; i < processedLine.length; i++) {
          const char = processedLine[i];

          // 處理標籤
          if (char === '<') {
            inTag = true;
            newLine += char;
            continue;
          }
          if (char === '>') {
            inTag = false;
            newLine += char;
            continue;
          }
          if (inTag) {
            newLine += char;
            continue;
          }

          // 檢查是否為中文字或異讀字
          const isChinese = /[\u4e00-\u9fa5]/.test(char);
          const isVariant = /[\uE0100-\uE01EF]/.test(char);

          if (isChinese || isVariant) {
            newLine += char;
          } else {
            newLine += '　'; // 全形空格
          }
        }
        processedLine = newLine;
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

    return lines.join('');
  }

  function updateTextElements(initial = false) {
    styleMap = parseColorDefinitions(textarea3.value);
    const value1 = textarea1.value;
    const value2 = textarea2.value;

    if (initial) {
      text1.innerHTML = processColorTags(value1, false, 'text-1');
      text2.innerHTML = processColorTags(value1, false, 'text-2');
      text3.innerHTML = processColorTags(value1, false, 'text-3');
    } else {
      text1.innerHTML = processColorTags(value1, false, 'text-1');
      text2.innerHTML = processColorTags(value1, false, 'text-2');
      text3.innerHTML = processColorTags(value1, false, 'text-3');
    }
  }

  async function captureAndCopyImage() {
    try {
      window.focus();
      const canvas = await html2canvas(document.querySelector('#capture'), {
        scale: 4,
        backgroundColor: null,
      });

      canvas.toBlob(async (blob) => {
        if (!blob) {
          throw new Error('Canvas is empty');
        }
        try {
          const item = new ClipboardItem({ 'image/png': blob });
          await navigator.clipboard.write([item]);
          showFloatingAlert('圖片已成功複製到剪貼簿！');
        } catch (error) {
          console.error('複製到剪貼簿失敗:', error);
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'image.png';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          showFloatingAlert('無法直接複製到剪貼簿，已自動下載圖片。');
        }
      }, 'image/png');
    } catch (error) {
      console.error('截圖失敗:', error);
      showFloatingAlert('截圖失敗，請檢查瀏覽器控制台以獲取更多資訊。');
    }
  }

  const debouncedCapture = debounce(captureAndCopyImage, 500);

  textarea3.value = `#text-2 r:
color: #f23924
font-family: 'NotoSansTC-Medium'

#text-3 r:
color: #f23924`;

  textarea1.value = `一󠇡<r>個󠇡</r>
銀<r>行</r>
重年
牛仔褲`;

  textarea2.value = `一󠇡<r>個󠇡</r>
銀<r>航</r>
蟲年
牛<r>崽</r>褲`;

  updateTextElements(true);

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

  copyImageBtn.addEventListener('click', async function () {
    await captureAndCopyImage();
  });
});
