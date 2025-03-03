import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Formula } from './entities/formula.entity';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { parseHml } from '../utils/hml-parser.util';
import * as xml2js from 'xml2js';
import { 
  convertHmlToLatex, 
  convertLatexToHml, 
  findScriptStringsByCharPr 
} from '../utils/hml-conversion.util';

@Injectable()
export class ReportService {
  constructor(
    @InjectRepository(Formula)
    private formulaRepository: Repository<Formula>,
  ) {}

  /**
   * HWPML 파일에서 charPrIDRef="0"인 hp:run 요소를 찾아,
   * hp:script 태그의 문자열만 추출한 후 LaTeX 변환 및 역변환하여 DB에 저장합니다.
   * 기존 데이터는 모두 삭제됩니다.
   */
  async parseProblemsAndSave(): Promise<any> {
    const filePath = path.join(process.cwd(), 'assets', 'section0.xml');
    if (!fs.existsSync(filePath)) {
      throw new Error('HWPML 파일을 찾을 수 없습니다: ' + filePath);
    }
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const parsed = await parseHml(fileContent);

    // XML 파일 재구성 및 JSON 구조 저장 (output 폴더에 저장)
    const builder = new xml2js.Builder({
      headless: false,
      renderOpts: { pretty: true, indent: '  ', newline: '\n' },
    });
    const xmlString = builder.buildObject(parsed);
    const outputDir = path.join(process.cwd(), 'output');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir);
    }
    fs.writeFileSync(path.join(outputDir, 'converted.xml'), xmlString, 'utf-8');
    const jsonString = JSON.stringify(parsed, null, 2);
    fs.writeFileSync(path.join(outputDir, 'parsed_structure.json'), jsonString, 'utf-8');

    // charPrIDRef="0"인 hp:run 요소 내의 hp:script 문자열 추출
    const scriptStrings = findScriptStringsByCharPr(parsed, "0");
    if (!scriptStrings || scriptStrings.length === 0) {
      throw new Error('charPrIDRef="0" 인 문제 요소의 hp:script 태그를 찾을 수 없습니다.');
    }

    // 기존 데이터 삭제 및 시퀀스 초기화
    await this.formulaRepository.clear();
    await this.formulaRepository.query(`DELETE FROM sqlite_sequence WHERE name = 'formula'`);

    // 추출된 수식 문자열마다 DB에 저장
    let problemNumber = 1;
    for (const originalScript of scriptStrings) {
      const latexScript = convertHmlToLatex(originalScript);
      const reverseScript = convertLatexToHml(latexScript);
      const record = this.formulaRepository.create({
        problemNumber,
        segments: { original: originalScript, latex: latexScript, reverse: reverseScript },
      });
      await this.formulaRepository.save(record);
      problemNumber++;
    }

    return {
      메시지: '수식 데이터 저장 완료',
      저장된수식수: scriptStrings.length,
    };
  }

  async getAllProblems(): Promise<Formula[]> {
    return await this.formulaRepository.find();
  }
}
