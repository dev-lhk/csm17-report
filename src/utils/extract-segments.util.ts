/**
 * 단락(paragraph) 내의 TEXT 필드를 분석하여
 * 텍스트 세그먼트와 수식 세그먼트를 추출하는 함수
 */
export function extractSegmentsFromParagraph(
    paragraph: any,
    convertHmlToLatexFn: (s: string) => string,
    convertLatexToHmlFn: (s: string) => string
  ): any[] {
    const segments: any[] = [];
    // TEXT 필드가 배열이면 그대로, 아니면 배열로 변환
    const texts = Array.isArray(paragraph.TEXT) ? paragraph.TEXT : [paragraph.TEXT];
  
    texts.forEach(textObj => {
      // CHAR 값이 있으면 텍스트 세그먼트 추가 (문자열 또는 "_" 속성 사용)
      if (textObj.CHAR) {
        let textValue = "";
        if (typeof textObj.CHAR === 'string') {
          textValue = textObj.CHAR;
        } else if (typeof textObj.CHAR === 'object' && textObj.CHAR._) {
          textValue = textObj.CHAR._;
        } else {
          textValue = JSON.stringify(textObj.CHAR);
        }
        if (textValue.trim()) {
          segments.push({ type: 'text', value: textValue.trim() });
        }
      }
      // EQUATION 노드가 있으면 수식 세그먼트 추가
      if (textObj.EQUATION) {
        const eqs = Array.isArray(textObj.EQUATION) ? textObj.EQUATION : [textObj.EQUATION];
        eqs.forEach(eq => {
          if (eq.SCRIPT) {
            const original = eq.SCRIPT.trim();
            const latex = convertHmlToLatexFn(original);
            const reverse = convertLatexToHmlFn(latex);
            segments.push({ type: 'formula', original, latex, reverse });
          }
        });
      }
    });
    return segments;
  }
  