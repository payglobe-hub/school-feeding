// GSFP Content Validation Service
// Provides comprehensive validation for content before publishing

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  score: number; // 0-100 quality score
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
  severity: 'error' | 'warning';
}

export interface ValidationWarning {
  field: string;
  message: string;
  code: string;
  suggestion?: string;
}

export interface ContentValidationRules {
  title: {
    required: boolean;
    minLength: number;
    maxLength: number;
    pattern?: RegExp;
  };
  content: {
    required: boolean;
    minLength: number;
    maxLength: number;
    allowEmpty: boolean;
  };
  excerpt: {
    required: boolean;
    maxLength: number;
  };
  tags: {
    required: boolean;
    minTags: number;
    maxTags: number;
    tagPattern: RegExp;
  };
  media: {
    required: boolean;
    allowedTypes: string[];
    maxSize: number; // in bytes
    dimensions?: {
      minWidth: number;
      minHeight: number;
    };
  };
  seo: {
    required: boolean;
    minDescriptionLength: number;
    maxDescriptionLength: number;
    keywordDensity: number; // max percentage
  };
}

class ContentValidator {
  private static instance: ContentValidator;
  private rules: ContentValidationRules;

  private constructor() {
    this.rules = {
      title: {
        required: true,
        minLength: 10,
        maxLength: 200,
        pattern: /^[a-zA-Z0-9\s\-_.,!?&()]+$/ // Allow basic characters and punctuation
      },
      content: {
        required: true,
        minLength: 50,
        maxLength: 50000,
        allowEmpty: false
      },
      excerpt: {
        required: true,
        maxLength: 500
      },
      tags: {
        required: true,
        minTags: 1,
        maxTags: 10,
        tagPattern: /^[a-zA-Z0-9\s\-_]{2,30}$/
      },
      media: {
        required: false,
        allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
        maxSize: 10 * 1024 * 1024, // 10MB
        dimensions: {
          minWidth: 800,
          minHeight: 600
        }
      },
      seo: {
        required: true,
        minDescriptionLength: 120,
        maxDescriptionLength: 160,
        keywordDensity: 3 // max 3% keyword density
      }
    };
  }

  static getInstance(): ContentValidator {
    if (!ContentValidator.instance) {
      ContentValidator.instance = new ContentValidator();
    }
    return ContentValidator.instance;
  }

  /**
   * Validate content item before publishing
   */
  async validateContent(content: any): Promise<ValidationResult> {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Basic structure validation
    this.validateStructure(content, errors);
    
    // Title validation
    this.validateTitle(content.title, errors, warnings);
    
    // Content validation
    this.validateContentBody(content.content, errors, warnings);
    
    // Excerpt validation
    this.validateExcerpt(content.excerpt, errors, warnings);
    
    // Tags validation
    this.validateTags(content.tags, errors, warnings);
    
    // Media validation
    if (content.mediaUrl || content.image) {
      await this.validateMedia(content.mediaUrl || content.image, errors, warnings);
    }
    
    // SEO validation
    this.validateSEO(content, errors, warnings);
    
    // Content quality checks
    this.validateContentQuality(content, errors, warnings);

    const isValid = errors.length === 0;
    const score = this.calculateQualityScore(errors, warnings);

    return {
      isValid,
      errors,
      warnings,
      score
    };
  }

  /**
   * Quick validation for draft content (less strict)
   */
  validateDraft(content: any): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Less strict validation for drafts
    if (!content.title || content.title.length < 5) {
      errors.push({
        field: 'title',
        message: 'Title must be at least 5 characters',
        code: 'TITLE_TOO_SHORT',
        severity: 'error'
      });
    }

    if (!content.content || content.content.length < 20) {
      errors.push({
        field: 'content',
        message: 'Content must be at least 20 characters',
        code: 'CONTENT_TOO_SHORT',
        severity: 'error'
      });
    }

    const isValid = errors.length === 0;
    const score = this.calculateQualityScore(errors, warnings);

    return {
      isValid,
      errors,
      warnings,
      score
    };
  }

  /**
   * Validate content structure
   */
  private validateStructure(content: any, errors: ValidationError[]): void {
    if (!content || typeof content !== 'object') {
      errors.push({
        field: 'content',
        message: 'Content must be a valid object',
        code: 'INVALID_STRUCTURE',
        severity: 'error'
      });
      return;
    }

    const requiredFields = ['title', 'content', 'type', 'status'];
    for (const field of requiredFields) {
      if (!(field in content)) {
        errors.push({
          field,
          message: `${field} is required`,
          code: 'MISSING_FIELD',
          severity: 'error'
        });
      }
    }
  }

  /**
   * Validate title
   */
  private validateTitle(title: string, errors: ValidationError[], warnings: ValidationWarning[]): void {
    if (!title) {
      errors.push({
        field: 'title',
        message: 'Title is required',
        code: 'TITLE_REQUIRED',
        severity: 'error'
      });
      return;
    }

    if (title.length < this.rules.title.minLength) {
      errors.push({
        field: 'title',
        message: `Title must be at least ${this.rules.title.minLength} characters`,
        code: 'TITLE_TOO_SHORT',
        severity: 'error'
      });
    }

    if (title.length > this.rules.title.maxLength) {
      errors.push({
        field: 'title',
        message: `Title must not exceed ${this.rules.title.maxLength} characters`,
        code: 'TITLE_TOO_LONG',
        severity: 'error'
      });
    }

    if (this.rules.title.pattern && !this.rules.title.pattern.test(title)) {
      errors.push({
        field: 'title',
        message: 'Title contains invalid characters',
        code: 'TITLE_INVALID_CHARS',
        severity: 'error'
      });
    }

    // Warnings
    if (title.length > 100) {
      warnings.push({
        field: 'title',
        message: 'Long titles may perform poorly in search results',
        code: 'TITLE_TOO_LONG_FOR_SEO',
        suggestion: 'Consider shortening the title to under 100 characters'
      });
    }

    if (title.toLowerCase() === title) {
      warnings.push({
        field: 'title',
        message: 'Title should use proper capitalization',
        code: 'TITLE_CAPITALIZATION',
        suggestion: 'Use title case for better readability'
      });
    }
  }

  /**
   * Validate content body
   */
  private validateContentBody(content: string, errors: ValidationError[], warnings: ValidationWarning[]): void {
    if (!content) {
      errors.push({
        field: 'content',
        message: 'Content is required',
        code: 'CONTENT_REQUIRED',
        severity: 'error'
      });
      return;
    }

    if (content.length < this.rules.content.minLength) {
      errors.push({
        field: 'content',
        message: `Content must be at least ${this.rules.content.minLength} characters`,
        code: 'CONTENT_TOO_SHORT',
        severity: 'error'
      });
    }

    if (content.length > this.rules.content.maxLength) {
      errors.push({
        field: 'content',
        message: `Content must not exceed ${this.rules.content.maxLength} characters`,
        code: 'CONTENT_TOO_LONG',
        severity: 'error'
      });
    }

    // Content quality warnings
    const paragraphs = content.split('\n').filter(p => p.trim().length > 0);
    if (paragraphs.length < 2) {
      warnings.push({
        field: 'content',
        message: 'Content should have multiple paragraphs for better readability',
        code: 'CONTENT_FEW_PARAGRAPHS',
        suggestion: 'Break up content into smaller paragraphs'
      });
    }

    // Check for very long paragraphs
    const longParagraphs = paragraphs.filter(p => p.length > 500);
    if (longParagraphs.length > 0) {
      warnings.push({
        field: 'content',
        message: 'Some paragraphs are too long for optimal reading',
        code: 'CONTENT_LONG_PARAGRAPHS',
        suggestion: 'Consider breaking up long paragraphs'
      });
    }
  }

  /**
   * Validate excerpt
   */
  private validateExcerpt(excerpt: string, errors: ValidationError[], warnings: ValidationWarning[]): void {
    if (!excerpt) {
      errors.push({
        field: 'excerpt',
        message: 'Excerpt is required',
        code: 'EXCERPT_REQUIRED',
        severity: 'error'
      });
      return;
    }

    if (excerpt.length > this.rules.excerpt.maxLength) {
      errors.push({
        field: 'excerpt',
        message: `Excerpt must not exceed ${this.rules.excerpt.maxLength} characters`,
        code: 'EXCERPT_TOO_LONG',
        severity: 'error'
      });
    }

    if (excerpt.length < 100) {
      warnings.push({
        field: 'excerpt',
        message: 'Excerpt is quite short for SEO purposes',
        code: 'EXCERPT_TOO_SHORT',
        suggestion: 'Consider expanding the excerpt to 120-160 characters'
      });
    }
  }

  /**
   * Validate tags
   */
  private validateTags(tags: string[], errors: ValidationError[], warnings: ValidationWarning[]): void {
    if (!tags || !Array.isArray(tags)) {
      errors.push({
        field: 'tags',
        message: 'Tags must be an array',
        code: 'TAGS_INVALID_FORMAT',
        severity: 'error'
      });
      return;
    }

    if (tags.length < this.rules.tags.minTags) {
      errors.push({
        field: 'tags',
        message: `At least ${this.rules.tags.minTags} tag is required`,
        code: 'TAGS_TOO_FEW',
        severity: 'error'
      });
    }

    if (tags.length > this.rules.tags.maxTags) {
      errors.push({
        field: 'tags',
        message: `Maximum ${this.rules.tags.maxTags} tags allowed`,
        code: 'TAGS_TOO_MANY',
        severity: 'error'
      });
    }

    // Validate individual tags
    tags.forEach((tag, index) => {
      if (typeof tag !== 'string') {
        errors.push({
          field: 'tags',
          message: `Tag ${index + 1} must be a string`,
          code: 'TAG_INVALID_TYPE',
          severity: 'error'
        });
        return;
      }

      if (!this.rules.tags.tagPattern.test(tag)) {
        errors.push({
          field: 'tags',
          message: `Tag "${tag}" contains invalid characters`,
          code: 'TAG_INVALID_CHARS',
          severity: 'error'
        });
      }
    });

    // Check for duplicate tags
    const uniqueTags = new Set(tags.map(t => t.toLowerCase()));
    if (uniqueTags.size !== tags.length) {
      warnings.push({
        field: 'tags',
        message: 'Duplicate tags detected',
        code: 'TAGS_DUPLICATE',
        suggestion: 'Remove duplicate tags'
      });
    }
  }

  /**
   * Validate media
   */
  private async validateMedia(mediaUrl: string, errors: ValidationError[], warnings: ValidationWarning[]): Promise<void> {
    try {
      // For now, basic URL validation
      if (!mediaUrl || typeof mediaUrl !== 'string') {
        errors.push({
          field: 'media',
          message: 'Valid media URL is required',
          code: 'MEDIA_INVALID_URL',
          severity: 'error'
        });
        return;
      }

      // Check if it's a valid URL
      try {
        new URL(mediaUrl);
      } catch {
        errors.push({
          field: 'media',
          message: 'Media URL is not valid',
          code: 'MEDIA_INVALID_URL_FORMAT',
          severity: 'error'
        });
        return;
      }

      // TODO: Add actual file validation (size, dimensions, type)
      // This would require fetching the file or checking Firebase Storage metadata
      
    } catch (error) {
      errors.push({
        field: 'media',
        message: 'Failed to validate media',
        code: 'MEDIA_VALIDATION_ERROR',
        severity: 'error'
      });
    }
  }

  /**
   * Validate SEO elements
   */
  private validateSEO(content: any, errors: ValidationError[], warnings: ValidationWarning[]): void {
    // Check if content has SEO-friendly structure
    const hasHeadings = /<h[1-6]/i.test(content.content);
    if (!hasHeadings) {
      warnings.push({
        field: 'content',
        message: 'Content lacks heading structure',
        code: 'SEO_NO_HEADINGS',
        suggestion: 'Add headings to improve SEO and readability'
      });
    }

    // Check keyword density (basic implementation)
    const words = content.content.toLowerCase().split(/\s+/);
    const titleWords = content.title.toLowerCase().split(/\s+/);
    
    for (const titleWord of titleWords) {
      if (titleWord.length > 3) { // Skip short words
        const count = words.filter((word: string) => word === titleWord).length;
        const density = (count / words.length) * 100;
        
        if (density > this.rules.seo.keywordDensity) {
          warnings.push({
            field: 'content',
            message: `Keyword "${titleWord}" density is too high (${density.toFixed(1)}%)`,
            code: 'SEO_HIGH_KEYWORD_DENSITY',
            suggestion: 'Reduce keyword repetition for better SEO'
          });
        }
      }
    }
  }

  /**
   * Validate content quality
   */
  private validateContentQuality(content: any, errors: ValidationError[], warnings: ValidationWarning[]): void {
    // Check for spelling errors (basic implementation)
    const commonMisspellings = ['teh', 'recieve', 'seperate', 'definately', 'occured'];
    const contentLower = content.content.toLowerCase();
    
    commonMisspellings.forEach(misspelling => {
      if (contentLower.includes(misspelling)) {
        warnings.push({
          field: 'content',
          message: `Possible spelling error: "${misspelling}"`,
          code: 'CONTENT_SPELLING',
          suggestion: 'Check for spelling errors'
        });
      }
    });

    // Check readability
    const sentences = content.content.split(/[.!?]+/).filter((s: string) => s.trim().length > 0);
    const avgSentenceLength = content.content.length / sentences.length;
    
    if (avgSentenceLength > 30) {
      warnings.push({
        field: 'content',
        message: 'Sentences are quite long, consider breaking them up',
        code: 'CONTENT_LONG_SENTENCES',
        suggestion: 'Use shorter sentences for better readability'
      });
    }

    // Check for calls to action
    const hasCallToAction = /\b(click|learn more|find out|contact|visit|register|sign up)\b/i.test(content.content);
    if (!hasCallToAction && content.type === 'article') {
      warnings.push({
        field: 'content',
        message: 'Consider adding a call to action',
        code: 'CONTENT_NO_CTA',
        suggestion: 'Add a call to action to engage readers'
      });
    }
  }

  /**
   * Calculate quality score based on errors and warnings
   */
  private calculateQualityScore(errors: ValidationError[], warnings: ValidationWarning[]): number {
    let score = 100;
    
    // Deduct points for errors
    score -= errors.length * 20; // 20 points per error
    
    // Deduct points for warnings
    score -= warnings.length * 5; // 5 points per warning
    
    // Ensure score doesn't go below 0
    return Math.max(0, score);
  }

  /**
   * Get validation rules
   */
  getRules(): ContentValidationRules {
    return { ...this.rules };
  }

  /**
   * Update validation rules
   */
  updateRules(newRules: Partial<ContentValidationRules>): void {
    this.rules = { ...this.rules, ...newRules };
  }
}

export const contentValidator = ContentValidator.getInstance();
