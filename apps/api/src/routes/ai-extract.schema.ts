import { z } from '@hono/zod-openapi';

export const ResumeParseRequestSchema = z
  .object({
    fileBase64: z.string().openapi({ example: 'JVBERi0xLjQK...' }),
    fileName: z.string().openapi({ example: 'resume.pdf' }),
  })
  .openapi('ResumeParseRequest');

export const ResumeProfileSchema = z
  .object({
    fullName: z.string().nullable().optional(),
    headline: z.string().nullable().optional(),
    summary: z.string().nullable().optional(),
    location: z.string().nullable().optional(),
    email: z.string().nullable().optional(),
    phone: z.string().nullable().optional(),
    links: z.array(z.string()).optional(),
    yearsExperience: z.number().nullable().optional(),
    keySkills: z.array(z.string()),
    skillCategories: z
      .array(
        z.object({
          name: z.string(),
          skills: z.array(z.string()),
        }),
      )
      .optional(),
    languagesHuman: z.array(z.string()).optional(),
    certifications: z.array(z.string()).optional(),
    education: z
      .array(
        z.object({
          institution: z.string().optional(),
          degree: z.string().optional(),
          field: z.string().optional(),
          endYear: z.union([z.number(), z.string()]).optional(),
        }),
      )
      .optional(),
    workHistory: z
      .array(
        z.object({
          company: z.string().optional(),
          title: z.string().optional(),
          start: z.string().optional(),
          end: z.string().optional(),
          highlights: z.array(z.string()).optional(),
        }),
      )
      .optional(),
    confidence: z.number().min(0).max(1).optional(),
    notes: z.string().optional(),
  })
  .openapi('ResumeProfile');

export const ResumeParseResponseSchema = z
  .object({
    detectedKind: z.enum(['pdf', 'docx']),
    truncated: z.boolean(),
    profile: ResumeProfileSchema,
  })
  .openapi('ResumeParseResponse');

export const ProjectGithubAnalyzeRequestSchema = z
  .object({
    repoUrl: z.string().url().openapi({ example: 'https://github.com/vercel/next.js' }),
  })
  .openapi('ProjectGithubAnalyzeRequest');

export const ProjectTechProfileSchema = z
  .object({
    primaryLanguages: z.array(z.string()),
    frameworksLibraries: z.array(z.string()),
    runtimePlatforms: z.array(z.string()),
    databasesStorage: z.array(z.string()),
    infraDevops: z.array(z.string()),
    testingQuality: z.array(z.string()),
    otherNotable: z.array(z.string()).optional(),
    summary: z.string().optional(),
    confidence: z.number().min(0).max(1).optional(),
  })
  .openapi('ProjectTechProfile');

export const ProjectGithubAnalyzeResponseSchema = z
  .object({
    repoUrl: z.string(),
    github: z.object({
      owner: z.string(),
      repo: z.string(),
      description: z.string().nullable(),
      defaultBranch: z.string(),
      languageBytes: z.record(z.string(), z.number()),
      topics: z.array(z.string()),
    }),
    tech: ProjectTechProfileSchema,
  })
  .openapi('ProjectGithubAnalyzeResponse');
