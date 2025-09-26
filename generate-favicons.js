const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// 確保 public 目錄存在
const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
}

// 讀取 SVG 文件
const svgBuffer = fs.readFileSync(path.join(publicDir, 'favicon.svg'));

// 定義需要生成的 favicon 尺寸
const sizes = [
    { size: 16, name: 'favicon-16x16.png' },
    { size: 32, name: 'favicon-32x32.png' },
    { size: 180, name: 'apple-touch-icon.png' },
    { size: 192, name: 'android-chrome-192x192.png' },
    { size: 512, name: 'android-chrome-512x512.png' }
];

// 生成所有尺寸的 PNG favicon
async function generateFavicons() {
    console.log('🍅 開始生成 favicon...');

    for (const { size, name } of sizes) {
        try {
            await sharp(svgBuffer)
                .resize(size, size)
                .png()
                .toFile(path.join(publicDir, name));

            console.log(`✅ 生成 ${name} (${size}x${size})`);
        } catch (error) {
            console.error(`❌ 生成 ${name} 失敗:`, error.message);
        }
    }

    // 生成標準的 favicon.ico (16x16)
    try {
        await sharp(svgBuffer)
            .resize(16, 16)
            .png()
            .toFile(path.join(publicDir, 'favicon.png'));

        console.log('✅ 生成 favicon.png (16x16)');
    } catch (error) {
        console.error('❌ 生成 favicon.png 失敗:', error.message);
    }

    console.log('🎉 所有 favicon 生成完成！');

    // 列出生成的文件
    console.log('\n📁 生成的文件:');
    const files = fs.readdirSync(publicDir).filter(file =>
        file.endsWith('.png') || file.endsWith('.svg')
    );
    files.forEach(file => {
        const filePath = path.join(publicDir, file);
        const stats = fs.statSync(filePath);
        console.log(`   ${file} (${Math.round(stats.size / 1024 * 100) / 100} KB)`);
    });
}

generateFavicons().catch(console.error);