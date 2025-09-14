"use strict";

const path = require("path");
const fs = require("fs");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegInstaller = require("@ffmpeg-installer/ffmpeg");

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

const inputDir = path.join(__dirname, "input");
const outputDir = path.join(__dirname, "output");

if (!fs.existsSync(outputDir))
{
   fs.mkdirSync(outputDir, { recursive: true });
}

function convertFile(file)
{
   const ext = path.extname(file).toLowerCase();
   if (ext !== ".aiff" && ext !== ".aif") { return; }

   const base = path.basename(file, ext);
   const inputPath = path.join(inputDir, file);
   const outputPath = path.join(outputDir, base + ".mp3");

   console.log(`Converting: ${inputPath} -> ${outputPath}`);

   return new Promise((resolve, reject) =>
   {
      ffmpeg(inputPath)
      .audioCodec("libmp3lame")
      .audioQuality(2)
      .on("end", () =>
      {
         console.log(`Success: ${outputPath}`);
         resolve();
      })
      .on("error", (err) =>
      {
         console.error("Error:", err.message);
         reject(err);
      })
      .save(outputPath);
   });
}

async function main()
{
   const files = fs.readdirSync(inputDir);
   if (!files.length)
   {
      console.log("No files found in input/ directory");
      return;
   }

   for (const file of files)
   {
      try
      {
         await convertFile(file);
      }
      catch (err)
      {
         console.error("Failed to convert:", file);
      }
   }
}

main();