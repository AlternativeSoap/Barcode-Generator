document.addEventListener('DOMContentLoaded', () => {
    // --- State Management ---
    const state = {
        category: '1d', // '1d' or '2d'
        type: 'EAN13',
        contentType: 'text', // for QR codes
        content: '',
        ean13Mode: 'simple', // 'simple' or 'gs1'
        ean8Mode: 'simple',
        upcMode: 'simple',
        itf14Mode: 'simple',
        gs1InfoExpanded: false, // For expandable info panel (collapsed by default)
        options: {
            fgColor: '#000000',
            bgColor: '#ffffff',
            size: 200,
            showText: true,
            includeMargin: true
        },
        history: []
    };

    // --- GS1 Barcode Information Database ---
    const barcodeInfo = {
        EAN13: {
            en: {
                title: "EAN-13 (European Article Number)",
                description: "The most widely used barcode worldwide for retail products. Part of the GS1 system, it encodes a 13-digit number that uniquely identifies products globally.",
                structure: "GS1 Prefix (2-3 digits, e.g. 57=Denmark, 40-44=Germany, 50=UK) + Company Number (variable) + Product Number (variable) + Check Digit (1 digit) = 13 digits total",
                usage: "Retail products, books (ISBN-13), magazines (ISSN)"
            },
            dk: {
                title: "EAN-13 (European Article Number)",
                description: "Den mest udbredte stregkode i verden til detailprodukter. En del af GS1-systemet, den koder et 13-cifret nummer der unikt identificerer produkter globalt.",
                structure: "GS1 Præfiks (2-3 cifre, f.eks. 57=Danmark, 40-44=Tyskland, 50=UK) + Virksomhedsnr. (variabel) + Varenr. (variabel) + Kontrolciffer (1 ciffer) = 13 cifre i alt",
                usage: "Detailprodukter, bøger (ISBN-13), magasiner (ISSN)"
            }
        },
        EAN8: {
            en: {
                title: "EAN-8 (Compact EAN)",
                description: "A shorter version of EAN-13 for small products where space is limited. Uses 8 digits for compact packaging.",
                structure: "GS1 Prefix (2-3 digits) + Item Reference (4-5 digits) + Check Digit (1 digit)",
                usage: "Small products, candy, cosmetics, small packages"
            },
            dk: {
                title: "EAN-8 (Kompakt EAN)",
                description: "En kortere version af EAN-13 til små produkter hvor pladsen er begrænset. Bruger 8 cifre til kompakt emballage.",
                structure: "GS1 Præfiks (2-3 cifre) + Varereference (4-5 cifre) + Kontrolciffer (1 ciffer)",
                usage: "Små produkter, slik, kosmetik, små pakker"
            }
        },
        UPC: {
            en: {
                title: "UPC-A (Universal Product Code)",
                description: "The standard barcode used in USA and Canada for retail products. Compatible with EAN-13 (add leading 0 to convert).",
                structure: "Number System (1 digit) + Manufacturer Code (5 digits) + Product Code (5 digits) + Check Digit (1 digit)",
                usage: "Retail products in North America, supermarkets"
            },
            dk: {
                title: "UPC-A (Universal Product Code)",
                description: "Standard stregkoden brugt i USA og Canada til detailprodukter. Kompatibel med EAN-13 (tilføj foranstillet 0 for at konvertere).",
                structure: "Nummersystem (1 ciffer) + Producentkode (5 cifre) + Produktkode (5 cifre) + Kontrolciffer (1 ciffer)",
                usage: "Detailprodukter i Nordamerika, supermarkeder"
            }
        },
        CODE39: {
            en: {
                title: "Code 39 (Alpha39)",
                description: "A variable length barcode that can encode uppercase letters, numbers, and some special characters. Self-checking without a required check digit.",
                structure: "Variable length, supports A-Z, 0-9, and symbols - . $ / + % SPACE",
                usage: "Automotive industry, defense, healthcare, ID badges"
            },
            dk: {
                title: "Code 39 (Alpha39)",
                description: "En stregkode med variabel længde der kan kode store bogstaver, tal og nogle specialtegn. Selvkontrollerende uden påkrævet kontrolciffer.",
                structure: "Variabel længde, understøtter A-Z, 0-9 og symboler - . $ / + % MELLEMRUM",
                usage: "Bilindustrien, forsvar, sundhedssektoren, ID-kort"
            }
        },
        CODE128: {
            en: {
                title: "Code 128",
                description: "A high-density barcode supporting the full ASCII character set. Very efficient for alphanumeric data with automatic character set switching.",
                structure: "Variable length, supports all 128 ASCII characters",
                usage: "Shipping labels, packaging, logistics, GS1-128 applications"
            },
            dk: {
                title: "Code 128",
                description: "En høj-densitet stregkode der understøtter det fulde ASCII-tegnsæt. Meget effektiv til alfanumeriske data med automatisk tegnsætskift.",
                structure: "Variabel længde, understøtter alle 128 ASCII-tegn",
                usage: "Forsendelsesmærkater, emballage, logistik, GS1-128 applikationer"
            }
        },
        ITF14: {
            en: {
                title: "ITF-14 (Interleaved 2 of 5)",
                description: "A GS1 barcode for marking shipping containers and cartons. The first digit indicates packaging level (1-8 for different packaging configurations).",
                structure: "Packaging Indicator (1 digit) + GS1 Company Prefix (7 digits) + Item Reference (5 digits) + Check Digit (1 digit)",
                usage: "Shipping cartons, pallets, logistics, warehouse management"
            },
            dk: {
                title: "ITF-14 (Interleaved 2 of 5)",
                description: "En GS1 stregkode til mærkning af forsendelsescontainere og kartoner. Det første ciffer angiver emballageniveau (1-8 for forskellige emballagekonfigurationer).",
                structure: "Emballageindikator (1 ciffer) + GS1 Virksomhedspræfiks (7 cifre) + Varereference (5 cifre) + Kontrolciffer (1 ciffer)",
                usage: "Forsendelseskartoner, paller, logistik, lagerstyring"
            }
        },
        QR: {
            en: {
                title: "QR Code (Quick Response)",
                description: "A 2D matrix barcode that can store large amounts of data including URLs, text, contact info, and more. Readable from any angle.",
                structure: "Matrix pattern with position markers, timing patterns, and data modules",
                usage: "Mobile payments, marketing, tickets, authentication, WiFi sharing"
            },
            dk: {
                title: "QR-kode (Quick Response)",
                description: "En 2D matrix stregkode der kan gemme store mængder data inklusiv URLs, tekst, kontaktinfo og mere. Kan læses fra enhver vinkel.",
                structure: "Matrixmønster med positionsmarkører, timingmønstre og datamoduler",
                usage: "Mobilbetalinger, markedsføring, billetter, autentificering, WiFi-deling"
            }
        },
        DATAMATRIX: {
            en: {
                title: "Data Matrix",
                description: "A 2D barcode ideal for marking small items. Very high data density and excellent error correction. Can be as small as 2.5mm.",
                structure: "Square or rectangular matrix with finder pattern and data cells",
                usage: "Electronic components, medical devices, aerospace parts, pharmaceuticals"
            },
            dk: {
                title: "Data Matrix",
                description: "En 2D stregkode ideel til mærkning af små genstande. Meget høj datadensitet og fremragende fejlkorrektion. Kan være så lille som 2,5mm.",
                structure: "Kvadratisk eller rektangulær matrix med søgemønster og dataceller",
                usage: "Elektroniske komponenter, medicinsk udstyr, luftfartsdele, farmaceutiske produkter"
            }
        },
        PDF417: {
            en: {
                title: "PDF417 (Portable Data File)",
                description: "A stacked linear barcode that can encode large amounts of text and data. Used for ID cards and documents with high data capacity.",
                structure: "Stacked rows of linear patterns with start/stop patterns",
                usage: "Driver's licenses, ID cards, airline boarding passes, shipping documents"
            },
            dk: {
                title: "PDF417 (Portable Data File)",
                description: "En stablet lineær stregkode der kan kode store mængder tekst og data. Bruges til ID-kort og dokumenter med høj datakapacitet.",
                structure: "Stablede rækker af lineære mønstre med start/stop mønstre",
                usage: "Kørekort, ID-kort, fly-boardingkort, forsendelsesdokumenter"
            }
        }
    };

    // GS1 Prefix countries (common ones)
    const gs1Prefixes = {
        '00-13': 'USA & Canada',
        '20-29': 'In-store / Intern brug',
        '30-37': 'France / Frankrig',
        '40-44': 'Germany / Tyskland',
        '45-49': 'Japan',
        '50': 'UK',
        '53': 'Ireland / Irland',
        '54': 'Belgium & Luxembourg',
        '57': 'Denmark / Danmark',
        '64': 'Finland',
        '70': 'Norway / Norge',
        '73': 'Sweden / Sverige',
        '76': 'Switzerland / Schweiz',
        '80-83': 'Italy / Italien',
        '84': 'Spain / Spanien',
        '87': 'Netherlands / Holland',
        '90-91': 'Austria / Østrig',
        '93': 'Australia / Australien',
        '94': 'New Zealand',
        '471': 'Taiwan',
        '489': 'Hong Kong',
        '690-699': 'China / Kina'
    };

    // --- DOM Elements ---
    const elements = {
        themeToggle: document.getElementById('themeToggle'),
        typeTabs: document.querySelectorAll('.type-tab'),
        typeGroups: document.querySelectorAll('.type-group'),
        barcodeTypes: document.querySelectorAll('input[name="barcodeType"]'),
        qrContentSection: document.getElementById('qrContentSection'),
        contentTypeBtns: document.querySelectorAll('.content-type-btn'),
        inputSectionTitle: document.getElementById('inputSectionTitle'),
        inputGroups: document.querySelectorAll('.input-group'),
        generateBtn: document.getElementById('generateBtn'),
        randomBtn: document.getElementById('randomBtn'),
        previewArea: document.getElementById('previewArea'),
        placeholder: document.getElementById('placeholder'),
        barcodeDisplay: document.getElementById('barcodeDisplay'),
        barcodeCanvas: document.getElementById('barcodeCanvas'),
        qrcodeContainer: document.getElementById('qrcodeContainer'),
        fgColor: document.getElementById('fgColor'),
        bgColor: document.getElementById('bgColor'),
        barcodeSize: document.getElementById('barcodeSize'),
        sizeValue: document.getElementById('sizeValue'),
        showText: document.getElementById('showText'),
        includeMargin: document.getElementById('includeMargin'),
        exportBtns: {
            copy: document.getElementById('copyBtn'),
            png: document.getElementById('downloadPng'),
            svg: document.getElementById('downloadSvg'),
            jpg: document.getElementById('downloadJpg'),
            print: document.getElementById('printBtn')
        },
        historyGrid: document.getElementById('historyGrid'),
        clearHistory: document.getElementById('clearHistory'),
        toast: document.getElementById('toast'),
        toastMessage: document.getElementById('toastMessage'),
        // GS1 elements
        gs1InfoPanel: document.getElementById('gs1InfoPanel'),
        gs1Structure: document.getElementById('gs1Structure'),
        gs1InfoSection: document.getElementById('gs1InfoSection'),
        gs1InfoToggle: document.getElementById('gs1InfoToggle'),
        gs1InfoContent: document.getElementById('gs1InfoContent'),
        // EAN-13 GS1 mode elements
        ean13ModeRadios: document.querySelectorAll('input[name="ean13Mode"]'),
        ean13SimpleInput: document.getElementById('ean13SimpleInput'),
        ean13Gs1Input: document.getElementById('ean13Gs1Input'),
        ean13Prefix: document.getElementById('ean13Prefix'),
        ean13Company: document.getElementById('ean13Company'),
        ean13Product: document.getElementById('ean13Product'),
        ean13CheckDigit: document.getElementById('ean13CheckDigit'),
        ean13PreviewValue: document.getElementById('ean13PreviewValue'),
        // EAN-8 GS1 mode elements
        ean8ModeRadios: document.querySelectorAll('input[name="ean8Mode"]'),
        ean8SimpleInput: document.getElementById('ean8SimpleInput'),
        ean8Gs1Input: document.getElementById('ean8Gs1Input'),
        ean8Prefix: document.getElementById('ean8Prefix'),
        ean8Product: document.getElementById('ean8Product'),
        ean8CheckDigit: document.getElementById('ean8CheckDigit'),
        ean8PreviewValue: document.getElementById('ean8PreviewValue'),
        // UPC-A GS1 mode elements
        upcModeRadios: document.querySelectorAll('input[name="upcMode"]'),
        upcSimpleInput: document.getElementById('upcSimpleInput'),
        upcGs1Input: document.getElementById('upcGs1Input'),
        upcNumSys: document.getElementById('upcNumSys'),
        upcManufacturer: document.getElementById('upcManufacturer'),
        upcProduct: document.getElementById('upcProduct'),
        upcCheckDigit: document.getElementById('upcCheckDigit'),
        upcPreviewValue: document.getElementById('upcPreviewValue'),
        // ITF-14 GS1 mode elements
        itf14ModeRadios: document.querySelectorAll('input[name="itf14Mode"]'),
        itf14SimpleInput: document.getElementById('itf14SimpleInput'),
        itf14Gs1Input: document.getElementById('itf14Gs1Input'),
        itf14Indicator: document.getElementById('itf14Indicator'),
        itf14Company: document.getElementById('itf14Company'),
        itf14Product: document.getElementById('itf14Product'),
        itf14CheckDigit: document.getElementById('itf14CheckDigit'),
        itf14PreviewValue: document.getElementById('itf14PreviewValue')
    };

    // --- Initialization ---
    init();

    function init() {
        loadHistory();
        setupEventListeners();
        updateUI();
        updateBarcodeInfo(); // Initialize barcode info display
        
        // Set info panel to collapsed by default
        if (elements.gs1InfoSection) {
            elements.gs1InfoSection.classList.add('collapsed');
        }
        
        // Check system theme preference
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.documentElement.setAttribute('data-theme', 'dark');
        }
    }

    function updateUI() {
        updateCategoryUI();
        updateTypeUI();
        updateBarcodeInfo();
    }

    // --- Event Listeners ---
    function setupEventListeners() {
        // Theme Toggle
        elements.themeToggle.addEventListener('click', toggleTheme);

        // Category Tabs (1D vs 2D)
        elements.typeTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                state.category = tab.dataset.category;
                updateCategoryUI();
                
                // Select first available type in category
                const firstType = document.querySelector(`.type-group[data-category="${state.category}"] input`);
                if (firstType) {
                    firstType.click();
                }
            });
        });

        // Barcode Type Selection
        elements.barcodeTypes.forEach(radio => {
            radio.addEventListener('change', (e) => {
                state.type = e.target.value;
                updateTypeUI();
                updateBarcodeInfo();
            });
        });

        // EAN-13 GS1 Mode Toggle
        if (elements.ean13ModeRadios) {
            elements.ean13ModeRadios.forEach(radio => {
                radio.addEventListener('change', (e) => {
                    state.ean13Mode = e.target.value;
                    updateEan13ModeUI();
                });
            });
        }

        // EAN-13 GS1 fields listeners
        if (elements.ean13Prefix) {
            elements.ean13Prefix.addEventListener('input', updateEan13Preview);
            elements.ean13Company.addEventListener('input', updateEan13Preview);
            elements.ean13Product.addEventListener('input', updateEan13Preview);
        }

        // EAN-8 GS1 Mode Toggle
        if (elements.ean8ModeRadios) {
            elements.ean8ModeRadios.forEach(radio => {
                radio.addEventListener('change', (e) => {
                    state.ean8Mode = e.target.value;
                    updateEan8ModeUI();
                });
            });
        }

        // EAN-8 GS1 fields listeners
        if (elements.ean8Prefix) {
            elements.ean8Prefix.addEventListener('input', updateEan8Preview);
            elements.ean8Product.addEventListener('input', updateEan8Preview);
        }

        // UPC-A GS1 Mode Toggle
        if (elements.upcModeRadios) {
            elements.upcModeRadios.forEach(radio => {
                radio.addEventListener('change', (e) => {
                    state.upcMode = e.target.value;
                    updateUpcModeUI();
                });
            });
        }

        // UPC-A GS1 fields listeners
        if (elements.upcNumSys) {
            elements.upcNumSys.addEventListener('input', updateUpcPreview);
            elements.upcManufacturer.addEventListener('input', updateUpcPreview);
            elements.upcProduct.addEventListener('input', updateUpcPreview);
        }

        // ITF-14 GS1 Mode Toggle
        if (elements.itf14ModeRadios) {
            elements.itf14ModeRadios.forEach(radio => {
                radio.addEventListener('change', (e) => {
                    state.itf14Mode = e.target.value;
                    updateItf14ModeUI();
                });
            });
        }

        // ITF-14 GS1 fields listeners
        if (elements.itf14Indicator) {
            elements.itf14Indicator.addEventListener('input', updateItf14Preview);
            elements.itf14Company.addEventListener('input', updateItf14Preview);
            elements.itf14Product.addEventListener('input', updateItf14Preview);
        }

        // GS1 Info Panel Toggle (Expandable)
        if (elements.gs1InfoToggle) {
            elements.gs1InfoToggle.addEventListener('click', () => {
                state.gs1InfoExpanded = !state.gs1InfoExpanded;
                elements.gs1InfoSection.classList.toggle('collapsed', !state.gs1InfoExpanded);
            });
        }

        // Content Type Selection (QR)
        elements.contentTypeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                state.contentType = btn.dataset.content;
                updateContentTypeUI();
            });
        });

        // Customization Options
        elements.fgColor.addEventListener('input', (e) => {
            state.options.fgColor = e.target.value;
            generateBarcode(); // Live update
        });

        elements.bgColor.addEventListener('input', (e) => {
            state.options.bgColor = e.target.value;
            generateBarcode(); // Live update
        });

        elements.barcodeSize.addEventListener('input', (e) => {
            state.options.size = parseInt(e.target.value);
            elements.sizeValue.textContent = `${state.options.size}px`;
            generateBarcode(); // Live update
        });

        elements.showText.addEventListener('change', (e) => {
            state.options.showText = e.target.checked;
            generateBarcode();
        });

        elements.includeMargin.addEventListener('change', (e) => {
            state.options.includeMargin = e.target.checked;
            generateBarcode();
        });

        // Generate Button
        elements.generateBtn.addEventListener('click', () => {
            generateBarcode(true); // true = save to history
        });

        // Random Button
        if (elements.randomBtn) {
            elements.randomBtn.addEventListener('click', () => {
                fillRandomData();
            });
        }

        // Fun QR Refresh Buttons
        document.getElementById('refreshJoke')?.addEventListener('click', () => {
            getRandomJoke();
            generateBarcode(false);
        });
        document.getElementById('refreshFortune')?.addEventListener('click', () => {
            getRandomFortune();
            generateBarcode(false);
        });
        document.getElementById('refreshCompliment')?.addEventListener('click', () => {
            getRandomCompliment();
            generateBarcode(false);
        });
        document.getElementById('refreshCatfact')?.addEventListener('click', () => {
            getRandomCatFact();
            generateBarcode(false);
        });
        document.getElementById('refreshDadjoke')?.addEventListener('click', () => {
            getRandomDadJoke();
            generateBarcode(false);
        });

        // Fun link and meme selectors
        document.getElementById('funlinkSelect')?.addEventListener('change', () => {
            generateBarcode(false);
        });
        document.getElementById('memeTemplate')?.addEventListener('change', () => {
            generateBarcode(false);
        });
        document.getElementById('memeTop')?.addEventListener('input', () => {
            generateBarcode(false);
        });
        document.getElementById('memeBottom')?.addEventListener('input', () => {
            generateBarcode(false);
        });

        // QR Customization listeners
        document.getElementById('qrGradientType')?.addEventListener('change', (e) => {
            const gradientOptions = document.getElementById('qrGradientOptions');
            const rotationGroup = document.getElementById('gradientRotationGroup');
            if (gradientOptions) {
                gradientOptions.classList.toggle('hidden', e.target.value === 'none');
            }
            if (rotationGroup) {
                rotationGroup.classList.toggle('hidden', e.target.value !== 'linear');
            }
            generateBarcode(false);
        });
        
        document.getElementById('gradientColor1')?.addEventListener('input', () => generateBarcode(false));
        document.getElementById('gradientColor2')?.addEventListener('input', () => generateBarcode(false));
        document.getElementById('gradientRotation')?.addEventListener('input', (e) => {
            const rotationValue = document.getElementById('rotationValue');
            if (rotationValue) rotationValue.textContent = e.target.value + '°';
            generateBarcode(false);
        });
        
        // Logo customization listeners
        document.getElementById('qrLogoUpload')?.addEventListener('change', () => generateBarcode(false));
        document.getElementById('logoSizeSlider')?.addEventListener('input', (e) => {
            const logoSizeValue = document.getElementById('logoSizeValue');
            if (logoSizeValue) logoSizeValue.textContent = Math.round(e.target.value * 100) + '%';
            generateBarcode(false);
        });
        document.getElementById('logoMarginSlider')?.addEventListener('input', (e) => {
            const logoMarginValue = document.getElementById('logoMarginValue');
            if (logoMarginValue) logoMarginValue.textContent = e.target.value + 'px';
            generateBarcode(false);
        });
        document.getElementById('logoBorderRadiusSlider')?.addEventListener('input', (e) => {
            const logoBorderRadiusValue = document.getElementById('logoBorderRadiusValue');
            if (logoBorderRadiusValue) logoBorderRadiusValue.textContent = e.target.value + 'px';
            generateBarcode(false);
        });
        document.getElementById('clearLogoBtn')?.addEventListener('click', () => {
            const logoUpload = document.getElementById('qrLogoUpload');
            if (logoUpload) logoUpload.value = '';
            generateBarcode(false);
        });

        // Export Buttons
        elements.exportBtns.copy.addEventListener('click', copyToClipboard);
        elements.exportBtns.png.addEventListener('click', () => downloadImage('png'));
        elements.exportBtns.svg.addEventListener('click', () => downloadImage('svg')); // Note: Basic implementation
        elements.exportBtns.jpg.addEventListener('click', () => downloadImage('jpeg'));
        elements.exportBtns.print.addEventListener('click', printBarcode);

        // History
        elements.clearHistory.addEventListener('click', clearHistory);
    }

    // --- UI Updates ---
    function toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
    }

    function updateCategoryUI() {
        // Update tabs
        elements.typeTabs.forEach(tab => {
            tab.classList.toggle('active', tab.dataset.category === state.category);
        });

        // Show/hide type groups
        elements.typeGroups.forEach(group => {
            group.classList.toggle('hidden', group.dataset.category !== state.category);
        });
    }

    function updateTypeUI() {
        // Update selected style on cards
        document.querySelectorAll('.type-option').forEach(opt => {
            opt.classList.toggle('selected', opt.querySelector('input').checked);
        });

        // Show/hide QR content section
        if (state.type === 'QR') {
            elements.qrContentSection.classList.add('visible');
            updateContentTypeUI();
        } else {
            elements.qrContentSection.classList.remove('visible');
            showInputGroup(`input${capitalize(state.type)}`) || showInputGroup('inputText');
        }
    }

    function updateContentTypeUI() {
        // Update buttons
        elements.contentTypeBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.content === state.contentType);
        });

        // Show appropriate input fields
        showInputGroup(`input${capitalize(state.contentType)}`);
        
        // Initialize fun QR content if needed
        if (['joke', 'fortune', 'compliment', 'catfact', 'dadjoke'].includes(state.contentType)) {
            // Generate initial content if not already set
            if (!state.funContent || !state.funContent[state.contentType]) {
                switch (state.contentType) {
                    case 'joke': getRandomJoke(); break;
                    case 'fortune': getRandomFortune(); break;
                    case 'compliment': getRandomCompliment(); break;
                    case 'catfact': getRandomCatFact(); break;
                    case 'dadjoke': getRandomDadJoke(); break;
                }
            }
        }
    }

    function showInputGroup(id) {
        // Hide all first
        elements.inputGroups.forEach(group => group.classList.add('hidden'));
        
        // Show target
        const target = document.getElementById(id);
        if (target) {
            target.classList.remove('hidden');
            return true;
        }
        // Fallback to text input if specific input group not found
        const textInput = document.getElementById('inputText');
        if (textInput) textInput.classList.remove('hidden');
        return false;
    }

    // --- GS1 Info and Structure Updates ---
    function updateBarcodeInfo() {
        const info = barcodeInfo[state.type];
        if (!info || !elements.gs1InfoPanel) return;

        elements.gs1InfoPanel.innerHTML = `
            <div class="info-title">
                <span>ℹ️</span> ${info.en.title}
            </div>
            <div class="info-content">
                <div class="info-en">
                    <strong>Description:</strong> ${info.en.description}<br>
                    <strong>Structure:</strong> ${info.en.structure}<br>
                    <strong>Common uses:</strong> ${info.en.usage}
                </div>
                <div class="info-dk">
                    <strong>Beskrivelse:</strong> ${info.dk.description}<br>
                    <strong>Struktur:</strong> ${info.dk.structure}<br>
                    <strong>Almindelige anvendelser:</strong> ${info.dk.usage}
                </div>
            </div>
        `;

        // Update GS1 structure visualization for applicable types
        updateGS1StructureVisualization();
    }

    function updateGS1StructureVisualization() {
        if (!elements.gs1Structure) return;

        // Only show structure for GS1 barcodes
        const gs1Types = ['EAN13', 'EAN8', 'UPC', 'ITF14'];
        if (!gs1Types.includes(state.type)) {
            elements.gs1Structure.innerHTML = '';
            elements.gs1Structure.style.display = 'none';
            return;
        }

        elements.gs1Structure.style.display = 'block';
        
        let structureHTML = '';
        switch (state.type) {
            case 'EAN13':
                structureHTML = `
                    <div class="gs1-structure-title">EAN-13 GS1 Structure / Struktur</div>
                    <div class="gs1-structure-visual">
                        <div class="struct-segment prefix">
                            <span class="segment-value">XXX</span>
                            <span class="segment-label">Prefix</span>
                            <span class="segment-label-dk">Præfiks</span>
                        </div>
                        <div class="struct-segment company">
                            <span class="segment-value">XXXX</span>
                            <span class="segment-label">Company</span>
                            <span class="segment-label-dk">Virksomhed</span>
                        </div>
                        <div class="struct-segment product">
                            <span class="segment-value">XXXXX</span>
                            <span class="segment-label">Product</span>
                            <span class="segment-label-dk">Vare</span>
                        </div>
                        <div class="struct-segment check">
                            <span class="segment-value">X</span>
                            <span class="segment-label">Check</span>
                            <span class="segment-label-dk">Kontrol</span>
                        </div>
                    </div>
                `;
                break;
            case 'EAN8':
                structureHTML = `
                    <div class="gs1-structure-title">EAN-8 GS1 Structure / Struktur</div>
                    <div class="gs1-structure-visual">
                        <div class="struct-segment prefix">
                            <span class="segment-value">XX</span>
                            <span class="segment-label">Prefix</span>
                            <span class="segment-label-dk">Præfiks</span>
                        </div>
                        <div class="struct-segment product">
                            <span class="segment-value">XXXXX</span>
                            <span class="segment-label">Item Ref</span>
                            <span class="segment-label-dk">Vareref.</span>
                        </div>
                        <div class="struct-segment check">
                            <span class="segment-value">X</span>
                            <span class="segment-label">Check</span>
                            <span class="segment-label-dk">Kontrol</span>
                        </div>
                    </div>
                `;
                break;
            case 'UPC':
                structureHTML = `
                    <div class="gs1-structure-title">UPC-A Structure / Struktur</div>
                    <div class="gs1-structure-visual">
                        <div class="struct-segment prefix">
                            <span class="segment-value">X</span>
                            <span class="segment-label">Num Sys</span>
                            <span class="segment-label-dk">Num.sys</span>
                        </div>
                        <div class="struct-segment company">
                            <span class="segment-value">XXXXX</span>
                            <span class="segment-label">Manufacturer</span>
                            <span class="segment-label-dk">Producent</span>
                        </div>
                        <div class="struct-segment product">
                            <span class="segment-value">XXXXX</span>
                            <span class="segment-label">Product</span>
                            <span class="segment-label-dk">Produkt</span>
                        </div>
                        <div class="struct-segment check">
                            <span class="segment-value">X</span>
                            <span class="segment-label">Check</span>
                            <span class="segment-label-dk">Kontrol</span>
                        </div>
                    </div>
                `;
                break;
            case 'ITF14':
                structureHTML = `
                    <div class="gs1-structure-title">ITF-14 GS1 Structure / Struktur</div>
                    <div class="gs1-structure-visual">
                        <div class="struct-segment prefix">
                            <span class="segment-value">X</span>
                            <span class="segment-label">Pkg Level</span>
                            <span class="segment-label-dk">Emb.niveau</span>
                        </div>
                        <div class="struct-segment company">
                            <span class="segment-value">XXXXXXX</span>
                            <span class="segment-label">Company</span>
                            <span class="segment-label-dk">Virksomhed</span>
                        </div>
                        <div class="struct-segment product">
                            <span class="segment-value">XXXXX</span>
                            <span class="segment-label">Item Ref</span>
                            <span class="segment-label-dk">Vareref.</span>
                        </div>
                        <div class="struct-segment check">
                            <span class="segment-value">X</span>
                            <span class="segment-label">Check</span>
                            <span class="segment-label-dk">Kontrol</span>
                        </div>
                    </div>
                `;
                break;
        }
        elements.gs1Structure.innerHTML = structureHTML;
    }

    // --- EAN-13 GS1 Mode Functions ---
    function updateEan13ModeUI() {
        if (!elements.ean13SimpleInput || !elements.ean13Gs1Input) return;
        
        if (state.ean13Mode === 'simple') {
            elements.ean13SimpleInput.classList.remove('hidden');
            elements.ean13Gs1Input.classList.add('hidden');
        } else {
            elements.ean13SimpleInput.classList.add('hidden');
            elements.ean13Gs1Input.classList.remove('hidden');
        }
    }

    function updateEan13Preview() {
        if (!elements.ean13Prefix) return;
        
        const prefix = elements.ean13Prefix.value || '';
        const company = elements.ean13Company.value || '';
        const product = elements.ean13Product.value || '';
        
        // Combine all parts
        let combined = prefix + company + product;
        
        // Must be exactly 12 digits for check digit calculation
        if (combined.length > 12) {
            combined = combined.substring(0, 12);
        }
        
        // Show current length status
        const digitsNeeded = 12 - combined.length;
        
        if (combined.length === 12) {
            // Calculate check digit only when we have exactly 12 digits
            const checkDigit = calculateEANChecksum(combined);
            const fullCode = combined + checkDigit;
            
            if (elements.ean13CheckDigit) {
                elements.ean13CheckDigit.value = checkDigit;
            }
            if (elements.ean13PreviewValue) {
                elements.ean13PreviewValue.textContent = fullCode;
                elements.ean13PreviewValue.style.color = '';
            }
            
            // Also update the simple input
            const ean13Input = document.getElementById('ean13Input');
            if (ean13Input) {
                ean13Input.value = fullCode;
            }
        } else {
            // Not enough digits yet
            if (elements.ean13CheckDigit) {
                elements.ean13CheckDigit.value = '?';
            }
            if (elements.ean13PreviewValue) {
                elements.ean13PreviewValue.textContent = combined + ' (need ' + digitsNeeded + ' more)';
                elements.ean13PreviewValue.style.color = 'var(--danger-color)';
            }
        }
    }

    function getEan13FromGs1Fields() {
        if (!elements.ean13Prefix) return '';
        
        const prefix = elements.ean13Prefix.value || '';
        const company = elements.ean13Company.value || '';
        const product = elements.ean13Product.value || '';
        
        let combined = prefix + company + product;
        
        // Must be exactly 12 digits
        if (combined.length !== 12) {
            return ''; // Invalid - will trigger validation error
        }
        
        return combined + calculateEANChecksum(combined);
    }

    // --- EAN-8 GS1 Mode Functions ---
    function updateEan8ModeUI() {
        if (!elements.ean8SimpleInput || !elements.ean8Gs1Input) return;
        
        if (state.ean8Mode === 'simple') {
            elements.ean8SimpleInput.classList.remove('hidden');
            elements.ean8Gs1Input.classList.add('hidden');
        } else {
            elements.ean8SimpleInput.classList.add('hidden');
            elements.ean8Gs1Input.classList.remove('hidden');
        }
    }

    function updateEan8Preview() {
        if (!elements.ean8Prefix) return;
        
        const prefix = elements.ean8Prefix.value || '';
        const product = elements.ean8Product.value || '';
        
        let combined = prefix + product;
        
        if (combined.length > 7) {
            combined = combined.substring(0, 7);
        } else if (combined.length < 7) {
            combined = combined.padEnd(7, '0');
        }
        
        const checkDigit = calculateEANChecksum(combined);
        const fullCode = combined + checkDigit;
        
        if (elements.ean8CheckDigit) {
            elements.ean8CheckDigit.value = checkDigit;
        }
        if (elements.ean8PreviewValue) {
            elements.ean8PreviewValue.textContent = fullCode;
        }
        
        const ean8Input = document.getElementById('ean8Input');
        if (ean8Input) {
            ean8Input.value = fullCode;
        }
    }

    function getEan8FromGs1Fields() {
        if (!elements.ean8Prefix) return '';
        
        const prefix = elements.ean8Prefix.value || '';
        const product = elements.ean8Product.value || '';
        
        let combined = prefix + product;
        
        if (combined.length > 7) {
            combined = combined.substring(0, 7);
        } else if (combined.length < 7) {
            combined = combined.padEnd(7, '0');
        }
        
        return combined + calculateEANChecksum(combined);
    }

    // --- UPC-A GS1 Mode Functions ---
    function updateUpcModeUI() {
        if (!elements.upcSimpleInput || !elements.upcGs1Input) return;
        
        if (state.upcMode === 'simple') {
            elements.upcSimpleInput.classList.remove('hidden');
            elements.upcGs1Input.classList.add('hidden');
        } else {
            elements.upcSimpleInput.classList.add('hidden');
            elements.upcGs1Input.classList.remove('hidden');
        }
    }

    function updateUpcPreview() {
        if (!elements.upcNumSys) return;
        
        const numSys = elements.upcNumSys.value || '';
        const manufacturer = elements.upcManufacturer.value || '';
        const product = elements.upcProduct.value || '';
        
        let combined = numSys + manufacturer + product;
        
        if (combined.length > 11) {
            combined = combined.substring(0, 11);
        } else if (combined.length < 11) {
            combined = combined.padEnd(11, '0');
        }
        
        const checkDigit = calculateEANChecksum(combined);
        const fullCode = combined + checkDigit;
        
        if (elements.upcCheckDigit) {
            elements.upcCheckDigit.value = checkDigit;
        }
        if (elements.upcPreviewValue) {
            elements.upcPreviewValue.textContent = fullCode;
        }
        
        const upcInput = document.getElementById('upcInput');
        if (upcInput) {
            upcInput.value = fullCode;
        }
    }

    function getUpcFromGs1Fields() {
        if (!elements.upcNumSys) return '';
        
        const numSys = elements.upcNumSys.value || '';
        const manufacturer = elements.upcManufacturer.value || '';
        const product = elements.upcProduct.value || '';
        
        let combined = numSys + manufacturer + product;
        
        if (combined.length > 11) {
            combined = combined.substring(0, 11);
        } else if (combined.length < 11) {
            combined = combined.padEnd(11, '0');
        }
        
        return combined + calculateEANChecksum(combined);
    }

    // --- ITF-14 GS1 Mode Functions ---
    function updateItf14ModeUI() {
        if (!elements.itf14SimpleInput || !elements.itf14Gs1Input) return;
        
        if (state.itf14Mode === 'simple') {
            elements.itf14SimpleInput.classList.remove('hidden');
            elements.itf14Gs1Input.classList.add('hidden');
        } else {
            elements.itf14SimpleInput.classList.add('hidden');
            elements.itf14Gs1Input.classList.remove('hidden');
        }
    }

    function updateItf14Preview() {
        if (!elements.itf14Indicator) return;
        
        const indicator = elements.itf14Indicator.value || '';
        const company = elements.itf14Company.value || '';
        const product = elements.itf14Product.value || '';
        
        let combined = indicator + company + product;
        
        if (combined.length > 13) {
            combined = combined.substring(0, 13);
        } else if (combined.length < 13) {
            combined = combined.padEnd(13, '0');
        }
        
        const checkDigit = calculateEANChecksum(combined);
        const fullCode = combined + checkDigit;
        
        if (elements.itf14CheckDigit) {
            elements.itf14CheckDigit.value = checkDigit;
        }
        if (elements.itf14PreviewValue) {
            elements.itf14PreviewValue.textContent = fullCode;
        }
        
        const itf14Input = document.getElementById('itf14Input');
        if (itf14Input) {
            itf14Input.value = fullCode;
        }
    }

    function getItf14FromGs1Fields() {
        if (!elements.itf14Indicator) return '';
        
        const indicator = elements.itf14Indicator.value || '';
        const company = elements.itf14Company.value || '';
        const product = elements.itf14Product.value || '';
        
        let combined = indicator + company + product;
        
        if (combined.length > 13) {
            combined = combined.substring(0, 13);
        } else if (combined.length < 13) {
            combined = combined.padEnd(13, '0');
        }
        
        return combined + calculateEANChecksum(combined);
    }

    // --- Data Collection ---
    function getInputData() {
        if (state.type !== 'QR') {
            // Special handling for EAN-13 in GS1 mode
            if (state.type === 'EAN13' && state.ean13Mode === 'gs1') {
                return getEan13FromGs1Fields();
            }
            // Special handling for EAN-8 in GS1 mode
            if (state.type === 'EAN8' && state.ean8Mode === 'gs1') {
                return getEan8FromGs1Fields();
            }
            // Special handling for UPC-A in GS1 mode
            if (state.type === 'UPC' && state.upcMode === 'gs1') {
                return getUpcFromGs1Fields();
            }
            // Special handling for ITF-14 in GS1 mode
            if (state.type === 'ITF14' && state.itf14Mode === 'gs1') {
                return getItf14FromGs1Fields();
            }
            
            // For 1D barcodes, look for the specific input by ID convention
            // EAN13 -> ean13Input, CODE39 -> code39Input, etc.
            const inputId = state.type.toLowerCase() + 'Input';
            const specificInput = document.getElementById(inputId);
            if (specificInput && specificInput.value) return specificInput.value;
            
            // Fallback to looking in the input group with textarea (for DATAMATRIX/PDF417)
            const inputGroup = document.getElementById(`input${capitalize(state.type)}`);
            if (inputGroup) {
                const textArea = inputGroup.querySelector('textarea');
                if (textArea && textArea.value) return textArea.value;
            }
            
            const textInput = document.getElementById('textInput');
            return textInput.value;
        }

        // For QR codes, construct data based on content type
        switch (state.contentType) {
            case 'text':
                return document.getElementById('textInput').value;
            case 'url':
                return document.getElementById('urlInput').value;
            case 'email':
                const email = document.getElementById('emailTo').value;
                const subject = document.getElementById('emailSubject').value;
                const body = document.getElementById('emailBody').value;
                return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
            case 'phone':
                return `tel:${document.getElementById('phoneInput').value}`;
            case 'sms':
                const smsNum = document.getElementById('smsNumber').value;
                const smsMsg = document.getElementById('smsMessage').value;
                return `sms:${smsNum}:${smsMsg}`; // Note: format varies by device, this is generic
            case 'wifi':
                const ssid = document.getElementById('wifiSsid').value;
                const pass = document.getElementById('wifiPassword').value;
                const type = document.getElementById('wifiEncryption').value;
                const hidden = document.getElementById('wifiHidden').checked;
                return `WIFI:S:${ssid};T:${type};P:${pass};H:${hidden};;`;
            case 'vcard':
                const n = document.getElementById('vcardLastName').value + ';' + document.getElementById('vcardFirstName').value;
                const fn = document.getElementById('vcardFirstName').value + ' ' + document.getElementById('vcardLastName').value;
                const org = document.getElementById('vcardOrg').value;
                const title = document.getElementById('vcardTitle').value;
                const tel = document.getElementById('vcardPhone').value;
                const mail = document.getElementById('vcardEmail').value;
                const url = document.getElementById('vcardWebsite').value;
                const adr = document.getElementById('vcardAddress').value;
                const note = document.getElementById('vcardNote').value;
                return `BEGIN:VCARD\nVERSION:3.0\nN:${n}\nFN:${fn}\nORG:${org}\nTITLE:${title}\nTEL:${tel}\nEMAIL:${mail}\nURL:${url}\nADR:;;${adr};;;;\nNOTE:${note}\nEND:VCARD`;
            case 'event':
                const evtTitle = document.getElementById('eventTitle').value;
                const start = formatVCalendarDate(document.getElementById('eventStart').value);
                const end = formatVCalendarDate(document.getElementById('eventEnd').value);
                const loc = document.getElementById('eventLocation').value;
                const desc = document.getElementById('eventDescription').value;
                return `BEGIN:VEVENT\nSUMMARY:${evtTitle}\nDTSTART:${start}\nDTEND:${end}\nLOCATION:${loc}\nDESCRIPTION:${desc}\nEND:VEVENT`;
            case 'geo':
                const lat = document.getElementById('geoLat').value;
                const lng = document.getElementById('geoLng').value;
                const query = document.getElementById('geoQuery').value;
                if (query) return `geo:0,0?q=${encodeURIComponent(query)}`;
                return `geo:${lat},${lng}`;
            case 'whatsapp':
                const waNum = document.getElementById('whatsappNumber').value;
                const waMsg = document.getElementById('whatsappMessage').value;
                return `https://wa.me/${waNum}?text=${encodeURIComponent(waMsg)}`;
            case 'bitcoin':
                const btcAddr = document.getElementById('bitcoinAddress').value;
                const btcAmt = document.getElementById('bitcoinAmount').value;
                const btcLabel = document.getElementById('bitcoinLabel').value;
                const btcMsg = document.getElementById('bitcoinMessage').value;
                let btcUri = `bitcoin:${btcAddr}`;
                const params = [];
                if (btcAmt) params.push(`amount=${btcAmt}`);
                if (btcLabel) params.push(`label=${encodeURIComponent(btcLabel)}`);
                if (btcMsg) params.push(`message=${encodeURIComponent(btcMsg)}`);
                if (params.length) btcUri += `?${params.join('&')}`;
                return btcUri;
            case 'ethereum':
                const ethAddr = document.getElementById('ethereumAddress').value;
                const ethAmt = document.getElementById('ethereumAmount').value;
                return ethAmt ? `ethereum:${ethAddr}?value=${ethAmt}` : `ethereum:${ethAddr}`;
            case 'paypal':
                // PayPal.me link
                const ppUser = document.getElementById('paypalEmail').value;
                const ppAmt = document.getElementById('paypalAmount').value;
                const ppCurr = document.getElementById('paypalCurrency').value;
                return ppAmt ? `https://www.paypal.com/paypalme/${ppUser}/${ppAmt}${ppCurr}` : `https://www.paypal.com/paypalme/${ppUser}`;
            case 'twitter':
                return `https://twitter.com/${document.getElementById('twitterUsername').value.replace('@', '')}`;
            case 'instagram':
                return `https://instagram.com/${document.getElementById('instagramUsername').value.replace('@', '')}`;
            case 'facebook':
                return document.getElementById('facebookUrl').value;
            case 'linkedin':
                return document.getElementById('linkedinUrl').value;
            case 'youtube':
                return document.getElementById('youtubeUrl').value;
            case 'tiktok':
                return `https://tiktok.com/@${document.getElementById('tiktokUsername').value.replace('@', '')}`;
            case 'spotify':
                return document.getElementById('spotifyUrl').value;
            case 'zoom':
                const zoomUrl = document.getElementById('zoomUrl').value;
                const zoomPass = document.getElementById('zoomPassword').value;
                // Note: Zoom URLs usually embed password, but this is a simple append if needed or just the URL
                return zoomUrl; 
            case 'appstore':
                return document.getElementById('appstoreUrl').value;
            case 'playstore':
                return document.getElementById('playstoreUrl').value;
            case 'mecard':
                const mcName = document.getElementById('mecardName').value;
                const mcTel = document.getElementById('mecardPhone').value;
                const mcEmail = document.getElementById('mecardEmail').value;
                const mcAdr = document.getElementById('mecardAddress').value;
                const mcUrl = document.getElementById('mecardUrl').value;
                const mcBday = document.getElementById('mecardBirthday').value.replace(/-/g, '');
                const mcNote = document.getElementById('mecardNote').value;
                return `MECARD:N:${mcName};TEL:${mcTel};EMAIL:${mcEmail};ADR:${mcAdr};URL:${mcUrl};BDAY:${mcBday};NOTE:${mcNote};;`;
            
            // Fun QR Codes
            case 'rickroll':
                return 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
            case 'joke':
                return state.funContent?.joke || getRandomJoke();
            case 'fortune':
                return state.funContent?.fortune || getRandomFortune();
            case 'compliment':
                return state.funContent?.compliment || getRandomCompliment();
            case 'catfact':
                return state.funContent?.catfact || getRandomCatFact();
            case 'dadjoke':
                return state.funContent?.dadjoke || getRandomDadJoke();
            case 'funlink':
                return getFunLink(document.getElementById('funlinkSelect')?.value || 'theuselessweb');
            case 'meme':
                const mTop = document.getElementById('memeTop')?.value || 'TOP TEXT';
                const mBottom = document.getElementById('memeBottom')?.value || 'BOTTOM TEXT';
                const mTemplate = document.getElementById('memeTemplate')?.value || 'doge';
                return getMemeUrl(mTemplate, mTop, mBottom);
            default:
                return '';
        }
    }

    // --- Fun QR Content ---
    const funData = {
        jokes: [
            "Why don't scientists trust atoms? Because they make up everything!",
            "What do you call a fake noodle? An impasta!",
            "Why did the scarecrow win an award? He was outstanding in his field!",
            "Why don't eggs tell jokes? They'd crack each other up!",
            "What do you call a bear with no teeth? A gummy bear!",
            "Why did the bicycle fall over? Because it was two tired!",
            "What do you call a fish without eyes? A fsh!",
            "Why can't your nose be 12 inches long? Because then it would be a foot!",
            "What did the ocean say to the beach? Nothing, it just waved!",
            "Why do programmers prefer dark mode? Because light attracts bugs!"
        ],
        fortunes: [
            "🌟 A beautiful, smart person will appear in your mirror today!",
            "🍀 Good fortune will find you when you least expect it!",
            "💫 Your creativity will lead to unexpected opportunities!",
            "🎯 Focus on your goals and success will follow!",
            "🌈 After every storm comes a rainbow. Your rainbow is coming!",
            "🔮 The answer you seek is closer than you think!",
            "⭐ You will make someone smile today!",
            "🎪 Adventure awaits around the next corner!",
            "💡 A brilliant idea is on its way to you!",
            "🌸 Kindness you show today returns tenfold tomorrow!"
        ],
        compliments: [
            "💝 You're not just awesome, you're awesomer!",
            "🌟 Your smile could light up the darkest room!",
            "💪 You've got this! Whatever 'this' is!",
            "🎨 You add color to everyone's life!",
            "🌈 You make the world a better place just by being in it!",
            "⭐ You're a star among stars!",
            "🦋 You're more beautiful than you know!",
            "🎵 You're the melody in life's song!",
            "🌻 You're sunshine on a cloudy day!",
            "💎 You're one of a kind, a true original!"
        ],
        catFacts: [
            "🐱 Cats spend 70% of their lives sleeping!",
            "🐱 A group of cats is called a clowder!",
            "🐱 Cats can rotate their ears 180 degrees!",
            "🐱 A cat's purr vibrates at 25-150 Hz, which can heal bones!",
            "🐱 Cats have over 20 vocalizations, including the meow!",
            "🐱 The first cat in space was French - named Félicette!",
            "🐱 Cats can't taste sweetness!",
            "🐱 A cat's nose print is unique, like a human fingerprint!",
            "🐱 Cats can jump up to 6 times their length!",
            "🐱 Ancient Egyptians would shave their eyebrows when their cat died!"
        ],
        dadJokes: [
            "👨 I'm reading a book about anti-gravity. It's impossible to put down!",
            "👨 What do you call a factory that makes okay products? A satisfactory!",
            "👨 I used to hate facial hair, but then it grew on me!",
            "👨 What do you call a belt made of watches? A waist of time!",
            "👨 Why do dads take an extra pair of socks when golfing? In case they get a hole in one!",
            "👨 I'm afraid for the calendar. Its days are numbered!",
            "👨 What did the janitor say when he jumped out of the closet? Supplies!",
            "👨 Why did the coffee file a police report? It got mugged!",
            "👨 I only know 25 letters of the alphabet. I don't know y!",
            "👨 What do you call a fish wearing a bowtie? Sofishticated!"
        ],
        funLinks: {
            theuselessweb: 'https://theuselessweb.com',
            pointerpointer: 'https://pointerpointer.com',
            corgi: 'https://corgiorgy.com',
            paper: 'https://papertoilet.com',
            comfort: 'https://comfort.zone',
            patience: 'https://patience-is-a-virtue.org',
            nyan: 'https://www.nyan.cat',
            hackertyper: 'https://hackertyper.com'
        },
        memeTemplates: {
            doge: 'doge',
            success: 'success',
            aliens: 'aag',
            drake: 'drake',
            futurama: 'fry',
            distracted: 'distracted',
            pikachu: 'pikachu',
            batman: 'slappin'
        }
    };

    function getRandomJoke() {
        const joke = funData.jokes[Math.floor(Math.random() * funData.jokes.length)];
        if (!state.funContent) state.funContent = {};
        state.funContent.joke = joke;
        updateFunPreview('joke', joke);
        return joke;
    }

    function getRandomFortune() {
        const fortune = funData.fortunes[Math.floor(Math.random() * funData.fortunes.length)];
        if (!state.funContent) state.funContent = {};
        state.funContent.fortune = fortune;
        updateFunPreview('fortune', fortune);
        return fortune;
    }

    function getRandomCompliment() {
        const compliment = funData.compliments[Math.floor(Math.random() * funData.compliments.length)];
        if (!state.funContent) state.funContent = {};
        state.funContent.compliment = compliment;
        updateFunPreview('compliment', compliment);
        return compliment;
    }

    function getRandomCatFact() {
        const fact = funData.catFacts[Math.floor(Math.random() * funData.catFacts.length)];
        if (!state.funContent) state.funContent = {};
        state.funContent.catfact = fact;
        updateFunPreview('catfact', fact);
        return fact;
    }

    function getRandomDadJoke() {
        const joke = funData.dadJokes[Math.floor(Math.random() * funData.dadJokes.length)];
        if (!state.funContent) state.funContent = {};
        state.funContent.dadjoke = joke;
        updateFunPreview('dadjoke', joke);
        return joke;
    }

    function getFunLink(key) {
        return funData.funLinks[key] || funData.funLinks.theuselessweb;
    }

    function getMemeUrl(template, top, bottom) {
        const templateId = funData.memeTemplates[template] || 'doge';
        // Using imgflip's meme format URL
        const topEnc = encodeURIComponent(top || '_');
        const bottomEnc = encodeURIComponent(bottom || '_');
        return `https://imgflip.com/i/${templateId}?top=${topEnc}&bottom=${bottomEnc}`;
    }

    function updateFunPreview(type, content) {
        const previewId = type + 'Preview';
        const preview = document.getElementById(previewId);
        if (preview) {
            preview.textContent = content;
        }
    }

    function formatVCalendarDate(dateStr) {
        if (!dateStr) return '';
        return dateStr.replace(/[-:]/g, '') + '00';
    }

    // --- Barcode Generation ---
    function generateBarcode(saveToHistory = false) {
        const data = getInputData();
        if (!data) {
            if (saveToHistory) showToast('Please enter data first', 'error');
            return;
        }

        // Validate data before attempting generation
        const validation = validateInput(data, state.type);
        if (!validation.isValid) {
            showToast(validation.error, 'error');
            return;
        }

        // UI Update
        elements.placeholder.classList.add('hidden');
        elements.barcodeDisplay.classList.remove('hidden');
        
        // Reset Display Area
        // We recreate the canvas/container to ensure a clean state for every generation
        elements.barcodeDisplay.innerHTML = '';
        
        try {
            if (state.type === 'QR') {
                // Create container for QR
                const qrContainer = document.createElement('div');
                qrContainer.id = 'qrcodeContainer';
                elements.barcodeDisplay.appendChild(qrContainer);
                elements.qrcodeContainer = qrContainer; // Update reference
                
                generateQRCode(data);
            } else {
                // Create canvas for Barcodes
                const canvas = document.createElement('canvas');
                canvas.id = 'barcodeCanvas';
                elements.barcodeDisplay.appendChild(canvas);
                elements.barcodeCanvas = canvas; // Update reference

                // Use JsBarcode for standard 1D codes, bwip-js for others
                if (['EAN13', 'EAN8', 'UPC', 'CODE39', 'CODE128'].includes(state.type)) {
                    generate1DBarcode(data);
                } else {
                    // ITF14, DATAMATRIX, PDF417 use bwip-js
                    generateBwipBarcode(data);
                }
            }

            if (saveToHistory) {
                addToHistory(data, state.type);
                showToast('Barcode generated successfully!');
            }
        } catch (error) {
            console.error(error);
            let errorMsg = error.message;
            if (errorMsg && errorMsg.includes('is not a valid input')) {
                errorMsg = 'Invalid characters or length for this barcode type.';
            }
            if (saveToHistory) showToast('Error: ' + errorMsg, 'error');
        }
    }

    function generate1DBarcode(data) {
        JsBarcode("#barcodeCanvas", data, {
            format: state.type === 'UPC' ? 'UPC' : state.type, // JsBarcode uses 'UPC' for UPC-A
            lineColor: state.options.fgColor,
            background: state.options.bgColor,
            width: Math.max(1, state.options.size / 100), // Ensure width is at least 1
            height: state.options.size / 2,
            displayValue: state.options.showText,
            margin: state.options.includeMargin ? 10 : 0
        });
    }

    function generateQRCode(data) {
        const size = state.options.size;
        
        // Get QR customization options from the DOM
        const gradientType = document.getElementById('qrGradientType')?.value || 'none';
        const gradientColor1 = document.getElementById('gradientColor1')?.value || '#000000';
        const gradientColor2 = document.getElementById('gradientColor2')?.value || '#4f46e5';
        const gradientRotation = parseInt(document.getElementById('gradientRotation')?.value || '0');
        const logoInput = document.getElementById('qrLogoUpload');
        const logoSizeSlider = document.getElementById('logoSizeSlider');
        const logoMarginSlider = document.getElementById('logoMarginSlider');
        const logoBorderRadiusSlider = document.getElementById('logoBorderRadiusSlider');
        
        // Create canvas for custom rendering
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        
        // Generate QR matrix using QRCode library
        const qr = new QRCode(document.createElement('div'), {
            text: data,
            width: size,
            height: size,
            correctLevel: QRCode.CorrectLevel.H // High error correction for logo support
        });
        
        // Get the QR code image data after a small delay for rendering
        setTimeout(() => {
            try {
                const qrImg = qr._el.querySelector('img') || qr._el.querySelector('canvas');
                if (!qrImg) {
                    // Fallback to basic QR
                    basicQRCodeFallback(data);
                    return;
                }
                
                // Draw background
                ctx.fillStyle = state.options.bgColor;
                ctx.fillRect(0, 0, size, size);
                
                // Create gradient or solid fill
                let fillStyle = state.options.fgColor;
                if (gradientType !== 'none') {
                    if (gradientType === 'linear') {
                        const angle = gradientRotation * Math.PI / 180;
                        const x1 = size/2 - Math.cos(angle) * size/2;
                        const y1 = size/2 - Math.sin(angle) * size/2;
                        const x2 = size/2 + Math.cos(angle) * size/2;
                        const y2 = size/2 + Math.sin(angle) * size/2;
                        fillStyle = ctx.createLinearGradient(x1, y1, x2, y2);
                    } else {
                        fillStyle = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
                    }
                    fillStyle.addColorStop(0, gradientColor1);
                    fillStyle.addColorStop(1, gradientColor2);
                }
                
                // Draw styled QR code with simple square modules (more scannable)
                drawSimpleStyledQR(ctx, qrImg, size, fillStyle);
                
                // Draw logo if present
                if (logoInput && logoInput.files && logoInput.files[0]) {
                    const logoSize = parseFloat(logoSizeSlider?.value || '0.2');
                    const logoMargin = parseInt(logoMarginSlider?.value || '5');
                    const logoBorderRadius = parseInt(logoBorderRadiusSlider?.value || '0');
                    
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        drawLogoOnQRSimple(ctx, size, e.target.result, logoSize, logoMargin, logoBorderRadius);
                        // Re-add canvas to container after logo is drawn
                        elements.qrcodeContainer.innerHTML = '';
                        elements.qrcodeContainer.appendChild(canvas);
                    };
                    reader.readAsDataURL(logoInput.files[0]);
                } else {
                    // Add canvas to container
                    elements.qrcodeContainer.innerHTML = '';
                    elements.qrcodeContainer.appendChild(canvas);
                }
                
            } catch (e) {
                console.error('QR styling error:', e);
                basicQRCodeFallback(data);
            }
        }, 50);
    }
    
    function basicQRCodeFallback(data) {
        elements.qrcodeContainer.innerHTML = '';
        new QRCode(elements.qrcodeContainer, {
            text: data,
            width: state.options.size,
            height: state.options.size,
            colorDark: state.options.fgColor,
            colorLight: state.options.bgColor,
            correctLevel: QRCode.CorrectLevel.H
        });
        elements.qrcodeContainer.removeAttribute('title');
    }
    
    function drawSimpleStyledQR(ctx, sourceImg, size, fillStyle) {
        // Create temporary canvas to get QR data
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = size;
        tempCanvas.height = size;
        const tempCtx = tempCanvas.getContext('2d');
        
        // Draw source QR to temp canvas
        tempCtx.drawImage(sourceImg, 0, 0, size, size);
        
        const imageData = tempCtx.getImageData(0, 0, size, size);
        const data = imageData.data;
        
        // Calculate module size (approximate)
        const moduleCount = detectModuleCount(data, size);
        const moduleSize = size / moduleCount;
        
        ctx.fillStyle = fillStyle;
        
        // Draw each module as a simple square (most scannable)
        for (let row = 0; row < moduleCount; row++) {
            for (let col = 0; col < moduleCount; col++) {
                const x = col * moduleSize;
                const y = row * moduleSize;
                
                // Sample center of module
                const sampleX = Math.floor(x + moduleSize / 2);
                const sampleY = Math.floor(y + moduleSize / 2);
                const idx = (sampleY * size + sampleX) * 4;
                
                // Check if this is a dark module
                if (data[idx] < 128) {
                    // Simple square modules - most reliable for scanning
                    ctx.fillRect(x, y, moduleSize, moduleSize);
                }
            }
        }
    }
    
    function detectModuleCount(data, size) {
        // Detect module count by finding transitions in first row
        let transitions = 0;
        let lastDark = data[0] < 128;
        
        for (let x = 1; x < size; x++) {
            const idx = x * 4;
            const isDark = data[idx] < 128;
            if (isDark !== lastDark) {
                transitions++;
                lastDark = isDark;
            }
        }
        
        // Module count is approximately transitions / 2 (each module has enter/exit)
        // QR codes are typically 21, 25, 29, etc. modules
        const estimated = Math.round(transitions / 2);
        const standardSizes = [21, 25, 29, 33, 37, 41, 45, 49, 53, 57, 61, 65, 69, 73, 77];
        return standardSizes.reduce((prev, curr) => 
            Math.abs(curr - estimated) < Math.abs(prev - estimated) ? curr : prev
        );
    }
    
    function drawLogoOnQRSimple(ctx, size, logoDataUrl, logoSizeRatio, logoMargin, borderRadius) {
        const logoImg = new Image();
        logoImg.onload = () => {
            const logoSize = size * logoSizeRatio;
            const logoX = (size - logoSize) / 2;
            const logoY = (size - logoSize) / 2;
            
            // Draw white background behind logo
            ctx.fillStyle = '#ffffff';
            if (borderRadius > 0) {
                drawRoundedRect(ctx, logoX - logoMargin, logoY - logoMargin, logoSize + logoMargin * 2, logoSize + logoMargin * 2, borderRadius);
            } else {
                ctx.fillRect(logoX - logoMargin, logoY - logoMargin, logoSize + logoMargin * 2, logoSize + logoMargin * 2);
            }
            
            // Draw logo
            if (borderRadius > 0) {
                ctx.save();
                ctx.beginPath();
                drawRoundedRectPath(ctx, logoX, logoY, logoSize, logoSize, borderRadius);
                ctx.clip();
                ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);
                ctx.restore();
            } else {
                ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);
            }
        };
        logoImg.src = logoDataUrl;
    }
    
    function drawRoundedRect(ctx, x, y, width, height, radius) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
        ctx.fill();
    }
    
    function drawRoundedRectPath(ctx, x, y, width, height, radius) {
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
    }

    function generateBwipBarcode(data) {
        let bcid = state.type.toLowerCase();
        if (state.type === 'DATAMATRIX') bcid = 'datamatrix';
        if (state.type === 'PDF417') bcid = 'pdf417';
        if (state.type === 'ITF14') bcid = 'itf14';

        try {
            bwipjs.toCanvas(elements.barcodeCanvas, {
                bcid: bcid,       // Barcode type
                text: data,       // Text to encode
                scale: state.options.size / 50,       // 3x scaling factor
                height: 10,       // Bar height, in millimeters
                includetext: state.options.showText,            // Show human-readable text
                textxalign: 'center',        // Always good to set this
                barcolor: state.options.fgColor.replace('#', ''),
                backgroundcolor: state.options.bgColor.replace('#', ''),
                padding: state.options.includeMargin ? 10 : 0
            });
        } catch (e) {
            // Handle bwip-js errors
            console.error(e);
            throw e;
        }
    }

    // --- Export ---
    function downloadImage(format) {
        let dataUrl;
        let filename = `barcode-${Date.now()}.${format}`;

        if (state.type === 'QR') {
            const img = elements.qrcodeContainer.querySelector('img');
            if (!img) return;
            
            if (format === 'png' || format === 'jpeg') {
                dataUrl = img.src;
            } else if (format === 'svg') {
                showToast('SVG export not fully supported for QR in this demo', 'error');
                return;
            }
        } else {
            const canvas = elements.barcodeCanvas;
            if (!canvas) return; // Safety check
            
            if (format === 'svg') {
                 showToast('SVG export requires re-rendering (not implemented)', 'error');
                 return;
            }
            dataUrl = canvas.toDataURL(`image/${format}`);
        }

        const link = document.createElement('a');
        link.download = filename;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    function copyToClipboard() {
        try {
            let canvas;
            if (state.type === 'QR') {
                canvas = elements.qrcodeContainer.querySelector('canvas');
                if (!canvas) {
                    const img = elements.qrcodeContainer.querySelector('img');
                    if (img) {
                        canvas = document.createElement('canvas');
                        canvas.width = img.width;
                        canvas.height = img.height;
                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(img, 0, 0);
                    }
                }
            } else {
                canvas = elements.barcodeCanvas;
            }

            if (canvas) {
                canvas.toBlob(blob => {
                    const item = new ClipboardItem({ 'image/png': blob });
                    navigator.clipboard.write([item]).then(() => {
                        showToast('Barcode image copied to clipboard!');
                    });
                });
            } else {
                navigator.clipboard.writeText(getInputData()).then(() => {
                    showToast('Data text copied to clipboard!');
                });
            }
        } catch (err) {
            console.error(err);
            showToast('Failed to copy', 'error');
        }
    }

    function printBarcode() {
        const printWindow = window.open('', '', 'height=600,width=800');
        
        let imgHtml = '';
        if (state.type === 'QR') {
            const img = elements.qrcodeContainer.querySelector('img');
            if (img) imgHtml = `<img src="${img.src}" style="max-width:100%;">`;
        } else {
            if (elements.barcodeCanvas) {
                imgHtml = `<img src="${elements.barcodeCanvas.toDataURL()}" style="max-width:100%;">`;
            }
        }

        printWindow.document.write('<html><head><title>Print Barcode</title>');
        printWindow.document.write('</head><body style="display:flex;justify-content:center;align-items:center;height:100vh;">');
        printWindow.document.write(imgHtml);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 500);
    }

    // --- History Management ---
    function addToHistory(data, type) {
        const item = { data, type, timestamp: Date.now() };
        state.history.unshift(item);
        if (state.history.length > 10) state.history.pop(); // Keep last 10
        saveHistory();
        renderHistory();
    }

    function saveHistory() {
        localStorage.setItem('barcodeHistory', JSON.stringify(state.history));
    }

    function loadHistory() {
        const saved = localStorage.getItem('barcodeHistory');
        if (saved) {
            state.history = JSON.parse(saved);
            renderHistory();
        }
    }

    function clearHistory() {
        state.history = [];
        saveHistory();
        renderHistory();
    }

    function renderHistory() {
        elements.historyGrid.innerHTML = '';
        state.history.forEach(item => {
            const el = document.createElement('div');
            el.className = 'history-item';
            el.innerHTML = `
                <div class="history-info">
                    <span class="history-type">${item.type}</span>
                    <span class="history-data">${item.data}</span>
                </div>
            `;
            el.addEventListener('click', () => {
                // Load data back into inputs
                // This is complex because we need to parse the data back to fields
                // For now, we'll just set the text input and type
                // Ideally, we'd store the full input state object in history
                
                // Simple restore:
                if (item.type === 'QR') {
                    // Try to detect content type or default to text
                    // For this demo, we'll just put it in text input
                    document.getElementById('textInput').value = item.data;
                    // Trigger generation
                    state.contentType = 'text';
                    updateContentTypeUI();
                } else {
                    // Find input for type
                    const inputId = `input${capitalize(item.type)}`;
                    const input = document.getElementById(inputId)?.querySelector('input');
                    if (input) input.value = item.data;
                    else document.getElementById('textInput').value = item.data;
                }
                
                // Switch to correct type
                state.type = item.type;
                // Find category
                const is2d = ['QR', 'DATAMATRIX', 'PDF417'].includes(item.type);
                state.category = is2d ? '2d' : '1d';
                
                updateCategoryUI();
                updateTypeUI();
                
                // Check the radio button
                const radio = document.querySelector(`input[name="barcodeType"][value="${item.type}"]`);
                if (radio) radio.checked = true;

                generateBarcode(false);
            });
            elements.historyGrid.appendChild(el);
        });
    }

    // --- Validation & Random Data ---
    function validateInput(data, type) {
        if (!data) return { isValid: false, error: 'Data is empty' };

        switch (type) {
            case 'EAN13':
                if (!/^\d{13}$/.test(data)) return { isValid: false, error: 'EAN-13 requires exactly 13 digits / EAN-13 kræver præcis 13 cifre' };
                break;
            case 'EAN8':
                if (!/^\d{7,8}$/.test(data)) return { isValid: false, error: 'EAN-8 requires 7 or 8 digits' };
                break;
            case 'UPC':
                if (!/^\d{11,12}$/.test(data)) return { isValid: false, error: 'UPC-A requires 11 or 12 digits' };
                break;
            case 'ITF14':
                if (!/^\d{13,14}$/.test(data)) return { isValid: false, error: 'ITF-14 requires 13 or 14 digits' };
                break;
            case 'CODE39':
                if (!/^[0-9A-Z\-\.\ \$\/\+\%]+$/.test(data)) return { isValid: false, error: 'Code 39 only supports A-Z, 0-9 and - . $ / + % SPACE' };
                break;
            // CODE128, QR, PDF417, DATAMATRIX support almost anything
        }
        return { isValid: true };
    }

    function fillRandomData() {
        let randomData = '';
        
        if (state.type === 'QR') {
            // Fill fields based on current content type
            switch (state.contentType) {
                case 'text':
                    const phrases = ['Hello World', 'Scan Me', 'Bar Code Pro', 'Random Text ' + Math.floor(Math.random() * 1000)];
                    randomData = phrases[Math.floor(Math.random() * phrases.length)];
                    document.getElementById('textInput').value = randomData;
                    break;
                case 'url':
                    document.getElementById('urlInput').value = 'https://example.com/page' + Math.floor(Math.random() * 100);
                    break;
                case 'email':
                    document.getElementById('emailTo').value = 'user' + Math.floor(Math.random() * 100) + '@example.com';
                    document.getElementById('emailSubject').value = 'Hello';
                    document.getElementById('emailBody').value = 'This is a test email.';
                    break;
                case 'phone':
                    document.getElementById('phoneInput').value = '+' + Math.floor(1000000000 + Math.random() * 9000000000);
                    break;
                case 'sms':
                    document.getElementById('smsNumber').value = '+' + Math.floor(1000000000 + Math.random() * 9000000000);
                    document.getElementById('smsMessage').value = 'Hello, this is a test SMS.';
                    break;
                case 'wifi':
                    document.getElementById('wifiSsid').value = 'MyGuestNetwork';
                    document.getElementById('wifiPassword').value = 'securePassword123';
                    document.getElementById('wifiEncryption').value = 'WPA';
                    document.getElementById('wifiHidden').checked = false;
                    break;
                case 'vcard':
                    document.getElementById('vcardFirstName').value = 'John';
                    document.getElementById('vcardLastName').value = 'Doe';
                    document.getElementById('vcardOrg').value = 'Acme Corp';
                    document.getElementById('vcardTitle').value = 'Manager';
                    document.getElementById('vcardPhone').value = '+15550199';
                    document.getElementById('vcardEmail').value = 'john.doe@example.com';
                    document.getElementById('vcardWebsite').value = 'https://example.com';
                    document.getElementById('vcardAddress').value = '123 Main St, Springfield';
                    document.getElementById('vcardNote').value = 'Generated contact';
                    break;
                case 'event':
                    document.getElementById('eventTitle').value = 'Team Meeting';
                    const now = new Date();
                    now.setDate(now.getDate() + 1);
                    now.setMinutes(0);
                    // Format for datetime-local: YYYY-MM-DDTHH:mm
                    const formatDT = (d) => d.toISOString().slice(0, 16);
                    document.getElementById('eventStart').value = formatDT(now);
                    now.setHours(now.getHours() + 1);
                    document.getElementById('eventEnd').value = formatDT(now);
                    document.getElementById('eventLocation').value = 'Room 101';
                    document.getElementById('eventDescription').value = 'Discuss project status';
                    break;
                case 'geo':
                    document.getElementById('geoLat').value = (Math.random() * 180 - 90).toFixed(6);
                    document.getElementById('geoLng').value = (Math.random() * 360 - 180).toFixed(6);
                    document.getElementById('geoQuery').value = '';
                    break;
                case 'whatsapp':
                    document.getElementById('whatsappNumber').value = Math.floor(1000000000 + Math.random() * 9000000000);
                    document.getElementById('whatsappMessage').value = 'Hi there!';
                    break;
                case 'bitcoin':
                    document.getElementById('bitcoinAddress').value = '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa';
                    document.getElementById('bitcoinAmount').value = '0.005';
                    document.getElementById('bitcoinLabel').value = 'Coffee';
                    document.getElementById('bitcoinMessage').value = 'Thanks';
                    break;
                case 'ethereum':
                    document.getElementById('ethereumAddress').value = '0x71C7656EC7ab88b098defB751B7401B5f6d8976F';
                    document.getElementById('ethereumAmount').value = '0.1';
                    break;
                case 'paypal':
                    document.getElementById('paypalEmail').value = 'user@example.com';
                    document.getElementById('paypalAmount').value = '25.00';
                    document.getElementById('paypalCurrency').value = 'USD';
                    document.getElementById('paypalDescription').value = 'Services';
                    break;
                case 'twitter':
                    document.getElementById('twitterUsername').value = 'twitter';
                    break;
                case 'instagram':
                    document.getElementById('instagramUsername').value = 'instagram';
                    break;
                case 'facebook':
                    document.getElementById('facebookUrl').value = 'https://facebook.com/facebook';
                    break;
                case 'linkedin':
                    document.getElementById('linkedinUrl').value = 'https://linkedin.com/in/williamhgates';
                    break;
                case 'youtube':
                    document.getElementById('youtubeUrl').value = 'https://youtube.com/watch?v=dQw4w9WgXcQ';
                    break;
                case 'tiktok':
                    document.getElementById('tiktokUsername').value = 'tiktok';
                    break;
                case 'spotify':
                    document.getElementById('spotifyUrl').value = 'https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT';
                    break;
                case 'zoom':
                    document.getElementById('zoomUrl').value = 'https://zoom.us/j/5551112222';
                    document.getElementById('zoomPassword').value = '123456';
                    break;
                case 'appstore':
                    document.getElementById('appstoreUrl').value = 'https://apps.apple.com/us/app/example/id123456789';
                    break;
                case 'playstore':
                    document.getElementById('playstoreUrl').value = 'https://play.google.com/store/apps/details?id=com.example.app';
                    break;
                case 'mecard':
                    document.getElementById('mecardName').value = 'Doe,John';
                    document.getElementById('mecardPhone').value = '1234567890';
                    document.getElementById('mecardEmail').value = 'john@example.com';
                    document.getElementById('mecardAddress').value = '123 St';
                    document.getElementById('mecardUrl').value = 'http://example.com';
                    document.getElementById('mecardBirthday').value = '1990-01-01';
                    document.getElementById('mecardNote').value = 'Memo';
                    break;
                // Fun QR types
                case 'rickroll':
                    // Rickroll is always the same - no random needed!
                    break;
                case 'joke':
                    getRandomJoke();
                    break;
                case 'fortune':
                    getRandomFortune();
                    break;
                case 'compliment':
                    getRandomCompliment();
                    break;
                case 'catfact':
                    getRandomCatFact();
                    break;
                case 'dadjoke':
                    getRandomDadJoke();
                    break;
                case 'funlink':
                    const funlinkSelect = document.getElementById('funlinkSelect');
                    if (funlinkSelect) {
                        const funOptions = funlinkSelect.options;
                        funlinkSelect.selectedIndex = Math.floor(Math.random() * funOptions.length);
                    }
                    break;
                case 'meme':
                    const memeTemplates = ['doge', 'success', 'aliens', 'drake', 'futurama', 'distracted', 'pikachu', 'batman'];
                    const memeTopTexts = ['When you scan this', 'Me trying to', 'When your code works', 'Nobody:', 'That feeling when'];
                    const memeBottomTexts = ['And it actually works', 'Fix one bug, create three more', 'First try!', 'Everybody liked that', '*surprised face*'];
                    document.getElementById('memeTop').value = memeTopTexts[Math.floor(Math.random() * memeTopTexts.length)];
                    document.getElementById('memeBottom').value = memeBottomTexts[Math.floor(Math.random() * memeBottomTexts.length)];
                    const memeSelect = document.getElementById('memeTemplate');
                    if (memeSelect) {
                        memeSelect.value = memeTemplates[Math.floor(Math.random() * memeTemplates.length)];
                    }
                    break;
            }
        } else {
            // 1D Barcodes
            switch (state.type) {
                case 'EAN13':
                    // Generate with GS1 structure
                    // GS1 Prefix is 2-3 digits. Common 2-digit prefixes:
                    // 57=Denmark, 59=Poland (partial), 40-44=Germany, 50=UK, 87=Netherlands
                    const ean13Prefixes = ['57', '40', '50', '87', '45']; // Denmark, Germany, UK, Netherlands, Japan
                    const randomEan13Prefix = ean13Prefixes[Math.floor(Math.random() * ean13Prefixes.length)];
                    
                    // Company code: 5 digits for this example
                    let randomEan13Company = '';
                    for(let i=0; i<5; i++) randomEan13Company += Math.floor(Math.random() * 10);
                    
                    // Product code: remaining digits to make 12 total before check digit
                    // With 2-digit prefix + 5-digit company = 7, need 5 more for product
                    let randomEan13Product = '';
                    const productLen = 12 - randomEan13Prefix.length - randomEan13Company.length;
                    for(let i=0; i<productLen; i++) randomEan13Product += Math.floor(Math.random() * 10);
                    
                    randomData = randomEan13Prefix + randomEan13Company + randomEan13Product;
                    randomData += calculateEANChecksum(randomData);
                    document.getElementById('ean13Input').value = randomData;
                    
                    // Also fill GS1 fields
                    if (elements.ean13Prefix) {
                        elements.ean13Prefix.value = randomEan13Prefix;
                        elements.ean13Company.value = randomEan13Company;
                        elements.ean13Product.value = randomEan13Product;
                        updateEan13Preview();
                    }
                    break;
                case 'EAN8':
                    // Generate with GS1 structure
                    const ean8Prefixes = ['57', '59', '40', '50', '87']; // Denmark, Poland, Germany, UK, Netherlands
                    const randomEan8Prefix = ean8Prefixes[Math.floor(Math.random() * ean8Prefixes.length)];
                    let randomEan8Product = '';
                    for(let i=0; i<5; i++) randomEan8Product += Math.floor(Math.random() * 10);
                    
                    randomData = randomEan8Prefix + randomEan8Product;
                    randomData += calculateEANChecksum(randomData);
                    document.getElementById('ean8Input').value = randomData;
                    
                    // Also fill GS1 fields
                    if (elements.ean8Prefix) {
                        elements.ean8Prefix.value = randomEan8Prefix;
                        elements.ean8Product.value = randomEan8Product;
                        updateEan8Preview();
                    }
                    break;
                case 'UPC':
                    // Generate with GS1 structure
                    const randomNumSys = String(Math.floor(Math.random() * 2)); // 0 or 1 most common
                    let randomManufacturer = '';
                    for(let i=0; i<5; i++) randomManufacturer += Math.floor(Math.random() * 10);
                    let randomUpcProduct = '';
                    for(let i=0; i<5; i++) randomUpcProduct += Math.floor(Math.random() * 10);
                    
                    randomData = randomNumSys + randomManufacturer + randomUpcProduct;
                    randomData += calculateEANChecksum(randomData);
                    document.getElementById('upcInput').value = randomData;
                    
                    // Also fill GS1 fields
                    if (elements.upcNumSys) {
                        elements.upcNumSys.value = randomNumSys;
                        elements.upcManufacturer.value = randomManufacturer;
                        elements.upcProduct.value = randomUpcProduct;
                        updateUpcPreview();
                    }
                    break;
                case 'CODE39':
                    randomData = 'TEST-' + Math.floor(Math.random() * 1000);
                    document.getElementById('code39Input').value = randomData;
                    break;
                case 'CODE128':
                    randomData = 'Code128-' + Math.floor(Math.random() * 1000);
                    document.getElementById('code128Input').value = randomData;
                    break;
                case 'ITF14':
                    // Generate with GS1 structure
                    const randomIndicator = String(Math.floor(Math.random() * 8) + 1); // 1-8 packaging levels
                    let randomItf14Company = '';
                    for(let i=0; i<7; i++) randomItf14Company += Math.floor(Math.random() * 10);
                    let randomItf14Product = '';
                    for(let i=0; i<5; i++) randomItf14Product += Math.floor(Math.random() * 10);
                    
                    randomData = randomIndicator + randomItf14Company + randomItf14Product;
                    randomData += calculateEANChecksum(randomData);
                    document.getElementById('itf14Input').value = randomData;
                    
                    // Also fill GS1 fields
                    if (elements.itf14Indicator) {
                        elements.itf14Indicator.value = randomIndicator;
                        elements.itf14Company.value = randomItf14Company;
                        elements.itf14Product.value = randomItf14Product;
                        updateItf14Preview();
                    }
                    break;
                case 'DATAMATRIX':
                case 'PDF417':
                    randomData = 'Data-' + Math.floor(Math.random() * 10000);
                    const input = document.getElementById(`input${capitalize(state.type)}`)?.querySelector('textarea');
                    if (input) input.value = randomData;
                    break;
            }
        }
        
        generateBarcode(false); // Generate preview without saving to history immediately
        showToast('Random data generated');
    }

    function calculateEANChecksum(code) {
        // code is string of digits
        let sum = 0;
        // Process from right to left
        // Weights alternate 3, 1, 3, 1... starting from the rightmost digit of the data
        for (let i = 0; i < code.length; i++) {
            const digit = parseInt(code[code.length - 1 - i]);
            const weight = (i % 2 === 0) ? 3 : 1;
            sum += digit * weight;
        }
        const checksum = (10 - (sum % 10)) % 10;
        return checksum;
    }

    // --- Utilities ---
    function capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    }

    function showToast(msg, type = 'success') {
        elements.toastMessage.textContent = msg;
        elements.toast.querySelector('.toast-icon').textContent = type === 'success' ? '✓' : '!';
        elements.toast.querySelector('.toast-icon').style.backgroundColor = type === 'success' ? 'var(--success-color)' : 'var(--danger-color)';
        elements.toast.classList.add('show');
        setTimeout(() => {
            elements.toast.classList.remove('show');
        }, 3000);
    }
});
