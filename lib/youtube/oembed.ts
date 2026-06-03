import { toCanonicalYouTubeWatchUrl } from "./validate";

export type YouTubeOEmbed = {
  title: string;
  thumbnailUrl: string;
};

export async function fetchYouTubeOEmbed(
  url: string,
): Promise<YouTubeOEmbed | null> {
  try {
    const normalized = toCanonicalYouTubeWatchUrl(url);
    const endpoint = `https://www.youtube.com/oembed?url=${encodeURIComponent(normalized)}&format=json`;
    const res = await fetch(endpoint, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      title?: string;
      thumbnail_url?: string;
    };
    if (!data.title) return null;
    return {
      title: data.title,
      thumbnailUrl: data.thumbnail_url ?? "",
    };
  } catch {
    return null;
  }
}
