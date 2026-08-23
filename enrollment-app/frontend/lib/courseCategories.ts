export type CourseGroup = 'Adults' | 'Family & Children' | 'Exceptional Stages';

export const COURSE_GROUPS: CourseGroup[] = ['Adults', 'Family & Children', 'Exceptional Stages'];

const COURSE_GROUP_ORDER: Record<CourseGroup, number> = {
  Adults: 0,
  'Family & Children': 1,
  'Exceptional Stages': 2,
};

export const getCourseGroupLabel = (course?: {
  category?: string;
  type?: string;
  level?: string;
  name?: string;
}): CourseGroup => {
  const category = (course?.category ?? '').toLowerCase();
  const type = (course?.type ?? '').toLowerCase();
  const level = (course?.level ?? '').toLowerCase();
  const name = (course?.name ?? '').toLowerCase();

  if (
    type.includes('special') ||
    type.includes('workshop') ||
    category.includes('special') ||
    category.includes('exceptional') ||
    category.includes('workshop') ||
    category.includes('stage') ||
    name.includes('stage') ||
    name.includes('workshop')
  ) {
    return 'Exceptional Stages';
  }

  if (
    level === 'family' ||
    category.includes('family') ||
    category.includes('child') ||
    category.includes('enfant') ||
    category.includes('kids') ||
    name.includes('family') ||
    name.includes('child') ||
    name.includes('enfant')
  ) {
    return 'Family & Children';
  }

  return 'Adults';
};

export const getCourseCategoryValue = (course?: {
  category?: string;
  type?: string;
  level?: string;
  name?: string;
}) => {
  if (course?.category) return course.category;
  if (course?.type === 'SPECIAL' || course?.type === 'WORKSHOP') return 'Exceptional Stages';
  if (course?.level === 'FAMILY' || /family|child|enfant/i.test(course?.name ?? '')) return 'Family & Childs';
  return 'Adults';
};

const normalizeDateValue = (value?: string | null) => {
  if (!value) return '9999-12-31';

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString().slice(0, 10);
  }

  return '9999-12-31';
};

export const groupCoursesByCategory = <T>(
  items: T[],
  getCourse: (item: T) => { category?: string; type?: string; level?: string; name?: string },
  getDate: (item: T) => string | undefined
) => {
  const grouped: Record<CourseGroup, T[]> = {
    Adults: [],
    'Family & Children': [],
    'Exceptional Stages': [],
  };

  items.forEach((item) => {
    const course = getCourse(item);
    grouped[getCourseGroupLabel(course)].push(item);
  });

  (Object.keys(COURSE_GROUP_ORDER) as CourseGroup[]).forEach((group) => {
    grouped[group].sort((a, b) => {
      const dateA = normalizeDateValue(getDate(a));
      const dateB = normalizeDateValue(getDate(b));
      const timeA = (getCourse(a).name ?? '').toLowerCase();
      const timeB = (getCourse(b).name ?? '').toLowerCase();

      if (dateA !== dateB) {
        return dateA.localeCompare(dateB);
      }

      return timeA.localeCompare(timeB);
    });
  });

  return (Object.keys(COURSE_GROUP_ORDER) as CourseGroup[])
    .map((group) => ({ group, items: grouped[group] }))
    .filter(({ items }) => items.length > 0);
};
