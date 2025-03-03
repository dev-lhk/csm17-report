<p align="center">
  <a href="http://nestjs.com/" target="_blank">
    <img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" />
  </a>
</p>

# HWPML 수식 변환 및 저장 시스템

이 프로젝트는 한글 워드프로세서의 HWPML(Hancom Word Processor Markup Language) 문서에서 수식 데이터를 추출하여,  
한글 수식과 LaTeX 형식으로 변환한 후 SQLite3 데이터베이스에 저장하는 API 서버입니다.

## 주요 기능

- **HWPML 파일 파싱 및 구조 분석**  
  - `assets` 폴더 내의 HWPML XML 파일을 읽어 `xml2js` 라이브러리로 파싱합니다.
  - 파싱된 XML 데이터는 재구성되어 `output` 폴더에 XML 및 JSON 파일로 저장됩니다.
  - XML 트리에서 `hp:run` 요소 중 `charPrIDRef="0"`인 문제 단락에서 `hp:script` 태그의 수식 문자열을 추출합니다.

- **수식 변환 기능**  
  - 추출한 한글 수식을 정규식 기반 변환 로직을 통해 LaTeX 형식으로 변환합니다.
  - LaTeX로 변환된 수식을 다시 한글 수식(원본 형식)으로 역변환하는 기능도 제공합니다.
  - 향후 enum 및 토큰 기반 파서(예: PEG.js, ANTLR 등)를 도입하여 복잡한 수식도 안정적으로 처리할 예정입니다.

- **REST API 제공**  
  - `/problems/parse-and-save`: HWPML 파일을 파싱하여 수식을 DB에 저장합니다.
  - `/problems/list`: 저장된 수식 데이터를 문제 번호와 함께 조회합니다.

## 프로젝트 설치 및 실행

### 설치

```bash
$ npm install
```

## 개발 환경에서 실행
```bash
$ npm run start:dev
```

## API 문서
Swagger를 통해 API 명세를 확인할 수 있습니다.
애플리케이션 실행 후 브라우저에서 아래 URL로 접근하세요.

http://localhost:3000/api


