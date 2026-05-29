document.addEventListener('DOMContentLoaded', function () {

  // 1. Multi-Image Upload Preview
  const imageInput = document.getElementById('admin-image-input');
  const previewContainer = document.getElementById('admin-image-preview');

  if (imageInput && previewContainer) {
    imageInput.addEventListener('change', function () {
      previewContainer.innerHTML = ''; // Clear previous previews
      const files = this.files;

      if (files && files.length > 0) {
        Array.from(files).forEach((file, index) => {
          if (!file.type.startsWith('image/')) return;

          const reader = new FileReader();
          reader.onload = function (e) {
            const previewItem = document.createElement('div');
            previewItem.className = 'image-preview-item';
            
            const img = document.createElement('img');
            img.src = e.target.result;
            img.alt = file.name;
            
            previewItem.appendChild(img);

            // Add a badge on the first image indicating it's the main thumbnail
            if (index === 0) {
              const badge = document.createElement('span');
              badge.className = 'thumbnail-badge';
              badge.innerText = 'Primary';
              previewItem.appendChild(badge);
            }

            previewContainer.appendChild(previewItem);
          };
          reader.readAsDataURL(file);
        });
      }
    });
  }

  // 2. Delete confirmations
  const deleteForms = document.querySelectorAll('.delete-confirm-form');
  if (deleteForms.length > 0) {
    deleteForms.forEach(form => {
      form.addEventListener('submit', function (e) {
        const itemType = this.getAttribute('data-item-type') || 'item';
        if (!confirm(`Are you sure you want to delete this ${itemType}? This action cannot be undone.`)) {
          e.preventDefault();
        }
      });
    });
  }

});
