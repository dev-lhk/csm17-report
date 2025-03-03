import * as xml2js from 'xml2js';

export async function parseHml(content: string): Promise<any> {
  const parser = new xml2js.Parser({
    explicitArray: false,  // 단일 노드는 배열 대신 객체로 파싱
    ignoreAttrs: false,
  });
  try {
    return await parser.parseStringPromise(content);
  } catch (error) {
    throw new Error('HML 파일 파싱 중 오류 발생: ' + error.message);
  }
}
