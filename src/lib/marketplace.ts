import { readJsonBlob, writeJsonBlob } from "./blob-json";
import type { MarketplaceListing } from "./types";

const PATH = "ownvite/marketplace.json";

type Registry = { version: 1; listings: MarketplaceListing[] };

async function load(): Promise<Registry> {
  return readJsonBlob<Registry>(PATH, { version: 1, listings: [] });
}

export async function listPublishedListings(): Promise<MarketplaceListing[]> {
  const reg = await load();
  return reg.listings
    .filter((l) => l.status === "published")
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function listAllListings(): Promise<MarketplaceListing[]> {
  const reg = await load();
  return reg.listings.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function createListing(input: {
  authorId: string;
  authorName: string;
  templateId: string;
  title: string;
  description: string;
  priceCents: number;
  previewImage: string;
}): Promise<MarketplaceListing> {
  const reg = await load();
  const listing: MarketplaceListing = {
    id: `mkt_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
    authorId: input.authorId,
    authorName: input.authorName.trim() || "Designer",
    templateId: input.templateId,
    title: input.title.trim().slice(0, 80),
    description: input.description.trim().slice(0, 600),
    priceCents: Math.max(0, Math.min(9900, Math.floor(input.priceCents))),
    previewImage: input.previewImage,
    status: "pending",
    createdAt: new Date().toISOString(),
  };
  reg.listings.push(listing);
  await writeJsonBlob(PATH, reg);
  return listing;
}

export async function publishListing(
  listingId: string,
): Promise<MarketplaceListing | undefined> {
  const reg = await load();
  const idx = reg.listings.findIndex((l) => l.id === listingId);
  if (idx < 0) return undefined;
  reg.listings[idx] = { ...reg.listings[idx]!, status: "published" };
  await writeJsonBlob(PATH, reg);
  return reg.listings[idx];
}
