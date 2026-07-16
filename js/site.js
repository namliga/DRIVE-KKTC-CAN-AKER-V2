(() => {
    "use strict";

    const reducedMotionQuery = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    );

    const routeSceneTimings = {
        mapStart: 0,
        routeStart: 0.16,
        routeArrive: 0.46,
        pointActivate: 0.48,
        panelEnter: 0.53,
        panelVisible: 0.68,
        panelExit: 0.84
    };

    const cinematicRoutes = [
        {
            id: "korucam",
            mapX: 22,
            mapY: 6,
            mapZ: 45,
            scale: 1.62,
            rotateX: 52,
            rotateY: -9,
            lineProgress: 0.06,
            hudNumber: "1 / 5",
            hudRegion: "Koruçam",
            hudCoordinates: "Western coast / Maronite village"
        },
        {
            id: "lapta",
            mapX: 15,
            mapY: 5,
            mapZ: 60,
            scale: 1.68,
            rotateX: 50,
            rotateY: -5,
            lineProgress: 0.18,
            hudNumber: "2 / 5",
            hudRegion: "Lapta",
            hudCoordinates: "Kyrenia west / Coastal route"
        },
        {
            id: "buffavento",
            mapX: 2,
            mapY: 0,
            mapZ: 85,
            scale: 1.75,
            rotateX: 43,
            rotateY: 0,
            lineProgress: 0.41,
            hudNumber: "3 / 5",
            hudRegion: "Buffavento",
            hudCoordinates: "Kyrenia range / Mountain route"
        },
        {
            id: "kantara",
            mapX: -16,
            mapY: 4,
            mapZ: 55,
            scale: 1.66,
            rotateX: 49,
            rotateY: 7,
            lineProgress: 0.84,
            hudNumber: "4 / 5",
            hudRegion: "Kantara",
            hudCoordinates: "Eastern range / Panoramic route"
        },
        {
            id: "mehmetcik",
            mapX: -22,
            mapY: 5,
            mapZ: 65,
            scale: 1.72,
            rotateX: 47,
            rotateY: 10,
            lineProgress: 1,
            hudNumber: "5 / 5",
            hudRegion: "Mehmetçik",
            hudCoordinates: "Karpas gateway / Coastal drive"
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
            lineProgress: 0,
            hudNumber: "5 routes",
            hudRegion: "Northern Cyprus",
            hudCoordinates: "One island / Five journeys"
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
            lineProgress: 1,
            hudNumber: "5 / 5",
            hudRegion: "Journey complete",
            hudCoordinates: "Five routes / Route overview"
        }
    ];

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
        const routeProgress = smoothStep(
            progressBetween(
                localProgress,
                routeSceneTimings.routeStart,
                routeSceneTimings.routeArrive
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
        const lineProgress = interpolate(
            currentScene.lineProgress,
            nextScene.lineProgress,
            routeProgress
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
        state.story.style.setProperty(
            "--route-line-progress",
            clamp(lineProgress).toFixed(4)
        );
    }

    function updateSceneContent(
        state,
        currentIndex,
        nextIndex,
        localProgress
    ) {
        const isStaticScene = currentIndex === nextIndex;
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
            : smoothStep(
                progressBetween(
                    localProgress,
                    routeSceneTimings.panelEnter,
                    routeSceneTimings.panelVisible
                )
            );

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
        const activeIndex =
            currentIndex === nextIndex ||
            localProgress < routeSceneTimings.pointActivate
                ? currentIndex
                : nextIndex;

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
            state.story.style.setProperty(
                "--route-line-progress",
                "1"
            );

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
                localProgress
            );
        }

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
            needsMeasure: true,
            reducedMotion: reducedMotionQuery.matches,
            isMobile: false,
            isTablet: false,
            headerHeight: 0,
            stageHeight: window.innerHeight
        };

        if (
            !state.stage ||
            !state.track ||
            !state.routeLine ||
            !state.hudNumber ||
            !state.hudRegion ||
            !state.hudCoordinates ||
            state.scenes.length !== cinematicSceneStates.length ||
            state.photos.length !== cinematicRoutes.length ||
            state.points.length !== cinematicRoutes.length
        ) {
            return;
        }

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

        state.scenes.forEach((scene, index) => {
            scene.addEventListener("focusin", () => {
                setActiveCinematicRoute(state, index);
            });
        });

        if (document.fonts?.ready) {
            document.fonts.ready.then(requestMeasure);
        }

        requestUpdate();
    }

    function initialiseRevealDelays() {
        const groups = document.querySelectorAll(
            ".stops-list, .practical-grid"
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
        initialiseCinematicStory();
    });
})();
