// script.js

const lengthInput = document.getElementById('length');
const widthInput = document.getElementById('width');
const thicknessInput = document.getElementById('thickness');
const previewImg = document.getElementById('preview-img');
const generateBtn = document.getElementById('generate');

// Default preview
const defaultPreview = 'images/default-lbracket.jpg';
previewImg.src = defaultPreview;

function updatePreview() {
  const l = parseFloat(lengthInput.value) || 100;
  const w = parseFloat(widthInput.value) || 50;
  const t = parseFloat(thicknessInput.value) || 3;

  // Simple thickness-based image swap (add more images as needed)
  if (t <= 2) previewImg.src = 'images/thin-lbracket.jpg' || defaultPreview;
  else if (t <= 5) previewImg.src = 'images/medium-lbracket.jpg' || defaultPreview;
  else previewImg.src = 'images/thick-lbracket.jpg' || defaultPreview;

  // Optional: add text overlay (requires canvas for real overlay, here just console)
  console.log(`Preview updated: ${l} × ${w} × ${t} mm`);
}

function validateInputs() {
  const l = parseFloat(lengthInput.value);
  const w = parseFloat(widthInput.value);
  const t = parseFloat(thicknessInput.value);

  if (!l || l < 50 || l > 1000) return 'Length must be 50–1000 mm';
  if (!w || w < 30 || w > 500) return 'Width must be 30–500 mm';
  if (!t || t < 1 || t > 10) return 'Thickness must be 1–10 mm';
  return null;
}

// Input listeners
[lengthInput, widthInput, thicknessInput].forEach(input => {
  input.addEventListener('input', updatePreview);
});

// Generate button
generateBtn.addEventListener('click', async () => {
  const error = validateInputs();
  if (error) {
    alert(error);
    return;
  }

  generateBtn.disabled = true;
  generateBtn.textContent = 'Processing...';

  const l = lengthInput.value;
  const w = widthInput.value;
  const t = thicknessInput.value;

  try {
    // Option A: redirect to payment with params
    const params = new URLSearchParams({ length: l, width: w, thickness: t });
    window.location.href = `https://your-stripe-checkout-link.com?${params}`;

    // Option B: call your backend API (uncomment if using API)
    /*
    const res = await fetch(`/api/generate?length=${l}&width=${w}&thickness=${t}`);
    if (!res.ok) throw new Error('Generation failed');
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `L-Bracket_${l}x${w}x${t}.dxf`;
    a.click();
    URL.revokeObjectURL(url);
    */
  } catch (err) {
    alert('Error: ' + err.message);
  } finally {
    generateBtn.disabled = false;
    generateBtn.textContent = 'Generate DXF & Pay $3.90';
  }
});

// Initial preview
updatePreview();
