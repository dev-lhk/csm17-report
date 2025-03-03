/**
 * 한글 수식을 LaTeX 형식으로 변환하는 함수
 * 참고: https://katex.org/docs/supported.html, https://ko.wikipedia.org/wiki/위키백과:TeX_문법
 */
export function convertHmlToLatex(hml: string): string {
    let latex = hml.trim();

    // 1. "rm <영문단어>" → "\mathrm{<영문단어>}"
    latex = latex.replace(/\brm\s+([A-Za-z]+)/g, '\\mathrm{$1}');

    // 2. "it " 제거
    latex = latex.replace(/\bit\s+/g, '');

    // 3. "SMALLINTER" → "\cap"
    latex = latex.replace(/\bSMALLINTER\b/gi, '\\cap');

    // 4. "times" (대소문자 구분 없이) → "\times"
    latex = latex.replace(/\btimes\b/gi, '\\times');

    // 5. "LEFT (" 와 "RIGHT )" → "\left(" 와 "\right)"
    latex = latex.replace(/LEFT\s*\(/g, '\\left(');
    latex = latex.replace(/\)\s*RIGHT/g, '\\right)');

    // 6. 분수 표현: { ... } over { ... } → \dfrac{...}{...}
    latex = latex.replace(/\{([^{}]+?)\}\s*over\s*\{([^{}]+?)\}/g, '\\dfrac{$1}{$2}');

    // 7. "sqrt {exponent} of {radicand}" 또는 "root {exponent} of {radicand}" 또는 "루트 {exponent} of {radicand}" → "\sqrt[exponent]{radicand}"
    latex = latex.replace(/(?:sqrt|root|루트)\s*\{([^}]+)\}\s*of\s*\{([^}]+)\}/gi, '\\sqrt[$1]{$2}');

    // 8. 일반적인 "sqrt {radicand}" → "\sqrt{radicand}"
    latex = latex.replace(/sqrt\s*\{([^}]+)\}/gi, '\\sqrt{$1}');

    // 9. "lim _{h rarrow 0}" → "\lim_{h \\to 0}"
    latex = latex.replace(/lim\s*_\s*\{([^}]+)\s*rarrow\s*([^}]+)\}/g, '\\lim_{$1 \\to $2}');
    latex = latex.replace(/lim\s*_\s*([A-Za-z0-9]+)\s*rarrow\s*([A-Za-z0-9]+)/g, '\\lim_{$1 \\to $2}');

    // 10. 불필요한 공백 정리
    latex = latex.replace(/\s+/g, ' ').trim();

    return latex;
}

/**
 * LaTeX 수식을 다시 한글 수식(원본 형식)으로 변환하는 함수.
 * 실제 변환 규칙은 필요에 따라 추가/수정할 수 있습니다.
 */
export function convertLatexToHml(latex: string): string {
    let hml = latex.trim();

    // 1. \mathrm{...} → rm ...
    hml = hml.replace(/\\mathrm\{([^}]+)\}/g, 'rm $1');

    // 2. \left( 와 \right) → LEFT ( 와 ) RIGHT
    hml = hml.replace(/\\left\(/g, 'LEFT (');
    hml = hml.replace(/\\right\)/g, ') RIGHT');

    // 3. \times → times
    hml = hml.replace(/\\times/g, 'times');

    // 4. \dfrac{...}{...} → { ... } over { ... }
    hml = hml.replace(/\\dfrac\{([^}]+)\}\{([^}]+)\}/g, '{$1} over {$2}');

    // 5. \sqrt\[(.+?)\]\{(.+?)\} → sqrt {$1} of {$2}
    hml = hml.replace(/\\sqrt\[(.+?)\]\{(.+?)\}/g, 'sqrt {$1} of {$2}');
    // 6. \sqrt\{(.+?)\} → sqrt {$1}
    hml = hml.replace(/\\sqrt\{(.+?)\}/g, 'sqrt {$1}');

    // 7. \lim_\{([^}]+)\\to\s+([^}]+)\} → lim _{$1 rarrow $2}
    hml = hml.replace(/\\lim_\{([^}]+)\\to\s+([^}]+)\}/g, 'lim _{$1 rarrow $2}');

    // 8. 불필요한 공백 정리
    hml = hml.replace(/\s+/g, ' ').trim();

    return hml;
}

/**
 * hp:script 태그에서 텍스트를 추출하는 함수.
 */
export function getScriptText(script: any): string {
    if (typeof script === 'string') {
        return script.trim();
    } else if (typeof script === 'object' && script._) {
        return script._.trim();
    }
    return '';
}

/**
 * hp:run 요소 내부 및 하위 hp:equation 요소 내에서 hp:script 태그의 문자열을 추출하는 함수.
 */
export function extractScriptsFromRun(run: any): string[] {
    let scripts: string[] = [];
    if (run['hp:script']) {
        const scriptText = getScriptText(run['hp:script']);
        if (scriptText) {
            scripts.push(scriptText);
        }
    }
    if (run['hp:equation']) {
        const equations = Array.isArray(run['hp:equation']) ? run['hp:equation'] : [run['hp:equation']];
        for (const eq of equations) {
            if (eq['hp:script']) {
                const scriptText = getScriptText(eq['hp:script']);
                if (scriptText) {
                    scripts.push(scriptText);
                }
            }
        }
    }
    return scripts;
}

/**
 * 재귀적으로 객체를 순회하여,
 * "hp:run" 요소 중 속성 "$.charPrIDRef"가 targetValue와 일치하는 요소에서
 * hp:script 태그의 문자열만 모두 추출하여 반환하는 함수.
 */
export function findScriptStringsByCharPr(obj: any, targetValue: string): string[] {
    let result: string[] = [];
    const traverse = (node: any) => {
        if (typeof node !== 'object' || node === null) return;
        for (const key in node) {
            const value = node[key];
            if (key === 'hp:run') {
                const runs = Array.isArray(value) ? value : [value];
                for (const run of runs) {
                    if (run.$ && run.$.charPrIDRef === targetValue) {
                        const scripts = extractScriptsFromRun(run);
                        result = result.concat(scripts);
                    }
                }
            }
            if (typeof value === 'object') {
                traverse(value);
            }
        }
    };
    traverse(obj);
    return result;
}
