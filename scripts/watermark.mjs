#!/usr/bin/env node
/**
 * Digital Watermark Script
 *
 * Adds a subtle text watermark to images in /public/art/
 * Outputs watermarked versions to /public/art/watermarked/
 *
 * Usage:
 *   node scripts/watermark.mjs
 *
 * Requires: npm install sharp
 *
 * The watermark is a semi-transparent text overlay in the bottom-right corner.
 * Original files are never modified — watermarked copies go to a separate folder.
 */

import { readdir, mkdir } from "node:fs/promises";
import { join, extname } from "node:path";
import sharp from "sharp";

const INPUT_DIR = join(process.cwd(), "public", "art");
const OUTPUT_DIR = join(process.cwd(), "public", "art", "watermarked");
const WATERMARK_TEXT = "© Deona Hawaii";
const IMAGE_EXTS = new Set([".jpg", ".jpeg", ".png", ".webp"]);

async function watermarkImage(inputPath, outputPath) {
  const image = sharp(inputPath);
  const metadata = await image.metadata();
  const { width = 1200, height = 800 } = metadata;

  // Scale font size relative to image width
  const fontSize = Math.max(16, Math.round(width * 0.025));
  const padding = Math.round(fontSize * 1.5);

  // Create SVG text overlay
  const svgOverlay = Buffer.from(`
    <svg width="${width}" height="${height}">
      <style>
        .watermark {
          fill: rgba(255, 255, 255, 0.35);
          font-family: 'Montserrat', 'Helvetica', sans-serif;
          font-size: ${fontSize}px;
          font-weight: 500;
          letter-spacing: 2px;
        }
      </style>
      <text
        x="${width - padding}"
        y="${height - padding}"
        text-anchor="end"
        class="watermark"
      >${WATERMARK_TEXT}</text>
    </svg>
  `);

  await image
    .composite([{ input: svgOverlay, top: 0, left: 0 }])
    .jpeg({ quality: 90 })
    .toFile(outputPath);

  console.log(`  Watermarked: ${outputPath}`);
}

async function main() {
  await mkdir(OUTPUT_DIR, { recursive: true });

  const files = await readdir(INPUT_DIR);
  const imageFiles = files.filter(
    (f) => IMAGE_EXTS.has(extname(f).toLowerCase()) && !f.startsWith(".")
  );

  if (imageFiles.length === 0) {
    console.log("No images found in /public/art/. Add your artwork files first.");
    return;
  }

  console.log(`Processing ${imageFiles.length} image(s)...\n`);

  for (const file of imageFiles) {
    const inputPath = join(INPUT_DIR, file);
    const outputPath = join(OUTPUT_DIR, file);
    await watermarkImage(inputPath, outputPath);
  }

  console.log(`\nDone. Watermarked images saved to /public/art/watermarked/`);
}

main().catch(console.error);
