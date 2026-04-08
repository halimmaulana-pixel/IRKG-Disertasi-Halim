"""
domain_map.py — IR-KG Pipeline v3
Domain Filter: Peta 6 Prodi APTIKOM → ESCO Corpus

Sumber utama:
  [1] APTIKOM 2022 — Panduan Kurikulum Bidang INFOKOM Berbasis OBE/KKNI/SKKNI
      (Setiawan, Shofi, Wicaksono — Forum Prodi APTIKOM, Desember 2022)
      Tabel VI-1: Rumusan Bahan Kajian (BK01–BK31)
      Tabel V-4:  CPL SN-DIKTI (Profil Lulusan per ranah)
      Tabel VI-4: MK Penciri Pendukung (MKP01–MKP19)
  [2] ACM Computing Curricula 2020 (CC2020)
      Landscape of Computing Knowledge — Tabel 5.3 (hal. 64)
      Rujukan BK01–BK19 dan BK20–BK29
  [3] UNESCO ISCED-F 2013 — Field 06: Information and Communication Technologies
      0611 Computer use, 0612 Database and network design and administration,
      0613 Software and applications development and analysis
  [4] KKNI Bidang TIK 2018 — Daftar Unit Kompetensi Okupasi
      Level 6 (Sarjana): profesi yang dirujuk dari Lampiran Tabel 1 APTIKOM 2022

Struktur domain_map:
  core_keywords    → ESCO skills yang paling relevan (S_con = 1.0)
  adjacent_keywords → ESCO skills pendukung lintas domain (S_con = 0.5)
  isced_codes      → UNESCO ISCED-F codes untuk query ESCO API
  bk_penciri_utama → Bahan Kajian wajib dari APTIKOM 2022 (BK01–BK19 + BK30–BK31)
  bk_penciri_pendukung → BK pilihan yang membedakan domain prodi
  profesi_kkni     → Profesi target dari Lampiran Tabel 1 APTIKOM 2022
  mk_penciri       → Mata Kuliah penciri utama dari Tabel VII-3 APTIKOM 2022
"""

# ─────────────────────────────────────────────────────────────────────────────
# BAHAN KAJIAN BERSAMA (21 BK Penciri Utama — WAJIB semua prodi Informatika)
# Sumber: APTIKOM 2022 Tabel VI-1, rujukan CC2020 Tabel 5.3 hal.64
# ─────────────────────────────────────────────────────────────────────────────

BK_PENCIRI_UTAMA_BERSAMA = {
    "BK01": "Social Issues and Professional Practice",
    "BK02": "Information Assurance and Security (core)",
    "BK03": "Project Management",
    "BK04": "User Experience Design",
    "BK05": "Networking and Communication",
    "BK06": "Database Systems",
    "BK07": "Systems and Networking",
    "BK08": "Software Engineering",
    "BK09": "Security Implementation",
    "BK10": "Software Design",
    "BK11": "Operating Systems",
    "BK12": "Data Structures, Algorithms and Complexity",
    "BK13": "Programming Languages",
    "BK14": "Programming Fundamentals",
    "BK15": "Computing Systems Fundamentals",
    "BK16": "Architecture and Organization",
    "BK17": "Graphics and Visualization",
    "BK18": "Intelligent Systems",
    "BK19": "Platform-based Development",
    "BK30": "Pengembangan Diri",       # BK Penciri Utama SN-Dikti
    "BK31": "Metodologi Penelitian",   # BK Penciri Utama Umum
}

# Keywords dari 21 BK bersama — digunakan sebagai adjacent_keywords semua prodi
KEYWORDS_BERSAMA = [
    # BK01 Social Issues
    "professional ethics", "social responsibility", "digital ethics", "intellectual property",
    "privacy and data protection", "professional practice",
    # BK03 Project Management
    "project management", "agile methodology", "scrum", "software project planning",
    "risk management", "team collaboration",
    # BK05 Networking
    "computer networks", "network protocols", "TCP/IP", "network security",
    "cloud infrastructure", "distributed systems",
    # BK06 Database
    "database management", "SQL", "relational database", "data modeling",
    "NoSQL", "database administration",
    # BK08 Software Engineering
    "software engineering", "software development lifecycle", "requirements engineering",
    "software testing", "software quality assurance", "version control",
    # BK10-BK14 Programming
    "algorithms", "data structures", "object-oriented programming",
    "programming languages", "software design patterns", "complexity analysis",
    # BK11 OS
    "operating systems", "process management", "memory management", "system administration",
    # BK15-BK16 Architecture
    "computer architecture", "hardware systems", "embedded systems",
    # BK18 Intelligent Systems
    "machine learning", "artificial intelligence", "deep learning", "neural networks",
    "natural language processing", "computer vision",
    # BK19 Platform
    "mobile development", "web development", "cross-platform development",
    "cloud computing", "microservices",
    # BK31 Methodology
    "research methodology", "scientific writing", "academic research",
]

# ─────────────────────────────────────────────────────────────────────────────
# DOMAIN MAP PER PRODI
# ─────────────────────────────────────────────────────────────────────────────

DOMAIN_MAP = {

    # =========================================================================
    # SI — Sistem Informasi
    # Sumber profil: APTIKOM 2022 + KKNI TIK 2018 Level 6
    # Profesi target: Systems Analyst, Business Analyst, IT Consultant,
    #                 Database Administrator, IT Project Manager
    # BK Penciri Pendukung khas SI: BK26 Systems Analysis & Design,
    #   BK22 Human-Computer Interaction, BK27 Virtual Systems and Services
    # MK Khas: Analisis dan Desain PL, Manajemen Proyek TI, Basis Data,
    #          Keamanan Data, Cloud Computing, Big Data
    # =========================================================================
    "SI": {
        "nama_lengkap": "Sistem Informasi",
        "jenjang": "S1",
        "sumber_aptikom": "APTIKOM 2022 Tabel VI-1 + Lampiran Tabel 1",
        "isced_codes": ["0612", "0613", "0611"],
        # ISCED 0612: Database and network design and administration
        # ISCED 0613: Software and applications development and analysis
        # ISCED 0611: Computer use (information systems context)

        "profesi_kkni": [
            "Systems Analyst",
            "Business Analyst",
            "Database Administrator",
            "IT Project Manager",
            "IT Consultant",
            "Information System Developer",
            "ERP Consultant",
        ],

        "bk_penciri_pendukung": [
            "BK26: Systems Analysis and Design",
            "BK22: Human-Computer Interaction",
            "BK27: Virtual Systems and Services",
            "BK20: Computational Science",
            "BK29: Software Modeling and Analysis",
        ],

        "mk_penciri_utama": [
            "Analisis dan Desain Perangkat Lunak",
            "Manajemen Proyek Teknologi Informasi",
            "Basis Data",
            "Keamanan Data dan Informasi",
            "Cloud Computing",
            "Big Data",
            "Rekayasa Perangkat Lunak",
            "Human-Computer Interaction",
            "Proyek Perangkat Lunak",
        ],

        "mk_pilihan_khas": [
            "MKP02: Analisis Jejaring Sosial",
            "MKP07: Visualisasi Data",
            "MKP13: Data Science",
            "MKP11: Web Semantic",
            "MKP06: Technopreneurship",
            "MKP18: Data Mining",
            "MKP19: Process Mining",
        ],

        "core_keywords": [
            # Systems Analysis & Design (BK26 — penciri utama SI)
            "systems analysis", "systems design", "business process analysis",
            "requirements analysis", "system architecture", "enterprise architecture",
            "business requirements", "functional requirements", "system specification",
            # Information Management
            "information management", "information systems", "management information systems",
            "knowledge management", "enterprise resource planning", "ERP implementation",
            "business intelligence", "decision support systems",
            # Data Management (SKKNI area — PL10 APTIKOM 2022)
            "data management", "data governance", "database design",
            "data warehouse", "ETL processes", "data quality management",
            "master data management", "data integration",
            # IT Project Management (profesi utama SI)
            "IT project management", "project planning", "stakeholder management",
            "change management", "IT governance", "COBIT", "ITIL",
            # Business Analysis
            "business process modeling", "BPMN", "use case modeling",
            "business intelligence analyst", "data analyst",
            # HCI & UX (BK22 + BK04)
            "user experience design", "usability testing", "user interface design",
            "information architecture", "interaction design",
        ],

        "adjacent_keywords": KEYWORDS_BERSAMA + [
            # Adjacent: teknologi yang dipakai SI tapi bukan core
            "web application development", "API development", "REST API",
            "network administration", "cybersecurity fundamentals",
            "statistical analysis", "data visualization", "reporting tools",
            "process improvement", "digital transformation",
        ],
    },

    # =========================================================================
    # TI — Teknologi Informasi
    # Sumber profil: APTIKOM 2022 + KKNI TIK 2018 Level 6
    # Profesi target: Network Engineer, System Administrator, Cloud Engineer,
    #                 Security Engineer, Infrastructure Specialist
    # BK Penciri Pendukung khas TI: BK23 Information Assurance and Security,
    #   BK27 Virtual Systems and Services, BK07 Systems and Networking
    # MK Khas: Jaringan Komputer, Keamanan Data, Cloud Computing,
    #          Sistem Operasi, Komputasi Paralel dan Terdistribusi, IoT
    # =========================================================================
    "TI": {
        "nama_lengkap": "Teknologi Informasi",
        "jenjang": "S1",
        "sumber_aptikom": "APTIKOM 2022 Tabel VI-1 + Lampiran Tabel 1",
        "isced_codes": ["0612", "0611", "0613"],
        # ISCED 0612: Database and network design — dominan untuk TI
        # ISCED 0611: Computer use — administration context
        # ISCED 0613: Software — aplikasi infrastruktur

        "profesi_kkni": [
            "Network Engineer",
            "System Administrator",
            "Cloud Engineer",
            "Network Security Analyst",
            "IT Infrastructure Specialist",
            "DevOps Engineer",
            "Cybersecurity Specialist",
        ],

        "bk_penciri_pendukung": [
            "BK23: Information Assurance and Security",
            "BK27: Virtual Systems and Services",
            "BK07: Systems and Networking",
            "BK02: Information Security (core)",
            "BK09: Security Implementation",
        ],

        "mk_penciri_utama": [
            "Jaringan Komputer",
            "Keamanan Data dan Informasi",
            "Cloud Computing",
            "Sistem Operasi",
            "Komputasi Paralel dan Terdistribusi",
            "Internet of Things",
            "Organisasi dan Arsitektur Komputer",
        ],

        "mk_pilihan_khas": [
            "MKP15: Digital Forensic",
            "MKP16: Wireless Sensors Network",
            "MKP04: Teknologi Blockchain",
            "MKP08: Teknologi AR/VR",
            "MKP17: AI Computing Platform",
        ],

        "core_keywords": [
            # Networking (BK05 + BK07 — penciri utama TI)
            "network engineering", "network administration", "network infrastructure",
            "TCP/IP networking", "network protocols", "routing and switching",
            "network design", "wireless networking", "network troubleshooting",
            "LAN WAN design", "SDN software defined networking",
            # Security (BK02 + BK09 + BK23 — khas TI)
            "cybersecurity", "information security", "network security",
            "penetration testing", "security operations", "incident response",
            "vulnerability assessment", "firewall management", "SIEM",
            "digital forensics", "ethical hacking", "security auditing",
            # Cloud & Infrastructure (BK27)
            "cloud computing", "cloud infrastructure", "virtualization",
            "containerization", "Docker", "Kubernetes", "DevOps",
            "cloud architecture", "AWS", "Azure", "Google Cloud",
            "infrastructure as code", "site reliability engineering",
            # Systems Administration (BK11)
            "system administration", "server management", "Linux administration",
            "Windows Server", "Active Directory", "monitoring systems",
            # IoT & Embedded (MK35)
            "Internet of Things", "embedded systems", "sensor networks",
            "edge computing", "IoT security", "wireless sensor networks",
        ],

        "adjacent_keywords": KEYWORDS_BERSAMA + [
            # Adjacent: yang dipakai TI tapi tidak spesifik TI
            "database administration", "web server administration",
            "software installation", "technical support",
            "parallel computing", "distributed computing",
        ],
    },

    # =========================================================================
    # CS — Computer Science / Ilmu Komputer
    # Sumber profil: APTIKOM 2022 CPL penciri utama (CPL03, CPL04, CPL05)
    #   + CC2020 Computer Science knowledge areas
    # Profesi target: Software Engineer, Algorithm Engineer, AI Researcher,
    #                 Compiler Engineer, Theoretical CS
    # BK Penciri Khas CS: BK12 Data Structures & Algorithms, BK18 Intelligent Systems,
    #   BK13 Programming Languages, BK20 Computational Science, BK21 Discrete Structures
    # =========================================================================
    "CS": {
        "nama_lengkap": "Ilmu Komputer / Computer Science",
        "jenjang": "S1",
        "sumber_aptikom": "APTIKOM 2022 + ACM CC2020 CS Knowledge Areas",
        "isced_codes": ["0613", "0612", "0611"],
        # ISCED 0613: Software and applications — dominan untuk CS

        "profesi_kkni": [
            "Software Engineer",
            "Algorithm Engineer",
            "AI Engineer",
            "Research Scientist Computing",
            "Compiler Developer",
            "Game Developer",
        ],

        "bk_penciri_pendukung": [
            "BK12: Data Structures, Algorithms and Complexity",
            "BK18: Intelligent Systems",
            "BK13: Programming Languages",
            "BK20: Computational Science",
            "BK21: Discrete Structures",
        ],

        "mk_penciri_utama": [
            "Struktur Data",
            "Algoritma Pemrograman",
            "Kompleksitas Algoritma",
            "Pembelajaran Mesin",
            "Kecerdasan Buatan",
            "Pemrograman Berorientasi Objek",
            "Matematika Diskrit",
            "Logika Matematika",
        ],

        "mk_pilihan_khas": [
            "MKP03: Strategi Algoritma",
            "MKP05: Pemrosesan Bahasa Alami",
            "MKP10: Deep Learning",
            "MKP14: Computer Vision",
            "MKP09: Game Development",
            "MKP17: AI Computing Platform",
        ],

        "core_keywords": [
            # Algorithms & Complexity (BK12 — penciri utama CS)
            "algorithm design", "computational complexity", "data structures",
            "algorithm analysis", "graph algorithms", "dynamic programming",
            "sorting algorithms", "search algorithms", "NP-completeness",
            # Programming Languages & Compilers (BK13)
            "programming language theory", "compiler design", "interpreter development",
            "formal languages", "automata theory", "type systems",
            "functional programming", "programming paradigms",
            # Intelligent Systems & AI (BK18 — kuat di CS)
            "artificial intelligence", "machine learning", "deep learning",
            "neural networks", "reinforcement learning", "natural language processing",
            "computer vision", "robotics", "knowledge representation",
            "expert systems", "AI research",
            # Theoretical CS & Math (BK20 + BK21)
            "discrete mathematics", "mathematical logic", "formal methods",
            "computational theory", "numerical methods", "mathematical modeling",
            "scientific computing", "simulation",
            # Software Development (BK08 + BK14)
            "software development", "object-oriented programming", "design patterns",
            "software architecture", "test-driven development", "code review",
            # Graphics (BK17)
            "computer graphics", "visualization", "game development",
            "rendering techniques", "3D modeling",
        ],

        "adjacent_keywords": KEYWORDS_BERSAMA + [
            "database programming", "web development", "mobile applications",
            "network programming", "parallel algorithms", "distributed algorithms",
        ],
    },

    # =========================================================================
    # SE — Software Engineering / Rekayasa Perangkat Lunak
    # Sumber profil: APTIKOM 2022 CPL08, CPL09, CPL10 (penciri utama)
    #   + CC2020 Software Engineering knowledge areas
    # Profesi target: Software Engineer, DevOps Engineer, QA Engineer,
    #                 Software Architect, Product Manager Tech
    # BK Penciri Khas SE: BK08 Software Engineering, BK10 Software Design,
    #   BK24 Software Development Fundamentals, BK25 Software Process,
    #   BK28 Software Quality, BK29 Software Modeling
    # =========================================================================
    "SE": {
        "nama_lengkap": "Rekayasa Perangkat Lunak / Software Engineering",
        "jenjang": "S1",
        "sumber_aptikom": "APTIKOM 2022 CPL08/CPL09/CPL10 + CC2020 SE Knowledge Areas",
        "isced_codes": ["0613", "0612"],
        # ISCED 0613: Software and applications development — sangat dominan SE

        "profesi_kkni": [
            "Software Engineer",
            "Software Architect",
            "DevOps Engineer",
            "Quality Assurance Engineer",
            "Full Stack Developer",
            "Mobile Developer",
            "Product Manager Technical",
        ],

        "bk_penciri_pendukung": [
            "BK08: Software Engineering",
            "BK10: Software Design",
            "BK24: Software Development Fundamentals",
            "BK25: Software Process",
            "BK28: Software Quality, Verification and Validation",
            "BK29: Software Modeling and Analysis",
        ],

        "mk_penciri_utama": [
            "Rekayasa Perangkat Lunak",
            "Analisis dan Desain Perangkat Lunak",
            "Proyek Perangkat Lunak",
            "Pemrograman Berbasis Platform",
            "Pengenalan Pemrograman",
            "Pemrograman Berorientasi Objek",
        ],

        "mk_pilihan_khas": [
            "MKP01: Penjaminan Kualitas Perangkat Lunak",
            "MKP03: Strategi Algoritma",
            "MKP06: Technopreneurship",
            "MKP08: Teknologi AR/VR",
            "MKP09: Game Development",
            "MKP11: Web Semantic",
        ],

        "core_keywords": [
            # Software Engineering Process (BK08 + BK25 — inti SE)
            "software engineering", "software development lifecycle", "SDLC",
            "agile development", "scrum methodology", "kanban",
            "requirements engineering", "software process improvement",
            "software project management", "continuous integration",
            # Software Design & Architecture (BK10 + BK29)
            "software architecture", "design patterns", "microservices architecture",
            "software design", "object-oriented design", "UML modeling",
            "software modeling", "domain-driven design", "clean architecture",
            # Software Quality & Testing (BK28 + MKP01)
            "software testing", "test automation", "unit testing",
            "quality assurance", "software verification", "software validation",
            "code review", "static analysis", "continuous testing",
            # Development (BK14 + BK24)
            "full stack development", "web development", "API development",
            "mobile application development", "backend development", "frontend development",
            "DevOps", "CI/CD pipelines", "containerization",
            # Platform-based (BK19)
            "platform development", "cloud-native development", "serverless computing",
            "PWA progressive web apps", "cross-platform development",
        ],

        "adjacent_keywords": KEYWORDS_BERSAMA + [
            "database development", "system administration basics",
            "network programming", "security programming", "UI design",
            "technical documentation", "code optimization",
        ],
    },

    # =========================================================================
    # CE — Computer Engineering / Teknik Komputer
    # Sumber profil: APTIKOM 2022 + CC2020 CE + KKNI TIK Hardware
    # Profesi target: Hardware Engineer, Embedded Systems Developer,
    #                 IoT Engineer, FPGA Developer, Robotics Engineer
    # BK Penciri Khas CE: BK15 Computing Systems Fundamentals,
    #   BK16 Architecture and Organization, BK07 Systems and Networking (hardware)
    # =========================================================================
    "CE": {
        "nama_lengkap": "Teknik Komputer / Computer Engineering",
        "jenjang": "S1",
        "sumber_aptikom": "APTIKOM 2022 + CC2020 CE Knowledge Areas + KKNI TIK Hardware",
        "isced_codes": ["0714", "0613", "0612"],
        # ISCED 0714: Electronics and automation — dominan CE (hardware)
        # ISCED 0613: Software — embedded software
        # ISCED 0612: Network — hardware networking

        "profesi_kkni": [
            "Hardware Engineer",
            "Embedded Systems Developer",
            "IoT Engineer",
            "FPGA Developer",
            "Robotics Engineer",
            "Digital Systems Designer",
            "Computer Hardware Technician",
        ],

        "bk_penciri_pendukung": [
            "BK15: Computing Systems Fundamentals",
            "BK16: Architecture and Organization",
            "BK07: Systems and Networking (hardware)",
            "BK11: Operating Systems (embedded)",
            "BK19: Platform-based Development (embedded)",
        ],

        "mk_penciri_utama": [
            "Organisasi dan Arsitektur Komputer",
            "Internet of Things",
            "Sistem Operasi",
            "Jaringan Komputer",
            "Komputasi Paralel dan Terdistribusi",
        ],

        "mk_pilihan_khas": [
            "MKP16: Wireless Sensors Network",
            "MKP08: Teknologi AR/VR",
            "MKP17: AI Computing Platform",
            "MKP04: Teknologi Blockchain",
        ],

        "core_keywords": [
            # Computer Architecture (BK15 + BK16 — inti CE)
            "computer architecture", "digital systems design", "processor design",
            "memory systems", "cache design", "instruction set architecture",
            "FPGA programming", "ASIC design", "hardware description language",
            "VHDL", "Verilog", "RTL design",
            # Embedded Systems
            "embedded systems", "microcontroller programming", "real-time systems",
            "firmware development", "RTOS", "embedded Linux",
            "bare-metal programming", "hardware-software interface",
            # IoT & Hardware Networking
            "Internet of Things hardware", "sensor design", "actuator systems",
            "wireless sensor networks", "hardware protocols", "SPI I2C UART",
            "edge computing hardware", "hardware security",
            # Robotics & Automation
            "robotics", "automation systems", "control systems",
            "mechatronics", "signal processing hardware",
            # Low-level Software
            "device drivers", "operating system internals", "kernel development",
            "hardware abstraction layer", "boot loaders",
        ],

        "adjacent_keywords": KEYWORDS_BERSAMA + [
            "network hardware", "server hardware", "data center infrastructure",
            "hardware troubleshooting", "power systems computing",
        ],
    },

    # =========================================================================
    # DS — Data Science
    # Sumber profil: APTIKOM 2022 MK Pilihan (Data Science, Data Mining,
    #   Big Data, Visualisasi Data) + KKNI TIK Level 6 Data profesi
    #   + CC2020 Data-centric knowledge areas
    # Profesi target: Data Scientist, Data Analyst, ML Engineer,
    #                 Data Engineer, Business Intelligence Developer
    # BK Penciri Khas DS: BK18 Intelligent Systems, BK17 Graphics and Visualization,
    #   BK20 Computational Science, BK06 Database Systems
    # =========================================================================
    "DS": {
        "nama_lengkap": "Data Science / Sains Data",
        "jenjang": "S1",
        "sumber_aptikom": "APTIKOM 2022 MKP13/MKP18/MKP07 + CC2020 Data Centric + KKNI TIK",
        "isced_codes": ["0613", "0612", "0611"],
        # ISCED 0613: Software — data processing tools
        # ISCED 0612: Database — data management context
        # ISCED 0611: Computer use — data analysis tools

        "profesi_kkni": [
            "Data Scientist",
            "Data Analyst",
            "Machine Learning Engineer",
            "Data Engineer",
            "Business Intelligence Developer",
            "AI Researcher",
            "Competitive Intelligence Analyst",
        ],

        "bk_penciri_pendukung": [
            "BK18: Intelligent Systems",
            "BK17: Graphics and Visualization",
            "BK20: Computational Science",
            "BK06: Database Systems",
            "BK12: Data Structures and Algorithms",
        ],

        "mk_penciri_utama": [
            "Pembelajaran Mesin",
            "Kecerdasan Buatan",
            "Big Data",
            "Statistika",
            "Aljabar Linier",
            "Kalkulus",
            "Matematika Diskrit",
        ],

        "mk_pilihan_khas": [
            "MKP13: Data Science",
            "MKP18: Data Mining",
            "MKP07: Visualisasi Data",
            "MKP10: Deep Learning",
            "MKP05: Pemrosesan Bahasa Alami",
            "MKP14: Computer Vision",
            "MKP02: Analisis Jejaring Sosial",
            "MKP19: Process Mining",
        ],

        "core_keywords": [
            # Data Science Core
            "data science", "data analysis", "statistical analysis",
            "exploratory data analysis", "data preprocessing", "feature engineering",
            "data cleaning", "data wrangling", "statistical modeling",
            # Machine Learning & AI (BK18 — inti DS)
            "machine learning", "supervised learning", "unsupervised learning",
            "deep learning", "neural networks", "model evaluation",
            "hyperparameter tuning", "cross-validation", "ensemble methods",
            "gradient boosting", "random forest", "support vector machines",
            # Big Data & Engineering
            "big data processing", "Apache Spark", "Hadoop ecosystem",
            "data pipeline", "data engineering", "data lake",
            "stream processing", "batch processing", "ETL pipeline",
            # Visualization (BK17 + MKP07)
            "data visualization", "dashboard development", "storytelling with data",
            "business intelligence", "Tableau", "Power BI",
            "matplotlib seaborn plotly", "interactive visualization",
            # Specialized AI (MKP05, MKP14)
            "natural language processing", "text mining", "sentiment analysis",
            "computer vision", "image classification", "object detection",
            # Mathematics (Statistika + Aljabar Linier + Kalkulus)
            "probability theory", "linear algebra", "calculus optimization",
            "bayesian statistics", "hypothesis testing", "regression analysis",
        ],

        "adjacent_keywords": KEYWORDS_BERSAMA + [
            "database querying", "cloud data platforms", "API integration",
            "web scraping", "data collection", "research methods",
            "experiment design", "scientific computing",
        ],
    },
}

# ─────────────────────────────────────────────────────────────────────────────
# HELPER FUNCTIONS
# ─────────────────────────────────────────────────────────────────────────────

def get_all_prodi_codes():
    """Return list 6 kode prodi APTIKOM."""
    return list(DOMAIN_MAP.keys())


def get_domain(prodi_code: str) -> dict:
    """
    Return domain config untuk satu prodi.
    Raise KeyError jika prodi tidak ditemukan.
    """
    code = prodi_code.upper()
    if code not in DOMAIN_MAP:
        raise KeyError(
            f"Prodi '{code}' tidak ditemukan. "
            f"Pilihan: {get_all_prodi_codes()}"
        )
    return DOMAIN_MAP[code]


def get_core_keywords(prodi_code: str) -> list:
    """Return core_keywords untuk prodi tertentu."""
    return get_domain(prodi_code)["core_keywords"]


def get_adjacent_keywords(prodi_code: str) -> list:
    """Return adjacent_keywords untuk prodi tertentu."""
    return get_domain(prodi_code)["adjacent_keywords"]


def get_isced_codes(prodi_code: str) -> list:
    """Return ISCED-F codes untuk prodi tertentu."""
    return get_domain(prodi_code)["isced_codes"]


def get_all_keywords(prodi_code: str) -> dict:
    """
    Return semua keywords (core + adjacent) dalam satu dict.
    Berguna untuk stage00_domain_filter.py.
    """
    domain = get_domain(prodi_code)
    return {
        "core": domain["core_keywords"],
        "adjacent": domain["adjacent_keywords"],
        "isced_codes": domain["isced_codes"],
        "profesi_kkni": domain["profesi_kkni"],
    }


def get_metadata(prodi_code: str) -> dict:
    """
    Return metadata prodi untuk DomainMap.jsx frontend.
    Response-ready untuk /api/domain/{prodi} endpoint.
    """
    domain = get_domain(prodi_code)
    return {
        "prodi_code": prodi_code.upper(),
        "nama_lengkap": domain["nama_lengkap"],
        "jenjang": domain["jenjang"],
        "sumber": domain["sumber_aptikom"],
        "isced_codes": domain["isced_codes"],
        "profesi_kkni": domain["profesi_kkni"],
        "bk_penciri_pendukung": domain["bk_penciri_pendukung"],
        "mk_penciri_utama": domain["mk_penciri_utama"],
        "mk_pilihan_khas": domain.get("mk_pilihan_khas", []),
        "n_core_keywords": len(domain["core_keywords"]),
        "n_adjacent_keywords": len(domain["adjacent_keywords"]),
    }


# ─────────────────────────────────────────────────────────────────────────────
# QUICK TEST
# ─────────────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    print("=== Domain Map IR-KG v3 — APTIKOM 2022 ===\n")
    for code in get_all_prodi_codes():
        meta = get_metadata(code)
        kw = get_all_keywords(code)
        print(f"[{code}] {meta['nama_lengkap']}")
        print(f"  ISCED: {meta['isced_codes']}")
        print(f"  Core keywords: {meta['n_core_keywords']}")
        print(f"  Adjacent keywords: {meta['n_adjacent_keywords']}")
        print(f"  Profesi KKNI: {len(meta['profesi_kkni'])} profesi")
        print(f"  BK Penciri Khas: {len(meta['bk_penciri_pendukung'])} BK")
        print()
    print(f"Total prodi: {len(DOMAIN_MAP)}")
    print("Sumber: APTIKOM 2022 (Setiawan, Shofi, Wicaksono) + ACM CC2020 + KKNI TIK 2018")
