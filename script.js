let cropper;
const imageElement = document.getElementById('image');
const resolutionText = document.getElementById('resolution');
const aspectRatioSelect = document.getElementById('aspect-ratio-select');

document.getElementById('file-upload').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(event) {
      imageElement.src = event.target.result;
      if (cropper) cropper.destroy();
      cropper = new Cropper(imageElement, {
        aspectRatio: 1, // Начальное соотношение сторон 1:1
        viewMode: 1,
        responsive: true,
        autoCropArea: 1,
        cropBoxResizable: true,
        ready() {
          updateResolution();
        }
      });
    };
    reader.readAsDataURL(file);
  }
});

aspectRatioSelect.addEventListener('change', () => {
  const ratio = aspectRatioSelect.value.split(':');
  const width = parseFloat(ratio[0]);
  const height = parseFloat(ratio[1]);
  
  if (cropper) {
    cropper.setAspectRatio(width / height);
    updateResolution();
  }
});

function updateResolution() {
  if (cropper) {
    const canvas = cropper.getCroppedCanvas();
    const width = canvas.width;
    const height = canvas.height;
    resolutionText.textContent = `Разрешение: ${width} x ${height}`;
  }
}

function downloadImage() {
  if (cropper) {
    const canvas = cropper.getCroppedCanvas();
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = 'cropped-image.png';
    link.click();
  }
}
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/service-worker.js')
        .then((registration) => {
          console.log('Сервис-воркер зарегистрирован: ', registration);
        })
        .catch((error) => {
          console.log('Ошибка при регистрации сервис-воркера: ', error);
        });
    });
  }