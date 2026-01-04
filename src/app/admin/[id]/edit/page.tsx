import { getPathologyById } from "@/modules/pathology/actions/pathology-actions";
import { PathologyForm } from "@/modules/pathology/components/pathology-form";
import { notFound } from "next/navigation";

interface EditPathologyPageProps {
    params: Promise<{ id: string }>;
}

export default async function EditPathologyPage({ params }: EditPathologyPageProps) {
    const { id } = await params;
    const pathology = await getPathologyById(parseInt(id));

    if (!pathology) {
        notFound();
    }

    return (
        <div className="container py-6">
            <PathologyForm initialData={pathology} isEditing={true} />
        </div>
    );
}
