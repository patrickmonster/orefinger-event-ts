import { Image, CanvasRenderingContext2D, createCanvas } from 'canvas';

export const drawImageWithRadius = (
    ctx: CanvasRenderingContext2D,
    image: Image,
    x: number,
    y: number,
    width = image.width,
    height = image.height,
    radius = width / 2,
    drowLine = true
) => {
    console.log('IMG]drawImageWithRadius', image, x, y, width, height, radius);

    trance(ctx, () => {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;

        ctx.arc(x + radius, y + radius, radius, 0, Math.PI * 2, true);
        if (drowLine) ctx.stroke();
        ctx.clip();
        ctx.drawImage(image, x, y, width, height);
    });
};

export const bluerSpace = (ctx: CanvasRenderingContext2D, image: Image, x: number, y: number, width: number, height: number, blur = 2) => {
    console.log('IMG]bluerSpace', x, y, width, height);

    trance(ctx, () => {
        let sum = 0;
        let delta = 5;
        let alpha_left = 1 / (2 * Math.PI * delta * delta);
        let step = blur < 3 ? 1 : 2;
        for (let y = -blur; y <= blur; y += step) {
            for (let x = -blur; x <= blur; x += step) {
                let weight = alpha_left * Math.exp(-(x * x + y * y) / (2 * delta * delta));
                sum += weight;
            }
        }

        for (let y = -blur; y <= blur; y += step) {
            for (let x = -blur; x <= blur; x += step) {
                ctx.globalAlpha = ((alpha_left * Math.exp(-(x * x + y * y) / (2 * delta * delta))) / sum) * blur;
                ctx.drawImage(image, x, y, width, height);
            }
        }
    });
};

export const drawFullColor = (
    ctx: CanvasRenderingContext2D,
    image: Image,
    color: string,
    x: number,
    y: number,
    width = image.width,
    height = image.height,
    radius?: number
) => {
    console.log('IMG]drawFullColor', image, color, x, y, width, height);
    const tmpCtx = createCanvas(image.width, image.height).getContext('2d');
    if (radius) {
        drawImageWithRadius(tmpCtx, image, 0, 0, image.width, image.height, image.width / 2, false);
    } else tmpCtx.drawImage(image, 0, 0);

    const red = parseInt(color.substring(1, 3), 16);
    const green = parseInt(color.substring(3, 5), 16);
    const blue = parseInt(color.substring(5, 7), 16);

    const imageData = tmpCtx.getImageData(0, 0, image.width, image.height);
    const pixels = imageData.data;

    for (let i = 0, n = pixels.length; i < n; i += 4) {
        pixels[i] = red;
        pixels[i + 1] = green;
        pixels[i + 2] = blue;
    }

    tmpCtx.putImageData(imageData, 0, 0);

    trance(ctx, () => {
        ctx.drawImage(tmpCtx.canvas, x, y, width, height);
    });
};

export const trance = (ctx: CanvasRenderingContext2D, func = () => {}) => {
    console.log('IMG]trance');
    ctx.save();
    func();
    ctx.restore();
};

export const loadImage = (src: string): Promise<Image> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
    });
};

export const getImageData = (image: Image) => {
    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0);
    return ctx.getImageData(0, 0, image.width, image.height);
};

export const getImageDataToHSV = (data: ImageData) => {
    const hsvData = [];
    for (let i = 0; i < data.data.length; i += 4) {
        const r = data.data[i];
        const g = data.data[i + 1];
        const b = data.data[i + 2];
        const a = data.data[i + 3];
        const hsv = RGBToHSB(r, g, b);
        hsvData.push(hsv);
    }
    return hsvData;
};

export const RGBToHSB = (r: number, g: number, b: number) => {
    r /= 255;
    g /= 255;
    b /= 255;
    const v = Math.max(r, g, b),
        n = v - Math.min(r, g, b);
    const h = n === 0 ? 0 : n && v === r ? (g - b) / n : v === g ? 2 + (b - r) / n : 4 + (r - g) / n;
    return [60 * (h < 0 ? h + 6 : h), v && (n / v) * 100, v * 100];
};
