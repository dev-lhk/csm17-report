import { Controller, Post, Get, Res, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ReportService } from './report.service';
import { Response } from 'express';
import { Formula } from './entities/formula.entity';

@ApiTags('reports')
@Controller('reports')
export class ReportController {
  constructor(private readonly reportService: ReportService) { }

  @Post('parse-and-save')
  @ApiOperation({
    summary: 'HML 파일 parser & save',
    description: `HML 파일을 읽어 XML 구조로 파싱한 후, 
    hp:run 요소 중 charPrIDRef가 "0"인 문제 단락에서 hp:script 태그의 수식 문자열을 추출합니다.
    추출된 한글 수식은 LaTeX 형식으로 변환되며, 추가로 LaTeX를 다시 한글 수식 형식(역변환)으로 변환하여 
    각 수식에 대해 { original, latex, reverse } 객체로 DB에 저장됩니다.
    추후, 정규식을 기반으로 한 변환 로직을 더욱 체계적인 토큰화 및 enum 기반 파서로 확장하여 
    문법의 무결성을 보장하고, PEG.js나 ANTLR 같은 파서 제너레이터 도구를 활용할 예정입니다.`
  })
  async parseAndSave(@Res() res: Response): Promise<any> {
    try {
      const result = await this.reportService.parseProblemsAndSave();
      return res.status(200).json(result);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('list')
  @ApiOperation({
    summary: '수식 목록',
    description: `DB에 저장된 수식 데이터를 조회합니다.
    각 수식 데이터는 문제 번호와 함께 한글 수식 원본(original), LaTeX 변환(latex), 
    그리고 LaTeX를 다시 한글 수식으로 역변환(reverse)한 값으로 구성되어 있습니다.
    현재는 정규식을 이용한 간단한 변환 로직을 사용하고 있으나, 
    향후 enum 및 토큰 기반 파서로 변환 로직을 개선하여 
    더 복잡한 수식도 정확하게 처리할 수 있도록 할 예정입니다.`})
  async getProblems(@Res() res: Response): Promise<any> {
    try {
      const problems = await this.reportService.getAllProblems();
      return res.status(200).json(problems);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
