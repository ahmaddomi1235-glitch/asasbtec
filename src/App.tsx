import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FinalResults, FullCalcResults as FullCalcResultsType,
  Grade, SharedGrades, SavedState, Subject, TawjihiCalcMode,
} from './types';
import { curriculum } from './data/curriculum';
import {
  calculateSpecialty, calculateShared, calculateFinal, calculateFullCalc,
} from './utils/calculations';
import { useLocalStorage, clearLocalStorage } from './hooks/useLocalStorage';

import SplashScreen             from './components/SplashScreen';
import Header                   from './components/Header';
import StageSelector            from './components/StageSelector';
import TawjihiModeSelector      from './components/TawjihiModeSelector';
import SpecializationSelector   from './components/SpecializationSelector';
import EngineeringSubSelector   from './components/EngineeringSubSelector';
import SubjectGrades            from './components/SubjectGrades';
import SharedQuestion           from './components/SharedQuestion';
import SharedSubjectsForm       from './components/SharedSubjectsForm';
import ResultsDisplay           from './components/ResultsDisplay';
import SharedOnlyResults        from './components/SharedOnlyResults';
import FullCalcResultsDisplay    from './components/FullCalcResults';

const STORAGE_KEY = 'asasmehani-v2-state';

const EMPTY_SHARED: SharedGrades = { arabic: '', english: '', islamic: '', history: '' };

const INITIAL_STATE: SavedState = {
  step: 'stage',
  selectedStageId:     null,
  selectedSpecId:      null,
  selectedSubSpecId:   null,
  subjectGrades:       {},
  sharedGrades:        EMPTY_SHARED,
  wantsShared:         null,
  tawjihiCalcMode:     null,
  fullFirstSpecId:     null,
  fullFirstGrades:     {},
  fullTawjihiSpecId:   null,
  fullTawjihiSubSpecId:null,
  fullTawjihiGrades:   {},
  fullSharedGrades:    EMPTY_SHARED,
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function getSubjects(
  stageId: string | null,
  specId: string | null,
  subSpecId: string | null,
): Subject[] {
  if (!stageId || !specId) return [];
  const stage = curriculum.find(s => s.id === stageId);
  const spec  = stage?.specializations.find(s => s.id === specId);
  if (!spec) return [];
  if (subSpecId && spec.subSpecs) {
    return spec.subSpecs.find(s => s.id === subSpecId)?.subjects ?? [];
  }
  return spec.subjects;
}

function getSpecLabel(
  stageId: string | null,
  specId: string | null,
  subSpecId: string | null,
): string {
  if (!stageId || !specId) return '';
  const stage = curriculum.find(s => s.id === stageId);
  const spec  = stage?.specializations.find(s => s.id === specId);
  if (!spec) return '';
  if (subSpecId && spec.subSpecs) {
    const sub = spec.subSpecs.find(s => s.id === subSpecId);
    return sub ? `الهندسة / ${sub.name}` : spec.name;
  }
  return spec.name;
}

function initGrades(subjects: Subject[]): Record<string, Grade | null> {
  const g: Record<string, Grade | null> = {};
  subjects.forEach(s => { g[s.name] = null; });
  return g;
}

// ── App ───────────────────────────────────────────────────────────────────────

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [savedState, setSavedState] = useLocalStorage<SavedState>(STORAGE_KEY, INITIAL_STATE);

  // ── Theme management ──────────────────────────────────────────
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem('asasmehani-theme');
      return saved === 'dark' ? 'dark' : 'light';
    } catch { return 'light'; }
  });

  useEffect(() => {
    // Remove HTML loading screen once React has mounted
    if (typeof window.__removeLoader === 'function') {
      window.__removeLoader();
    }
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try { localStorage.setItem('asasmehani-theme', theme); } catch { /* ignore */ }
  }, [theme]);

  function toggleTheme() {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  }
  const [specResults, setSpecResults]         = useState<FinalResults | null>(null);
  const [sharedOnlyResult, setSharedOnlyResult] = useState<ReturnType<typeof calculateShared> | null>(null);
  const [fullCalcResult, setFullCalcResult]   = useState<FullCalcResultsType | null>(null);

  const update = useCallback(
    (updates: Partial<SavedState>) => setSavedState({ ...savedState, ...updates }),
    [savedState, setSavedState],
  );

  // Derived
  const {
    step,
    selectedStageId, selectedSpecId, selectedSubSpecId,
    subjectGrades, sharedGrades, wantsShared,
    tawjihiCalcMode,
    fullFirstSpecId, fullFirstGrades,
    fullTawjihiSpecId, fullTawjihiSubSpecId, fullTawjihiGrades,
    fullSharedGrades,
  } = savedState;

  const selectedStage = curriculum.find(s => s.id === selectedStageId) ?? null;
  // useMemo prevents re-creating these on every render; the fallback (empty
  // specializations array) avoids a non-null-assertion crash if curriculum
  // data is ever malformed.
  const firstStage   = useMemo(
    () => curriculum.find(s => s.id === 'first')   ?? { id: 'first',   name: '', icon: '', description: '', specializations: [] },
    [],
  );
  const tawjihiStage = useMemo(
    () => curriculum.find(s => s.id === 'tawjihi') ?? { id: 'tawjihi', name: '', icon: '', description: '', specializations: [] },
    [],
  );

  // ── Splash ────────────────────────────────────────────────────────────────
  // IMPORTANT: must be memoized with useCallback.
  // SplashScreen has [onDone] as a useEffect dependency. Without useCallback,
  // every App re-render produces a new function reference, which causes
  // SplashScreen's effect to re-run and reset the progress interval from zero.
  // On devices that trigger multiple renders during initialization (slow JS,
  // React StrictMode double-invocation, storage reads), this causes the splash
  // screen to loop and never finish.
  const handleSplashDone = useCallback(() => { setShowSplash(false); }, []);

  // ── Stage selection ───────────────────────────────────────────────────────

  function handleStageSelect(stageId: string) {
    const nextStep = stageId === 'tawjihi' ? 'tawjihi-mode' : 'specialization';
    update({
      step: nextStep,
      selectedStageId: stageId,
      selectedSpecId: null, selectedSubSpecId: null,
      subjectGrades: {}, sharedGrades: EMPTY_SHARED, wantsShared: null,
      tawjihiCalcMode: null,
      fullFirstSpecId: null, fullFirstGrades: {},
      fullTawjihiSpecId: null, fullTawjihiSubSpecId: null, fullTawjihiGrades: {},
      fullSharedGrades: EMPTY_SHARED,
    });
    setSpecResults(null);
    setSharedOnlyResult(null);
    setFullCalcResult(null);
  }

  // ── Tawjihi mode ──────────────────────────────────────────────────────────

  function handleTawjihiModeSelect(mode: TawjihiCalcMode) {
    if (mode === 'spec-only') {
      update({ step: 'specialization', tawjihiCalcMode: mode,
               selectedSpecId: null, selectedSubSpecId: null, subjectGrades: {} });
    } else if (mode === 'shared-only') {
      update({ step: 'tawjihi-shared-only', tawjihiCalcMode: mode, sharedGrades: EMPTY_SHARED });
    } else {
      update({ step: 'full-first-spec', tawjihiCalcMode: mode,
               fullFirstSpecId: null, fullFirstGrades: {},
               fullTawjihiSpecId: null, fullTawjihiSubSpecId: null, fullTawjihiGrades: {},
               fullSharedGrades: EMPTY_SHARED });
    }
  }

  // ── Spec selection (first-year path & tawjihi mode-1) ────────────────────

  function handleSpecSelect(specId: string) {
    const stage = curriculum.find(s => s.id === selectedStageId);
    const spec  = stage?.specializations.find(s => s.id === specId);
    if (!spec) return;

    if (spec.subSpecs && spec.subSpecs.length > 0) {
      // Engineering with sub-specs → go to sub-spec picker
      update({ step: 'engineering-sub', selectedSpecId: specId, selectedSubSpecId: null, subjectGrades: {} });
      return;
    }
    update({
      step: 'grades',
      selectedSpecId: specId,
      selectedSubSpecId: null,
      subjectGrades: initGrades(spec.subjects),
    });
  }

  function handleSubSpecSelect(subSpecId: string) {
    const spec = selectedStage?.specializations.find(s => s.id === selectedSpecId);
    const sub  = spec?.subSpecs?.find(s => s.id === subSpecId);
    if (!sub) return;
    update({
      step: 'grades',
      selectedSubSpecId: subSpecId,
      subjectGrades: initGrades(sub.subjects),
    });
  }

  // ── Grade input (first-year / mode-1) ────────────────────────────────────

  function handleGradeChange(name: string, grade: Grade) {
    update({ subjectGrades: { ...subjectGrades, [name]: grade } });
  }

  function handleCalculateSpecialty() {
    const subjects = getSubjects(selectedStageId, selectedSpecId, selectedSubSpecId);
    const stageName = selectedStage?.name ?? '';
    const specName  = getSpecLabel(selectedStageId, selectedSpecId, selectedSubSpecId);

    const spec = calculateSpecialty(subjects, subjectGrades as Record<string, Grade>, stageName, specName);

    if (tawjihiCalcMode === 'spec-only') {
      // Mode 1: show results immediately, no shared question
      const result = calculateFinal(spec, undefined, false, stageName, specName, false);
      setSpecResults(result);
      update({ step: 'results' });
    } else {
      // First-year: show shared question
      const result = calculateFinal(spec, undefined, false, stageName, specName, true);
      setSpecResults(result);
      update({ step: 'shared-question' });
    }
  }

  function handleSharedAnswer(wants: boolean) {
    if (!wants) {
      update({ step: 'results', wantsShared: false });
    } else {
      update({ step: 'shared', wantsShared: true });
    }
  }

  function handleSharedChange(field: keyof SharedGrades, value: string) {
    update({ sharedGrades: { ...sharedGrades, [field]: value } });
  }

  function handleCalculateFinal() {
    const subjects = getSubjects(selectedStageId, selectedSpecId, selectedSubSpecId);
    const stageName = selectedStage?.name ?? '';
    const specName  = getSpecLabel(selectedStageId, selectedSpecId, selectedSubSpecId);
    const spec   = calculateSpecialty(subjects, subjectGrades as Record<string, Grade>, stageName, specName);
    const shared = calculateShared(sharedGrades);
    const result = calculateFinal(spec, shared, true, stageName, specName, true);
    setSpecResults(result);
    update({ step: 'results', wantsShared: true });
  }

  function handleAddShared() {
    update({ step: 'shared', wantsShared: true });
  }

  // ── Tawjihi mode-2 (shared only) ─────────────────────────────────────────

  function handleSharedOnlyCalc() {
    const result = calculateShared(sharedGrades);
    setSharedOnlyResult(result);
    update({ step: 'tawjihi-shared-results' });
  }

  // ── Full-calc mode-3 ──────────────────────────────────────────────────────

  function handleFullFirstSpecSelect(specId: string) {
    const spec = firstStage.specializations.find(s => s.id === specId);
    if (!spec) return;
    // First-year engineering has no subSpecs — go directly to grades
    update({
      step: 'full-first-grades',
      fullFirstSpecId: specId,
      fullFirstGrades: initGrades(spec.subjects),
    });
  }

  function handleFullFirstGradeChange(name: string, grade: Grade) {
    update({ fullFirstGrades: { ...fullFirstGrades, [name]: grade } });
  }

  function handleFullFirstDone() {
    update({ step: 'full-tawjihi-spec' });
  }

  function handleFullTawjihiSpecSelect(specId: string) {
    const spec = tawjihiStage.specializations.find(s => s.id === specId);
    if (!spec) return;
    if (spec.subSpecs && spec.subSpecs.length > 0) {
      update({ step: 'full-tawjihi-sub', fullTawjihiSpecId: specId, fullTawjihiSubSpecId: null, fullTawjihiGrades: {} });
      return;
    }
    update({
      step: 'full-tawjihi-grades',
      fullTawjihiSpecId: specId,
      fullTawjihiSubSpecId: null,
      fullTawjihiGrades: initGrades(spec.subjects),
    });
  }

  function handleFullTawjihiSubSelect(subSpecId: string) {
    const spec = tawjihiStage.specializations.find(s => s.id === fullTawjihiSpecId);
    const sub  = spec?.subSpecs?.find(s => s.id === subSpecId);
    if (!sub) return;
    update({
      step: 'full-tawjihi-grades',
      fullTawjihiSubSpecId: subSpecId,
      fullTawjihiGrades: initGrades(sub.subjects),
    });
  }

  function handleFullTawjihiGradeChange(name: string, grade: Grade) {
    update({ fullTawjihiGrades: { ...fullTawjihiGrades, [name]: grade } });
  }

  function handleFullTawjihiDone() {
    update({ step: 'full-shared' });
  }

  function handleFullSharedChange(field: keyof SharedGrades, value: string) {
    update({ fullSharedGrades: { ...fullSharedGrades, [field]: value } });
  }

  function handleFullCalcFinal() {
    const firstSubjects = getSubjects('first', fullFirstSpecId, null);
    const firstSpecName = getSpecLabel('first', fullFirstSpecId, null);
    const firstSpec = calculateSpecialty(firstSubjects, fullFirstGrades as Record<string, Grade>, 'الأول ثانوي', firstSpecName);

    const tawSubjects = getSubjects('tawjihi', fullTawjihiSpecId, fullTawjihiSubSpecId);
    const tawSpecName = getSpecLabel('tawjihi', fullTawjihiSpecId, fullTawjihiSubSpecId);
    const tawSpec = calculateSpecialty(tawSubjects, fullTawjihiGrades as Record<string, Grade>, 'التوجيهي', tawSpecName);

    const shared = calculateShared(fullSharedGrades);

    const result = calculateFullCalc(firstSpec, firstSpecName, tawSpec, tawSpecName, shared);
    setFullCalcResult(result);
    update({ step: 'full-results' });
  }

  // ── Reset ─────────────────────────────────────────────────────────────────

  function handleReset() {
    clearLocalStorage(STORAGE_KEY);
    setSavedState(INITIAL_STATE);
    setSpecResults(null);
    setSharedOnlyResult(null);
    setFullCalcResult(null);
  }

  // ── Restore results on page reload ────────────────────────────────────────

  useEffect(() => {
    if (step === 'results' && !specResults) {
      const subjects = getSubjects(selectedStageId, selectedSpecId, selectedSubSpecId);
      const stageName = selectedStage?.name ?? '';
      const specName  = getSpecLabel(selectedStageId, selectedSpecId, selectedSubSpecId);
      const spec = calculateSpecialty(subjects, subjectGrades as Record<string, Grade>, stageName, specName);
      if (wantsShared) {
        setSpecResults(calculateFinal(spec, calculateShared(sharedGrades), true, stageName, specName, tawjihiCalcMode !== 'spec-only'));
      } else {
        setSpecResults(calculateFinal(spec, undefined, false, stageName, specName, tawjihiCalcMode !== 'spec-only'));
      }
    }
    if (step === 'tawjihi-shared-results' && !sharedOnlyResult) {
      setSharedOnlyResult(calculateShared(sharedGrades));
    }
    if (step === 'full-results' && !fullCalcResult) {
      const fSub  = getSubjects('first', fullFirstSpecId, null);
      const fName = getSpecLabel('first', fullFirstSpecId, null);
      const tSub  = getSubjects('tawjihi', fullTawjihiSpecId, fullTawjihiSubSpecId);
      const tName = getSpecLabel('tawjihi', fullTawjihiSpecId, fullTawjihiSubSpecId);
      const fSpec = calculateSpecialty(fSub, fullFirstGrades as Record<string, Grade>, 'الأول ثانوي', fName);
      const tSpec = calculateSpecialty(tSub, fullTawjihiGrades as Record<string, Grade>, 'التوجيهي', tName);
      setFullCalcResult(calculateFullCalc(fSpec, fName, tSpec, tName, calculateShared(fullSharedGrades)));
    }
  }, [step]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Derived data for full-calc UI ─────────────────────────────────────────

  const fullFirstSpec  = firstStage.specializations.find(s => s.id === fullFirstSpecId);
  const fullFirstSubjects = fullFirstSpec?.subjects ?? [];

  const fullTawjihiSpec     = tawjihiStage.specializations.find(s => s.id === fullTawjihiSpecId);
  const fullTawjihiSubSpec  = fullTawjihiSpec?.subSpecs?.find(s => s.id === fullTawjihiSubSpecId);
  const fullTawjihiSubjects = fullTawjihiSubSpecId
    ? (fullTawjihiSubSpec?.subjects ?? [])
    : (fullTawjihiSpec?.subjects ?? []);

  // ── Render ─────────────────────────────────────────────────────────────────

  if (showSplash) return <SplashScreen onDone={handleSplashDone} />;

  return (
    <div className="app-container">
      <Header currentStep={step} onReset={handleReset} theme={theme} onToggleTheme={toggleTheme} />

      <main className="page-content">

        {/* Stage selection */}
        {step === 'stage' && (
          <StageSelector stages={curriculum} onSelect={handleStageSelect} />
        )}

        {/* Tawjihi: choose calculation mode */}
        {step === 'tawjihi-mode' && (
          <TawjihiModeSelector
            onSelect={handleTawjihiModeSelect}
            onBack={() => update({ step: 'stage' })}
          />
        )}

        {/* First-year / Tawjihi mode-1: choose specialization */}
        {step === 'specialization' && selectedStage && (
          <SpecializationSelector
            stageName={selectedStage.name}
            specializations={selectedStage.specializations}
            eyebrowExtra={tawjihiCalcMode === 'spec-only' ? 'حساب التخصص فقط' : undefined}
            onSelect={handleSpecSelect}
            onBack={() => update({
              step: tawjihiCalcMode === 'spec-only' ? 'tawjihi-mode' : 'stage',
            })}
          />
        )}

        {/* Engineering sub-spec picker (mode-1) */}
        {step === 'engineering-sub' && selectedStage && selectedSpecId && (() => {
          const spec = selectedStage.specializations.find(s => s.id === selectedSpecId);
          return spec?.subSpecs ? (
            <EngineeringSubSelector
              subSpecs={spec.subSpecs}
              onSelect={handleSubSpecSelect}
              onBack={() => update({ step: 'specialization' })}
              contextLabel={`${selectedStage.name} — الهندسة`}
            />
          ) : null;
        })()}

        {/* Grade input (first-year / mode-1) */}
        {step === 'grades' && selectedStage && (() => {
          const subjects  = getSubjects(selectedStageId, selectedSpecId, selectedSubSpecId);
          const specName  = getSpecLabel(selectedStageId, selectedSpecId, selectedSubSpecId);
          const backStep  = selectedSubSpecId ? 'engineering-sub' : 'specialization';
          return (
            <SubjectGrades
              specName={specName}
              stageName={selectedStage.name}
              subjects={subjects}
              grades={subjectGrades}
              onGradeChange={handleGradeChange}
              onCalculate={handleCalculateSpecialty}
              onBack={() => update({ step: backStep })}
            />
          );
        })()}

        {/* Shared question (first-year only) */}
        {step === 'shared-question' && specResults && (
          <SharedQuestion
            specialtyAvg35={specResults.specialty.average35}
            onAnswer={handleSharedAnswer}
          />
        )}

        {/* Shared subjects form (first-year with shared) */}
        {step === 'shared' && (
          <SharedSubjectsForm
            grades={sharedGrades}
            onChange={handleSharedChange}
            onCalculate={handleCalculateFinal}
            onBack={() => update({ step: 'shared-question' })}
          />
        )}

        {/* Results (first-year OR mode-1) */}
        {step === 'results' && specResults && (
          <ResultsDisplay
            results={specResults}
            onRestart={handleReset}
            onAddShared={handleAddShared}
          />
        )}

        {/* ── Mode 2: shared-only ─────────────────────────── */}

        {step === 'tawjihi-shared-only' && (
          <SharedSubjectsForm
            grades={sharedGrades}
            onChange={handleSharedChange}
            onCalculate={handleSharedOnlyCalc}
            onBack={() => update({ step: 'tawjihi-mode' })}
          />
        )}

        {step === 'tawjihi-shared-results' && sharedOnlyResult && (
          <SharedOnlyResults results={sharedOnlyResult} onRestart={handleReset} />
        )}

        {/* ── Mode 3: full-calc ───────────────────────────── */}

        {/* Step 1 of 3: Choose first-year specialization */}
        {step === 'full-first-spec' && (
          <>
            <FullCalcProgressBar current={1} />
            <SpecializationSelector
              stageName="الأول ثانوي"
              specializations={firstStage.specializations}
              eyebrowExtra="الكارد الأول: الأول ثانوي"
              onSelect={handleFullFirstSpecSelect}
              onBack={() => update({ step: 'tawjihi-mode' })}
            />
          </>
        )}

        {/* Step 1 grades */}
        {step === 'full-first-grades' && fullFirstSpec && (
          <>
            <FullCalcProgressBar current={1} />
            <SubjectGrades
              specName={fullFirstSpec.name}
              stageName="الأول ثانوي"
              subjects={fullFirstSubjects}
              grades={fullFirstGrades}
              onGradeChange={handleFullFirstGradeChange}
              onCalculate={handleFullFirstDone}
              onBack={() => update({ step: 'full-first-spec' })}
              calcButtonLabel="التالي: اختيار تخصص التوجيهي ←"
            />
          </>
        )}

        {/* Step 2 of 3: Choose tawjihi specialization */}
        {step === 'full-tawjihi-spec' && (
          <>
            <FullCalcProgressBar current={2} />
            <SpecializationSelector
              stageName="التوجيهي"
              specializations={tawjihiStage.specializations}
              eyebrowExtra="الكارد الثاني: التوجيهي"
              onSelect={handleFullTawjihiSpecSelect}
              onBack={() => update({ step: 'full-first-grades' })}
            />
          </>
        )}

        {/* Step 2 engineering sub */}
        {step === 'full-tawjihi-sub' && fullTawjihiSpec?.subSpecs && (
          <>
            <FullCalcProgressBar current={2} />
            <EngineeringSubSelector
              subSpecs={fullTawjihiSpec.subSpecs}
              onSelect={handleFullTawjihiSubSelect}
              onBack={() => update({ step: 'full-tawjihi-spec' })}
              contextLabel="التوجيهي — الهندسة"
            />
          </>
        )}

        {/* Step 2 grades */}
        {step === 'full-tawjihi-grades' && fullTawjihiSpec && (
          <>
            <FullCalcProgressBar current={2} />
            <SubjectGrades
              specName={getSpecLabel('tawjihi', fullTawjihiSpecId, fullTawjihiSubSpecId)}
              stageName="التوجيهي"
              subjects={fullTawjihiSubjects}
              grades={fullTawjihiGrades}
              onGradeChange={handleFullTawjihiGradeChange}
              onCalculate={handleFullTawjihiDone}
              onBack={() => update({
                step: fullTawjihiSubSpecId ? 'full-tawjihi-sub' : 'full-tawjihi-spec',
              })}
              calcButtonLabel="التالي: إدخال المواد المشتركة ←"
            />
          </>
        )}

        {/* Step 3 of 3: Shared subjects */}
        {step === 'full-shared' && (
          <>
            <FullCalcProgressBar current={3} />
            <SharedSubjectsForm
              grades={fullSharedGrades}
              onChange={handleFullSharedChange}
              onCalculate={handleFullCalcFinal}
              onBack={() => update({ step: 'full-tawjihi-grades' })}
              submitLabel="احسب المعدل الكامل 🏆"
            />
          </>
        )}

        {/* Full-calc results */}
        {step === 'full-results' && fullCalcResult && (
          <FullCalcResultsDisplay results={fullCalcResult} onRestart={handleReset} />
        )}

      </main>

      {/* Footer */}
      <footer className="app-footer">
        منصة أساس التعليمية · تم التطوير بواسطة الأستاذ أحمد دومي
      </footer>
    </div>
  );
}

// ── Full-calc progress indicator ─────────────────────────────────────────────

function FullCalcProgressBar({ current }: { current: 1 | 2 | 3 }) {
  const steps = [
    { n: 1, label: 'الأول ثانوي' },
    { n: 2, label: 'التوجيهي' },
    { n: 3, label: 'المشترك' },
  ];
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginBottom: 24,
        background: 'var(--bg-card)',
        border: '1px solid var(--gold-border)',
        borderRadius: 'var(--r-full)',
        padding: '10px 20px',
      }}
    >
      {steps.map((s, i) => (
        <span key={s.n} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {i > 0 && <span style={{ color: 'var(--text-muted)', fontSize: 10 }}>◀</span>}
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              fontSize: 13,
              fontWeight: current === s.n ? 800 : 500,
              color: current > s.n
                ? 'var(--success)'
                : current === s.n
                ? 'var(--gold)'
                : 'var(--text-muted)',
            }}
          >
            <span
              style={{
                width: 22,
                height: 22,
                borderRadius: '50%',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 11,
                fontWeight: 800,
                background: current > s.n
                  ? 'rgba(16,185,129,0.2)'
                  : current === s.n
                  ? 'var(--gold-dim)'
                  : 'rgba(255,255,255,0.05)',
                border: current === s.n ? '1px solid var(--gold)' : '1px solid rgba(255,255,255,0.1)',
                color: current > s.n ? 'var(--success)' : current === s.n ? 'var(--gold)' : 'var(--text-muted)',
              }}
            >
              {current > s.n ? '✓' : s.n}
            </span>
            {s.label}
          </span>
        </span>
      ))}
    </div>
  );
}
