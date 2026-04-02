import { Course as FrontendCourse, CourseDB } from '@/types/content';

export function transformCourse(dbCourse: CourseDB): FrontendCourse {
    return {
        id: dbCourse.id,
        title: dbCourse.title,
        description: dbCourse.description,
        levelId: dbCourse.level,
        modules: [],
        category: 'crypto',
        thumbnail: dbCourse.thumbnail,
        // Database fields
        level: dbCourse.level,
        price: dbCourse.price,
        duration: dbCourse.duration,
        instructor: dbCourse.instructor,
        is_published: dbCourse.is_published,
        created_at: dbCourse.created_at,
        updated_at: dbCourse.updated_at,
    };
}