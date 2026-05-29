document.addEventListener('DOMContentLoaded', function () {
  
  // 1. Page Loader
  const loader = document.getElementById('page-loader');
  if (loader) {
    window.addEventListener('load', function () {
      setTimeout(() => {
        loader.style.opacity = '0';
        setTimeout(() => {
          loader.style.display = 'none';
        }, 500);
      }, 300);
    });
  }

  // 2. Fade-in Scroll Animations
  const faders = document.querySelectorAll('.fade-in-section');
  if (faders.length > 0) {
    const appearOptions = {
      threshold: 0.15,
      rootMargin: "0px 0px -50px 0px"
    };

    const appearOnScroll = new IntersectionObserver(function (entries, appearOnScroll) {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        appearOnScroll.unobserve(entry.target);
      });
    }, appearOptions);

    faders.forEach(fader => {
      appearOnScroll.observe(fader);
    });
  }

  // 3. Product Details Page: Image Thumbnail Switcher
  const mainProductImg = document.getElementById('main-product-img');
  const thumbnails = document.querySelectorAll('.detail-img-thumbnail');
  
  if (mainProductImg && thumbnails.length > 0) {
    thumbnails.forEach(thumb => {
      thumb.addEventListener('click', function () {
        // Remove active class from all thumbnails
        thumbnails.forEach(t => t.classList.remove('active'));
        
        // Add active class to clicked thumbnail
        this.classList.add('active');
        
        // Switch main image source
        const newSrc = this.getAttribute('data-image');
        mainProductImg.setAttribute('src', newSrc);
      });
    });
  }

  // 4. Custom Gallery Lightbox
  const lightbox = document.getElementById('gallery-lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const galleryLinks = document.querySelectorAll('.gallery-lightbox-trigger');

  if (lightbox && lightboxImg && galleryLinks.length > 0) {
    galleryLinks.forEach(trigger => {
      trigger.addEventListener('click', function (e) {
        e.preventDefault();
        const imgPath = this.getAttribute('data-image');
        const title = this.getAttribute('data-title') || '';
        const desc = this.getAttribute('data-description') || '';
        
        lightboxImg.src = imgPath;
        lightboxCaption.innerHTML = `<h4>${title}</h4><p class="text-white-50">${desc}</p>`;
        
        lightbox.style.display = 'block';
        document.body.style.overflow = 'hidden'; // Disable scroll
      });
    });

    const closeBtn = document.querySelector('.lightbox-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', closeLightbox);
    }

    // Close lightbox on click outside the image
    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox || e.target.classList.contains('container') || e.target.closest('.lightbox-content') === null && e.target !== lightboxImg) {
        closeLightbox();
      }
    });

    // Close lightbox on Escape key
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        closeLightbox();
      }
    });
  }

  function closeLightbox() {
    if (lightbox) {
      lightbox.style.display = 'none';
      document.body.style.overflow = 'auto'; // Enable scroll
    }
  }

  // 5. Before/After Image Comparison Slider
  const sliders = document.querySelectorAll('[data-ba-slider]');
  sliders.forEach(slider => {
    const beforeWrapper = slider.querySelector('[data-ba-before-wrapper]');
    const handle = slider.querySelector('[data-ba-handle]');
    
    if (!beforeWrapper || !handle) return;

    let isDragging = false;

    // Move slider to specified percentage
    function moveSlider(percentage) {
      const clamped = Math.max(0, Math.min(100, percentage));
      beforeWrapper.style.width = `${clamped}%`;
      handle.style.left = `${clamped}%`;
    }

    // Calculate slider percentage from x coordinate
    function calcPercentage(clientX) {
      const rect = slider.getBoundingClientRect();
      const positionX = clientX - rect.left;
      return (positionX / rect.width) * 100;
    }

    // Mouse events
    handle.addEventListener('mousedown', (e) => {
      e.preventDefault();
      isDragging = true;
      slider.classList.add('dragging');
    });

    window.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        slider.classList.remove('dragging');
      }
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const percentage = calcPercentage(e.clientX);
      moveSlider(percentage);
    });

    // Touch events for mobile responsiveness
    handle.addEventListener('touchstart', (e) => {
      isDragging = true;
      slider.classList.add('dragging');
    });

    window.addEventListener('touchend', () => {
      if (isDragging) {
        isDragging = false;
        slider.classList.remove('dragging');
      }
    });

    window.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      if (e.touches && e.touches[0]) {
        const percentage = calcPercentage(e.touches[0].clientX);
        moveSlider(percentage);
      }
    });

    // Click on slider to move it immediately
    slider.addEventListener('click', (e) => {
      if (e.target.closest('[data-ba-handle]')) return;
      const percentage = calcPercentage(e.clientX);
      moveSlider(percentage);
    });
  });

});
