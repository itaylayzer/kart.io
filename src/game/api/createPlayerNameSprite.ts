import * as THREE from "three";

// Function to update the canvas with the player's name and background color
function updateCanvas(name: string, backgroundColor: string) {
    const fontSize = 100; // Increase font size for better resolution
    const paddingX = 100;
    const paddingY = 20;

    // Determine text width
    const tempCanvas = document.createElement("canvas");
    const tempContext = tempCanvas.getContext("2d")!;
    tempContext.font = `${fontSize}px Arial`;
    const textWidth = tempContext.measureText(name).width;

    // Define high-resolution canvas size
    const canvasWidth = textWidth + paddingX * 2;
    const canvasHeight = fontSize + paddingY * 2;

    // Create the actual canvas with high resolution
    const canvas = document.createElement("canvas");
    canvas.width = canvasWidth * 4; // Increase resolution (4x for sharpness)
    canvas.height = canvasHeight * 4;

    const context = canvas.getContext("2d")!;
    context.scale(4, 4); // Scale down to fit canvas size

    // Set background color
    context.fillStyle = backgroundColor;
    context.fillRect(0, 0, canvasWidth, canvasHeight);

    // Draw the player's name
    context.font = `${fontSize}px Signika`;
    context.fillStyle = "#ffffff"; // White text color
    context.textAlign = "center";
    context.textBaseline = "middle";

    context.fillText(name, canvasWidth / 2, canvasHeight / 2);

    return [canvas, canvasWidth, canvasHeight] as [
        HTMLCanvasElement,
        number,
        number
    ];
}

// Create a texture from the canvas
function createNameTexture(
    name: string,
    backgroundColor: string
): [THREE.CanvasTexture, number, number] {
    const [updatedCanvas, width, height] = updateCanvas(name, backgroundColor);
    const texture = new THREE.CanvasTexture(updatedCanvas);
    texture.anisotropy = 16; // Improve texture quality
    texture.needsUpdate = true;
    return [texture, width, height];
}

// Create the sprite
function createNameSprite(
    name: string,
    backgroundColor: string
): [THREE.Sprite, number, number] {
    const [texture, width, height] = createNameTexture(name, backgroundColor);
    const spriteMaterial = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
    });
    const sprite = new THREE.Sprite(spriteMaterial);

    sprite.scale.set(width / 100, height / 100, 1);

    return [sprite, width, height];
}

function createTagSprite(backgroundColor: string) {
    const canvas = document.createElement("canvas");
    canvas.width = 100;
    canvas.height = 100;

    // Get the 2D context
    const ctx = canvas.getContext("2d")!;

    // Draw a white triangle using the points (0, 0), (100, 0), (50, 100)
    ctx.fillStyle = backgroundColor;
    ctx.beginPath();
    ctx.moveTo(0, 0); // Move to the first point (0, 0)
    ctx.lineTo(100, 0); // Draw a line to (100, 0)
    ctx.lineTo(50, 100); // Draw a line to (50, 100)
    ctx.closePath(); // Close the path back to (0, 0)
    ctx.fill(); // Fill the triangle with white color

    // Convert the canvas to a texture
    const texture = new THREE.CanvasTexture(canvas);

    // Use the texture in a sprite or material
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.multiplyScalar(0.5);
    return sprite;
}

export default function (name: string, backgroundColor: string) {
    const group = new THREE.Group();

    const [nameTag, _1, _2] = createNameSprite(name, backgroundColor);
    group.add(nameTag);

    const tagSprite = createTagSprite(backgroundColor);
    tagSprite.position.y -= 0.8;
    tagSprite.scale.set(0.5, 0.4, 0.25);
    group.add(tagSprite);

    group.scale.multiplyScalar(0.05);
    return group;
}
