        let cropper;
        let currentAspectRatio = 2.35;

        // Инициализация Cropper
        function initCropper() {
            if (cropper) cropper.destroy();
            
            cropper = new Cropper(document.getElementById('imagePreview'), {
                aspectRatio: currentAspectRatio,
                viewMode: 1,
                responsive: true,
                autoCropArea: 1,
                movable: false,
                zoomable: false,
                scalable: false,
                cropBoxResizable: true
            });
        }

        // Обработчик выбора соотношения сторон
        document.querySelectorAll('.aspect-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                document.querySelectorAll('.aspect-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                
                const ratioText = this.getAttribute('data-ratio');
                currentAspectRatio = eval(ratioText);
                
                if (document.getElementById('imagePreview').src) {
                    initCropper();
                }
            });
        });

        // Переключение видимости качества при смене формата
        document.getElementById('formatSelect').addEventListener('change', function() {
            const qualityGroup = document.querySelector('.quality-group');
            qualityGroup.style.display = this.value === 'jpeg' ? 'block' : 'none';
        });

        // Обновление отображения качества
        document.getElementById('qualityRange').addEventListener('input', function() {
            const value = parseFloat(this.value).toFixed(1);
            document.getElementById('qualityValue').textContent = `${Math.round(value * 100)}%`;
        });

        // Показать/скрыть поле для водяного знака
        document.getElementById('watermarkCheckbox').addEventListener('change', function() {
            const watermarkInput = document.querySelector('.watermark-input');
            watermarkInput.classList.toggle('d-none', !this.checked);
        });

        // Загрузка изображения
        document.getElementById('imageInput').addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = function(event) {
                const preview = document.getElementById('imagePreview');
                preview.src = event.target.result;

                if (cropper) cropper.destroy();
                initCropper();

                document.querySelector('.preview-container').classList.remove('d-none');
                document.getElementById('cropButton').disabled = false;
            };
            reader.readAsDataURL(file);
        });

        // Кадрирование
        document.getElementById('cropButton').addEventListener('click', function() {
            const cropData = cropper.getData(true);
            const format = document.getElementById('formatSelect').value;
            const quality = parseFloat(document.getElementById('qualityRange').value);
            const addWatermark = document.getElementById('watermarkCheckbox').checked;
            const watermarkText = document.getElementById('watermarkText').value.trim();

            // Создаем canvas с точными размерами
            const canvas = cropper.getCroppedCanvas({
                width: cropData.width,
                height: cropData.height,
                fillColor: format === 'png' ? null : '#fff'
            });

            // Добавляем водяной знак, если он включен
            if (addWatermark && watermarkText) {
                const ctx = canvas.getContext('2d');
                ctx.font = '20px Arial';
                ctx.fillStyle = getComputedStyle(document.documentElement)
                    .getPropertyValue('--bs-body-color') || '#000';
                ctx.textAlign = 'left';
                ctx.textBaseline = 'bottom';
                ctx.fillText(watermarkText, 10, canvas.height - 10);
            }

            // Определяем MIME-тип
            const mimeType = `image/${format}`;
            
            // Генерируем Blob
            canvas.toBlob(blob => {
                const url = URL.createObjectURL(blob);
                const filename = `cropped-image.${format}`;
                
                // Обновляем результат
                document.getElementById('croppedImage').src = url;
                document.getElementById('downloadLink').href = url;
                document.getElementById('downloadLink').download = filename;

                // Активируем вкладку результата
                const resultTab = document.getElementById('result-tab');
                resultTab.removeAttribute('disabled');
                new bootstrap.Tab(resultTab).show();
            }, mimeType, format === 'jpeg' ? Math.max(0, Math.min(1, quality)) : undefined);
        });

        // Переключатель темы
        document.getElementById('themeSwitch').addEventListener('change', function() {
            document.body.classList.toggle('dark-theme');
            localStorage.setItem('theme', this.checked ? 'dark' : 'light');
            if (cropper) cropper.destroy();
            initCropper();
        });

        // Загрузка сохраненной темы
        (function() {
            const savedTheme = localStorage.getItem('theme');
            if (savedTheme === 'dark') {
                document.body.classList.add('dark-theme');
                document.getElementById('themeSwitch').checked = true;
            }
            if (document.getElementById('imagePreview').src) {
                initCropper();
            }
        })();
 