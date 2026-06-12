import type { RouteHandler } from '@hono/zod-openapi';

import type { Env } from '../../types.js';
import { prisma } from '../../lib/prisma.js';
import { getStatsRoute } from './get-stats.route.js';

type HistoryPoint = { label: string; date: string; avgScore: number; count: number };

function isoWeekLabel(d: Date): string {
  const monday = new Date(d);
  monday.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return monday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function isoWeekKey(d: Date): string {
  const monday = new Date(d);
  monday.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return monday.toISOString().slice(0, 10);
}

function buildHistory(
  rows: { overallScore: number; createdAt: Date }[],
): { daily: HistoryPoint[]; weekly: HistoryPoint[]; monthly: HistoryPoint[] } {
  const daily = new Map<string, { sum: number; count: number }>();
  const weekly = new Map<string, { sum: number; count: number; date: Date }>();
  const monthly = new Map<string, { sum: number; count: number; date: Date }>();

  const cutoffDaily = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const cutoffWeekly = new Date(Date.now() - 12 * 7 * 24 * 60 * 60 * 1000);
  const cutoffMonthly = new Date(Date.now() - 12 * 30 * 24 * 60 * 60 * 1000);

  for (const row of rows) {
    const d = row.createdAt;
    const score = row.overallScore;

    if (d >= cutoffDaily) {
      const key = d.toISOString().slice(0, 10);
      const e = daily.get(key) ?? { sum: 0, count: 0 };
      daily.set(key, { sum: e.sum + score, count: e.count + 1 });
    }
    if (d >= cutoffWeekly) {
      const key = isoWeekKey(d);
      const e = weekly.get(key) ?? { sum: 0, count: 0, date: d };
      weekly.set(key, { sum: e.sum + score, count: e.count + 1, date: e.date });
    }
    if (d >= cutoffMonthly) {
      const key = d.toISOString().slice(0, 7); // "YYYY-MM"
      const e = monthly.get(key) ?? { sum: 0, count: 0, date: d };
      monthly.set(key, { sum: e.sum + score, count: e.count + 1, date: e.date });
    }
  }

  const sortedDaily: HistoryPoint[] = [...daily.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, v]) => ({
      label: new Date(key + 'T12:00:00Z').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      date: key,
      avgScore: Math.round(v.sum / v.count),
      count: v.count,
    }));

  const sortedWeekly: HistoryPoint[] = [...weekly.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, v]) => ({
      label: isoWeekLabel(new Date(key + 'T12:00:00Z')),
      date: key,
      avgScore: Math.round(v.sum / v.count),
      count: v.count,
    }));

  const sortedMonthly: HistoryPoint[] = [...monthly.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, v]) => ({
      label: new Date(key + '-15T12:00:00Z').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      date: key,
      avgScore: Math.round(v.sum / v.count),
      count: v.count,
    }));

  return { daily: sortedDaily, weekly: sortedWeekly, monthly: sortedMonthly };
}

export const getStatsHandler: RouteHandler<typeof getStatsRoute, Env> = async (c) => {
  const userId = c.get('userId');

  // User's own assessments
  const userAssessments = await prisma.assessment.findMany({
    where: { userId },
    select: { overallScore: true, createdAt: true },
    orderBy: { createdAt: 'asc' },
  });

  const assessmentCount = userAssessments.length;
  const avgScore =
    assessmentCount > 0
      ? Math.round(userAssessments.reduce((s: number, a: { overallScore: number }) => s + a.overallScore, 0) / assessmentCount)
      : 0;
  const topScore =
    assessmentCount > 0 ? Math.max(...userAssessments.map((a: { overallScore: number }) => a.overallScore)) : 0;

  // Percentile: compare against all developers who have ≥1 assessment
  const allGrouped = await prisma.assessment.groupBy({
    by: ['userId'],
    _avg: { overallScore: true },
  });

  type GroupedRow = { userId: string; _avg: { overallScore: number | null } };
  const totalRankedDevelopers = allGrouped.length;
  const belowCount = (allGrouped as GroupedRow[]).filter(
    (g) => (g._avg.overallScore ?? 0) < avgScore,
  ).length;
  const percentile =
    totalRankedDevelopers > 1 ? Math.round((belowCount / (totalRankedDevelopers - 1)) * 100) : 100;
  const sortedDesc = [...(allGrouped as GroupedRow[])].sort(
    (a, b) => (b._avg.overallScore ?? 0) - (a._avg.overallScore ?? 0),
  );
  const rank = sortedDesc.findIndex((g) => g.userId === userId) + 1;

  const history = buildHistory(userAssessments);

  return c.json(
    {
      userId,
      avgScore,
      topScore,
      assessmentCount,
      percentile,
      rank: rank || 1,
      totalRankedDevelopers,
      history,
    },
    200,
  );
};
