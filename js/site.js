(() => {
    "use strict";

    const reducedMotionQuery = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    );

    const routeSceneTimings = {
        mapStart: 0,
        routeStart: 0.08,
        routeArrive: 0.40,
        pointActivate: 0.44,
        panelEnter: 0.60,
        panelVisible: 0.72,
        panelExit: 0.88
    };

    const routeMarkerCoordinates = [
        { x: 194, y: 190 },
        { x: 236, y: 193 },
        { x: 298, y: 220 },
        { x: 432, y: 156 },
        { x: 472, y: 147 }
    ];

    const isTurkish =
    document.body.dataset.locale === "tr";

    const cinematicRoutes = [
        {
            id: "korucam",
            mapX: 22,
            mapY: 6,
            mapZ: 45,
            scale: 1.62,
            rotateX: 52,
            rotateY: -9,
            hudNumber: "1 / 5",
            hudRegion: "Koruçam",
            hudCoordinates: isTurkish
                ? "Batı sahili / Maronit köyü"
                : "Western coast / Maronite village"
        },
        {
            id: "lapta",
            mapX: 15,
            mapY: 5,
            mapZ: 60,
            scale: 1.68,
            rotateX: 50,
            rotateY: -5,
            hudNumber: "2 / 5",
            hudRegion: "Lapta",
            hudCoordinates: isTurkish
                ? "Girne batısı / Sahil rotası"
                : "Kyrenia west / Coastal route"
        },
        {
            id: "buffavento",
            mapX: 2,
            mapY: 0,
            mapZ: 85,
            scale: 1.75,
            rotateX: 43,
            rotateY: 0,
            hudNumber: "3 / 5",
            hudRegion: "Buffavento",
            hudCoordinates: isTurkish
                ? "Girne sıradağları / Dağ rotası"
                : "Kyrenia range / Mountain route"
        },
        {
            id: "kantara",
            mapX: -16,
            mapY: 4,
            mapZ: 55,
            scale: 1.66,
            rotateX: 49,
            rotateY: 7,
            hudNumber: "4 / 5",
            hudRegion: "Kantara",
            hudCoordinates: isTurkish
                ? "Doğu sıradağları / Panorama rotası"
                : "Eastern range / Panoramic route"
        },
        {
            id: "mehmetcik",
            mapX: -22,
            mapY: 5,
            mapZ: 65,
            scale: 1.72,
            rotateX: 47,
            rotateY: 10,
            hudNumber: "5 / 5",
            hudRegion: "Mehmetçik",
            hudCoordinates: isTurkish
                ? "Karpaz geçidi / Sahil sürüşü"
                : "Karpas gateway / Coastal drive"
        }
    ];

    const cinematicSceneStates = [
        {
            id: "intro",
            mapX: 10,
            mapY: -2,
            mapZ: 0,
            scale: 1.05,
            rotateX: 56,
            rotateY: -8,
            hudNumber: isTurkish
                ? "5 rota"
                : "5 routes",
            hudRegion: isTurkish
                ? "Kuzey Kıbrıs"
                : "Northern Cyprus",
            hudCoordinates: isTurkish
                ? "Tek ada / Beş yolculuk"
                : "One island / Five journeys"
        },
        ...cinematicRoutes,
        {
            id: "finale",
            mapX: 0,
            mapY: 2,
            mapZ: 0,
            scale: 0.92,
            rotateX: 56,
            rotateY: 0,
            hudNumber: "5 / 5",
            hudRegion: isTurkish
                ? "Yolculuk tamamlandı"
                : "Journey complete",
            hudCoordinates: isTurkish
                ? "Beş rota / Rota özeti"
                : "Five routes / Route overview"
        }
    ];

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
        const copyButtons = document.querySelectorAll(
            "[data-copy-link]"
        );

        if (!copyButtons.length) {
            return;
        }

        const isTurkish =
            document.body.dataset.locale === "tr";

        function getMapLocationUrl(button) {
            const routeContent = button.closest(
                ".route-content"
            );

            const mapFrame = routeContent?.querySelector(
                ".map-frame iframe"
            );

            if (!mapFrame) {
                return "";
            }

            const embedUrl = new URL(
                mapFrame.src,
                window.location.href
            );

            const locationQuery =
                embedUrl.searchParams.get("q");

            if (!locationQuery) {
                return mapFrame.src;
            }

            return (
                "https://www.google.com/maps/search/" +
                "?api=1&query=" +
                encodeURIComponent(locationQuery)
            );
        }

        async function copyToClipboard(value) {
            if (
                navigator.clipboard &&
                window.isSecureContext
            ) {
                await navigator.clipboard.writeText(
                    value
                );

                return;
            }

            const temporaryInput =
                document.createElement("textarea");

            temporaryInput.value = value;
            temporaryInput.setAttribute(
                "readonly",
                ""
            );

            temporaryInput.style.position = "fixed";
            temporaryInput.style.opacity = "0";

            document.body.appendChild(
                temporaryInput
            );

            temporaryInput.select();

            const copied =
                document.execCommand("copy");

            temporaryInput.remove();

            if (!copied) {
                throw new Error(
                    "Clipboard copy failed."
                );
            }
        }

        copyButtons.forEach((button) => {
            const defaultText = isTurkish
                ? "Konumu kopyala"
                : "Copy location";

            const successText = isTurkish
                ? "Konum kopyalandı"
                : "Location copied";

            const errorText = isTurkish
                ? "Kopyalama başarısız"
                : "Copy failed";

            button.textContent = defaultText;

            let resetTimer;

            button.addEventListener(
                "click",
                async () => {
                    const mapLocationUrl =
                        getMapLocationUrl(button);

                    window.clearTimeout(
                        resetTimer
                    );

                    if (!mapLocationUrl) {
                        button.textContent =
                            errorText;

                        resetTimer =
                            window.setTimeout(() => {
                                button.textContent =
                                    defaultText;
                            }, 1800);

                        return;
                    }

                    try {
                        await copyToClipboard(
                            mapLocationUrl
                        );

                        button.textContent =
                            successText;
                    } catch (error) {
                        console.error(
                            "Map location could not be copied:",
                            error
                        );

                        button.textContent =
                            errorText;
                    }

                    resetTimer =
                        window.setTimeout(() => {
                            button.textContent =
                                defaultText;
                        }, 1800);
                }
            );
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

    function getFieldGalleryItems(gallery) {
        return Array.from(
            gallery.querySelectorAll("[data-gallery-thumbnail]")
        ).map((thumbnail) => ({
            thumbnail,
            src: thumbnail.dataset.imageSrc || "",
            alt: thumbnail.dataset.imageAlt || "",
            caption: thumbnail.dataset.imageCaption || ""
        }));
    }

    function setFieldGalleryImage(
        gallery,
        requestedIndex,
        animate = true
    ) {
        const items = getFieldGalleryItems(gallery);
        const mainImage = gallery.querySelector(
            "[data-gallery-main-image]"
        );
        const caption = gallery.querySelector(
            "[data-gallery-caption]"
        );

        if (!items.length || !mainImage || !caption) {
            return;
        }

        const index = (
            (requestedIndex % items.length) + items.length
        ) % items.length;
        const item = items[index];
        const swapToken = `${Date.now()}-${Math.random()}`;

        gallery.dataset.activeIndex = String(index);
        gallery.dataset.swapToken = swapToken;

        items.forEach((currentItem, currentIndex) => {
            const isActive = currentIndex === index;

            currentItem.thumbnail.classList.toggle(
                "is-active",
                isActive
            );
            currentItem.thumbnail.setAttribute(
                "aria-pressed",
                String(isActive)
            );
        });

        const applySelection = () => {
            if (gallery.dataset.swapToken !== swapToken) {
                return;
            }

            mainImage.setAttribute("src", item.src);
            mainImage.setAttribute("alt", item.alt);
            caption.textContent = item.caption;

            window.requestAnimationFrame(() => {
                mainImage.classList.remove("is-changing");
            });
        };

        if (
            animate &&
            !reducedMotionQuery.matches &&
            mainImage.getAttribute("src") !== item.src
        ) {
            mainImage.classList.add("is-changing");
            window.setTimeout(applySelection, 130);
        } else {
            applySelection();
        }
    }

    function initialiseFieldStoryReveals(section, stories) {
        if (
            reducedMotionQuery.matches ||
            !("IntersectionObserver" in window)
        ) {
            stories.forEach((story) => {
                story.classList.add("is-visible");
            });

            return;
        }

        section.classList.add("is-enhanced");

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

        stories.forEach((story) => {
            observer.observe(story);
        });

        const revealForReducedMotion = (event) => {
            if (!event.matches) {
                return;
            }

            observer.disconnect();
            section.classList.remove("is-enhanced");
            stories.forEach((story) => {
                story.classList.add("is-visible");
            });
        };

        if (typeof reducedMotionQuery.addEventListener === "function") {
            reducedMotionQuery.addEventListener(
                "change",
                revealForReducedMotion,
                { once: true }
            );
        }
    }

    function initialiseFieldStories() {
        const section = document.querySelector("[data-field-stories]");

        if (!section) {
            return;
        }

        const stories = Array.from(
            section.querySelectorAll("[data-field-story]")
        );
        const galleries = Array.from(
            section.querySelectorAll("[data-field-gallery]")
        );

        initialiseFieldStoryReveals(section, stories);

        galleries.forEach((gallery) => {
            const thumbnails = Array.from(
                gallery.querySelectorAll("[data-gallery-thumbnail]")
            );

            gallery.dataset.activeIndex = "0";

            thumbnails.forEach((thumbnail, index) => {
                thumbnail.addEventListener("click", () => {
                    setFieldGalleryImage(gallery, index);
                });
            });
        });

        const lightbox = document.querySelector(
            "[data-field-lightbox]"
        );

        if (!lightbox) {
            return;
        }

        const lightboxImage = lightbox.querySelector(
            "[data-lightbox-image]"
        );
        const lightboxCaption = lightbox.querySelector(
            "[data-lightbox-caption]"
        );
        const closeButton = lightbox.querySelector(
            "[data-lightbox-close]"
        );
        const previousButton = lightbox.querySelector(
            "[data-lightbox-previous]"
        );
        const nextButton = lightbox.querySelector(
            "[data-lightbox-next]"
        );

        if (
            !lightboxImage ||
            !lightboxCaption ||
            !closeButton ||
            !previousButton ||
            !nextButton
        ) {
            return;
        }

        let activeGallery = null;
        let activeIndex = 0;
        let openingTrigger = null;

        const renderLightbox = () => {
            if (!activeGallery) {
                return;
            }

            const items = getFieldGalleryItems(activeGallery);

            if (!items.length) {
                return;
            }

            activeIndex = (
                (activeIndex % items.length) + items.length
            ) % items.length;

            const item = items[activeIndex];

            lightboxImage.setAttribute("src", item.src);
            lightboxImage.setAttribute("alt", item.alt);
            lightboxCaption.textContent = item.caption;
            setFieldGalleryImage(activeGallery, activeIndex, false);
        };

        const closeLightbox = () => {
            if (lightbox.hidden) {
                return;
            }

            lightbox.hidden = true;
            document.body.classList.remove("is-lightbox-open");
            document.body.style.removeProperty(
                "--lightbox-scrollbar-width"
            );

            if (
                openingTrigger &&
                document.contains(openingTrigger)
            ) {
                openingTrigger.focus();
            }

            activeGallery = null;
            openingTrigger = null;
        };

        const openLightbox = (gallery, trigger) => {
            const parsedIndex = Number.parseInt(
                gallery.dataset.activeIndex || "0",
                10
            );
            const scrollbarWidth = Math.max(
                window.innerWidth -
                    document.documentElement.clientWidth,
                0
            );

            activeGallery = gallery;
            activeIndex = Number.isFinite(parsedIndex)
                ? parsedIndex
                : 0;
            openingTrigger = trigger;

            document.body.style.setProperty(
                "--lightbox-scrollbar-width",
                `${scrollbarWidth}px`
            );
            document.body.classList.add("is-lightbox-open");
            lightbox.hidden = false;
            renderLightbox();

            window.requestAnimationFrame(() => {
                closeButton.focus();
            });
        };

        galleries.forEach((gallery) => {
            const opener = gallery.querySelector(
                "[data-lightbox-open]"
            );

            if (!opener) {
                return;
            }

            opener.addEventListener("click", () => {
                openLightbox(gallery, opener);
            });
        });

        closeButton.addEventListener("click", closeLightbox);
        previousButton.addEventListener("click", () => {
            activeIndex -= 1;
            renderLightbox();
        });
        nextButton.addEventListener("click", () => {
            activeIndex += 1;
            renderLightbox();
        });

        lightbox.addEventListener("click", (event) => {
            if (event.target === lightbox) {
                closeLightbox();
            }
        });

        document.addEventListener("keydown", (event) => {
            if (lightbox.hidden) {
                return;
            }

            if (event.key === "Escape") {
                event.preventDefault();
                closeLightbox();
                return;
            }

            if (event.key === "ArrowLeft") {
                event.preventDefault();
                activeIndex -= 1;
                renderLightbox();
                return;
            }

            if (event.key === "ArrowRight") {
                event.preventDefault();
                activeIndex += 1;
                renderLightbox();
                return;
            }

            if (event.key !== "Tab") {
                return;
            }

            const focusableElements = Array.from(
                lightbox.querySelectorAll(
                    "button:not([disabled])"
                )
            );
            const firstElement = focusableElements[0];
            const lastElement =
                focusableElements[focusableElements.length - 1];

            if (!firstElement || !lastElement) {
                return;
            }

            if (
                event.shiftKey &&
                document.activeElement === firstElement
            ) {
                event.preventDefault();
                lastElement.focus();
            } else if (
                !event.shiftKey &&
                document.activeElement === lastElement
            ) {
                event.preventDefault();
                firstElement.focus();
            }
        });
    }

    function clamp(value, minimum = 0, maximum = 1) {
        return Math.min(Math.max(value, minimum), maximum);
    }

    function interpolate(start, end, amount) {
        return start + (end - start) * amount;
    }

    function smoothStep(value) {
        const clampedValue = clamp(value);

        return clampedValue * clampedValue * (3 - 2 * clampedValue);
    }

    function progressBetween(value, start, end) {
        return clamp(
            (value - start) / Math.max(end - start, 0.001)
        );
    }

    function distanceSquared(point, target) {
        const deltaX = point.x - target.x;
        const deltaY = point.y - target.y;

        return deltaX * deltaX + deltaY * deltaY;
    }

    /**
     * Bir SVG koordinatına path üzerindeki en yakın uzunluğu iki aşamalı
     * örnekleme ile bulur. Bu ölçüm yalnızca başlangıçta ve resize sonrasında
     * çalışır; scroll sırasında getPointAtLength çağrılmaz.
     */
    function findClosestRouteLength(path, totalLength, target) {
        const coarseSteps = Math.max(
            96,
            Math.ceil(totalLength / 2)
        );
        const coarseStep = totalLength / coarseSteps;
        let bestLength = 0;
        let bestDistance = Number.POSITIVE_INFINITY;

        for (let index = 0; index <= coarseSteps; index += 1) {
            const length = Math.min(index * coarseStep, totalLength);
            const point = path.getPointAtLength(length);
            const currentDistance = distanceSquared(point, target);

            if (currentDistance < bestDistance) {
                bestDistance = currentDistance;
                bestLength = length;
            }
        }

        let searchRadius = coarseStep;

        for (let pass = 0; pass < 3; pass += 1) {
            const searchStart = Math.max(0, bestLength - searchRadius);
            const searchEnd = Math.min(
                totalLength,
                bestLength + searchRadius
            );
            const refinementSteps = 32;
            const refinementStep =
                (searchEnd - searchStart) / refinementSteps;

            for (
                let index = 0;
                index <= refinementSteps;
                index += 1
            ) {
                const length = Math.min(
                    searchStart + index * refinementStep,
                    totalLength
                );
                const point = path.getPointAtLength(length);
                const currentDistance = distanceSquared(point, target);

                if (currentDistance < bestDistance) {
                    bestDistance = currentDistance;
                    bestLength = length;
                }
            }

            searchRadius = Math.max(
                refinementStep * 2,
                totalLength / 100000
            );
        }

        return bestLength;
    }

    function setRouteVisibleLength(state, visibleLength) {
        const totalLength = state.routeTotalLength;

        if (!Number.isFinite(totalLength) || totalLength <= 0) {
            return;
        }

        const safeVisibleLength = clamp(
            visibleLength,
            0,
            totalLength
        );

        /*
         * Gerçek SVG uzunluğunu 0–1 arasındaki ilerleme oranına
         * dönüştürür. Path üzerinde pathLength="1" kullanıldığı için
         * masaüstü scale ve 3D transform değerlerinden etkilenmez.
         */
        const routeRatio = safeVisibleLength / totalLength;

        /*
         * İlk değer görünür rota kısmıdır.
         * İkinci değer bütün path'ten daha uzun bir boşluktur.
         * Bu nedenle çizgi path sonunda tekrar başlayamaz.
         */
        const normalizedDashArray =
            `${routeRatio.toFixed(6)} 2`;

        state.routeLines.forEach((line) => {
            line.style.strokeDasharray = normalizedDashArray;
            line.style.strokeDashoffset = "0";
        });

        state.mapObject.classList.toggle(
            "has-route-progress",
            routeRatio > 0.0005
        );

        state.routeVisibleLength = safeVisibleLength;
    }

    function measureRouteGeometry(state) {
        const totalLength = state.routeLine.getTotalLength();

        if (!Number.isFinite(totalLength) || totalLength <= 0) {
            return;
        }

        let previousLength = 0;
        const markerLengths = routeMarkerCoordinates.map((target) => {
            const closestLength = findClosestRouteLength(
                state.routeLine,
                totalLength,
                target
            );
            const orderedLength = Math.max(
                previousLength,
                closestLength
            );

            previousLength = orderedLength;

            return orderedLength;
        });

        state.routeTotalLength = totalLength;
        state.routeMarkerLengths = markerLengths;
        state.sceneRouteLengths = [
            0,
            ...markerLengths,
            totalLength
        ];

        setRouteVisibleLength(
            state,
            state.routeReady &&
                Number.isFinite(state.routeVisibleLength)
                ? state.routeVisibleLength
                : 0
        );
        state.mapObject.classList.add("is-route-ready");
        state.routeReady = true;
    }

    /**
     * Sticky hikâyenin sabit ölçülerini yalnızca başlangıçta ve resize
     * sonrasında okur. Scroll sırasında layout ölçümü yapılmaz.
     */
    function measureCinematicStory(state) {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const header = document.querySelector(".site-header");

        state.headerHeight = header
            ? header.getBoundingClientRect().height
            : 0;
        state.stageHeight =
            state.stage.getBoundingClientRect().height ||
            Math.max(window.innerHeight - state.headerHeight, 1);
        state.sceneCenters = state.scenes.map((scene) => {
            const bounds = scene.getBoundingClientRect();

            return scrollTop + bounds.top + bounds.height / 2;
        });
        state.isMobile = window.innerWidth <= 760;
        state.isTablet =
            !state.isMobile &&
            window.innerWidth <= 1080;
        measureRouteGeometry(state);
        state.needsMeasure = false;
    }

    function calculateStoryProgress(state) {
        const firstCenter = state.sceneCenters[0];
        const lastCenter =
            state.sceneCenters[state.sceneCenters.length - 1];
        const viewportCenter =
            window.scrollY +
            state.headerHeight +
            state.stageHeight / 2;
        const storyRange = Math.max(lastCenter - firstCenter, 1);

        return clamp(
            (viewportCenter - firstCenter) / storyRange
        );
    }

    function calculateScenePosition(state) {
        const viewportCenter =
            window.scrollY +
            state.headerHeight +
            state.stageHeight / 2;
        const centers = state.sceneCenters;
        const lastIndex = centers.length - 1;

        if (viewportCenter <= centers[0]) {
            return 0;
        }

        if (viewportCenter >= centers[lastIndex]) {
            return lastIndex;
        }

        for (let index = 0; index < lastIndex; index += 1) {
            const currentCenter = centers[index];
            const nextCenter = centers[index + 1];

            if (viewportCenter <= nextCenter) {
                const localProgress = clamp(
                    (viewportCenter - currentCenter) /
                    Math.max(nextCenter - currentCenter, 1)
                );

                return index + localProgress;
            }
        }

        return lastIndex;
    }

    function updateMapTransform(
        state,
        currentScene,
        nextScene,
        localProgress
    ) {
        const mapProgress = smoothStep(
            progressBetween(
                localProgress,
                routeSceneTimings.mapStart,
                routeSceneTimings.pointActivate
            )
        );
        const travelFactor = state.isMobile
            ? 0.44
            : state.isTablet
                ? 0.72
                : 1;
        const rotationFactor = state.isMobile
            ? 0.34
            : state.isTablet
                ? 0.68
                : 1;
        const scaleFactor = state.isMobile
            ? 0.5
            : state.isTablet
                ? 0.78
                : 1;
        const mapX = interpolate(
            currentScene.mapX,
            nextScene.mapX,
            mapProgress
        );
        const mapY = interpolate(
            currentScene.mapY,
            nextScene.mapY,
            mapProgress
        );
        const mapZ = interpolate(
            currentScene.mapZ,
            nextScene.mapZ,
            mapProgress
        );
        const rawScale = interpolate(
            currentScene.scale,
            nextScene.scale,
            mapProgress
        );
        const mapScale = 1 + (rawScale - 1) * scaleFactor;
        const rotateX = interpolate(
            currentScene.rotateX,
            nextScene.rotateX,
            mapProgress
        );
        const rotateY = interpolate(
            currentScene.rotateY,
            nextScene.rotateY,
            mapProgress
        );

        state.story.style.setProperty(
            "--map-x",
            `${(mapX * travelFactor).toFixed(3)}vw`
        );
        state.story.style.setProperty(
            "--map-y",
            `${(mapY * travelFactor).toFixed(3)}vh`
        );
        state.story.style.setProperty(
            "--map-z",
            `${(mapZ * travelFactor).toFixed(2)}px`
        );
        state.story.style.setProperty(
            "--map-scale",
            mapScale.toFixed(4)
        );
        state.story.style.setProperty(
            "--map-rotate-x",
            `${(rotateX * rotationFactor).toFixed(3)}deg`
        );
        state.story.style.setProperty(
            "--map-rotate-y",
            `${(rotateY * rotationFactor).toFixed(3)}deg`
        );
    }

    function updateRouteLine(
        state,
        currentIndex,
        nextIndex,
        localProgress
    ) {
        const routeProgress = smoothStep(
            progressBetween(
                localProgress,
                routeSceneTimings.routeStart,
                routeSceneTimings.routeArrive
            )
        );
        const currentLength =
            state.sceneRouteLengths[currentIndex] || 0;
        const targetLength =
            state.sceneRouteLengths[nextIndex] || currentLength;
        const visibleLength = interpolate(
            currentLength,
            targetLength,
            routeProgress
        );
        const arrivalTolerance = Math.max(
            state.routeTotalLength * 0.0005,
            0.08
        );
        const targetReached =
            Math.abs(targetLength - visibleLength) <= arrivalTolerance;

        setRouteVisibleLength(state, visibleLength);

        return {
            routeProgress,
            targetReached,
            visibleLength,
            targetLength
        };
    }

    function updateSceneContent(
        state,
        currentIndex,
        nextIndex,
        localProgress,
        routeTransition
    ) {
        const isStaticScene = currentIndex === nextIndex;
        const targetActivated =
            isStaticScene ||
            (
                routeTransition.targetReached &&
                localProgress >= routeSceneTimings.pointActivate
            );
        const outgoingPhotoProgress = smoothStep(
            progressBetween(localProgress, 0, 0.42)
        );
        const incomingPhotoProgress = smoothStep(
            progressBetween(
                localProgress,
                routeSceneTimings.mapStart,
                routeSceneTimings.routeArrive
            )
        );

        state.photos.forEach((photo, index) => {
            const routeSceneIndex = index + 1;
            let presence = 0;

            if (
                isStaticScene &&
                routeSceneIndex === currentIndex
            ) {
                presence = 1;
            } else if (routeSceneIndex === currentIndex) {
                presence = 1 - outgoingPhotoProgress;
            } else if (routeSceneIndex === nextIndex) {
                presence = incomingPhotoProgress;
            }

            const scale = 1.075 - presence * 0.075;

            photo.style.setProperty(
                "--photo-presence",
                presence.toFixed(4)
            );
            photo.style.setProperty(
                "--photo-scale",
                scale.toFixed(4)
            );
            photo.style.setProperty(
                "--photo-reveal",
                `${(presence * 100).toFixed(3)}%`
            );
            photo.style.setProperty(
                "--photo-inset",
                `${((1 - presence) * 50).toFixed(3)}%`
            );
            photo.style.setProperty(
                "--photo-panel-inset",
                `${((1 - presence) * 38).toFixed(3)}%`
            );
        });

        const outgoingDuration = Math.max(
            1 - routeSceneTimings.panelExit,
            0.001
        );
        const outgoingPanelPresence = isStaticScene
            ? 1
            : 1 - smoothStep(
                progressBetween(
                    localProgress,
                    0,
                    outgoingDuration
                )
            );
        const incomingPanelPresence = isStaticScene
            ? 1
            : targetActivated
                ? smoothStep(
                    progressBetween(
                        localProgress,
                        routeSceneTimings.panelEnter,
                        routeSceneTimings.panelVisible
                    )
                )
                : 0;

        state.scenes.forEach((scene, index) => {
            let presence = 0;
            let shift = 34;

            if (isStaticScene && index === currentIndex) {
                presence = 1;
                shift = 0;
            } else if (index === currentIndex) {
                presence = outgoingPanelPresence;
                shift = (1 - presence) * -24;
            } else if (index === nextIndex) {
                presence = incomingPanelPresence;
                shift = (1 - presence) * 34;
            }

            scene.style.setProperty(
                "--chapter-presence",
                presence.toFixed(4)
            );
            scene.style.setProperty(
                "--chapter-shift",
                `${shift.toFixed(2)}px`
            );
            scene.style.setProperty(
                "--route-local-progress",
                index === currentIndex || index === nextIndex
                    ? localProgress.toFixed(4)
                    : "0"
            );
        });
    }

    function setActiveCinematicRoute(state, sceneIndex) {
        if (state.activeSceneIndex === sceneIndex) {
            return;
        }

        const finalIndex = state.scenes.length - 1;
        const isFinal = sceneIndex === finalIndex;
        const routeIndex =
            sceneIndex > 0 && sceneIndex < finalIndex
                ? sceneIndex - 1
                : -1;
        const sceneState = cinematicSceneStates[sceneIndex];

        state.activeSceneIndex = sceneIndex;
        state.story.dataset.activeScene = sceneState.id;
        state.story.classList.toggle("is-final", isFinal);

        state.scenes.forEach((scene, index) => {
            scene.classList.toggle("is-active", index === sceneIndex);
            scene.classList.toggle("is-past", index < sceneIndex);

            if (
                index === sceneIndex &&
                scene.hasAttribute("data-cinematic-route")
            ) {
                scene.setAttribute("aria-current", "step");
            } else {
                scene.removeAttribute("aria-current");
            }
        });

        state.points.forEach((point, index) => {
            point.classList.toggle(
                "is-active",
                !isFinal && index === routeIndex
            );
            point.classList.toggle(
                "is-past",
                !isFinal && routeIndex > -1 && index < routeIndex
            );
            point.classList.toggle("is-complete", isFinal);
        });

        state.hudNumber.textContent = sceneState.hudNumber;
        state.hudRegion.textContent = sceneState.hudRegion;
        state.hudCoordinates.textContent =
            sceneState.hudCoordinates;
    }

    function updateStoryScene(state) {
        state.animationFrame = null;

        if (state.needsMeasure) {
            measureCinematicStory(state);
        }

        const storyProgress = calculateStoryProgress(state);
        const scenePosition = calculateScenePosition(state);
        const currentIndex = Math.min(
            Math.floor(scenePosition),
            cinematicSceneStates.length - 1
        );
        const nextIndex = Math.min(
            currentIndex + 1,
            cinematicSceneStates.length - 1
        );
        const localProgress = clamp(scenePosition - currentIndex);
        let routeTransition;

        state.story.style.setProperty(
            "--story-progress",
            storyProgress.toFixed(4)
        );
        state.story.style.setProperty(
            "--scene-progress",
            localProgress.toFixed(4)
        );
        document.body.classList.toggle(
            "is-story-scrolled",
            storyProgress > 0.015
        );

        if (state.reducedMotion) {
            state.story.style.setProperty("--map-x", "0vw");
            state.story.style.setProperty("--map-y", "0vh");
            state.story.style.setProperty("--map-z", "0px");
            state.story.style.setProperty("--map-scale", "1");
            state.story.style.setProperty("--map-rotate-x", "0deg");
            state.story.style.setProperty("--map-rotate-y", "0deg");
            setRouteVisibleLength(state, state.routeTotalLength);
            routeTransition = {
                routeProgress: 1,
                targetReached: true,
                visibleLength: state.routeTotalLength,
                targetLength: state.routeTotalLength
            };

            state.photos.forEach((photo) => {
                photo.style.setProperty("--photo-presence", "0");
                photo.style.setProperty("--photo-scale", "1");
                photo.style.setProperty("--photo-reveal", "0%");
                photo.style.setProperty("--photo-inset", "50%");
                photo.style.setProperty(
                    "--photo-panel-inset",
                    "38%"
                );
            });
        } else {
            routeTransition = updateRouteLine(
                state,
                currentIndex,
                nextIndex,
                localProgress
            );
            updateMapTransform(
                state,
                cinematicSceneStates[currentIndex],
                cinematicSceneStates[nextIndex],
                localProgress
            );
            updateSceneContent(
                state,
                currentIndex,
                nextIndex,
                localProgress,
                routeTransition
            );
        }

        const activeIndex =
            currentIndex === nextIndex ||
            localProgress < routeSceneTimings.pointActivate ||
            !routeTransition.targetReached
                ? currentIndex
                : nextIndex;

        setActiveCinematicRoute(state, activeIndex);
    }

    function initialiseReducedMotion(state, requestUpdate) {
        const applyMotionPreference = () => {
            state.reducedMotion = reducedMotionQuery.matches;
            state.story.classList.toggle(
                "is-reduced-motion",
                state.reducedMotion
            );
            state.needsMeasure = true;
            requestUpdate();
        };

        if (typeof reducedMotionQuery.addEventListener === "function") {
            reducedMotionQuery.addEventListener(
                "change",
                applyMotionPreference
            );
        } else if (
            typeof reducedMotionQuery.addListener === "function"
        ) {
            reducedMotionQuery.addListener(applyMotionPreference);
        }

        applyMotionPreference();
    }

    /**
     * İngilizce ana sayfadaki 2.5D rota hikâyesini tek passive scroll
     * listener ve requestAnimationFrame güncellemesiyle yönetir.
     */
    function initialiseCinematicStory() {
        const story = document.querySelector(
            "[data-cinematic-story]"
        );

        if (!story) {
            return;
        }

        const state = {
            story,
            mapObject: story.querySelector(".cinematic-map-object"),
            stage: story.querySelector("[data-cinematic-stage]"),
            track: story.querySelector("[data-cinematic-track]"),
            scenes: Array.from(
                story.querySelectorAll("[data-cinematic-scene]")
            ),
            photos: Array.from(
                story.querySelectorAll("[data-cinematic-photo]")
            ),
            points: Array.from(
                story.querySelectorAll("[data-cinematic-point]")
            ),
            routeLine: story.querySelector(
                "[data-cinematic-route-line]"
            ),
            routeGlow: story.querySelector(
                "[data-cinematic-route-glow]"
            ),
            hudNumber: story.querySelector(
                "[data-cinematic-hud-number]"
            ),
            hudRegion: story.querySelector(
                "[data-cinematic-hud-region]"
            ),
            hudCoordinates: story.querySelector(
                "[data-cinematic-hud-coordinates]"
            ),
            activeSceneIndex: -1,
            animationFrame: null,
            sceneCenters: [],
            routeLines: [],
            routeMarkerLengths: [],
            sceneRouteLengths: [],
            routeTotalLength: 0,
            routeVisibleLength: 0,
            routeReady: false,
            needsMeasure: true,
            reducedMotion: reducedMotionQuery.matches,
            isMobile: false,
            isTablet: false,
            headerHeight: 0,
            stageHeight: window.innerHeight
        };

        if (
            !state.mapObject ||
            !state.stage ||
            !state.track ||
            !state.routeLine ||
            !state.routeGlow ||
            !state.hudNumber ||
            !state.hudRegion ||
            !state.hudCoordinates ||
            state.scenes.length !== cinematicSceneStates.length ||
            state.photos.length !== cinematicRoutes.length ||
            state.points.length !== cinematicRoutes.length
        ) {
            return;
        }

        state.routeLines = [
            state.routeGlow,
            state.routeLine
        ];

        const requestUpdate = () => {
            if (state.animationFrame !== null) {
                return;
            }

            state.animationFrame = window.requestAnimationFrame(() => {
                updateStoryScene(state);
            });
        };
        const requestMeasure = () => {
            state.needsMeasure = true;
            requestUpdate();
        };

        story.classList.add("is-enhanced");
        initialiseReducedMotion(state, requestUpdate);

        window.addEventListener("scroll", requestUpdate, {
            passive: true
        });
        window.addEventListener("resize", requestMeasure, {
            passive: true
        });

        if (document.fonts?.ready) {
            document.fonts.ready.then(requestMeasure);
        }

        requestUpdate();
    }

    function initialiseLanguageSwitcherLinks() {
        const routeMap = {
            korucam: {
                en: {
                    folder: "routes",
                    slug: "korucam-maronite-route"
                },
                tr: {
                    folder: "rotalar",
                    slug: "korucam-maronit-kultur-rotasi"
                }
            },

            lapta: {
                en: {
                    folder: "routes",
                    slug: "lapta-village-coastal-route"
                },
                tr: {
                    folder: "rotalar",
                    slug: "lapta-koy-ve-sahil-rotasi"
                }
            },

            buffavento: {
                en: {
                    folder: "routes",
                    slug: "buffavento-mountain-route"
                },
                tr: {
                    folder: "rotalar",
                    slug: "buffavento-dag-ve-manastir-rotasi"
                }
            },

            kantara: {
                en: {
                    folder: "routes",
                    slug: "kantara-east-coast-route"
                },
                tr: {
                    folder: "rotalar",
                    slug: "kantara-dogu-sahili-rotasi"
                }
            },

            mehmetcik: {
                en: {
                    folder: "routes",
                    slug: "mehmetcik-bafra-bogaz-route"
                },
                tr: {
                    folder: "rotalar",
                    slug: "mehmetcik-bafra-bogaz-rotasi"
                }
            }
        };

        const currentRoute =
            document.body.dataset.route || "";

        const currentPath =
            window.location.pathname;

        const localeMatch = currentPath.match(
            /^(.*)\/(?:en|tr)(?:\/|$)/
        );

        const projectRoot = localeMatch
            ? localeMatch[1]
            : "";

        function detectTargetLocale(link) {
            const text = link.textContent
                .trim()
                .toLocaleLowerCase("tr");

            const href =
                link.getAttribute("href") || "";

            const declaredLocale =
                link.dataset.locale ||
                link.getAttribute("hreflang") ||
                link.getAttribute("lang") ||
                "";

            if (
                declaredLocale.toLowerCase().startsWith("en") ||
                text === "en" ||
                text.includes("english") ||
                /\/en(?:\/|$)/.test(href)
            ) {
                return "en";
            }

            if (
                declaredLocale.toLowerCase().startsWith("tr") ||
                text === "tr" ||
                text.includes("türkçe") ||
                text.includes("turkish") ||
                text.includes("turkce") ||
                /\/tr(?:\/|$)/.test(href)
            ) {
                return "tr";
            }

            return "";
        }

        function updateLanguageLinks() {
            const languageLinks =
                document.querySelectorAll(
                    ".language-switcher a"
                );

            if (!languageLinks.length) {
                return false;
            }

            languageLinks.forEach((link) => {
                const targetLocale =
                    detectTargetLocale(link);

                if (!targetLocale) {
                    return;
                }

                let targetPath =
                    `${projectRoot}/${targetLocale}/index.html`;

                if (
                    currentRoute &&
                    routeMap[currentRoute]
                ) {
                    const targetRoute =
                        routeMap[currentRoute][targetLocale];

                    targetPath =
                        `${projectRoot}/${targetLocale}/` +
                        `${targetRoute.folder}/` +
                        `${targetRoute.slug}/index.html`;
                }

                link.href = targetPath;
            });

            return true;
        }

        if (updateLanguageLinks()) {
            return;
        }

        const observer = new MutationObserver(() => {
            if (!updateLanguageLinks()) {
                return;
            }

            observer.disconnect();
        });

        observer.observe(
            document.body,
            {
                childList: true,
                subtree: true
            }
        );

        window.setTimeout(() => {
            observer.disconnect();
        }, 3000);
    }

    function initialiseHomeIntroReveal() {
    const homePage = document.querySelector(
        "body.cinematic-home"
    );

    const introSection = document.querySelector(
        ".cinematic-intro"
    );

    if (!homePage || !introSection) {
        return;
    }

    if (reducedMotionQuery.matches) {
        homePage.classList.add(
            "is-home-intro-visible"
        );

        return;
    }

    window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
            homePage.classList.add(
                "is-home-intro-visible"
            );
        });
    });
}

    function initialiseRouteDetailReveals() {
    const routeDetailPage = document.querySelector(
        ".cinematic-route-detail"
    );

    if (!routeDetailPage) {
        return;
    }

    const revealElements = Array.from(
        routeDetailPage.querySelectorAll(
            [
                ".route-hero-grid > *",
                ".route-content > *",
                ".stop-card",
                ".info-card",
                ".insider-tip",
                ".map-frame",
                ".share-bar"
            ].join(",")
        )
    );

    if (!revealElements.length) {
        return;
    }

    revealElements.forEach((element, index) => {
        element.classList.add("route-reveal");

        element.style.setProperty(
            "--route-reveal-delay",
            `${Math.min(index % 6, 5) * 70}ms`
        );
    });

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

    document.addEventListener("DOMContentLoaded", () => {
        initialiseLanguageSwitcherLinks();
        initialiseAnchorLinks();
        initialiseCopyButtons();
        initialiseShareButtons();
        initialiseImageDefaults();
        initialiseCinematicStory();
        initialiseHomeIntroReveal();
        initialiseFieldStories();
        initialiseRouteDetailReveals();
    });
})();
