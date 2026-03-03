import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Correction pour obtenir __dirname en mode ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Dossiers
const inputDir = path.join(__dirname, 'public/data');
const outputDir = path.join(__dirname, 'public/data_webp');

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

async function convertImages(dir) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            const relativePath = path.relative(inputDir, filePath);
            const newSubDir = path.join(outputDir, relativePath);
            if (!fs.existsSync(newSubDir)) fs.mkdirSync(newSubDir, { recursive: true });
            
            await convertImages(filePath);
        } else if (file.match(/\.(png|jpg|jpeg|tga)$/i)) {
            const relativePath = path.relative(inputDir, filePath);
            const outputFilePath = path.join(outputDir, relativePath).replace(/\.[^.]+$/, '.webp');

            console.log(`🚀 Conversion : ${file} -> .webp`);

            try {
                await sharp(filePath)
                    .webp({ quality: 80 })
                    .toFile(outputFilePath);
            } catch (err) {
                console.error(`❌ Erreur sur ${file}:`, err);
            }
        }
    }
}

console.log('--- DÉBUT DE LA COMPRESSION LUNATIC (ESM Mode) ---');
convertImages(inputDir).then(() => {
    console.log('--- TERMINÉ ! Les images sont dans public/data_webp ---');
});

// Doit etre bien dans le dossier Items pour que les chemins fonctionnent correctement
// Commande lancement conversion PNG to Webp : node convert.js
// Installé sharp : npm install sharp
// Le script convertira toutes les images PNG, JPG, JPEG et TGA du dossier public/data (et ses sous-dossiers) en WebP, en les enregistrant dans public/data_webp avec la même structure de dossiers