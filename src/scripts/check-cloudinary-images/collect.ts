import qs from "qs";
import { STRAPI_ENV } from "../strapi-env";
import { FundraiserEntry, ImageRef, OverviewEntry } from "./types.d";

/** Mirrors next-website-v2's routes */
const PUBLIC_PATHS = {
  overview: (entry: OverviewEntry) =>
    entry.slug ? `/responses/${entry.slug}` : undefined,
  fundraiser: () => "/donate",
};

async function strapiGet<T>(
  path: string,
  query: Record<string, unknown>,
): Promise<T[]> {
  const url = `${STRAPI_ENV.URL}/${path}?${qs.stringify(query)}`;
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${STRAPI_ENV.KEY}` },
  });

  if (!response.ok) {
    throw new Error(`Strapi returned ${response.status} for /${path}`);
  }

  const { data } = (await response.json()) as { data: T[] };
  return data ?? [];
}

const addRef = (
  refs: ImageRef[],
  ref: Omit<ImageRef, "url">,
  url: string | null | undefined,
) => {
  if (typeof url !== "string" || url.trim().length === 0) return;
  refs.push({ ...ref, url: url.trim() });
};

export async function collectImageRefs(): Promise<ImageRef[]> {
  const refs: ImageRef[] = [];

  const overviews = await strapiGet<OverviewEntry>("overviews", {
    status: "published",
    populate: {
      imageGallery: true,
      callToActionCards: true,
      processImageMobile: true,
      processImageDesktop: true,
    },
  });

  for (const overview of overviews) {
    const shared = {
      collection: "overview" as const,
      displayName: "Response.Overview",
      documentId: overview.documentId,
      label: overview.name ?? "(untitled)",
      publicPath: PUBLIC_PATHS.overview(overview),
    };

    overview.imageGallery?.forEach((image, index) => {
      addRef(
        refs,
        { ...shared, field: `imageGallery entry ${index + 1} → imageURL` },
        image?.imageURL,
      );
    });

    overview.callToActionCards?.forEach((card, index) => {
      addRef(
        refs,
        {
          ...shared,
          field: `callToActionCards entry ${index + 1} → imageLink`,
        },
        card?.imageLink,
      );
    });

    // Uploaded rather than pasted, but the asset can still be deleted in Cloudinary.
    for (const field of [
      "processImageMobile",
      "processImageDesktop",
    ] as const) {
      addRef(refs, { ...shared, field }, overview[field]?.url);
    }
  }

  const fundraisers = await strapiGet<FundraiserEntry>("fundraisers", {
    status: "published",
  });

  for (const fundraiser of fundraisers) {
    addRef(
      refs,
      {
        collection: "fundraiser",
        displayName: "Response.Fundraiser",
        documentId: fundraiser.documentId,
        label: fundraiser.title ?? "(untitled)",
        field: "featuredImageURL",
        publicPath: PUBLIC_PATHS.fundraiser(),
      },
      fundraiser.featuredImageURL,
    );
  }

  return refs;
}
