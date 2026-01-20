// script.js

// Get elements
const lengthInput = document.getElementById('length');
const widthInput = document.getElementById('width');
const thicknessInput = document.getElementById('thickness');
const previewImg = document.getElementById('preview-img');
const generateBtn = document.getElementById('generate');

// Optional: array of preview images based on thickness (expand as needed)
const previewImages = {
  1: 'images/thin-lbracket.jpg',
  3: 'images/medium-lbracket.jpg',
  5: 'images/thick-lbracket.jpg'
  // Add more
};

// Update preview when inputs change
function updatePreview() {
  const thickness = parseInt(thicknessInput.value) || 3;
  
  // Change image based on thickness (simple example)
  if (previewImages[thickness]) {
    previewImg.src = previewImages[thickness];
  } else {
    previewImg.src = 'images/default-lbracket.jpg';
  }

  // Optional: display current dimensions
  console.log(`Dimensions: ${lengthInput.value} x ${widthInput.value} x ${thickness} mm`);
}

// Attach event listeners
[lengthInput, widthInput, thicknessInput].forEach(input => {
  input.addEventListener('input', updatePreview);
});

// Generate & pay button
generateBtn.addEventListener('click', () => {
  const length = lengthInput.value;
  const width = widthInput.value;
  const thickness = thicknessInput.value;

  if (!length || !width || !thickness) {
    alert('Please fill all dimensions');
    return;
  }

  // Example: redirect to payment with params (or call your API)
  const params = new URLSearchParams({
    length: length,
    width: width,
    thickness: thickness
  });

  // Replace with your real payment URL or Stripe redirect
  window.location.href = `https://your-payment-page.com?${params.toString()}`;
  // Or fetch('/api/generate', { method: 'POST', body: JSON.stringify({length, width, thickness}) })
});

// Initial update
updatePreview();
