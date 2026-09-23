export type ImageRef = {
  collection: "overview" | "fundraiser";
  displayName: string;
  documentId: string;
  label: string;
  field: string;
  url: string;
  publicPath?: string;
};

export type CheckStatus = "ok" | "missing" | "unknown";

export type CheckResult = ImageRef & {
  status: CheckStatus;
  detail: string;
};

export type StrapiMedia = {
  url?: string | null;
  provider?: string;
};

export type OverviewEntry = {
  documentId: string;
  name?: string;
  slug?: string;
  imageGallery?: { imageURL?: string | null }[] | null;
  callToActionCards?: { imageLink?: string | null }[] | null;
  processImageMobile?: StrapiMedia | null;
  processImageDesktop?: StrapiMedia | null;
};

export type FundraiserEntry = {
  documentId: string;
  title?: string;
  featuredImageURL?: string | null;
};
