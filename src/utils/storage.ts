import { deleteObject, getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "../lib/firebase";
import type { ProjectImage } from "../types/content";

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "item";
}

export async function uploadProjectImage(file: File, projectSlug: string): Promise<ProjectImage> {
  const cleanSlug = slugify(projectSlug);
  const baseName = slugify(file.name.replace(/\.[^.]+$/, ""));
  const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const storagePath = `2p-stavebni/projects/${cleanSlug}/${Date.now()}-${baseName}.${extension}`;
  const fileRef = ref(storage, storagePath);

  await uploadBytes(fileRef, file, {
    contentType: file.type || "image/jpeg",
  });

  const src = await getDownloadURL(fileRef);

  return {
    src,
    alt: file.name.replace(/\.[^.]+$/, ""),
    storagePath,
  };
}

export async function removeProjectImage(storagePath?: string) {
  if (!storagePath) return;
  await deleteObject(ref(storage, storagePath));
}

export async function removeProjectImages(images: ProjectImage[]) {
  await Promise.all(
    images
      .map((image) => image.storagePath)
      .filter((storagePath): storagePath is string => Boolean(storagePath))
      .map(async (storagePath) => {
        try {
          await deleteObject(ref(storage, storagePath));
        } catch {
          // Ignore missing or already-deleted files so project cleanup can continue.
        }
      }),
  );
}
