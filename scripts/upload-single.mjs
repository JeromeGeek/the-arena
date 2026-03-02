import { readFileSync } from "fs";
import { v2 as cloudinary } from "cloudinary";

const env = {};
for (const line of readFileSync(".env.local", "utf8").split("\n")) {
  const t = line.trim();
  if (!t || t.startsWith("#")) continue;
  const i = t.indexOf("=");
  if (i < 0) continue;
  env[t.slice(0, i).trim()] = t.slice(i + 1).trim();
}
cloudinary.config({
  cloud_name: env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  secure: true,
});

// Direct URLs — logos use Wikipedia File: pages, musicians use known images
const items = [
  { publicId: "snap-lens/easy/logos/dropbox", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/Dropbox_Icon.svg/512px-Dropbox_Icon.svg.png" },
];

for (const item of items) {
  try {
    const r = await cloudinary.uploader.upload(item.url, { public_id: item.publicId, overwrite: false });
    console.log("✅", r.public_id);
  } catch (e) {
    console.log("❌", item.publicId, e.message?.slice(0, 80));
  }
}


for (const item of items) {
  try {
    const r = await cloudinary.uploader.upload(item.url, { public_id: item.publicId, overwrite: false });
    console.log("✅", r.public_id);
  } catch (e) {
    console.log("❌", item.publicId, e.message);
  }
}
