import { Grade, Subject, SpecialtyResults, SharedResults, FinalResults, FullCalcResults } from '../types';
import { GRADE_VALUES } from '../data/curriculum';

export function calculateSpecialty(
  subjects: Subject[],
  grades: Record<string, Grade | null>,
  _stageName: string,
  _specName: string
): SpecialtyResults {
  let totalPoints = 0;
  let totalHours = 0;
  const subjectBreakdown: SpecialtyResults['subjectBreakdown'] = [];

  for (const subject of subjects) {
    const grade = grades[subject.name] as Grade;
    const gradeValue = GRADE_VALUES[grade] ?? 0;
    const points = gradeValue * subject.hours;
    totalPoints += points;
    totalHours += subject.hours;
    subjectBreakdown.push({ name: subject.name, hours: subject.hours, grade, points });
  }

  const average100 = totalHours > 0 ? totalPoints / totalHours : 0;
  const average35 = (average100 / 100) * 35;

  return { totalPoints, totalHours, average100, average35, subjectBreakdown };
}

export function calculateShared(grades: {
  arabic: string;
  english: string;
  islamic: string;
  history: string;
}): SharedResults {
  const arabicVal   = parseFloat(grades.arabic)  || 0;
  const englishVal  = parseFloat(grades.english) || 0;
  const islamicVal  = parseFloat(grades.islamic) || 0;
  const historyVal  = parseFloat(grades.history) || 0;

  const arabicWeighted   = (arabicVal  / 100) * 10;
  const englishWeighted  = (englishVal / 100) * 10;
  const islamicWeighted  = (islamicVal / 60)  * 6;
  const historyWeighted  = (historyVal / 40)  * 4;
  const total30 = arabicWeighted + englishWeighted + islamicWeighted + historyWeighted;

  return { arabicWeighted, englishWeighted, islamicWeighted, historyWeighted, total30 };
}

export function calculateFinal(
  specialty: SpecialtyResults,
  shared: SharedResults | undefined,
  hasShared: boolean,
  stageName: string,
  specName: string,
  allowAddShared = true,
): FinalResults {
  const finalGrade = hasShared && shared
    ? specialty.average35 + shared.total30
    : specialty.average35;

  const maxGrade = hasShared ? 65 : 35;
  const finalPercentage = maxGrade > 0 ? (finalGrade / maxGrade) * 100 : 0;

  return {
    specialty,
    shared: hasShared ? shared : undefined,
    finalGrade,
    finalPercentage,
    hasShared,
    allowAddShared,
    stageName,
    specName,
  };
}

export function calculateFullCalc(
  firstYear: SpecialtyResults,
  firstYearSpecName: string,
  tawjihi: SpecialtyResults,
  tawjihiSpecName: string,
  shared: SharedResults,
): FullCalcResults {
  // Total = firstYear/35 + tawjihi/35 + shared/30 = out of 100
  const finalGrade = firstYear.average35 + tawjihi.average35 + shared.total30;
  const finalPercentage = (finalGrade / 100) * 100; // already /100

  return {
    firstYear,
    firstYearSpecName,
    tawjihi,
    tawjihiSpecName,
    shared,
    finalGrade,
    finalPercentage,
  };
}

export function getGradeLabel(grade: Grade): string {
  const labels: Record<Grade, string> = {
    U: 'غير ناجح',
    P: 'مقبول',
    M: 'جيد',
    D: 'مميز',
  };
  return labels[grade];
}

export function getPercentageLabel(percentage: number): { label: string; color: string } {
  if (percentage >= 90) return { label: 'ممتاز',      color: '#6366f1' };
  if (percentage >= 80) return { label: 'جيد جداً',   color: '#22c55e' };
  if (percentage >= 70) return { label: 'جيد',        color: '#10b981' };
  if (percentage >= 60) return { label: 'مقبول',      color: '#f59e0b' };
  return                       { label: 'دون المعدل', color: '#ef4444' };
}
