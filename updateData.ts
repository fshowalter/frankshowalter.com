import { constants } from "node:fs";
import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { z } from "zod";

type DownloadOptions = {
  overwrite?: boolean;
  skipExisting?: boolean;
};

const UpdateSchema = z.object({
  date: z.coerce.date(),
  image: z.string(),
  slug: z.string(),
  stars: z.number(),
  title: z.string(),
});

const UpdatesArraySchema = z.array(UpdateSchema);
type MediaSource = {
  imagesDir: string;
  jsonPath: string;
  type: "book" | "movie";
  url: string;
};

type Update = z.infer<typeof UpdateSchema>;

const SOURCES: MediaSource[] = [
  {
    imagesDir: "./content/assets/posters",
    jsonPath: "./content/data/movielog.json",
    type: "movie",
    url: "https://www.franksmovielog.com/updates.json",
  },
  {
    imagesDir: "./content/assets/covers",
    jsonPath: "./content/data/booklog.json",
    type: "book",
    url: "https://www.franksbooklog.com/updates.json",
  },
];

async function downloadFile(
  url: string,
  outputPath: string,
  options: DownloadOptions = { overwrite: false, skipExisting: true },
): Promise<{ message: string; skipped: boolean; success: boolean }> {
  try {
    // Ensure output directory exists
    const outputDir = path.dirname(outputPath);

    // Check if file already exists
    const exists = await fileExists(outputPath);

    if (exists) {
      if (options.skipExisting) {
        return {
          message: `File already exists at ${outputPath} - skipped download`,
          skipped: true,
          success: true,
        };
      }

      if (!options.overwrite) {
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

    // Get the file content as an ArrayBuffer
    const fileContent = await response.arrayBuffer();

    // Convert ArrayBuffer to Buffer and write to disk
    await writeFile(outputPath, Buffer.from(fileContent));

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
    process.exit(1);
  }
}

async function processMediaUpdates(source: MediaSource): Promise<void> {
  try {
    // Read and parse the JSON file
    const jsonData = await readFile(source.jsonPath, "utf-8");
    const rawUpdates = JSON.parse(jsonData);

    // Validate the data against our schema
    const updates = UpdatesArraySchema.parse(rawUpdates);

    console.log(`Processing ${updates.length} ${source.type} updates`);

    // Process each update
    for (const update of updates) {
      const outputPath = path.join(source.imagesDir, update.slug);

      console.log(`Downloading ${source.type} image for: ${update.title}`);

      const result = await downloadFile(update.image, outputPath, {
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

// Execute the script
await main();
