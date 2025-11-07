/*
 * ORCID Parser is licensed under The 3-Clause BSD, see LICENSE.
 * Copyright 2025 Sira Pornsiriprasert <code@psira.me>
 */

export const WORK_TYPES = {
    // --- Academic Publications ---
    ARTICLE: 'journal-article',
    BOOK: 'book',
    BOOK_CHAPTER: 'book-chapter',
    CONFERENCE_PAPER: 'conference-paper',
    CONFERENCE_PROCEEDINGS: 'conference-proceedings',
    CONFERENCE_POSTER: 'conference-poster',
    CONFERENCE_PRESENTATION: 'conference-presentation',
    CONFERENCE_OUTPUT: 'conference-output',
    DISSERTATION: 'dissertation-thesis',
    PREPRINT: 'preprint',
    WORKING_PAPER: 'working-paper',

    // --- Review and Editing ---
    ANNOTATION: 'annotation',
    BOOK_REVIEW: 'book-review',
    JOURNAL_ISSUE: 'journal-issue',
    REVIEW: 'review',

    // --- Dissemination ---
    BLOG_POST: 'blog-post',
    DICTIONARY_ENTRY: 'dictionary-entry',
    ENCYCLOPEDIA_ENTRY: 'encyclopedia-entry',
    MAGAZINE_ARTICLE: 'magazine-article',
    NEWSPAPER_ARTICLE: 'newspaper-article',
    PUBLIC_SPEECH: 'public-speech',
    REPORT: 'report',
    WEBSITE: 'website',

    // --- Creative ---
    ARTISTIC_PERFORMANCE: 'artistic-performance',
    DESIGN: 'design',
    IMAGE: 'image',
    ONLINE_RESOURCE: 'online-resource',
    MOVING_IMAGE: 'moving-image',
    MUSICAL_COMPOSITION: 'musical-composition',
    SOUND: 'sound',

    // --- Data and Process ---
    CARTOGRAPHIC_MATERIAL: 'cartographic-material',
    CLINICAL_STUDY: 'clinical-study',
    DATASET: 'data-set',
    DATA_MANAGEMENT_PLAN: 'data-management-plan',
    PHYSICAL_OBJECT: 'physical-object',
    RESEARCH_TECHNIQUE: 'research-technique',
    RESEARCH_TOOL: 'research-tool',
    SOFTWARE: 'software',

    // --- Legal and IP ---
    INVENTION: 'invention',
    LICENSE: 'license',
    PATENT: 'patent',
    REGISTERED_COPYRIGHT: 'registered-copyright',
    STANDARDS_AND_POLICY: 'standards-and-policy',
    TRADEMARK: 'trademark',

    // --- Teaching and Supervision ---
    LECTURE_SPEECH: 'lecture-speech',
    LEARNING_OBJECT: 'learning-object',
    SUPERVISED_STUDENT_PUBLICATION: 'supervised-student-publication',

    // --- Other ---
    OTHER: 'other',
    UNSUPPORTED: 'unsupported',

    // --- Legacy ---
    CONFERENCE_ABSTRACT: 'conference-abstract', // replaced by conference-output
    DISCLOSURE: 'disclosure',
    EDITED_BOOK: 'edited-book', // replaced by book
    MANUAL: 'manual', // replaced by learning-object
    NEWSLETTER_ARTICLE: 'newsletter-article', // replaced by magazine/newspaper-article
    SPIN_OFF_COMPANY: 'spin-off-company',
    TECHNICAL_STANDARDS: 'technical-standards', // replaced by report
    TEST: 'test', // replaced by learning-object
} as const;


export type WorkType = typeof WORK_TYPES[keyof typeof WORK_TYPES];

// Namespace hacks
export namespace WorkType {
    export function format(workType: WorkType): string {
        const str = workType.replace("-", " ");
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    export function fromString(str: string): WorkType {
        const key = str.trim().toUpperCase().replace(/\s+/g, "_");
        const value = (WORK_TYPES as Record<string, WorkType>)[key];
        if (value) return value;

        // Fallback: input is one of the values
        const values = Object.values(WORK_TYPES) as WorkType[];
        return values.includes(str as WorkType) ? (str as WorkType) : WORK_TYPES.UNSUPPORTED;
    }
}
