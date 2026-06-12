import type { OpenAPIHono } from '@hono/zod-openapi';

import type { Env } from '../types.js';
import { postBootstrapHandler } from './bootstrap/post-bootstrap.handler.js';
import { postBootstrapRoute } from './bootstrap/post-bootstrap.route.js';
import { requireAuth } from '../middlewares/auth.js';
import { requireCompany } from '../middlewares/require-company.js';
import { listDocumentsHandler } from './documents/list-documents.handler.js';
import { listDocumentsRoute } from './documents/list-documents.route.js';
import { getExampleHandler } from './example/get-example.handler.js';
import { getExampleRoute } from './example/get-example.route.js';
import { getHealthHandler } from './health/get-health.handler.js';
import { getHealthRoute } from './health/get-health.route.js';
import { listInvoicesHandler } from './invoices/list-invoices.handler.js';
import { listInvoicesRoute } from './invoices/list-invoices.route.js';
import { getMeHandler } from './profile/get-me.handler.js';
import { getMeRoute } from './profile/get-me.route.js';
import { patchMeHandler } from './profile/patch-me.handler.js';
import { patchMeRoute } from './profile/patch-me.route.js';
import { postProjectGithubHandler } from './ai-extract/post-project-github.handler.js';
import { postProjectGithubRoute } from './ai-extract/post-project-github.route.js';
import { postResumeParseHandler } from './ai-extract/post-resume-parse.handler.js';
import { postResumeParseRoute } from './ai-extract/post-resume-parse.route.js';
import { postAssessmentHandler } from './assessments/post-assessment.handler.js';
import { postAssessmentRoute } from './assessments/post-assessment.route.js';
import { listAssessmentsHandler } from './assessments/list-assessments.handler.js';
import { listAssessmentsRoute } from './assessments/list-assessments.route.js';
import { getAssessmentHandler } from './assessments/get-assessment.handler.js';
import { getAssessmentRoute } from './assessments/get-assessment.route.js';
import { getPublicAssessmentHandler } from './assessments/get-public-assessment.handler.js';
import { getPublicAssessmentRoute } from './assessments/get-public-assessment.route.js';
import { postPortfolioGenerateHandler } from './portfolio/post-generate.handler.js';
import { postPortfolioGenerateRoute } from './portfolio/post-generate.route.js';
import { listTalentHandler } from './talent/list-talent.handler.js';
import { listTalentRoute } from './talent/list-talent.route.js';
import { getTalentHandler } from './talent/get-talent.handler.js';
import { getTalentRoute } from './talent/get-talent.route.js';
import { contactTalentHandler } from './talent/contact-talent.handler.js';
import { contactTalentRoute } from './talent/contact-talent.route.js';
import { listShortlistHandler } from './shortlist/list-shortlist.handler.js';
import { listShortlistRoute } from './shortlist/list-shortlist.route.js';
import { postShortlistHandler } from './shortlist/post-shortlist.handler.js';
import { postShortlistRoute } from './shortlist/post-shortlist.route.js';
import { deleteShortlistHandler } from './shortlist/delete-shortlist.handler.js';
import { deleteShortlistRoute } from './shortlist/delete-shortlist.route.js';

export const registerRoutes = (app: OpenAPIHono<Env>) => {
  app.openapi(getExampleRoute, getExampleHandler);
  app.openapi(getHealthRoute, getHealthHandler);
  app.openapi(getPublicAssessmentRoute, getPublicAssessmentHandler);
  app.use('/v1/*', requireAuth);

  // Profile
  app.openapi(postBootstrapRoute, postBootstrapHandler);
  app.openapi(getMeRoute, getMeHandler);
  app.openapi(patchMeRoute, patchMeHandler);

  // Developer routes
  app.openapi(listDocumentsRoute, listDocumentsHandler);
  app.openapi(listInvoicesRoute, listInvoicesHandler);
  app.openapi(postResumeParseRoute, postResumeParseHandler);
  app.openapi(postProjectGithubRoute, postProjectGithubHandler);
  app.openapi(postAssessmentRoute, postAssessmentHandler);
  app.openapi(listAssessmentsRoute, listAssessmentsHandler);
  app.openapi(getAssessmentRoute, getAssessmentHandler);
  app.openapi(postPortfolioGenerateRoute, postPortfolioGenerateHandler);

  // Talent directory (any authenticated user)
  app.openapi(listTalentRoute, listTalentHandler);
  app.openapi(getTalentRoute, getTalentHandler);

  // Contact (company only — handler enforces)
  app.openapi(contactTalentRoute, contactTalentHandler);

  // Shortlist (company only — middleware enforces)
  app.use('/v1/shortlist*', requireCompany);
  app.openapi(listShortlistRoute, listShortlistHandler);
  app.openapi(postShortlistRoute, postShortlistHandler);
  app.openapi(deleteShortlistRoute, deleteShortlistHandler);
};
