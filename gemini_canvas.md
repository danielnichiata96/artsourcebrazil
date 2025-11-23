<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Art Source Brazil | Creative Jobs</title>
    
    <!-- Fonts: Space Grotesk & Public Sans -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Public+Sans:wght@400;500;600&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">

    <!-- Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    fontFamily: {
                        sans: ['Public Sans', 'sans-serif'],
                        display: ['Space Grotesk', 'sans-serif'],
                    },
                    colors: {
                        paper: '#f4f3f0', 
                        ink: '#1a1918',
                        accent: {
                            lime: '#ccff00',  // Cyber Lime
                            pink: '#ff99cc',  
                            purple: '#b388ff', 
                            orange: '#ffaa00',
                            teal: '#00e5ff'
                        }
                    },
                    boxShadow: {
                        'hard': '5px 5px 0px 0px rgba(26, 25, 24, 1)',
                        'hard-sm': '3px 3px 0px 0px rgba(26, 25, 24, 1)',
                        'hard-lg': '10px 10px 0px 0px rgba(26, 25, 24, 1)',
                    },
                    animation: {
                        'fade-in-up': 'fadeInUp 0.5s ease-out forwards',
                        'slide-in-right': 'slideInRight 0.3s ease-out forwards',
                    },
                    keyframes: {
                        fadeInUp: {
                            '0%': { opacity: '0', transform: 'translateY(20px)' },
                            '100%': { opacity: '1', transform: 'translateY(0)' },
                        },
                        slideInRight: {
                            '0%': { transform: 'translateX(100%)' },
                            '100%': { transform: 'translateX(0)' },
                        }
                    }
                }
            }
        }
    </script>

    <style>
        /* Base Setup & Texture */
        body {
            background-color: #f4f3f0;
            color: #1a1918;
            /* Dot pattern background */
            background-image: radial-gradient(#1a1918 0.5px, transparent 0.5px);
            background-size: 24px 24px;
        }

        /* Noise Overlay for "Paper" Feel */
        .noise-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 50;
            opacity: 0.06;
            background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
        }
        
        /* Custom Checkbox */
        .studio-checkbox {
            appearance: none;
            width: 1.25rem;
            height: 1.25rem;
            border: 2px solid #1a1918;
            background: white;
            display: grid;
            place-content: center;
            transition: all 0.2s;
        }
        .studio-checkbox::before {
            content: "";
            width: 0.65rem;
            height: 0.65rem;
            background: #1a1918;
            transform: scale(0);
            transition: 0.2s transform ease-in-out;
        }
        .studio-checkbox:checked::before {
            transform: scale(1);
        }
        .studio-checkbox:checked {
            background: #ccff00; /* Lime accent on check */
        }

        /* Utilities */
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

        /* Staggered Animation Delays */
        .delay-100 { animation-delay: 100ms; }
        .delay-200 { animation-delay: 200ms; }
        .delay-300 { animation-delay: 300ms; }
    </style>
</head>
<body class="min-h-screen flex flex-col font-sans overflow-x-hidden">
    
    <!-- Global Texture -->
    <div class="noise-overlay"></div>

    <!-- Navigation -->
    <nav class="sticky top-0 z-40 w-full border-b-2 border-ink bg-paper/95 backdrop-blur-sm">
        <div class="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6">
            <!-- Logo -->
            <a href="#" class="flex items-center gap-3 group">
                <div class="h-10 w-10 border-2 border-ink bg-accent-lime shadow-hard-sm group-hover:shadow-none group-hover:translate-x-[3px] group-hover:translate-y-[3px] transition-all flex items-center justify-center">
                    <span class="font-display font-bold text-xl">Br</span>
                </div>
                <div class="flex flex-col leading-none">
                    <span class="font-display text-xl font-bold uppercase tracking-tight">Art Source</span>
                    <span class="font-sans text-xs font-bold tracking-widest text-stone-500 group-hover:text-ink transition-colors">BRAZIL EDITION</span>
                </div>
            </a>
            
            <!-- Desktop Actions -->
            <div class="flex items-center gap-8">
                <div class="hidden md:flex gap-6 text-sm font-bold uppercase tracking-wide">
                    <a href="#" class="hover:text-accent-purple transition-colors">Talent</a>
                    <a href="#" class="hover:text-accent-purple transition-colors">Studios</a>
                </div>
                <a href="#" class="border-2 border-ink bg-ink text-paper px-6 py-2 text-sm font-bold uppercase tracking-wider shadow-hard hover:bg-accent-lime hover:text-ink hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all">
                    Post a Job
                </a>
            </div>
        </div>
    </nav>

    <main class="flex-1 relative">
        
        <!-- Hero Section -->
        <section class="relative border-b-2 border-ink bg-paper overflow-hidden py-20 lg:py-28">
            <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
                <div class="max-w-4xl">
                    <!-- Animated Badge -->
                    <div class="inline-flex items-center gap-2 border-2 border-ink bg-white px-3 py-1 mb-8 shadow-hard-sm animate-fade-in-up">
                        <span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        <span class="text-xs font-bold uppercase tracking-widest">Live Beta v3.0</span>
                    </div>

                    <h1 class="font-display text-6xl sm:text-8xl font-bold leading-[0.9] mb-8 tracking-tighter animate-fade-in-up delay-100">
                        CRAFTED IN <br/>
                        <span class="text-transparent bg-clip-text bg-gradient-to-r from-accent-purple to-accent-teal">BRAZIL.</span> <br/>
                        DEPLOYED GLOBAL.
                    </h1>
                    
                    <div class="flex flex-col md:flex-row gap-8 items-start md:items-center animate-fade-in-up delay-200">
                        <p class="text-xl text-stone-600 font-medium max-w-lg leading-relaxed border-l-4 border-accent-lime pl-6">
                            The definitive hub for <span class="font-bold text-ink">3D Artists</span>, <span class="font-bold text-ink">VFX Wizards</span>, and <span class="font-bold text-ink">Game Devs</span> in Brazil looking for international remote work.
                        </p>

                        <!-- Search Input -->
                        <div class="relative w-full md:w-auto flex-1 max-w-md">
                            <div class="flex shadow-hard bg-white border-2 border-ink group focus-within:shadow-hard-lg transition-shadow">
                                <input
                                    type="text"
                                    id="search-input"
                                    class="w-full bg-transparent border-none py-4 pl-4 text-lg font-bold placeholder:text-stone-300 focus:ring-0 uppercase tracking-wide"
                                    placeholder="Search roles..."
                                />
                                <button class="bg-accent-lime text-ink px-6 border-l-2 border-ink hover:bg-accent-teal transition-colors">
                                    <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Abstract Shape decoration -->
            <div class="absolute top-20 right-[-5%] w-[400px] h-[400px] bg-accent-purple/20 rounded-full blur-3xl mix-blend-multiply pointer-events-none"></div>
            <div class="absolute bottom-[-10%] left-[-5%] w-[300px] h-[300px] bg-accent-lime/20 rounded-full blur-3xl mix-blend-multiply pointer-events-none"></div>
        </section>

        <!-- Main Content Area -->
        <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 relative">
            <div class="flex flex-col lg:flex-row gap-12">
                
                <!-- Desktop Sidebar -->
                <aside class="hidden lg:block w-72 flex-shrink-0">
                    <div class="sticky top-28 space-y-10">
                        <!-- Categories -->
                        <div class="border-2 border-ink bg-white p-6 shadow-hard-sm transform rotate-1 hover:rotate-0 transition-transform duration-300">
                            <h3 class="font-display text-lg font-bold uppercase tracking-wide mb-5 border-b-2 border-ink pb-2 inline-block">
                                Discipline
                            </h3>
                            <div class="space-y-3" id="category-filters">
                                <label class="flex items-center gap-3 cursor-pointer group hover:translate-x-1 transition-transform">
                                    <input type="radio" name="category-filter" value="all" checked class="studio-checkbox" />
                                    <span class="font-bold text-sm uppercase group-hover:text-accent-purple transition-colors">All Disciplines</span>
                                </label>
                                <!-- JS Injected -->
                            </div>
                        </div>

                        <!-- Tags -->
                        <div>
                            <h3 class="font-display text-lg font-bold uppercase tracking-wide mb-4 flex items-center gap-2">
                                <span class="w-2 h-2 bg-accent-lime border border-ink"></span> Hot Skills
                            </h3>
                            <div class="flex flex-wrap gap-2" id="tag-filters">
                                <!-- JS Injected -->
                            </div>
                        </div>

                        <!-- Ad Box -->
                        <div class="bg-ink text-paper p-6 border-2 border-ink shadow-hard text-center">
                            <p class="font-display font-bold text-xl mb-2">Hiring?</p>
                            <p class="text-sm text-stone-400 mb-4">Reach 5,000+ Brazilian creatives.</p>
                            <button class="w-full bg-paper text-ink font-bold uppercase py-2 hover:bg-accent-lime transition-colors">Post Now</button>
                        </div>
                    </div>
                </aside>

                <!-- Feed -->
                <div class="flex-1">
                    <!-- Feed Header -->
                    <div class="mb-8 flex items-center justify-between border-b-2 border-stone-300 pb-4 sticky top-20 bg-paper/95 backdrop-blur z-20 pt-4 lg:pt-0">
                        <h2 class="font-display text-3xl font-bold uppercase">
                            Fresh Roles <span class="ml-2 bg-accent-lime border border-ink text-ink text-lg px-2 py-0.5 align-middle rounded-none shadow-[2px_2px_0px_0px_#000]" id="job-count">0</span>
                        </h2>
                        
                        <!-- Mobile Filter Trigger -->
                        <button id="mobile-filter-btn" class="lg:hidden flex items-center gap-2 font-bold uppercase tracking-wide border-2 border-ink px-4 py-2 bg-white hover:bg-ink hover:text-white transition-colors shadow-hard-sm">
                            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
                            Filters
                        </button>
                    </div>

                    <!-- Job Grid -->
                    <div id="job-list" class="grid gap-6">
                        <!-- Jobs injected by JS -->
                    </div>
                    
                    <!-- Empty State -->
                    <div id="empty-state" class="hidden py-24 text-center border-2 border-dashed border-ink bg-white/50">
                        <div class="font-display text-6xl mb-4 grayscale">💀</div>
                        <h3 class="font-display text-2xl font-bold mb-2">Dead End.</h3>
                        <p class="text-stone-500 mb-6">No jobs match those filters.</p>
                        <button id="clear-filters" class="border-2 border-ink bg-accent-lime px-6 py-2 font-bold uppercase shadow-hard hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all">
                            Reset
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </main>

    <!-- Mobile Filter Drawer (Hidden by default) -->
    <div id="mobile-drawer" class="fixed inset-0 z-50 hidden">
        <div class="absolute inset-0 bg-ink/80 backdrop-blur-sm" id="drawer-backdrop"></div>
        <div class="absolute right-0 top-0 h-full w-80 bg-paper border-l-2 border-ink shadow-2xl transform translate-x-full transition-transform duration-300 ease-out flex flex-col" id="drawer-content">
            <div class="p-6 border-b-2 border-ink flex justify-between items-center bg-white">
                <h3 class="font-display text-xl font-bold uppercase">Filters</h3>
                <button id="close-drawer" class="p-2 hover:bg-stone-200 rounded-full">
                    <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>
            <div class="p-6 overflow-y-auto flex-1 space-y-8">
                <!-- Mobile Categories -->
                <div>
                    <h4 class="font-bold uppercase mb-4 text-sm tracking-wider text-stone-500">Discipline</h4>
                    <div class="space-y-3" id="mobile-category-filters">
                        <!-- Injected -->
                    </div>
                </div>
                <!-- Mobile Tags -->
                <div>
                    <h4 class="font-bold uppercase mb-4 text-sm tracking-wider text-stone-500">Skills</h4>
                    <div class="flex flex-wrap gap-2" id="mobile-tag-filters">
                        <!-- Injected -->
                    </div>
                </div>
            </div>
            <div class="p-6 border-t-2 border-ink bg-white">
                <button id="apply-mobile-filters" class="w-full bg-ink text-white font-bold uppercase py-4 shadow-hard hover:bg-accent-lime hover:text-ink transition-colors">
                    Show Results
                </button>
            </div>
        </div>
    </div>

    <!-- Job Detail Modal (Hidden by default) -->
    <div id="job-modal" class="fixed inset-0 z-[60] hidden flex justify-end pointer-events-none">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-ink/60 backdrop-blur-sm pointer-events-auto opacity-0 transition-opacity duration-300" id="modal-backdrop"></div>
        
        <!-- Content Pane -->
        <div class="relative w-full max-w-2xl bg-paper h-full shadow-2xl pointer-events-auto transform translate-x-full transition-transform duration-300 ease-out flex flex-col border-l-4 border-ink" id="modal-content">
            
            <!-- Header -->
            <div class="p-8 border-b-2 border-ink bg-white relative">
                <button id="close-modal" class="absolute top-6 right-6 p-2 hover:bg-stone-100 border-2 border-transparent hover:border-ink transition-all">
                    <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                <div id="modal-header-content">
                    <!-- Injected -->
                </div>
            </div>

            <!-- Scrollable Body -->
            <div class="flex-1 overflow-y-auto p-8 space-y-8">
                <div class="prose prose-stone max-w-none">
                    <h3 class="font-display text-xl font-bold uppercase mb-4">The Role</h3>
                    <p class="mb-4">We are looking for a creative individual to join our team. This is a remote position for Brazil-based talent. You will work closely with the Art Director to define the visual style of our next AAA title.</p>
                    
                    <h3 class="font-display text-xl font-bold uppercase mb-4">Requirements</h3>
                    <ul class="list-disc pl-5 space-y-2 font-medium text-stone-700">
                        <li>5+ years of experience in the industry.</li>
                        <li>Proficiency in the tools listed in the tags.</li>
                        <li>Strong communication skills in English.</li>
                        <li>Portfolio demonstrating high-quality work.</li>
                    </ul>
                    
                    <h3 class="font-display text-xl font-bold uppercase mb-4 mt-8">Benefits</h3>
                    <ul class="list-disc pl-5 space-y-2 font-medium text-stone-700">
                        <li>Competitive salary in USD/EUR.</li>
                        <li>Flexible hours.</li>
                        <li>Health insurance stipend.</li>
                    </ul>
                </div>
            </div>

            <!-- Footer Action -->
            <div class="p-6 border-t-2 border-ink bg-white flex gap-4">
                <button class="flex-1 border-2 border-ink py-3 font-bold uppercase hover:bg-stone-100">Save</button>
                <button class="flex-[2] bg-accent-lime border-2 border-ink py-3 font-bold uppercase shadow-hard hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all">Apply Now</button>
            </div>
        </div>
    </div>

    <script>
        // --- 1. DATA ---
        const jobsData = [
            {
                id: "1",
                jobTitle: "Senior Environment Artist",
                companyName: "Iron Studios",
                category: "3D Art",
                location: { scope: "remote-brazil" },
                contractType: "Full-time",
                salary: { min: 8000, max: 12000, currency: "BRL" },
                tags: ["Unreal 5", "Blender", "ZBrush"],
                postedDate: new Date().toISOString(),
                accentColor: "bg-accent-lime"
            },
            {
                id: "2",
                jobTitle: "Lead UI/UX Designer",
                companyName: "Wildlife Studios",
                category: "UI/UX",
                location: { scope: "hybrid" },
                contractType: "Contract",
                salary: { min: 15000, max: null, currency: "BRL" },
                tags: ["Figma", "Unity UI", "Mobile"],
                postedDate: new Date(Date.now() - 86400000).toISOString(),
                accentColor: "bg-accent-pink"
            },
            {
                id: "3",
                jobTitle: "Technical Artist (Shaders)",
                companyName: "Aquiris",
                category: "Tech Art",
                location: { scope: "remote-worldwide" },
                contractType: "Full-time",
                salary: { min: 4000, max: 6000, currency: "USD" },
                tags: ["HLSL", "Python", "Houdini"],
                postedDate: "2023-10-20",
                accentColor: "bg-accent-purple"
            },
            {
                id: "4",
                jobTitle: "VFX Artist",
                companyName: "Fortis Games",
                category: "VFX",
                location: { scope: "remote-latam" },
                contractType: "Full-time",
                salary: { min: null, max: null, currency: "BRL" },
                tags: ["Niagara", "Unity", "Particles"],
                postedDate: "2023-10-15",
                accentColor: "bg-accent-teal"
            },
            {
                id: "5",
                jobTitle: "Character Concept Artist",
                companyName: "Sketch House",
                category: "2D Art",
                location: { scope: "remote-brazil" },
                contractType: "Freelance",
                salary: { min: 3000, max: 5000, currency: "BRL" },
                tags: ["Photoshop", "Illustration"],
                postedDate: "2023-10-18",
                accentColor: "bg-accent-orange"
            }
        ];

        // --- 2. HELPERS ---
        const timeAgo = (dateStr) => {
            const days = Math.floor((new Date() - new Date(dateStr)) / (86400000));
            if (days === 0) return "TODAY";
            if (days === 1) return "YESTERDAY";
            return `${days}D AGO`;
        };

        const formatSalary = (s) => {
            if (!s || (!s.min && !s.max)) return null;
            const fmt = (n) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: s.currency, maximumSignificantDigits: 3 }).format(n);
            if (s.min && s.max) return `${fmt(s.min)}-${fmt(s.max)}`;
            return s.min ? `>${fmt(s.min)}` : `<${fmt(s.max)}`;
        };

        const getLocationLabel = (scope) => {
            const map = { 'remote-brazil': 'BRAZIL ONLY', 'remote-latam': 'LATAM REMOTE', 'remote-worldwide': 'GLOBAL', 'hybrid': 'HYBRID', 'onsite': 'ON-SITE' };
            return map[scope] || 'REMOTE';
        };

        // --- 3. RENDERING ---
        function renderJobs(jobs) {
            const list = document.getElementById('job-list');
            list.innerHTML = '';

            if (jobs.length === 0) {
                document.getElementById('empty-state').classList.remove('hidden');
                document.getElementById('job-count').textContent = '0';
                return;
            }

            document.getElementById('empty-state').classList.add('hidden');
            document.getElementById('job-count').textContent = jobs.length;

            jobs.forEach((job, i) => {
                const salary = formatSalary(job.salary);
                const isNew = (new Date() - new Date(job.postedDate)) < (3 * 86400000);
                const accent = job.accentColor || 'bg-accent-lime';
                const delayClass = i < 5 ? `delay-${(i+1)*100}` : '';

                const card = document.createElement('article');
                // Added animation classes
                card.className = `job-card group relative flex flex-col md:flex-row border-2 border-ink bg-white p-0 shadow-hard cursor-pointer hover:shadow-none hover:translate-x-[5px] hover:translate-y-[5px] transition-all duration-200 animate-fade-in-up ${delayClass}`;
                
                // Data attributes for filtering
                Object.assign(card.dataset, {
                    id: job.id,
                    category: job.category,
                    tags: job.tags.join(',').toLowerCase(),
                    title: job.jobTitle.toLowerCase(),
                    company: job.companyName.toLowerCase()
                });

                // Click event to open modal
                card.onclick = (e) => {
                    // Prevent clicking tags from opening modal if desired, but for now whole card works
                    openJobModal(job);
                };

                card.innerHTML = `
                    <div class="w-full md:w-4 ${accent} border-b-2 md:border-b-0 md:border-r-2 border-ink h-4 md:h-auto flex-shrink-0"></div>
                    <div class="flex-1 p-6 flex flex-col justify-between">
                        <div>
                            <div class="flex items-start justify-between gap-4 mb-2">
                                <div>
                                    <h3 class="font-display text-xl font-bold leading-tight group-hover:text-stone-600 transition-colors">${job.jobTitle}</h3>
                                    <p class="text-base font-medium text-stone-500 mt-1">${job.companyName}</p>
                                </div>
                                ${isNew ? `<span class="border-2 border-ink bg-accent-lime px-2 py-0.5 text-xs font-bold uppercase shadow-[2px_2px_0px_0px_#000]">New</span>` : ''}
                            </div>
                            <div class="flex flex-wrap gap-3 mt-4 text-xs font-bold uppercase tracking-wider text-stone-500">
                                <span class="flex items-center gap-1 text-ink"><svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>${getLocationLabel(job.location.scope)}</span>
                                <span class="flex items-center gap-1 text-ink"><svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>${job.contractType}</span>
                                ${salary ? `<span class="text-emerald-700 bg-emerald-100 px-1 border border-emerald-200">${salary}</span>` : ''}
                            </div>
                        </div>
                        <div class="mt-6 flex flex-wrap gap-2 relative z-10">
                            ${job.tags.map(tag => `<span class="border border-ink bg-white px-2 py-1 text-xs font-bold uppercase shadow-[2px_2px_0px_0px_#e5e5e5] hover:bg-ink hover:text-white transition-colors">${tag}</span>`).join('')}
                        </div>
                    </div>
                    <div class="p-6 pt-0 md:pt-6 md:border-l-2 md:border-ink flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-4 bg-stone-50 md:bg-transparent">
                        <time class="text-xs font-bold text-stone-400 uppercase tracking-widest">${timeAgo(job.postedDate)}</time>
                        <div class="hidden md:flex w-10 h-10 border-2 border-ink rounded-full items-center justify-center group-hover:bg-ink group-hover:text-white transition-colors">
                            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                        </div>
                    </div>
                `;
                list.appendChild(card);
            });
        }

        function renderFilters() {
            const categories = [...new Set(jobsData.map(j => j.category))].sort();
            const allTags = jobsData.flatMap(j => j.tags);
            const popularTags = [...new Set(allTags)].sort((a,b) => allTags.filter(t=>t===b).length - allTags.filter(t=>t===a).length).slice(0,10);

            const renderCats = (containerId) => {
                const container = document.getElementById(containerId);
                if(!container) return;
                container.innerHTML = `
                    <label class="flex items-center gap-3 cursor-pointer group hover:translate-x-1 transition-transform mb-3">
                        <input type="radio" name="${containerId}-radio" value="all" checked class="studio-checkbox" />
                        <span class="font-bold text-sm uppercase">All Disciplines</span>
                    </label>
                `;
                categories.forEach(cat => {
                    const label = document.createElement('label');
                    label.className = "flex items-center gap-3 cursor-pointer group hover:translate-x-1 transition-transform mb-3";
                    label.innerHTML = `
                        <input type="radio" name="${containerId}-radio" value="${cat}" class="studio-checkbox" />
                        <span class="font-bold text-sm uppercase">${cat}</span>
                    `;
                    container.appendChild(label);
                });
            };

            const renderTags = (containerId) => {
                const container = document.getElementById(containerId);
                if(!container) return;
                popularTags.forEach(tag => {
                    const btn = document.createElement('button');
                    btn.dataset.tag = tag;
                    btn.className = "tag-filter border border-ink bg-white px-2 py-1 text-xs font-bold uppercase hover:bg-ink hover:text-white transition-colors";
                    btn.textContent = tag;
                    container.appendChild(btn);
                });
            };

            renderCats('category-filters');
            renderTags('tag-filters');
            renderCats('mobile-category-filters');
            renderTags('mobile-tag-filters');
        }

        // --- 4. INTERACTION ---
        function openJobModal(job) {
            const modal = document.getElementById('job-modal');
            const content = document.getElementById('modal-content');
            const backdrop = document.getElementById('modal-backdrop');
            const header = document.getElementById('modal-header-content');

            // Populate Header
            header.innerHTML = `
                <span class="inline-block bg-accent-lime px-2 py-1 text-xs font-bold uppercase border border-ink shadow-[2px_2px_0px_0px_#000] mb-4">${job.category}</span>
                <h2 class="font-display text-3xl font-bold leading-tight mb-2">${job.jobTitle}</h2>
                <div class="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-medium text-stone-600">
                    <span class="flex items-center gap-1 text-ink font-bold"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>${job.companyName}</span>
                    <span>•</span>
                    <span>${getLocationLabel(job.location.scope)}</span>
                    ${job.salary ? `<span>•</span><span class="text-emerald-700">${formatSalary(job.salary)}</span>` : ''}
                </div>
            `;

            // Show
            modal.classList.remove('hidden');
            // Small delay to allow display:block to apply before transitioning opacity/transform
            setTimeout(() => {
                backdrop.classList.remove('opacity-0');
                content.classList.remove('translate-x-full');
            }, 10);
        }

        function closeJobModal() {
            const modal = document.getElementById('job-modal');
            const content = document.getElementById('modal-content');
            const backdrop = document.getElementById('modal-backdrop');

            backdrop.classList.add('opacity-0');
            content.classList.add('translate-x-full');

            setTimeout(() => {
                modal.classList.add('hidden');
            }, 300);
        }

        function initLogic() {
            const searchInput = document.getElementById('search-input');
            let state = { search: '', category: 'all', tag: null };

            const runFilter = () => {
                const cards = document.querySelectorAll('.job-card');
                let count = 0;
                cards.forEach(card => {
                    const matchS = state.search === '' || card.dataset.title.includes(state.search) || card.dataset.company.includes(state.search) || card.dataset.tags.includes(state.search);
                    const matchC = state.category === 'all' || card.dataset.category === state.category;
                    const matchT = state.tag === null || card.dataset.tags.includes(state.tag.toLowerCase());

                    if (matchS && matchC && matchT) {
                        card.style.display = 'flex';
                        // Re-trigger animation for filtered items could be complex, so we just show
                        count++;
                    } else {
                        card.style.display = 'none';
                    }
                });
                
                const empty = document.getElementById('empty-state');
                if (count === 0) empty.classList.remove('hidden'); 
                else empty.classList.add('hidden');
                document.getElementById('job-count').textContent = count;
            };

            // Search
            searchInput.addEventListener('input', (e) => { state.search = e.target.value.toLowerCase(); runFilter(); });

            // Categories (Desktop & Mobile)
            const handleCatChange = (val) => {
                state.category = val;
                // Sync other inputs
                document.querySelectorAll(`input[value="${val}"]`).forEach(r => r.checked = true);
                runFilter();
            };
            document.addEventListener('change', (e) => {
                if (e.target.name && e.target.name.includes('radio')) {
                    handleCatChange(e.target.value);
                }
            });

            // Tags (Delegate)
            const handleTagClick = (e) => {
                if (e.target.classList.contains('tag-filter')) {
                    const tag = e.target.dataset.tag;
                    const isActive = state.tag === tag;
                    state.tag = isActive ? null : tag;

                    // Update UI
                    document.querySelectorAll('.tag-filter').forEach(b => {
                        if (b.dataset.tag === state.tag) {
                            b.classList.remove('bg-white', 'text-black');
                            b.classList.add('bg-ink', 'text-white');
                        } else {
                            b.classList.add('bg-white', 'text-black');
                            b.classList.remove('bg-ink', 'text-white');
                        }
                    });
                    runFilter();
                }
            };
            document.addEventListener('click', handleTagClick);

            // Clear
            document.getElementById('clear-filters').addEventListener('click', () => {
                state = { search: '', category: 'all', tag: null };
                searchInput.value = '';
                document.querySelectorAll('input[value="all"]').forEach(r => r.checked = true);
                document.querySelectorAll('.tag-filter').forEach(b => {
                    b.classList.add('bg-white', 'text-black');
                    b.classList.remove('bg-ink', 'text-white');
                });
                runFilter();
            });

            // Mobile Drawer Logic
            const drawer = document.getElementById('mobile-drawer');
            const drawerContent = document.getElementById('drawer-content');
            const backdrop = document.getElementById('drawer-backdrop');

            const openDrawer = () => {
                drawer.classList.remove('hidden');
                setTimeout(() => drawerContent.classList.remove('translate-x-full'), 10);
            };
            const closeDrawer = () => {
                drawerContent.classList.add('translate-x-full');
                setTimeout(() => drawer.classList.add('hidden'), 300);
            };

            document.getElementById('mobile-filter-btn').addEventListener('click', openDrawer);
            document.getElementById('close-drawer').addEventListener('click', closeDrawer);
            backdrop.addEventListener('click', closeDrawer);
            document.getElementById('apply-mobile-filters').addEventListener('click', closeDrawer);

            // Modal Logic
            document.getElementById('close-modal').addEventListener('click', closeJobModal);
            document.getElementById('modal-backdrop').addEventListener('click', closeJobModal);
            // Close on Esc
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    if (!document.getElementById('job-modal').classList.contains('hidden')) closeJobModal();
                    if (!drawer.classList.contains('hidden')) closeDrawer();
                }
            });
        }

        // --- INIT ---
        document.addEventListener('DOMContentLoaded', () => {
            renderJobs(jobsData);
            renderFilters();
            initLogic();
        });

    </script>
</body>
</html>