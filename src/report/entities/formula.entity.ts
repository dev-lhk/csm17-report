import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Formula {
  @PrimaryGeneratedColumn()
  @ApiProperty({ example: 1, description: '문제 ID' })
  id: number;

  @Column({ type: 'int', nullable: true })
  @ApiProperty({ example: 3, description: '문제 번호' })
  problemNumber: number;

  // segments 필드는 한글 수식 원본과 LaTeX 변환 결과를 담은 객체로 저장됩니다.
  @Column({ type: 'simple-json' })
  @ApiProperty({
    example: {
      original: "root 3 of 5 times25^{1 over 3}",
      latex: "\\sqrt[3]{5} \\times 25^{\\dfrac{1}{3}}",
      reverse: "root 3 of 5 times25^{1 over 3}"
    },
    description: '한글 수식 원본, LaTeX 변환 값, 그리고 역변환 값',
  })
  segments: {
    original: string;   // 원시데이터
    latex: string;      // latex로 변경된 값
    reverse: string;    // 한글수식으로 변경된 값
  };
}
