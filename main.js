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

    // Initialize Page Views Counter System
    initPageViewsCounter();
});

/**
 * Page Views Counter & Metrics Manager
 */
function initPageViewsCounter() {
    const STORAGE_KEY_VIEWS = 'santinho_total_page_views_v2';
    const STORAGE_KEY_SESSION = 'santinho_session_active_v2';
    const BASE_INITIAL_VIEWS = 0; // Zerado para iniciar a contagem a partir de hoje

    // Limpar chaves antigas de contadores prévios
    localStorage.removeItem('santinho_total_page_views');
    sessionStorage.removeItem('santinho_session_active');

    // Elements
    const headerCountElem = document.getElementById('visit-count');
    const footerCountElem = document.getElementById('footer-visit-count');
    const modalTotalViewsElem = document.getElementById('modal-total-views');
    const modalSessionViewsElem = document.getElementById('modal-session-views');
    const modalOverlay = document.getElementById('views-modal');
    const modalCloseBtn = document.getElementById('views-modal-close');
    const viewsBadgeBtn = document.getElementById('views-badge');
    const footerViewsBtn = document.getElementById('footer-views-btn');

    // 1. Obter total armazenado localmente
    let savedViews = localStorage.getItem(STORAGE_KEY_VIEWS);
    let totalViews = savedViews ? parseInt(savedViews, 10) : BASE_INITIAL_VIEWS;
    
    // Obter acessos da sessão atual
    let sessionCount = sessionStorage.getItem('santinho_session_page_count');
    let sessionViews = sessionCount ? parseInt(sessionCount, 10) : 0;
    sessionViews++;
    sessionStorage.setItem('santinho_session_page_count', sessionViews);

    // 2. Incrementar visualizações caso seja uma nova sessão de navegação
    const isNewSession = !sessionStorage.getItem(STORAGE_KEY_SESSION);
    if (isNewSession) {
        sessionStorage.setItem(STORAGE_KEY_SESSION, 'true');
        totalViews += 1;
        localStorage.setItem(STORAGE_KEY_VIEWS, totalViews);
    } else {
        localStorage.setItem(STORAGE_KEY_VIEWS, totalViews);
    }

    // 3. Tentar sincronização remota com Supabase (API Global) com fallback gracioso
    syncWithSupabaseCounter(isNewSession, totalViews).then(remoteViews => {
        if (remoteViews && remoteViews > 0) {
            totalViews = remoteViews;
            localStorage.setItem(STORAGE_KEY_VIEWS, totalViews);
            updateDisplays(totalViews);
        }
    }).catch(err => {
        console.log('Contador operando em modo local/fallback.');
    });

    // 4. Animar os números no DOM
    function updateDisplays(finalValue) {
        const formattedStr = finalValue.toLocaleString('pt-BR');
        
        if (headerCountElem) animateCounter(headerCountElem, 0, finalValue, 1500);
        if (footerCountElem) animateCounter(footerCountElem, 0, finalValue, 1500);
        if (modalTotalViewsElem) modalTotalViewsElem.textContent = formattedStr;
    }

    updateDisplays(totalViews);

    // 5. Animação suave Odometer para o contador
    function animateCounter(element, start, end, duration) {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            // Easing de desaceleração (easeOutExpo)
            const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
            const currentVal = Math.floor(easeProgress * (end - start) + start);
            element.textContent = currentVal.toLocaleString('pt-BR');
            if (progress < 1) {
                window.requestAnimationFrame(step);
            } else {
                element.textContent = end.toLocaleString('pt-BR');
            }
        };
        window.requestAnimationFrame(step);
    }

    // 6. Manipulação do Modal de Estatísticas
    function openModal() {
        if (modalTotalViewsElem) modalTotalViewsElem.textContent = totalViews.toLocaleString('pt-BR');
        if (modalOverlay) modalOverlay.classList.add('active');
    }

    function closeModal() {
        if (modalOverlay) modalOverlay.classList.remove('active');
    }

    if (viewsBadgeBtn) viewsBadgeBtn.addEventListener('click', openModal);
    if (footerViewsBtn) footerViewsBtn.addEventListener('click', openModal);
    if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
    
    if (modalOverlay) {
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) closeModal();
        });
    }

    // Tecla ESC para fechar modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modalOverlay && modalOverlay.classList.contains('active')) {
            closeModal();
        }
    });
}

/**
 * Sincroniza o contador atômico global no Supabase Database
 * Endpoint Supabase: https://lueblrcuerycimfpcvba.supabase.co
 */
async function syncWithSupabaseCounter(shouldIncrement, localViewsFallback) {
    const SUPABASE_URL = 'https://lueblrcuerycimfpcvba.supabase.co';
    // Chave anon pública (configurada no window.SUPABASE_ANON_KEY ou fallback público)
    const SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1ZWJscmN1ZXJ5Y2ltZnBjdmJhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDAwMDAwMDAsImV4cCI6MjAxNTAwMDAwMH0.public_key_placeholder';
    const PAGE_ID = 'santinho_landingpage';

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000); // 4s timeout

        const headers = {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        };

        let response;
        if (shouldIncrement) {
            // Incrementar via RPC Supabase
            response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/increment_page_view`, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({ page_id: PAGE_ID }),
                signal: controller.signal
            });
        } else {
            // Apenas consultar a contagem global atual
            response = await fetch(`${SUPABASE_URL}/rest/v1/page_views?id=eq.${PAGE_ID}&select=count`, {
                method: 'GET',
                headers: headers,
                signal: controller.signal
            });
        }
        clearTimeout(timeoutId);

        if (response.ok) {
            const data = await response.json();
            if (typeof data === 'number') {
                return data; // Retorno do RPC (bigint)
            } else if (Array.isArray(data) && data.length > 0 && typeof data[0].count === 'number') {
                return data[0].count; // Retorno da consulta SELECT
            }
        }
    } catch (e) {
        // Fallback silencioso para contagem local se Supabase não responder
    }
    return localViewsFallback;
}
