const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');
const { glob } = require('glob');

// 画像変換設定
const config = {
  logo: {
    input: 'assets/img/logo.png',
    outputs: [
      { width: 88, quality: 90 },
      { width: 180, quality: 90 },
      { width: 72, quality: 90 }
    ]
  },
  backgrounds: [
    {
      input: 'assets/img/concept.png',
      outputs: [
        { width: 480, quality: 85 },
        { width: 1024, quality: 85 },
        { width: 1920, quality: 85 }
      ]
    },
    {
      input: 'assets/img/cast.jpg',
      outputs: [
        { width: 480, quality: 85 },
        { width: 1024, quality: 85 },
        { width: 1920, quality: 85 }
      ]
    }
  ],
  dragonIcons: {
    pattern: 'assets/img/dragons/*_icon.{jpg,png}',
    outputs: [
      { width: 160, quality: 88 },
      { width: 240, quality: 88 }
    ]
  },
  dragonFull: {
    pattern: 'assets/img/dragons/*_full.png',
    outputs: [
      { width: 480, quality: 90 },
      { width: 800, quality: 90 }
    ]
  },
  flowers: {
    pattern: 'assets/img/flowers/*_flower.png',
    outputs: [
      { width: 320, quality: 85 },
      { width: 640, quality: 85 }
    ]
  },
  cards: {
    pattern: 'assets/img/cards/*_card.{jpg,png}',
    outputs: [
      { width: 400, quality: 88 },
      { width: 600, quality: 88 }
    ]
  },
  accessMap: {
    input: 'assets/img/access-map-placeholder.png',
    outputs: [
      { width: 480, quality: 85 },
      { width: 1024, quality: 85 }
    ]
  }
};

/**
 * 単一画像を変換
 */
async function convertImage(inputPath, width, quality) {
  try {
    const ext = path.extname(inputPath);
    const base = path.basename(inputPath, ext);
    const dir = path.dirname(inputPath);
    const outputPath = path.join(dir, `${base}-${width}w.webp`);

    await sharp(inputPath)
      .resize(width, null, { withoutEnlargement: true })
      .webp({ quality })
      .toFile(outputPath);

    const stats = await fs.stat(outputPath);
    console.log(`✓ Created ${outputPath} (${(stats.size / 1024).toFixed(1)}KB)`);
    return true;
  } catch (error) {
    console.error(`✗ Failed to convert ${inputPath}:`, error.message);
    return false;
  }
}

/**
 * ロゴ画像を変換
 */
async function convertLogo() {
  console.log('\n📸 Converting logo...');
  const { input, outputs } = config.logo;

  for (const { width, quality } of outputs) {
    await convertImage(input, width, quality);
  }
}

/**
 * 背景画像を変換
 */
async function convertBackgrounds() {
  console.log('\n🖼️  Converting background images...');

  for (const bg of config.backgrounds) {
    const { input, outputs } = bg;
    for (const { width, quality } of outputs) {
      await convertImage(input, width, quality);
    }
  }
}

/**
 * パターンに一致する画像群を変換
 */
async function convertByPattern(category, pattern, outputs) {
  console.log(`\n🐉 Converting ${category}...`);

  const files = await glob(pattern.replace(/\\/g, '/'));

  if (files.length === 0) {
    console.log(`⚠️  No files found matching ${pattern}`);
    return;
  }

  console.log(`Found ${files.length} files`);

  for (const file of files) {
    for (const { width, quality } of outputs) {
      await convertImage(file, width, quality);
    }
  }
}

/**
 * アクセスマップを変換
 */
async function convertAccessMap() {
  console.log('\n🗺️  Converting access map...');
  const { input, outputs } = config.accessMap;

  // Check if file exists
  try {
    await fs.access(input);
  } catch {
    console.log(`⚠️  File not found: ${input}`);
    return;
  }

  for (const { width, quality } of outputs) {
    await convertImage(input, width, quality);
  }
}

/**
 * カテゴリ別に変換
 */
async function convertByCategory(category) {
  switch (category) {
    case 'logo':
      await convertLogo();
      break;
    case 'backgrounds':
      await convertBackgrounds();
      break;
    case 'dragonIcons':
      await convertByPattern('dragon icons', config.dragonIcons.pattern, config.dragonIcons.outputs);
      break;
    case 'dragonFull':
      await convertByPattern('dragon full images', config.dragonFull.pattern, config.dragonFull.outputs);
      break;
    case 'flowers':
      await convertByPattern('flower images', config.flowers.pattern, config.flowers.outputs);
      break;
    case 'cards':
      await convertByPattern('card images', config.cards.pattern, config.cards.outputs);
      break;
    case 'accessMap':
      await convertAccessMap();
      break;
    default:
      console.error(`Unknown category: ${category}`);
      return false;
  }
  return true;
}

/**
 * 全ての画像を変換
 */
async function convertAll() {
  console.log('🚀 Starting image conversion...\n');
  console.log('This will convert all images to WebP format with responsive sizes.');
  console.log('Quality settings: logo 90%, backgrounds 85%, dragons 88-90%, flowers 85%\n');

  const startTime = Date.now();

  await convertLogo();
  await convertBackgrounds();
  await convertByPattern('dragon icons', config.dragonIcons.pattern, config.dragonIcons.outputs);
  await convertByPattern('dragon full images', config.dragonFull.pattern, config.dragonFull.outputs);
  await convertByPattern('flower images', config.flowers.pattern, config.flowers.outputs);
  await convertByPattern('card images', config.cards.pattern, config.cards.outputs);
  await convertAccessMap();

  const duration = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n✨ Conversion complete! Total time: ${duration}s`);
}

/**
 * メイン処理
 */
async function main() {
  const args = process.argv.slice(2);
  const categoryArg = args.find(arg => arg.startsWith('--category='));

  if (categoryArg) {
    const category = categoryArg.split('=')[1];
    console.log(`Converting category: ${category}\n`);
    await convertByCategory(category);
  } else if (args.includes('--all') || args.length === 0) {
    await convertAll();
  } else {
    console.log('Usage:');
    console.log('  node scripts/convert-images.js                  # Convert all images');
    console.log('  node scripts/convert-images.js --all            # Convert all images');
    console.log('  node scripts/convert-images.js --category=logo  # Convert specific category');
    console.log('\nAvailable categories:');
    console.log('  logo, backgrounds, dragonIcons, dragonFull, flowers, cards, accessMap');
    process.exit(1);
  }
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
