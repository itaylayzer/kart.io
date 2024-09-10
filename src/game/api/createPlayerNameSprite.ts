import * as THREE from "three";

// Function to update the canvas with the player's name and background color
function updateCanvas(name: string) {
    const fontSize = 200; // Increase font size for better resolution
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
    //   context.fillStyle = backgroundColor;
    //   context.fillRect(0, 0, canvasWidth, canvasHeight);

    // Draw the player's name
    context.font = `${fontSize}px "New Super Mario Font U"`;
    context.fillStyle = "white"; // White text color
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.lineWidth = 30;
    context.strokeStyle = "black";
    context.strokeText(name, canvasWidth / 2, canvasHeight / 2);
    //   context.fillStyle = "#ffffff"; // White text color

    context.fillText(name, canvasWidth / 2, canvasHeight / 2);

    return [canvas, canvasWidth, canvasHeight] as [
        HTMLCanvasElement,
        number,
        number
    ];
}

// Create a texture from the canvas
function createNameTexture(
    name: string
): [THREE.CanvasTexture, number, number] {
    const [updatedCanvas, width, height] = updateCanvas(name);
    const texture = new THREE.CanvasTexture(updatedCanvas);
    texture.anisotropy = 16; // Improve texture quality
    texture.needsUpdate = true;
    return [texture, width, height];
}

// Create the sprite
function createNameSprite(name: string): [THREE.Sprite, number, number] {
    const [texture, width, height] = createNameTexture(name);
    const spriteMaterial = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
    });
    const sprite = new THREE.Sprite(spriteMaterial);

    sprite.scale.set(width / 100, height / 100, 1);

    return [sprite, width, height];
}

export default function (name: string) {
    const group = new THREE.Group();

    const [nameTag, _1, _2] = createNameSprite(name);
    group.add(nameTag);

    //   const tagSprite = createTagSprite("black");
    //   tagSprite.position.y -= 1.25;
    //   tagSprite.scale.set(0.5, 0.4, 0.25);
    //   group.add(tagSprite);

    group.scale.multiplyScalar(0.05);
    return group;
}
