const canvas = document.querySelector("canvas#art");
const ctx = canvas.getContext("2d");
ctx.fillStyle = "green";
// Add a rectangle at (10, 10) with size 100x100 pixels
ctx.fillRect(0, 0, canvas.width, canvas.height);