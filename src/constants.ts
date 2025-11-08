/*
 * ORCID Parser is licensed under The 3-Clause BSD, see LICENSE.
 * Copyright 2025 Sira Pornsiriprasert <code@psira.me>
 */

/**
 * Constants for all ORCID work types, according to https://info.orcid.org/ufaqs/what-work-types-does-orcid-support/.
 * 
 * @example
 * ```ts
 * // Filter works by type
 * const articles = filterByType(works, WORK_TYPES.ARTICLE);
 * ```
 */
export const WORK_TYPES = {
    // --- Academic Publications ---

    /** Standard journal article publication */
    ARTICLE: 'journal-article',

    /** Complete book publication */
    BOOK: 'book',

    /** Chapter or section within a book */
    BOOK_CHAPTER: 'book-chapter',

    /** Paper presented at a conference */
    CONFERENCE_PAPER: 'conference-paper',

    /** Published conference proceedings volume */
    CONFERENCE_PROCEEDINGS: 'conference-proceedings',

    /** Poster presented at a conference */
    CONFERENCE_POSTER: 'conference-poster',

    /** Oral presentation at a conference */
    CONFERENCE_PRESENTATION: 'conference-presentation',

    /** Generic conference output (abstracts, extended abstracts) */
    CONFERENCE_OUTPUT: 'conference-output',

    /** Doctoral dissertation or master's thesis */
    DISSERTATION: 'dissertation-thesis',

    /** Preprint or manuscript before peer review */
    PREPRINT: 'preprint',

    /** Working paper or draft publication */
    WORKING_PAPER: 'working-paper',

    // --- Review and Editing ---

    /** Annotation or commentary on another work */
    ANNOTATION: 'annotation',

    /** Critical review of a book */
    BOOK_REVIEW: 'book-review',

    /** Complete journal issue (editorial role) */
    JOURNAL_ISSUE: 'journal-issue',

    /** Review article or peer review */
    REVIEW: 'review',

    // --- Dissemination ---

    /** Blog post or web article */
    BLOG_POST: 'blog-post',

    /** Entry in a dictionary */
    DICTIONARY_ENTRY: 'dictionary-entry',

    /** Entry in an encyclopedia */
    ENCYCLOPEDIA_ENTRY: 'encyclopedia-entry',

    /** Article published in a magazine */
    MAGAZINE_ARTICLE: 'magazine-article',

    /** Article published in a newspaper */
    NEWSPAPER_ARTICLE: 'newspaper-article',

    /** Public speech or address */
    PUBLIC_SPEECH: 'public-speech',

    /** Technical or research report */
    REPORT: 'report',

    /** Website or web resource */
    WEBSITE: 'website',

    // --- Creative ---

    /** Artistic performance (theater, dance, music) */
    ARTISTIC_PERFORMANCE: 'artistic-performance',

    /** Design work (graphic, industrial, architectural) */
    DESIGN: 'design',

    /** Still image, photograph, or illustration */
    IMAGE: 'image',

    /** Generic online resource */
    ONLINE_RESOURCE: 'online-resource',

    /** Video, film, or animation */
    MOVING_IMAGE: 'moving-image',

    /** Musical composition or score */
    MUSICAL_COMPOSITION: 'musical-composition',

    /** Audio recording or sound work */
    SOUND: 'sound',

    // --- Data and Process ---

    /** Maps, atlases, or cartographic materials */
    CARTOGRAPHIC_MATERIAL: 'cartographic-material',

    /** Clinical trial or medical study */
    CLINICAL_STUDY: 'clinical-study',

    /** Research dataset or data collection */
    DATASET: 'data-set',

    /** Data management plan for research */
    DATA_MANAGEMENT_PLAN: 'data-management-plan',

    /** Physical object or artifact */
    PHYSICAL_OBJECT: 'physical-object',

    /** Research methodology or technique */
    RESEARCH_TECHNIQUE: 'research-technique',

    /** Research tool or instrument */
    RESEARCH_TOOL: 'research-tool',

    /** Software, code, or computer program */
    SOFTWARE: 'software',

    // --- Legal and IP ---

    /** Invention disclosure or patent application */
    INVENTION: 'invention',

    /** License or licensing agreement */
    LICENSE: 'license',

    /** Granted patent */
    PATENT: 'patent',

    /** Registered copyright */
    REGISTERED_COPYRIGHT: 'registered-copyright',

    /** Standards document or policy */
    STANDARDS_AND_POLICY: 'standards-and-policy',

    /** Registered trademark */
    TRADEMARK: 'trademark',

    // --- Teaching and Supervision ---

    /** Lecture or teaching presentation */
    LECTURE_SPEECH: 'lecture-speech',

    /** Educational resource or learning material */
    LEARNING_OBJECT: 'learning-object',

    /** Publication by a supervised student */
    SUPERVISED_STUDENT_PUBLICATION: 'supervised-student-publication',

    // --- Other ---

    /** Uncategorized or miscellaneous work */
    OTHER: 'other',

    /** Unsupported or unrecognized work type */
    UNSUPPORTED: 'unsupported',

    // --- Legacy ---

    /** @deprecated Replaced by {@link CONFERENCE_OUTPUT} */
    CONFERENCE_ABSTRACT: 'conference-abstract',

    /** @deprecated Legacy disclosure type */
    DISCLOSURE: 'disclosure',

    /** @deprecated Replaced by {@link BOOK} */
    EDITED_BOOK: 'edited-book',

    /** @deprecated Replaced by {@link LEARNING_OBJECT} */
    MANUAL: 'manual',

    /** @deprecated Replaced by {@link MAGAZINE_ARTICLE} or {@link NEWSPAPER_ARTICLE} */
    NEWSLETTER_ARTICLE: 'newsletter-article',

    /** @deprecated Legacy spin-off company type */
    SPIN_OFF_COMPANY: 'spin-off-company',

    /** @deprecated Replaced by {@link REPORT} */
    TECHNICAL_STANDARDS: 'technical-standards',

    /** @deprecated Replaced by {@link LEARNING_OBJECT} */
    TEST: 'test',
} as const;

/**
 * Union type of all valid ORCID work type string values.
 * 
 * @remarks
 * This type is derived from the {@link WORK_TYPES} constant object and includes
 * all possible work type string values (e.g., 'journal-article', 'book', etc.).
 * 
 * @example
 * ```ts
 * function processWork(type: WorkType) {
 *   switch (type) {
 *     case WORK_TYPES.ARTICLE:
 *       console.log('Processing journal article');
 *       break;
 *     case WORK_TYPES.BOOK:
 *       console.log('Processing book');
 *       break;
 *     // ... handle other types
 *   }
 * }
 * ```
 */
export type WorkType = typeof WORK_TYPES[keyof typeof WORK_TYPES];

/**
 * Utility namespace for WorkType operations.
 * 
 * Note: This uses TypeScript's namespace pattern to attach utility functions
 * to the type itself, allowing usage like `WorkType.format()`.
 */
export namespace WorkType {
    /**
     * Formats a work type constant into a human-readable string like in the ORCID user interface.
     * 
     * @param workType - The work type constant to format
     * @returns Formatted string
     * 
     * @remarks
     * This function converts hyphenated work type strings into space-separated,
     * title-case strings suitable for user interfaces.
     * 
     * @example
     * ```ts
     * WorkType.format(WORK_TYPES.ARTICLE);
     * // Returns: "Journal article"
     * 
     * WorkType.format(WORK_TYPES.CONFERENCE_PAPER);
     * // Returns: "Conference paper"
     * ```
     */
    export function format(workType: WorkType): string {
        const str = workType.replace("-", " ");
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    /**
     * Parses a string into a valid WorkType constant.
     * 
     * @param str - Input string to parse (case-insensitive, whitespace-flexible)
     * @returns Corresponding WorkType constant, or {@link WORK_TYPES.UNSUPPORTED} if not found
     * 
     * @remarks
     * This function attempts to match the input string in multiple ways:
     * 1. First tries to match against WORK_TYPES constant names (e.g., "JOURNAL_ARTICLE")
     * 2. Falls back to matching against actual type values (e.g., "journal-article")
     * 3. Returns {@link WORK_TYPES.UNSUPPORTED} if no match is found
     * 
     * The matching is case-insensitive and handles various whitespace formats.
     * 
     * @example
     * ```ts
     * // From constant name (case-insensitive)
     * WorkType.fromString('ARTICLE');
     * // Returns: 'journal-article'
     * 
     * WorkType.fromString('conference paper');
     * // Returns: 'conference-paper'
     * 
     * // From actual type value
     * WorkType.fromString('journal-article');
     * // Returns: 'journal-article'
     * 
     * // Unknown types
     * WorkType.fromString('unknown-type');
     * // Returns: 'unsupported'
     * 
     * // Flexible whitespace handling
     * WorkType.fromString('  JOURNAL  ARTICLE  ');
     * // Returns: 'journal-article'
     * ```
     */
    export function fromString(str: string): WorkType {
        const key = str.trim().toUpperCase().replace(/\s+/g, "_");
        const value = (WORK_TYPES as Record<string, WorkType>)[key];
        if (value) return value;

        // Fallback: input is one of the values
        const values = Object.values(WORK_TYPES) as WorkType[];
        return values.includes(str as WorkType) ? (str as WorkType) : WORK_TYPES.UNSUPPORTED;
    }
}
