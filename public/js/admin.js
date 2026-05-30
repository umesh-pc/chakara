document.addEventListener('DOMContentLoaded', function () {



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
