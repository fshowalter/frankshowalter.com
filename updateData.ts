import { constants } from "node:fs";
import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { z } from "zod";

type DownloadOptions = {
  overwrite?: boolean;
  skipExisting?: boolean;
};

const BaseUpdateSchema = z.object({
  date: z.coerce.date(),
  image: z.string(),
  slug: z.string(),
  stars: z.number(),
  title: z.string(),
});

const MovieUpdateSchema = BaseUpdateSchema.extend({
  year: z.string(),
});

const BookUpdateSchema = BaseUpdateSchema.extend({
  authors: z.array(z.string()),
});

const MovieUpdatesArraySchema = z.array(MovieUpdateSchema);
const BookUpdatesArraySchema = z.array(BookUpdateSchema);

type MediaSource = {
  baseUrl: string; // Added baseUrl for resolving relative paths
  imagesDir: string;
  jsonPath: string;
  type: "book" | "movie";
  url: string;
};

const SOURCES: MediaSource[] = [
  {
    baseUrl: "https://www.franksmovielog.com",
    imagesDir: "./content/assets/posters",
    jsonPath: "./content/data/movielog.json",
    type: "movie",
    url: "https://www.franksmovielog.com/updates.json",
  },
  {
    baseUrl: "https://www.franksbooklog.com",
    imagesDir: "./content/assets/covers",
    jsonPath: "./content/data/booklog.json",
    type: "book",
    url: "https://www.franksbooklog.com/updates.json",
  },
];

async function downloadFile(
  url: string,
  outputPath: string,
  options: DownloadOptions,
): Promise<{ message: string; skipped: boolean; success: boolean }> {
  const { overwrite, skipExisting } = {
    overwrite: false,
    skipExisting: true,
    ...options,
  };

  try {
    // Check if file already exists
    const exists = await fileExists(outputPath);

    if (exists) {
      if (skipExisting) {
        return {
          message: `File already exists at ${outputPath} - skipped download`,
          skipped: true,
          success: true,
        };
      }

      if (!overwrite) {
        throw new Error(
          `File already exists at ${outputPath} and overwrite is disabled`,
        );
      }
    }

    // Use native fetch API (stable in Node 22)
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    let content: Buffer;
    const isJson = outputPath.endsWith(".json");

    if (isJson) {
      // For JSON files, get as text, parse, and pretty print
      const text = await response.text();
      try {
        const json = JSON.parse(text) as unknown[];
        content = Buffer.from(JSON.stringify(json, undefined, 2));
      } catch {
        // If JSON parsing fails, treat as regular file
        content = Buffer.from(text);
      }
    } else {
      // For non-JSON files, get as ArrayBuffer
      const fileContent = await response.arrayBuffer();
      content = Buffer.from(fileContent);
    }

    // Write the processed content to disk
    await writeFile(outputPath, content);

    return {
      message: `File successfully downloaded to: ${outputPath}`,
      skipped: false,
      success: true,
    };
  } catch (error: unknown) {
    let errorMessage: string;

    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === "string") {
      errorMessage = error;
    } else {
      errorMessage = "An unknown error occurred";
    }

    return {
      message: `Failed to download file: ${errorMessage}`,
      skipped: false,
      success: false,
    };
  }
}

async function downloadUpdates(source: MediaSource): Promise<void> {
  console.log(`Downloading ${source.type} updates from ${source.url}`);

  const result = await downloadFile(source.url, source.jsonPath, {
    overwrite: true,
    skipExisting: false,
  });

  if (!result.success) {
    throw new Error(
      `Failed to download ${source.type} updates: ${result.message}`,
    );
  }
}

async function ensureDirectories(): Promise<void> {
  const dirs = SOURCES.flatMap((source) => [
    path.dirname(source.jsonPath),
    source.imagesDir,
  ]);

  for (const dir of dirs) {
    await mkdir(dir, { recursive: true });
  }
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function main(): Promise<void> {
  try {
    await ensureDirectories();

    // Download all update files first
    for (const source of SOURCES) {
      await downloadUpdates(source);
    }

    // Process each source
    for (const source of SOURCES) {
      await processMediaUpdates(source);
    }

    console.log("Successfully processed all updates");
  } catch (error: unknown) {
    console.error(
      "Failed to process updates:",
      error instanceof Error ? error.message : "Unknown error",
    );
    process.exit(1); // eslint-disable-line unicorn/no-process-exit
  }
}

async function processMediaUpdates(source: MediaSource): Promise<void> {
  try {
    const jsonData = await readFile(source.jsonPath, "utf8");
    const rawUpdates = JSON.parse(jsonData) as unknown[];

    // Use appropriate schema based on media type
    const updates =
      source.type === "movie"
        ? MovieUpdatesArraySchema.parse(rawUpdates)
        : BookUpdatesArraySchema.parse(rawUpdates);

    console.log(`Processing ${updates.length} ${source.type} updates`);

    for (const update of updates) {
      const outputPath = path.join(source.imagesDir, `${update.slug}.png`);

      // Resolve the image URL using the base URL
      const fullImageUrl = resolveUrl(source.baseUrl, update.image);

      console.log(`Downloading ${source.type} image for: ${update.title}`);
      console.log(`URL: ${fullImageUrl}`);

      const result = await downloadFile(fullImageUrl, outputPath, {
        skipExisting: true,
      });

      if (!result.success) {
        console.error(
          `Failed to download ${source.type} image for ${update.title}: ${result.message}`,
        );
        continue;
      }

      if (result.skipped) {
        console.log(`Image already exists for ${update.title}, skipped.`);
      } else {
        console.log(`Successfully downloaded image for ${update.title}`);
      }
    }

    console.log(`Finished processing ${source.type} updates`);
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      console.error(`Validation error in ${source.type} updates:`);
      for (const err of error.errors) {
        console.error(`- ${err.path.join(".")}: ${err.message}`);
      }
    } else {
      console.error(
        `Error processing ${source.type} updates:`,
        error instanceof Error ? error.message : "Unknown error",
      );
    }
    throw error;
  }
}

function resolveUrl(baseUrl: string, relativePath: string): string {
  // Remove leading slash if present to avoid double slashes
  const cleanPath = relativePath.startsWith("/")
    ? relativePath.slice(1)
    : relativePath;

  // Handle if the relative path is already a full URL
  try {
    new URL(relativePath);
    return relativePath; // Return as-is if it's already a valid URL
  } catch {
    // If it's not a valid URL, join it with the base URL
    const baseUrlTrimmed = baseUrl.endsWith("/")
      ? baseUrl.slice(0, -1)
      : baseUrl;
    return `${baseUrlTrimmed}/${cleanPath}`;
  }
}

// Execute the script
await main();
