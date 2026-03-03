import fs from 'fs';
import path from 'path';

// Dossier contenant les images
const dataDir = path.join(process.cwd(), 'public', 'data');
const outputFile = path.join(process.cwd(), 'src', 'constants', 'items.js');

const generateItems = () => {
  const categories = fs.readdirSync(dataDir);
  let allItems = [];

  categories.forEach(category => {
    const categoryPath = path.join(dataDir, category);
    
    // On vérifie si c'est bien un dossier
    if (fs.statSync(categoryPath).isDirectory()) {
      const files = fs.readdirSync(categoryPath);
      
      files.forEach(file => {
        // On ne prend que les images
        if (file.match(/\.(png|jpg|jpeg|webp)$/i)) {
          const itemName = file.split('.')[0];
          allItems.push({
            id: `${category}_${itemName}`,
            name: itemName.replace(/-/g, ' ').toUpperCase(),
            image: `/data/${category}/${file}`,
            category: category
          });
        }
      });
    }
  });

  // Création du fichier final avec l'export "items"
  const content = `export const items = ${JSON.stringify(allItems, null, 2)};`;
  
  // Créer le dossier constants s'il n'existe pas
  if (!fs.existsSync(path.dirname(outputFile))) {
    fs.mkdirSync(path.dirname(outputFile), { recursive: true });
  }

  fs.writeFileSync(outputFile, content);
  console.log(`✅ Succès ! ${allItems.length} items ont été indexés pour Lunatic Items.`);
};

generateItems();