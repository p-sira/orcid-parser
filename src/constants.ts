/*
 * ORCID Parser is licensed under The 3-Clause BSD, see LICENSE.
 * Copyright 2025 Sira Pornsiriprasert <code@psira.me>
 */

/**
 * Enumerated constants for ORCID work types.
 */
export const WORK_TYPES = {
    ARTICLE: 'journal-article',
    BOOK: 'book',
    BOOK_CHAPTER: 'book-chapter',
    CONFERENCE_PAPER: 'conference-paper',
    CONFERENCE_ABSTRACT: 'conference-abstract',
    DISSERTATION: 'dissertation-thesis',
    PREPRINT: 'preprint',
    REPORT: 'report',
    DATASET: 'data-set',
    SOFTWARE: 'research-software',
    PATENT: 'patent',
    REVIEW: 'review',
    WORKING_PAPER: 'working-paper',
    OTHER: 'other',
    UNSUPPORTED: 'unsupported',
} as const;

export type WorkType = typeof WORK_TYPES[keyof typeof WORK_TYPES];

// (Object.values(WORK_TYPES) as unknown as string[]).includes(data.type)
// ? (data.type as WorkType)
// : WORK_TYPES.UNSUPPORTED,