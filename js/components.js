(() => {
    "use strict";

    const routePaths = {
        en: {
            home: "en/",
            buffavento: "en/routes/buffavento-mountain-route/",
            kantara: "en/routes/kantara-east-coast-route/",
            lapta: "en/routes/lapta-village-coastal-route/",
            korucam: "en/routes/korucam-maronite-route/",
            mehmetcik: "en/routes/mehmetcik-bafra-bogaz-route/"
        },
        tr: {
            home: "tr/",
            buffavento: "tr/rotalar/buffavento-dag-ve-manastir-rotasi/",
            kantara: "tr/rotalar/kantara-dogu-sahili-rotasi/",
            lapta: "tr/rotalar/lapta-koy-ve-sahil-rotasi/",
            korucam: "tr/rotalar/korucam-maronit-kultur-rotasi/",
            mehmetcik: "tr/rotalar/mehmetcik-bafra-bogaz-rotasi/"
        }
    };

    const content = {
        en: {
            home: "Home",
            routes: "Routes",
            explore: "Explore routes",
            menuLabel: "Open navigation",
            languageLabel: "Choose language",
            footerText: "Independent routes for discovering Northern Cyprus.",
            routeNames: {
                buffavento: "Buffavento & Forgotten Monasteries",
                kantara: "Kantara & East Coast",
                lapta: "Lapta Village & Coast",
                korucam: "Koruçam Maronite Culture",
                mehmetcik: "Mehmetçik, Bafra & Boğaz"
            }
        },
        tr: {
            home: "Ana Sayfa",
            routes: "Rotalar",
            explore: "Rotaları keşfet",
            menuLabel: "Navigasyonu aç",
            languageLabel: "Dil seçin",
            footerText: "Kuzey Kıbrıs'ı keşfetmek için bağımsız rota rehberi.",
            routeNames: {
                buffavento: "Buffavento Dağ ve Manastırlar",
                kantara: "Kantara ve Doğu Sahili",
                lapta: "Lapta Köy ve Sahil",
                korucam: "Koruçam Maronit Kültürü",
                mehmetcik: "Mehmetçik, Bafra ve Boğaz"
            }
        }
    };

    const languageNames = {
        en: "English",
        tr: "Türkçe"
    };

    function getPageSettings() {
        const body = document.body;

        return {
            locale: body.dataset.locale || "en",
            page: body.dataset.page || "home",
            root: body.dataset.root || "../"
        };
    }

    function buildUrl(locale, page, root, hash = "") {
        const route = routePaths[locale]?.[page] || routePaths[locale].home;
        const suffix = location.protocol === "file:" ? "index.html" : "";

        return `${root}${route}${suffix}${hash}`;
    }

    function createHeader(locale, page, root) {
        const text = content[locale];
        const routeKeys = [
            "buffavento",
            "kantara",
            "lapta",
            "korucam",
            "mehmetcik"
        ];

        const routeLinks = routeKeys.map((key) => `
            <li>
                <a class="${page === key ? "is-active" : ""}"
                   href="${buildUrl(locale, key, root)}">
                    ${text.routeNames[key]}
                </a>
            </li>
        `).join("");

        const languageLinks = Object.keys(languageNames).map((language) => `
            <a class="${locale === language ? "is-current" : ""}"
               href="${buildUrl(language, page, root)}"
               lang="${language}">
                ${languageNames[language]}
            </a>
        `).join("");

        return `
            <header class="site-header">
                <div class="container header-inner">
                    <a class="brand" href="${buildUrl(locale, "home", root)}" aria-label="Drive KKTC">
                        <span class="brand-mark" aria-hidden="true">
                            <span></span>
                        </span>

                        <span class="brand-text">
                            <strong>DRIVE</strong>
                            <small>KKTC</small>
                        </span>
                    </a>

                    <button class="menu-toggle"
                            type="button"
                            aria-expanded="false"
                            aria-controls="primary-navigation"
                            aria-label="${text.menuLabel}">
                        <span></span>
                        <span></span>
                        <span></span>
                    </button>

                    <nav class="primary-navigation"
                         id="primary-navigation"
                         aria-label="Primary navigation">
                        <a class="nav-link ${page === "home" ? "is-active" : ""}"
                           href="${buildUrl(locale, "home", root)}">
                            ${text.home}
                        </a>

                        <div class="routes-menu">
                            <button class="routes-menu-button"
                                    type="button"
                                    aria-expanded="false">
                                ${text.routes}
                                <span aria-hidden="true">⌄</span>
                            </button>

                            <ul class="routes-dropdown">
                                ${routeLinks}
                            </ul>
                        </div>

                        <div class="language-switcher" aria-label="${text.languageLabel}">
                            ${languageLinks}
                        </div>

                        <a class="header-cta"
                           href="${buildUrl(locale, "home", root, "#routes")}">
                            ${text.explore}
                        </a>
                    </nav>
                </div>
            </header>
        `;
    }

    function createFooter(locale, root) {
        const text = content[locale];

        return `
            <footer class="site-footer">
                <div class="container footer-grid">
                    <div class="footer-brand">
                        <a class="brand" href="${buildUrl(locale, "home", root)}">
                            <span class="brand-mark" aria-hidden="true">
                                <span></span>
                            </span>

                            <span class="brand-text">
                                <strong>DRIVE</strong>
                                <small>KKTC</small>
                            </span>
                        </a>

                        <p>${text.footerText}</p>
                    </div>

                    <nav class="footer-routes" aria-label="${text.routes}">
                        <a href="${buildUrl(locale, "buffavento", root)}">${text.routeNames.buffavento}</a>
                        <a href="${buildUrl(locale, "kantara", root)}">${text.routeNames.kantara}</a>
                        <a href="${buildUrl(locale, "lapta", root)}">${text.routeNames.lapta}</a>
                        <a href="${buildUrl(locale, "korucam", root)}">${text.routeNames.korucam}</a>
                        <a href="${buildUrl(locale, "mehmetcik", root)}">${text.routeNames.mehmetcik}</a>
                    </nav>
                </div>

                <div class="container footer-bottom">
                    <p>© <span data-current-year></span> Drive KKTC · Can Aker</p>
                </div>
            </footer>
        `;
    }

    function initialiseNavigation() {
        const menuToggle = document.querySelector(".menu-toggle");
        const navigation = document.querySelector(".primary-navigation");
        const routesButton = document.querySelector(".routes-menu-button");
        const routesMenu = document.querySelector(".routes-menu");

        menuToggle?.addEventListener("click", () => {
            const isOpen = navigation.classList.toggle("is-open");
            menuToggle.setAttribute("aria-expanded", String(isOpen));
        });

        routesButton?.addEventListener("click", () => {
            const isOpen = routesMenu.classList.toggle("is-open");
            routesButton.setAttribute("aria-expanded", String(isOpen));
        });

        document.addEventListener("click", (event) => {
            if (routesMenu && !routesMenu.contains(event.target)) {
                routesMenu.classList.remove("is-open");
                routesButton?.setAttribute("aria-expanded", "false");
            }
        });
    }

    document.addEventListener("DOMContentLoaded", () => {
        const { locale, page, root } = getPageSettings();
        const headerTarget = document.querySelector("[data-site-header]");
        const footerTarget = document.querySelector("[data-site-footer]");

        document.documentElement.lang = locale;

        if (headerTarget) {
            headerTarget.innerHTML = createHeader(locale, page, root);
        }

        if (footerTarget) {
            footerTarget.innerHTML = createFooter(locale, root);
        }

        document.querySelectorAll("[data-current-year]").forEach((element) => {
            element.textContent = new Date().getFullYear();
        });

        initialiseNavigation();
    });
})();
