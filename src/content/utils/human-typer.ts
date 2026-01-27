export class HumanTyper {
  private baseDelay: number;
  private variance: number;

  constructor(baseDelay = 30, variance = 20) {
    this.baseDelay = baseDelay;
    this.variance = variance;
  }

  async typeText(element: HTMLElement, text: string): Promise<void> {
    element.focus();

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      
      // 随机延迟
      const delay = this.getRandomDelay();
      await this.sleep(delay);

      // 触发输入事件
      this.simulateInput(element, char);

      // 偶尔暂停（模拟思考）
      if (Math.random() < 0.03) {
        await this.sleep(150 + Math.random() * 250);
      }
    }
  }

  private simulateInput(element: HTMLElement, char: string): void {
    // 对于 contenteditable 元素
    if (element.isContentEditable) {
      // 使用 execCommand 或直接修改内容
      const selection = window.getSelection();
      const range = selection?.getRangeAt(0);
      
      if (range) {
        const textNode = document.createTextNode(char);
        range.insertNode(textNode);
        range.setStartAfter(textNode);
        range.setEndAfter(textNode);
        selection?.removeAllRanges();
        selection?.addRange(range);
      }
    } else if (element instanceof HTMLTextAreaElement || element instanceof HTMLInputElement) {
      // 对于 input/textarea 元素
      const start = element.selectionStart || 0;
      const end = element.selectionEnd || 0;
      const value = element.value;
      element.value = value.slice(0, start) + char + value.slice(end);
      element.selectionStart = element.selectionEnd = start + 1;
    }

    // 触发事件
    element.dispatchEvent(new InputEvent('input', {
      bubbles: true,
      cancelable: true,
      data: char,
      inputType: 'insertText',
    }));

    element.dispatchEvent(new Event('change', { bubbles: true }));
  }

  private getRandomDelay(): number {
    return this.baseDelay + (Math.random() * this.variance * 2 - this.variance);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// 快速填充（不模拟打字）
export function fillText(element: HTMLElement, text: string): void {
  if (element.isContentEditable) {
    element.textContent = text;
  } else if (element instanceof HTMLTextAreaElement || element instanceof HTMLInputElement) {
    element.value = text;
  }

  element.dispatchEvent(new InputEvent('input', {
    bubbles: true,
    cancelable: true,
    data: text,
    inputType: 'insertText',
  }));

  element.dispatchEvent(new Event('change', { bubbles: true }));
}
