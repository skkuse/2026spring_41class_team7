import { ResponsiveBuilder } from '../../components/builder/responsive-builder';

export default async function BuilderPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const loadDocId = typeof params.load === 'string' ? params.load : undefined;
  return <ResponsiveBuilder loadDocId={loadDocId} />;
}
