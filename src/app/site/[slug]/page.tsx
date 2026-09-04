import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { INSTITUTE_TYPE_LABELS, type InstituteType } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function PublicInstituteSite({ params }: { params: { slug: string } }) {
  const institute = await prisma.institute.findUnique({
    where: { slug: params.slug },
    include: {
      notices: { orderBy: { createdAt: "desc" }, take: 10, include: { author: true } },
      _count: { select: { students: true } },
    },
  });

  if (!institute || institute.status !== "APPROVED" || !institute.isActive) {
    notFound();
  }

  return (
    <main>
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-sm text-brand-700">
            Powered by Ek Badhyasi
          </Link>
          <Link href="/login" className="text-sm font-medium text-slate-700 hover:text-brand-700">
            Log in
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-4xl px-6 py-16">
        <p className="text-sm font-medium uppercase tracking-wide text-brand-600">
          {INSTITUTE_TYPE_LABELS[institute.type as InstituteType] ?? institute.type}
        </p>
        <h1 className="mt-1 text-3xl font-bold text-slate-900">{institute.name}</h1>
        {(institute.city || institute.address) && (
          <p className="mt-2 text-slate-600">{[institute.address, institute.city].filter(Boolean).join(", ")}</p>
        )}
        {institute.description && <p className="mt-6 max-w-2xl text-slate-700">{institute.description}</p>}

        <div className="mt-6 flex flex-wrap gap-4 text-sm text-slate-600">
          <span>📧 {institute.contactEmail}</span>
          <span>📞 {institute.contactPhone}</span>
          <span>🎓 {institute._count.students} students</span>
        </div>
      </section>

      <section className="mx-auto max-w-4xl border-t border-slate-200 px-6 py-12">
        <h2 className="text-xl font-semibold text-slate-900">Notices</h2>
        {institute.notices.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">No notices posted yet.</p>
        ) : (
          <ul className="mt-4 space-y-4">
            {institute.notices.map((n) => (
              <li key={n.id} className="rounded-lg border border-slate-200 bg-white p-4">
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="font-medium text-slate-900">{n.title}</h3>
                  <time className="shrink-0 text-xs text-slate-400">
                    {new Date(n.createdAt).toLocaleDateString()}
                  </time>
                </div>
                <p className="mt-1 whitespace-pre-wrap text-sm text-slate-600">{n.content}</p>
                <p className="mt-2 text-xs text-slate-400">— {n.author.name}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
