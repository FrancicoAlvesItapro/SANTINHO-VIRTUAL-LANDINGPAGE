// Santinho Virtual Landing Page Interactions

document.addEventListener('DOMContentLoaded', () => {
    const header = document.querySelector('.header');
    
    // Toggle header styling on scroll
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Add button click feedback micro-animation
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('click', (e) => {
            // Ripple or feedback effect could be added here in future iterations
            // For now, simple console log for tracking
            console.log(`Button clicked: ${button.textContent.trim()}`);
        });
    });

    // Video overlay control (Desktop 16:9)
    const videoOverlay = document.getElementById('video-overlay');
    const desktopVideo = document.getElementById('desktop-video');
    
    if (videoOverlay && desktopVideo) {
        videoOverlay.addEventListener('click', () => {
            desktopVideo.setAttribute('controls', 'true');
            desktopVideo.play();
            videoOverlay.classList.add('fade-out');
            
            // Remove from layout after fade out completes
            setTimeout(() => {
                videoOverlay.style.display = 'none';
            }, 500);
        });
    }
});
