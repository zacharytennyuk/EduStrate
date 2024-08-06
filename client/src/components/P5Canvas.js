import React, { useRef, useEffect } from 'react';
import p5 from 'p5';

const P5Canvas = ({ imageUrl, summary, quadrant, characterImageUrl }) => {
  const sketchRef = useRef();

  useEffect(() => {
    const sketch = (p) => {
      let img;
      let characterImg;

      p.preload = () => {
        img = p.loadImage(imageUrl);
        characterImg = p.loadImage(characterImageUrl); // Load character image
      };

      p.setup = () => {
        p.createCanvas(1024, 1024);
      };

      p.draw = () => {
        p.background(255);

        // Calculate the coordinates for the selected quadrant
        const quadrantCoords = {
          1: { x: 0, y: 0 },
          2: { x: 1024, y: 0 },
          3: { x: 0, y: 1024 },
          4: { x: 1024, y: 1024 }
        };

        const { x, y } = quadrantCoords[quadrant] || { x: 0, y: 0 };

        // Draw the selected quadrant of the image
        p.image(img, 0, 0, p.width, p.height, x, y, 1024, 1024);

        // Draw the character image
        const characterWidth = 1024;
        const characterHeight = 1024;
        const characterX = (p.width - characterWidth) / 2; // Centered horizontally
        const characterY = (p.height - characterHeight) / 2; // Centered vertically
        p.image(characterImg, characterX, characterY, characterWidth, characterHeight);

        // Define the bubble dimensions and position
        const bubbleWidth = p.width * 0.8;
        const bubbleX = (p.width - bubbleWidth) / 2;
        const textSize = 16;

        // Set text properties
        p.textSize(textSize);
        p.textAlign(p.LEFT, p.TOP);
        p.fill(0);
        p.noStroke();

        // Calculate wrapped text height
        const words = summary.split(' ');
        const lineHeight = textSize * 1.5;  // Increase line height to ensure enough space between lines
        const lines = [];
        let currentLine = '';

        for (let i = 0; i < words.length; i++) {
          const testLine = currentLine + words[i] + ' ';
          if (p.textWidth(testLine) > bubbleWidth - 40) {
            lines.push(currentLine);
            currentLine = words[i] + ' ';
          } else {
            currentLine = testLine;
          }
        }
        lines.push(currentLine);

        const wrappedTextHeight = lines.length * lineHeight;

        // Adjust bubble height based on text height
        const bubbleHeight = wrappedTextHeight + 40; // Add padding

        // Position the bubble at the bottom of the canvas
        const bubbleY = p.height - bubbleHeight - 20;

        // Draw the bubble
        p.fill(255);
        p.stroke(0);
        p.strokeWeight(2);
        p.rect(bubbleX, bubbleY, bubbleWidth, bubbleHeight, 20);

        // Draw the text
        p.fill(0);
        p.noStroke();
        let textY = bubbleY + 20;
        lines.forEach((line) => {
          p.text(line, bubbleX + 20, textY);
          textY += lineHeight;
        });
      };
    };

    const p5Instance = new p5(sketch, sketchRef.current);
    return () => {
      p5Instance.remove();
    };
  }, [imageUrl, summary, quadrant, characterImageUrl]);

  return <div ref={sketchRef}></div>;
};

export default P5Canvas;