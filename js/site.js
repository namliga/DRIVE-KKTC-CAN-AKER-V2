(() => {
    "use strict";

    const reducedMotionQuery = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    );

    /**
     * Görünürlük animasyonlarını başlatır.
     * Yalnızca opacity ve transform kullanan .reveal öğelerini yönetir.
     */
    function initialiseRevealAnimations() {
        const revealElements = document.querySelectorAll(".reveal");

        if (!revealElements.length) {
            return;
        }

        if (
            reducedMotionQuery.matches ||
            !("IntersectionObserver" in window)
        ) {
            revealElements.forEach((element) => {
                element.classList.add("is-visible");
            });

            return;
        }

        const observer = new IntersectionObserver(
            (entries, currentObserver) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) {
                        return;
                    }

                    entry.target.classList.add("is-visible");
                    currentObserver.unobserve(entry.target);
                });
            },
            {
                root: null,
                rootMargin: "0px 0px -8% 0px",
                threshold: 0.12
            }
        );

        revealElements.forEach((element) => {
            observer.observe(element);
        });
    }

    /**
     * Sayfadaki iç bağlantılarda kontrollü kaydırma sağlar.
     */
    function initialiseAnchorLinks() {
        const anchorLinks = document.querySelectorAll(
            'a[href^="#"]:not([href="#"])'
        );

        anchorLinks.forEach((link) => {
            link.addEventListener("click", (event) => {
                const targetSelector = link.getAttribute("href");

                if (!targetSelector) {
                    return;
                }

                const target = document.querySelector(targetSelector);

                if (!target) {
                    return;
                }

                event.preventDefault();

                target.scrollIntoView({
                    behavior: reducedMotionQuery.matches
                        ? "auto"
                        : "smooth",
                    block: "start"
                });
            });
        });
    }

    /**
     * URL'yi panoya kopyalar.
     */
    async function copyCurrentUrl() {
        const currentUrl = window.location.href;

        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(currentUrl);
            return;
        }

        const temporaryInput = document.createElement("textarea");

        temporaryInput.value = currentUrl;
        temporaryInput.setAttribute("readonly", "");
        temporaryInput.style.position = "fixed";
        temporaryInput.style.opacity = "0";
        temporaryInput.style.pointerEvents = "none";

        document.body.appendChild(temporaryInput);
        temporaryInput.select();

        const copied = document.execCommand("copy");

        temporaryInput.remove();

        if (!copied) {
            throw new Error("The page link could not be copied.");
        }
    }

    /**
     * Buton metnini kısa süreliğine değiştirir.
     */
    function showTemporaryButtonText(button, message) {
        const originalText = button.textContent;

        button.textContent = message;
        button.disabled = true;

        window.setTimeout(() => {
            button.textContent = originalText;
            button.disabled = false;
        }, 1800);
    }

    /**
     * Kopyalama butonlarını etkinleştirir.
     *
     * Örnek:
     * <button
     *   data-copy-link
     *   data-success-text="Link copied">
     *   Copy link
     * </button>
     */
    function initialiseCopyButtons() {
        const copyButtons = document.querySelectorAll("[data-copy-link]");

        copyButtons.forEach((button) => {
            button.addEventListener("click", async () => {
                try {
                    await copyCurrentUrl();

                    const successText =
                        button.dataset.successText || "Link copied";

                    showTemporaryButtonText(button, successText);
                } catch (error) {
                    console.error(error);

                    const errorText =
                        button.dataset.errorText || "Copy failed";

                    showTemporaryButtonText(button, errorText);
                }
            });
        });
    }

    /**
     * Cihaz destekliyorsa yerel paylaşım penceresini açar.
     *
     * Örnek:
     * <button
     *   data-share-page
     *   data-share-title="Drive KKTC">
     *   Share route
     * </button>
     */
    function initialiseShareButtons() {
        const shareButtons = document.querySelectorAll("[data-share-page]");

        shareButtons.forEach((button) => {
            button.addEventListener("click", async () => {
                const shareData = {
                    title:
                        button.dataset.shareTitle ||
                        document.title,
                    text:
                        button.dataset.shareText ||
                        document
                            .querySelector('meta[name="description"]')
                            ?.getAttribute("content") ||
                        "",
                    url: window.location.href
                };

                if (navigator.share) {
                    try {
                        await navigator.share(shareData);
                    } catch (error) {
                        if (error.name !== "AbortError") {
                            console.error(error);
                        }
                    }

                    return;
                }

                try {
                    await copyCurrentUrl();

                    const successText =
                        button.dataset.successText ||
                        "Link copied";

                    showTemporaryButtonText(button, successText);
                } catch (error) {
                    console.error(error);
                }
            });
        });
    }

    /**
     * Görsellerin tarayıcı tarafından daha verimli çözülmesine yardımcı olur.
     */
    function initialiseImageDefaults() {
        const images = document.querySelectorAll("img");

        images.forEach((image, index) => {
            if (!image.hasAttribute("decoding")) {
                image.setAttribute("decoding", "async");
            }

            if (
                index > 0 &&
                !image.hasAttribute("loading")
            ) {
                image.setAttribute("loading", "lazy");
            }
        });
    }

    function initialiseRevealDelays() {
        const groups = document.querySelectorAll(
            ".feature-grid, .route-grid, .stops-list, .practical-grid"
        );

        groups.forEach((group) => {
            const revealElements = group.querySelectorAll(".reveal");

            revealElements.forEach((element, index) => {
                const delay = Math.min(index * 130, 520);

                element.style.transitionDelay = `${delay}ms`;
            });
        });
    }

    document.addEventListener("DOMContentLoaded", () => {
        initialiseRevealDelays();
        initialiseRevealAnimations();
        initialiseAnchorLinks();
        initialiseCopyButtons();
        initialiseShareButtons();
        initialiseImageDefaults();
    });
})();