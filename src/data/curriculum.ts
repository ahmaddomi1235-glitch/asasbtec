import { StageData } from '../types';

export const curriculum: StageData[] = [
  {
    id: 'first',
    name: 'الأول ثانوي',
    icon: '🎓',
    description: 'المرحلة الأولى من الدراسة الثانوية',
    specializations: [
      {
        id: 'first-it',
        name: 'تكنولوجيا المعلومات',
        subjects: [
          { name: 'أنظمة التكنولوجيا', hours: 120 },
          { name: 'ألعاب المتقدم', hours: 60 },
          { name: 'تطبيقات المتقدم', hours: 60 },
          { name: 'ويب المتقدم', hours: 60 },
          { name: 'الدعم الفني', hours: 60 },
        ],
      },
      {
        id: 'first-business',
        name: 'إدارة الأعمال',
        subjects: [
          { name: 'استكشاف الأعمال', hours: 90 },
          { name: 'البحث والتخطيط لحملة تسويقية', hours: 90 },
          { name: 'تمويل الأعمال', hours: 90 },
          { name: 'إدارة الفعاليات', hours: 90 },
        ],
      },
      {
        id: 'first-beauty',
        name: 'التجميل',
        subjects: [
          { name: 'تدريب صالون التجميل المهني', hours: 60 },
          { name: 'الصحة والتغذية', hours: 60 },
          { name: 'الأساليب المتقدمة للعناية بالأظافر وتجميلها', hours: 60 },
          { name: 'علاجات البشرة المتقدمة', hours: 60 },
          { name: 'المكياج الإبداعي وفن الحناء', hours: 60 },
          { name: 'تلوين وتفتيح الشعر وتقنيات التمليسات', hours: 60 },
          { name: 'نظرة عامة على البلوثيربي', hours: 90 },
        ],
      },
      {
        // الكهرباء renamed to الهندسة — same subjects, no subSpecs needed for first year
        id: 'first-engineering',
        name: 'الهندسة',
        subjects: [
          { name: 'تصميم وتصنيع المنتجات في الهندسة', hours: 120 },
          { name: 'المبادئ الميكانيكية', hours: 60 },
          { name: 'المبادئ الكهربائية والإلكترونية', hours: 60 },
          { name: 'مبادئ التجارة والجودة التطبيقية في الهندسة', hours: 60 },
          { name: 'تقديم العمليات بأمان كفريق في الهندسة', hours: 60 },
        ],
      },
    ],
  },
  {
    id: 'tawjihi',
    name: 'التوجيهي',
    icon: '🏆',
    description: 'المرحلة التوجيهية النهائية',
    specializations: [
      {
        id: 'tawjihi-it',
        name: 'تكنولوجيا المعلومات',
        subjects: [
          { name: 'الأمن السيبراني', hours: 120 },
          { name: 'البرمجة', hours: 90 },
          { name: 'إدارة المشاريع', hours: 90 },
          { name: 'ذكاء اصطناعي', hours: 60 },
        ],
      },
      {
        id: 'tawjihi-business',
        name: 'إدارة الأعمال',
        subjects: [
          { name: 'مبادئ الإدارة', hours: 60 },
          { name: 'اتخاذ قرارات الأعمال', hours: 120 },
          { name: 'الموارد البشرية', hours: 60 },
          { name: 'دراسة خدمة العملاء', hours: 60 },
          { name: 'أخلاقيات الأعمال', hours: 60 },
        ],
      },
      {
        id: 'tawjihi-beauty',
        name: 'التجميل',
        subjects: [
          { name: 'قص الشعر والتجميل والمشورة', hours: 90 },
          { name: 'التدليك والعلاج بالروائح', hours: 90 },
          { name: 'بدء مشروع وإدارته', hours: 90 },
        ],
      },
      {
        // Engineering group — الكهرباء + الميكانيك + تكنولوجيا السيارات as subSpecs
        id: 'tawjihi-engineering',
        name: 'الهندسة',
        subjects: [], // no direct subjects; user must choose a sub-spec
        subSpecs: [
          {
            id: 'tawjihi-electrical',
            name: 'الكهرباء',
            subjects: [
              { name: 'الأجهزة والدوائر الإلكترونية', hours: 60 },
              { name: 'القياس والاختبار الإلكتروني للدوائر', hours: 60 },
              { name: 'الدوائر الإلكترونية للمواد', hours: 60 },
              { name: 'الأنظمة الإلكترونية التناظرية والرقمية', hours: 60 },
              { name: 'المتحكمات المنطقية القابلة للبرمجة PLC', hours: 60 },
              { name: 'الروبوتات الصناعية', hours: 60 },
            ],
          },
          {
            id: 'tawjihi-mech',
            name: 'الميكانيك',
            subjects: [
              { name: 'السلوك الميكانيكي للمواد المعدنية', hours: 60 },
              { name: 'السلوك الميكانيكي للمواد غير المعدنية', hours: 60 },
              { name: 'صيانة الآلات الميكانيكية', hours: 60 },
              { name: 'تقنية اللحام', hours: 60 },
              { name: 'المعالجة الثانوية بالتصنيع', hours: 60 },
              { name: 'عمليات التشغيل باستخدام التحكم الرقمي بالحاسوب CNC', hours: 60 },
            ],
          },
          {
            id: 'tawjihi-auto',
            name: 'تكنولوجيا السيارات',
            subjects: [
              { name: 'أنظمة التعليق والتوجيه والبدء في المركبات الخفيفة', hours: 60 },
              { name: 'تشغيل أنظمة نقل الحركة في المركبات الخفيفة وصيانتها', hours: 60 },
              { name: 'محركات المركبات الكهربائية والهجينة', hours: 60 },
              { name: 'تشغيل أنظمة الاتصال الإلكترونية في المركبات واختبارها', hours: 60 },
              { name: 'أنظمة نقل الحركة الكهربائية', hours: 60 },
              { name: 'النقل الكهربائي', hours: 60 },
            ],
          },
        ],
      },
    ],
  },
];

export const GRADE_VALUES: Record<string, number> = {
  U: 0,
  P: 60,
  M: 80,
  D: 100,
};

export const SHARED_SUBJECTS = [
  { id: 'arabic',  name: 'اللغة العربية',    maxMark: 100, weight: 10 },
  { id: 'english', name: 'اللغة الإنجليزية', maxMark: 100, weight: 10 },
  { id: 'islamic', name: 'التربية الإسلامية', maxMark: 60,  weight: 6  },
  { id: 'history', name: 'تاريخ الأردن',      maxMark: 40,  weight: 4  },
];
