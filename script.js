document.addEventListener('DOMContentLoaded', function() {
            const taskInput = document.getElementById('taskInput');
            const categorySelect = document.getElementById('categorySelect');
            const addButton = document.getElementById('addTask');
            const taskList = document.getElementById('taskList');
            const stats = document.getElementById('stats');
            const quoteElement = document.getElementById('motivationalQuote');
            const emptyState = document.getElementById('emptyState');
            const filterButtons = document.querySelectorAll('.filter-btn[data-filter]');
            const categoryFilterButtons = document.querySelectorAll('.category-filter[data-category]');
            const sortButton = document.getElementById('sortBtn');
            
            // Reminder elements
            const reminderToggle = document.getElementById('reminderToggle');
            const reminderFields = document.getElementById('reminderFields');
            const reminderDate = document.getElementById('reminderDate');
            const reminderTime = document.getElementById('reminderTime');
            
            // Authentication elements - only navbar elements are needed now
            const navbarUser = document.getElementById('navbarUser');
            const userNameNav = document.getElementById('userNameNav');
            const logoutBtnNav = document.getElementById('logoutBtnNav');

            let currentFilter = 'all';
            let currentCategoryFilter = null;
            let sortDirection = 'desc';
            let draggedTask = null;
            let customOrder = false;
            let lastQuoteIndex = -1; // متغير لتجنب تكرار نفس الاقتباس مباشرة
            let reminderActive = false;
            let reminderCheckerInterval = null;
            let audioContext = null;
            let soundEnabled = true;
            
            // Authentication variables
            let currentUser = null;
            let isLoggedIn = false;

            const quotes = [
            {
                text: "O you who have believed, do not put [yourselves] before Allah and His Messenger but fear Allah. Indeed, Allah is Hearing and Knowing.",
                textAr:"يَا أَيُّهَا الَّذِينَ آمَنُوا لَا تُقَدِّمُوا بَيْنَ يَدَيِ اللَّهِ وَرَسُولِهِ ۖ وَاتَّقُوا اللَّهَ ۚ إِنَّ اللَّهَ سَمِيعٌ عَلِيمٌ",
                author: "Al-Hujurāt 1"
            },
            {
                text: "O you who have believed, do not raise your voices above the voice of the Prophet or be loud to him in speech like the loudness of some of you to others, lest your deeds become worthless while you perceive not.",
                textAr: "يَا أَيُّهَا الَّذِينَ آمَنُوا لَا تَرْفَعُوا أَصْوَاتَكُمْ فَوْقَ صَوْتِ النَّبِيِّ وَلَا تَجْهَرُوا لَهُ بِالْقَوْلِ كَجَهْرِ بَعْضِكُمْ لِبَعْضٍ أَن تَحْبَطَ أَعْمَالُكُمْ وَأَنتُمْ لَا تَشْعُرُونَ",
                author: "Al-Hujurāt 2"
            },
            {
                text: "Indeed, those who lower their voices before the Messenger of Allah - they are the ones whose hearts Allah has tested for righteousness. For them is forgiveness and great reward.",
                textAr: "إِنَّ الَّذِينَ يَغُضُّونَ أَصْوَاتَهُمْ عِندَ رَسُولِ اللَّهِ أُولَٰئِكَ الَّذِينَ امْتَحَنَ اللَّهُ قُلُوبَهُمْ لِلتَّقْوَىٰ ۚ لَهُم مَّغْفِرَةٌ وَأَجْرٌ عَظِيمٌ",
                author: "Al-Hujurāt 3"
            },
            {
                text: "Indeed, those who call you, [O Muhammad], from behind the chambers - most of them do not use reason.",
                textAr: "إِنَّ الَّذِينَ يُنَادُونَكَ مِن وَرَاءِ الْحُجُرَاتِ أَكْثَرُهُمْ لَا يَعْقِلُونَ",
                author: "Al-Hujurāt 4"
            },
            {
                text: "And if they had been patient until you [could] come out to them, it would have been better for them. But Allah is Forgiving and Merciful.",
                textAr: "وَلَوْ أَنَّهُمْ صَبَرُوا حَتَّىٰ تَخْرُجَ إِلَيْهِمْ لَكَانَ خَيْرًا لَّهُمْ ۚ وَاللَّهُ غَفُورٌ رَّحِيمٌ",
                author: "Al-Hujurāt 5"
            },
            {
                text: "O you who have believed, if there comes to you a disobedient one with information, investigate, lest you harm a people out of ignorance and become, over what you have done, regretful.",
                textAr: "يَا أَيُّهَا الَّذِينَ آمَنُوا إِن جَاءَكُمْ فَاسِقٌ بِنَبَإٍ فَتَبَيَّنُوا أَن تُصِيبُوا قَوْمًا بِجَهَالَةٍ فَتُصْبِحُوا عَلَىٰ مَا فَعَلْتُمْ نَادِمِينَ",
                author: "Al-Hujurāt 6"
            },
            {
                text: "And know that among you is the Messenger of Allah. If he were to obey you in much of the matter, you would be in difficulty, but Allah has endeared to you the faith and has made it pleasing in your hearts and has made hateful to you disbelief, defiance and disobedience. Those are the [rightly] guided.",
                textAr: "وَاعْلَمُوا أَنَّ فِيكُمْ رَسُولَ اللَّهِ ۚ لَوْ يُطِيعُكُمْ فِي كَثِيرٍ مِّنَ الْأَمْرِ لَعَنِتُّمْ وَلَٰكِنَّ اللَّهَ حَبَّبَ إِلَيْكُمُ الْإِيمَانَ وَزَيَّنَهُ فِي قُلُوبِكُمْ وَكَرَّهَ إِلَيْكُمُ الْكُفْرَ وَالْفُسُوقَ وَالْعِصْيَانَ ۚ أُولَٰئِكَ هُمُ الرَّاشِدُونَ",
                author: "Al-Hujurāt 7"
            },
            {
                text: "[It is] as bounty from Allah and favor. And Allah is Knowing and Wise.",
                textAr: "فَضْلًا مِّنَ اللَّهِ وَنِعْمَةً ۚ وَاللَّهُ عَلِيمٌ حَكِيمٌ",
                author: "Al-Hujurāt 8"
            },
            {
                text: "And if two factions among the believers should fight, then make settlement between the two. But if one of them oppresses the other, then fight against the one that oppresses until it returns to the ordinance of Allah. And if it returns, then make settlement between them in justice and act justly. Indeed, Allah loves those who act justly.",
                textAr: "وَإِن طَائِفَتَانِ مِنَ الْمُؤْمِنِينَ اقْتَتَلُوا فَأَصْلِحُوا بَيْنَهُمَا ۖ فَإِن بَغَتْ إِحْدَاهُمَا عَلَى الْأُخْرَىٰ فَقَاتِلُوا الَّتِي تَبْغِي حَتَّىٰ تَفِيءَ إِلَىٰ أَمْرِ اللَّهِ ۚ فَإِن فَاءَتْ فَأَصْلِحُوا بَيْنَهُمَا بِالْعَدْلِ وَأَقْسِطُوا ۖ إِنَّ اللَّهَ يُحِبُّ الْمُقْسِطِينَ",
                author: "Al-Hujurāt 9"
            },
            {
                text: "The believers are but brothers, so make settlement between your brothers. And fear Allah that you may receive mercy.",
                textAr: "إِنَّمَا الْمُؤْمِنُونَ إِخْوَةٌ فَأَصْلِحُوا بَيْنَ أَخَوَيْكُمْ ۚ وَاتَّقُوا اللَّهَ لَعَلَّكُمْ تُرْحَمُونَ",
                author: "Al-Hujurāt 10"
            },
            {
                text: "O you who have believed, avoid much [negative] assumption. Indeed, some assumption is sin. And do not spy or backbite each other. Would one of you like to eat the flesh of his brother when dead? You would detest it. And fear Allah; indeed, Allah is Accepting of repentance and Merciful.",
                textAr: "يَا أَيُّهَا الَّذِينَ آمَنُوا اجْتَنِبُوا كَثِيرًا مِّنَ الظَّنِّ إِنَّ بَعْضَ الظَّنِّ إِثْمٌ ۖ وَلَا تَجَسَّسُوا وَلَا يَغْتَب بَّعْضُكُمْ بَعْضًا ۚ أَيُحِبُّ أَحَدُكُمْ أَن يَأْكُلَ لَحْمَ أَخِيهِ مَيْتًا فَكَرِهْتُمُوهُ ۚ وَاتَّقُوا اللَّهَ ۚ إِنَّ اللَّهَ تَوَّابٌ رَّحِيمٌ",
                author: "Al-Hujurāt 11"
            },
            {
                text: "O mankind, indeed We have created you from male and female and made you peoples and tribes that you may know one another. Indeed, the most noble of you in the sight of Allah is the most righteous of you. Indeed, Allah is Knowing and Acquainted.",
                textAr: "يَا أَيُّهَا النَّاسُ إِنَّا خَلَقْنَاكُم مِّن ذَكَرٍ وَأُنثَىٰ وَجَعَلْنَاكُمْ شُعُوبًا وَقَبَائِلَ لِتَعَارَفُوا ۚ إِنَّ أَكْرَمَكُمْ عِندَ اللَّهِ أَتْقَاكُمْ ۚ إِنَّ اللَّهَ عَلِيمٌ خَبِيرٌ",
                author: "Al-Hujurāt 13"
            },
            {
                text: "The bedouins say, We have believed. Say, You have not [yet] believed; but say [instead], 'We have submitted,' for faith has not yet entered your hearts. And if you obey Allah and His Messenger, He will not deprive you from your deeds of anything. Indeed, Allah is Forgiving and Merciful.",
                textAr: "۞ قَالَتِ الْأَعْرَابُ آمَنَّا ۖ قُل لَّمْ تُؤْمِنُوا وَلَٰكِن قُولُوا أَسْلَمْنَا وَلَمَّا يَدْخُلِ الْإِيمَانُ فِي قُلُوبِكُمْ ۖ وَإِن تُطِيعُوا اللَّهَ وَرَسُولَهُ لَا يَلِتْكُم مِّن أَعْمَالِكُمْ شَيْئًا ۚ إِنَّ اللَّهَ غَفُورٌ رَّحِيمٌ",
                author: "Al-Hujurāt 14"
            },
            {
                text: "The believers are only the ones who have believed in Allah and His Messenger and then doubt not but strive with their properties and their lives in the cause of Allah. It is those who are the truthful.",
                textAr: "إِنَّمَا الْمُؤْمِنُونَ الَّذِينَ آمَنُوا بِاللَّهِ وَرَسُولِهِ ثُمَّ لَمْ يَرْتَابُوا وَجَاهَدُوا بِأَمْوَالِهِمْ وَأَنفُسِهِمْ فِي سَبِيلِ اللَّهِ ۚ أُولَٰئِكَ هُمُ الصَّادِقُونَ",
                author: "Al-Hujurāt 15"
            },
            {
                text: "Say, Would you acquaint Allah with your religion while Allah knows whatever is in the heavens and whatever is on the earth, and Allah is Knowing of all things?",
                textAr: "قُلْ أَتُعَلِّمُونَ اللَّهَ بِدِينِكُمْ وَاللَّهُ يَعْلَمُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۚ وَاللَّهُ بِكُلِّ شَيْءٍ عَلِيمٌ",
                author: "Al-Hujurāt 16"
            },
            {
                text: "They consider it a favor to you that they have accepted Islam. Say, Do not consider your Islam a favor to me. Rather, Allah has conferred favor upon you that He has guided you to the faith, if you should be truthful.",
                textAr: "يَمُنُّونَ عَلَيْكَ أَنْ أَسْلَمُوا ۖ قُل لَّا تَمُنُّوا عَلَيَّ إِسْلَامَكُمْ ۖ بَلِ اللَّهُ يَمُنُّ عَلَيْكُمْ أَنْ هَدَاكُمْ لِلْإِيمَانِ إِن كُنتُمْ صَادِقِينَ",
                author: "Al-Hujurāt 17"
            },
            {
                text: "Indeed, Allah knows the unseen [aspects] of the heavens and the earth. And Allah is Seeing of what you do.",
                textAr: "إِنَّ اللَّهَ يَعْلَمُ غَيْبَ السَّمَاوَاتِ وَالْأَرْضِ ۚ وَاللَّهُ بَصِيرٌ بِمَا تَعْمَلُونَ",
                author: "Al-Hujurāt 18"
            },
            {
                text: "Allah does not charge a soul except [with that within] its capacity. It will have [the consequence of] what [good] it has gained, and it will bear [the consequence of] what [evil] it has earned. Our Lord, do not impose blame upon us if we have forgotten or erred. Our Lord, and lay not upon us a burden like that which You laid upon those before us. Our Lord, and burden us not with that which we have no ability to bear. And pardon us; and forgive us; and have mercy upon us. You are our protector, so give us victory over the disbelieving people.",
                textAr: "لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا ۚ لَهَا مَا كَسَبَتْ وَعَلَيْهَا مَا اكْتَسَبَتْ ۗ رَبَّنَا لَا تُؤَاخِذْنَا إِن نَّسِينَا أَوْ أَخْطَأْنَا ۚ رَبَّنَا وَلَا تَحْمِلْ عَلَيْنَا إِصْرًا كَمَا حَمَلْتَهُ عَلَى الَّذِينَ مِن قَبْلِنَا ۚ رَبَّنَا وَلَا تُحَمِّلْنَا مَا لَا طَاقَةَ لَنَا بِهِ ۖ وَاعْفُ عَنَّا وَاغْفِرْ لَنَا وَارْحَمْنَا ۚ أَنتَ مَوْلَانَا فَانصُرْنَا عَلَى الْقَوْمِ الْكَافِرِينَ",
                author: "Al-Baqarah 286"
            },
            {
                text: "Why [is it that] when a [single] disaster struck you [on the day of Uhud], although you had struck [the enemy in the battle of Badr] with one twice as great, you said, From where is this? Say, It is from yourselves. Indeed, Allah is over all things competent.",
                textAr: "أَوَلَمَّا أَصَابَتْكُم مُّصِيبَةٌ قَدْ أَصَبْتُم مِّثْلَيْهَا قُلْتُمْ أَنَّىٰ هَٰذَا ۖ قُلْ هُوَ مِنْ عِندِ أَنفُسِكُمْ ۗ إِنَّ اللَّهَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ",
                author: "Al Imran 165"
            },
           /*  {
                text: "",
                textAr: "",
                author: " 286"
            } */
            
        ];

            // ====== AUTHENTICATION SYSTEM ======
            
            // Check if user is already logged in
            function checkAuthStatus() {
                const storedUser = localStorage.getItem('anjiz_user');
                if (storedUser) {
                    currentUser = JSON.parse(storedUser);
                    isLoggedIn = true;
                    showUserInterface();
                    loadUserTasks();
                } else {
                    // Redirect to separate login page
                    window.location.href = 'login.html';
                }
            }
            

            
            // Show user interface after login
            function showUserInterface() {
                if (currentUser && navbarUser && userNameNav) {
                    userNameNav.textContent = currentUser.name;
                    navbarUser.style.display = 'flex';
                } else {
                    console.error('Navigation elements not found or user not logged in');
                }
            }
            
            // Handle logout
            function handleLogout() {
                // Save current tasks before logout
                if (currentUser) {
                    saveUserTasks();
                }
                
                localStorage.removeItem('anjiz_user');
                currentUser = null;
                isLoggedIn = false;
                
                // Redirect to login page immediately without showing notification
                window.location.href = 'login.html';
            }
            
            // Load tasks specific to user
            function loadUserTasks() {
                if (!currentUser) return;
                
                const userTasksKey = `anjiz_tasks_${currentUser.email}`;
                const userTasks = localStorage.getItem(userTasksKey);
                
                if (userTasks) {
                    localStorage.setItem('tasks', userTasks);
                } else {
                    // If no user-specific tasks, clear the general tasks
                    localStorage.setItem('tasks', JSON.stringify([]));
                }
                
                loadTasks();
            }
            
            // Save tasks specific to user
            function saveUserTasks() {
                if (!currentUser) return;
                
                const userTasksKey = `anjiz_tasks_${currentUser.email}`;
                const currentTasks = localStorage.getItem('tasks') || '[]';
                localStorage.setItem(userTasksKey, currentTasks);
            }



            function updateQuote() {
                // اختيار اقتباس عشوائي مع تجنب تكرار الاقتباس الأخير
                let randomIndex;
                do {
                    randomIndex = Math.floor(Math.random() * quotes.length);
                } while (randomIndex === lastQuoteIndex && quotes.length > 1);
                
                const currentQuote = quotes[randomIndex];
                const quoteTextElement = document.getElementById('quoteText');
                const quoteAuthorElement = document.getElementById('quoteAuthor');
                
                if (quoteTextElement && quoteAuthorElement && currentQuote) {
                    // عرض النص العربي أولاً ثم الإنجليزي
                    const arabicText = currentQuote.textAr ? `<div class="quote-arabic">"${currentQuote.textAr}"</div>` : '';
                    const englishText = `<div class="quote-english">"${currentQuote.text}"</div>`;
                    
                    quoteTextElement.innerHTML = arabicText + englishText;
                    quoteAuthorElement.textContent = `" ${currentQuote.author}`;
                    
                    // حفظ فهرس الاقتباس الحالي لتجنب تكراره في المرة القادمة
                    lastQuoteIndex = randomIndex;
                }
            }

            function startQuoteRotation() {
                // عرض الاقتباس الأول فوراً
                updateQuote();
                
                // تعيين مؤقت لتحديث الاقتباس كل 5 دقائق (300,000 ميلي ثانية)
                setInterval(updateQuote, 300000);
                
                // إضافة مؤشر لعرض الاقتباسات العشوائية (اختياري)
                console.log(`تم بدء دورة الاقتباسات العشوائية - سيتم تغيير الاقتباس كل 5 دقائق`);
                console.log(`إجمالي عدد الاقتباسات: ${quotes.length}`);
            }

            function loadTasks() {
                const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
                customOrder = JSON.parse(localStorage.getItem('customOrder')) || false;
                
                // Add default category to existing tasks that don't have one
                let tasksUpdated = false;
                tasks.forEach(task => {
                    if (!task.category) {
                        task.category = 'do-first';
                        tasksUpdated = true;
                    }
                });
                
                if (tasksUpdated) {
                    localStorage.setItem('tasks', JSON.stringify(tasks));
                }
                
                taskList.innerHTML = '';
                const sortedTasks = sortTasks(tasks);
                sortedTasks.forEach(task => addTaskToDOM(task));
                
                updateStats();
                updateEmptyState();
                updateFilterStats();
                applyFilter(currentFilter, currentCategoryFilter);
            }

            function sortTasks(tasks) {
                if (customOrder) {
                    return [...tasks];
                }

                return [...tasks].sort((a, b) => {
                    if (sortDirection === 'desc') {
                        return b.id - a.id;
                    } else {
                        return a.id - b.id;
                    }
                });
            }

            function addTask() {
                const text = taskInput.value.trim();
                const category = categorySelect.value;
                
                if (text) {
                    const task = {
                        id: Date.now(),
                        text: text,
                        completed: false,
                        date: new Date().toISOString(),
                        priority: getPriorityFromText(text),
                        category: category
                    };

                    // Add reminder if active
                    if (reminderActive && reminderDate.value && reminderTime.value) {
                        const reminderDateTime = new Date(`${reminderDate.value}T${reminderTime.value}`);
                        if (reminderDateTime > new Date()) {
                            task.reminder = {
                                date: reminderDate.value,
                                time: reminderTime.value,
                                datetime: reminderDateTime.toISOString(),
                                notified: false
                            };
                        }
                    }

                    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
                    tasks.push(task);
                    localStorage.setItem('tasks', JSON.stringify(tasks));
                    
                    addTaskToDOM(task);
                    updateStats();
                    updateEmptyState();
                    updateFilterStats();
                    
                    // Reset form
                    taskInput.value = '';
                    categorySelect.value = 'do-first';
                    resetReminderForm();
                    
                    applyFilter(currentFilter, currentCategoryFilter);
                    
                    // Start reminder checker if not already running
                    if (!reminderCheckerInterval) {
                        startReminderChecker();
                    }
                    
                    // Auto-save user tasks
                    if (isLoggedIn) {
                        saveUserTasks();
                    }
                }
            }

            function getPriorityFromText(text) {
                const lowerText = text.toLowerCase();
                
                if (lowerText.includes('urgent') || 
                    lowerText.includes('important') || 
                    lowerText.includes('asap') || 
                    lowerText.includes('critical')) {
                    return 'high';
                } 
                else if (lowerText.includes('soon') || 
                        lowerText.includes('tomorrow') || 
                        lowerText.includes('next')) {
                    return 'medium';
                } 
                else {
                    return 'low';
                }
            }

            function formatTimeForDisplay(date) {
                return date.toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    hour12: true 
                });
            }

            function formatFullDateTime(date) {
                const dateOptions = { 
                    weekday: 'long',
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric'
                };
                
                const timeOptions = {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: true
                };
                
                const dateStr = date.toLocaleDateString([], dateOptions);
                const timeStr = date.toLocaleTimeString([], timeOptions);
                
                return `${dateStr} at ${timeStr}`;
            }

            function getDateIconClass(date) {
                const today = new Date();
                const tomorrow = new Date(today);
                tomorrow.setDate(tomorrow.getDate() + 1);

                if (isSameDay(date, today)) {
                    return 'sun';
                } else if (isSameDay(date, tomorrow)) {
                    return 'moon';
                } else {
                    return 'calendar';
                }
            }

            function isSameDay(date1, date2) {
                return date1.getFullYear() === date2.getFullYear() &&
                       date1.getMonth() === date2.getMonth() &&
                       date1.getDate() === date2.getDate();
            }

            function formatDateForDisplay(date) {
                const today = new Date();
                const tomorrow = new Date(today);
                tomorrow.setDate(tomorrow.getDate() + 1);

                if (isSameDay(date, today)) {
                    return 'Today';
                } else if (isSameDay(date, tomorrow)) {
                    return 'Tomorrow';
                } else {
                    return date.toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric'
                    });
                }
            }

            function getCategoryLabel(category) {
                const labels = {
                    'do-first': 'Do First',
                    'schedule': 'Schedule',
                    'delegate': 'Delegate',
                    'dont-do': 'Don\'t Do'
                };
                return labels[category] || 'Do First';
            }

            function addTaskToDOM(task) {
                const div = document.createElement('div');
                const categoryClass = task.category || 'do-first';
                div.className = `task ${categoryClass} ${task.priority ? task.priority + '-priority' : ''} ${task.completed ? 'completed' : ''}`;
                div.dataset.id = task.id;

                const taskDate = new Date(task.date || Date.now());
                const dateDisplay = formatDateForDisplay(taskDate);
                const timeDisplay = formatTimeForDisplay(taskDate);
                const fullDateTime = formatFullDateTime(taskDate);
                
                div.innerHTML = `
                    <button class="custom-checkbox ${task.completed ? 'checked' : ''}" data-task-id="${task.id}" type="button" title="Mark as complete">
                        <i class="fas fa-check"></i>
                    </button>
                    <div class="task-content">
                        <div class="task-text">${escapeHtml(task.text)}</div>
                        <div class="task-meta">
                            <div class="date-time-container">
                                <div class="task-date date-pill">
                                    <i class="far fa-${getDateIconClass(taskDate)}"></i> ${dateDisplay}
                                    <div class="date-details">${fullDateTime}</div>
                                </div>
                                <div class="task-time">
                                    <i class="far fa-clock"></i> ${timeDisplay}
                                </div>
                                <div class="category-badge ${categoryClass}">
                                    ${getCategoryLabel(categoryClass)}
                                </div>
                                ${task.reminder ? getReminderBadgeHTML(task.reminder) : ''}
                            </div>
                        </div>
                    </div>
                    <div class="task-actions">
                        <button class="reminder-btn" title="Set reminder" aria-label="Set reminder" data-task-id="${task.id}">
                            <i class="fas fa-bell"></i>
                        </button>
                        <button class="change-category-btn" title="Change category" aria-label="Change category">
                            <i class="fas fa-palette"></i>
                        </button>
                        <button class="move-up-btn" title="Move task up" aria-label="Move task up">
                            <i class="fas fa-chevron-up"></i>
                        </button>
                        <button class="move-down-btn" title="Move task down" aria-label="Move task down">
                            <i class="fas fa-chevron-down"></i>
                        </button>
                        <button class="task-edit" title="Edit task" aria-label="Edit task">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="delete-btn" title="Delete task" aria-label="Delete task">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                `;

                // Add event listeners with error handling
                const checkbox = div.querySelector('.custom-checkbox');
                const deleteBtn = div.querySelector('.delete-btn');
                const editBtn = div.querySelector('.task-edit');
                const moveUpBtn = div.querySelector('.move-up-btn');
                const moveDownBtn = div.querySelector('.move-down-btn');
                const changeCategoryBtn = div.querySelector('.change-category-btn');
                const reminderBtn = div.querySelector('.reminder-btn');
                
                if (checkbox) {
                    checkbox.addEventListener('click', function(e) {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleTask(task.id);
                    });
                }
                
                if (deleteBtn) deleteBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    deleteTask(task.id);
                });
                
                if (editBtn) editBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    editTask(task.id);
                });
                
                if (moveUpBtn) moveUpBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    moveTask(task.id, 'up');
                });
                
                if (moveDownBtn) moveDownBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    moveTask(task.id, 'down');
                });
                
                if (changeCategoryBtn) changeCategoryBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    changeTaskCategory(task.id);
                });
                
                if (reminderBtn) reminderBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setTaskReminder(task.id);
                });

                taskList.appendChild(div);
            }

            function escapeHtml(text) {
                const div = document.createElement('div');
                div.textContent = text;
                return div.innerHTML;
            }

            function toggleTask(id) {
                const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
                const taskIndex = tasks.findIndex(t => t.id == id);
                
                if (taskIndex !== -1) {
                    // Toggle completion status
                    tasks[taskIndex].completed = !tasks[taskIndex].completed;
                    localStorage.setItem('tasks', JSON.stringify(tasks));
                    
                    // Update UI immediately without full reload
                    const taskElement = document.querySelector(`.task[data-id="${id}"]`);
                    const checkbox = taskElement?.querySelector('.custom-checkbox');
                    
                    if (taskElement && checkbox) {
                        if (tasks[taskIndex].completed) {
                            taskElement.classList.add('completed');
                            checkbox.classList.add('checked');
                        } else {
                            taskElement.classList.remove('completed');
                            checkbox.classList.remove('checked');
                        }
                        
                        // Add smooth animation
                        checkbox.style.transform = 'scale(1.1)';
                        setTimeout(() => {
                            checkbox.style.transform = '';
                        }, 150);
                    }
                    
                    updateStats();
                    updateFilterStats();
                    applyFilter(currentFilter, currentCategoryFilter);
                    
                    // Auto-save user tasks
                    if (isLoggedIn) {
                        saveUserTasks();
                    }
                }
            }

            function editTask(id) {
                const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
                const task = tasks.find(t => t.id === id);
                
                if (task) {
                    const newText = prompt('Edit task:', task.text);
                    if (newText && newText.trim() !== '' && newText.trim() !== task.text) {
                        const oldText = task.text;
                        task.text = newText.trim();
                        task.priority = getPriorityFromText(newText);
                        localStorage.setItem('tasks', JSON.stringify(tasks));
                        
                        // Update the specific task element instead of reloading all tasks
                        const taskElement = document.querySelector(`.task[data-id="${id}"]`);
                        if (taskElement) {
                            // Update the task text
                            const taskTextElement = taskElement.querySelector('.task-text');
                            if (taskTextElement) {
                                taskTextElement.textContent = task.text;
                            }
                            
                            // Update priority class
                            const categoryClass = task.category || 'do-first';
                            taskElement.className = `task ${categoryClass} ${task.priority}-priority ${task.completed ? 'completed' : ''}`;
                        }
                        
                        updateStats();
                        
                        // Auto-save user tasks
                        if (isLoggedIn) {
                            saveUserTasks();
                        }
                    }
                }
            }

            function changeTaskCategory(id) {
                const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
                const task = tasks.find(t => t.id === id);
                
                if (task) {
                    const categories = [
                        { value: 'do-first', label: 'ðŸŸ¢ Do First' },
                        { value: 'schedule', label: 'ðŸ"µ Schedule' },
                        { value: 'delegate', label: 'ðŸŸ Delegate' },
                        { value: 'dont-do', label: 'ðŸ"´ Don\'t Do' }
                    ];
                    
                    let categoryMessage = 'Select category:\n\n';
                    categories.forEach((cat, index) => {
                        categoryMessage += `${index + 1}. ${cat.label}\n`;
                    });
                    
                    const choice = prompt(categoryMessage + '\nEnter number (1-4):');
                    const choiceNum = parseInt(choice);
                    
                    if (choiceNum >= 1 && choiceNum <= 4) {
                        const selectedCategory = categories[choiceNum - 1];
                        task.category = selectedCategory.value;
                        localStorage.setItem('tasks', JSON.stringify(tasks));
                        
                        // Update the specific task element
                        const taskElement = document.querySelector(`.task[data-id="${id}"]`);
                        if (taskElement) {
                            // Update category class
                            const priorityClass = task.priority ? task.priority + '-priority' : '';
                            const completedClass = task.completed ? 'completed' : '';
                            taskElement.className = `task ${selectedCategory.value} ${priorityClass} ${completedClass}`;
                            
                            // Update category badge
                            const categoryBadge = taskElement.querySelector('.category-badge');
                            if (categoryBadge) {
                                categoryBadge.className = `category-badge ${selectedCategory.value}`;
                                categoryBadge.textContent = getCategoryLabel(selectedCategory.value);
                            }
                        }
                        
                        updateStats();
                        updateFilterStats();
                        applyFilter(currentFilter, currentCategoryFilter);
                    }
                }
            }

            function deleteTask(id) {
                if (confirm('Are you sure you want to delete this task?')) {
                    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
                    const updatedTasks = tasks.filter(t => t.id !== id);
                    localStorage.setItem('tasks', JSON.stringify(updatedTasks));
                    
                    const taskElement = document.querySelector(`.task[data-id="${id}"]`);
                    if (taskElement) {
                        taskElement.remove();
                    }
                    
                    updateStats();
                    updateEmptyState();
                    updateFilterStats();
                    
                    // Auto-save user tasks
                    if (isLoggedIn) {
                        saveUserTasks();
                    }
                }
            }

            function moveTask(id, direction) {
                const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
                const taskIndex = tasks.findIndex(t => t.id === id);
                
                if (taskIndex !== -1) {
                    const newIndex = direction === 'up' ? taskIndex - 1 : taskIndex + 1;
                    
                    if (newIndex >= 0 && newIndex < tasks.length) {
                        const task = tasks[taskIndex];
                        tasks.splice(taskIndex, 1);
                        tasks.splice(newIndex, 0, task);
                        
                        localStorage.setItem('tasks', JSON.stringify(tasks));
                        customOrder = true;
                        localStorage.setItem('customOrder', JSON.stringify(customOrder));
                        
                        // Update DOM directly instead of reloading all tasks
                        const taskElement = document.querySelector(`.task[data-id="${id}"]`);
                        const allTasks = [...document.querySelectorAll('.task')];
                        const currentIndex = allTasks.indexOf(taskElement);
                        
                        if (direction === 'up' && currentIndex > 0) {
                            taskList.insertBefore(taskElement, allTasks[currentIndex - 1]);
                        } else if (direction === 'down' && currentIndex < allTasks.length - 1) {
                            taskList.insertBefore(taskElement, allTasks[currentIndex + 1].nextSibling);
                        }
                    }
                }
            }



            function applyFilter(filter, categoryFilter = null) {
                if (filter !== undefined) {
                    currentFilter = filter;
                }
                if (categoryFilter !== undefined) {
                    currentCategoryFilter = categoryFilter;
                }
                
                const tasks = document.querySelectorAll('.task');
                
                tasks.forEach(task => {
                    const isCompleted = task.classList.contains('completed');
                    let showTask = true;
                    
                    // Apply status filter (all/active/completed)
                    if (currentFilter === 'active' && isCompleted) {
                        showTask = false;
                    } else if (currentFilter === 'completed' && !isCompleted) {
                        showTask = false;
                    }
                    
                    // Apply category filter
                    if (currentCategoryFilter && showTask) {
                        const taskCategory = getTaskCategory(task);
                        if (taskCategory !== currentCategoryFilter) {
                            showTask = false;
                        }
                    }
                    
                    task.style.display = showTask ? '' : 'none';
                });

                // Update active filter buttons
                filterButtons.forEach(btn => {
                    btn.classList.toggle('active', btn.dataset.filter === currentFilter);
                });
                
                // Update active category filter buttons
                categoryFilterButtons.forEach(btn => {
                    btn.classList.toggle('active', btn.dataset.category === currentCategoryFilter);
                });
                
                updateEmptyState();
                updateFilterStats();
            }

            function getTaskCategory(taskElement) {
                const classList = Array.from(taskElement.classList);
                const categoryClasses = ['do-first', 'schedule', 'delegate', 'dont-do'];
                return categoryClasses.find(cat => classList.includes(cat)) || 'do-first';
            }

            function updateFilterStats() {
                const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
                const visibleTasks = document.querySelectorAll('.task[style=""], .task:not([style])');
                
                // Update filter button text with counts
                filterButtons.forEach(btn => {
                    const filter = btn.dataset.filter;
                    let count = 0;
                    
                    if (filter === 'all') {
                        count = tasks.length;
                    } else if (filter === 'active') {
                        count = tasks.filter(t => !t.completed).length;
                    } else if (filter === 'completed') {
                        count = tasks.filter(t => t.completed).length;
                    }
                    
                    const originalText = btn.textContent.split(' (')[0];
                    btn.textContent = `${originalText} (${count})`;
                });
                
                // Update category filter button text with counts
                categoryFilterButtons.forEach(btn => {
                    const category = btn.dataset.category;
                    const count = tasks.filter(t => (t.category || 'do-first') === category).length;
                    const originalText = btn.textContent.split(' (')[0];
                    btn.textContent = `${originalText} (${count})`;
                });
            }

            function toggleSort() {
                sortDirection = sortDirection === 'desc' ? 'asc' : 'desc';
                customOrder = false;
                localStorage.setItem('customOrder', JSON.stringify(customOrder));
                loadTasks();
            }

            function updateStats() {
                const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
                const total = tasks.length;
                const completed = tasks.filter(t => t.completed).length;
                const active = total - completed;
                
                stats.innerHTML = `
                    <span>Total: ${total}</span>
                    <span>Active: ${active}</span>
                    <span>Completed: ${completed}</span>
                `;
            }

            function updateEmptyState() {
                const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
                const visibleTasks = document.querySelectorAll('.task[style=""], .task:not([style])');
                
                if (tasks.length === 0 || visibleTasks.length === 0) {
                    emptyState.style.display = 'block';
                    taskList.style.display = 'none';
                } else {
                    emptyState.style.display = 'none';
                    taskList.style.display = 'block';
                }
            }

            // Reminder Functions
            function requestNotificationPermission() {
                if ('Notification' in window && Notification.permission === 'default') {
                    Notification.requestPermission().then(permission => {
                        if (permission === 'granted') {
                            console.log('Notification permission granted');
                        } else {
                            console.log('Notification permission denied');
                        }
                    });
                }
            }

            function toggleReminderFields() {
                reminderActive = !reminderActive;
                reminderToggle.classList.toggle('active', reminderActive);
                
                if (reminderActive) {
                    reminderFields.style.display = 'block';
                    requestNotificationPermission();
                    // Set default time to 1 hour from now
                    const now = new Date();
                    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
                    
                    if (!reminderDate.value) {
                        reminderDate.value = oneHourLater.toISOString().split('T')[0];
                    }
                    if (!reminderTime.value) {
                        reminderTime.value = oneHourLater.toTimeString().slice(0, 5);
                    }
                } else {
                    reminderFields.style.display = 'none';
                }
            }

            function resetReminderForm() {
                reminderActive = false;
                reminderToggle.classList.remove('active');
                reminderFields.style.display = 'none';
                reminderDate.value = '';
                reminderTime.value = '';
            }

            function getReminderBadgeHTML(reminder) {
                const now = new Date();
                const reminderDate = new Date(reminder.datetime);
                const diffMs = reminderDate - now;
                const diffMins = Math.floor(diffMs / (1000 * 60));
                const diffHours = Math.floor(diffMins / 60);
                const diffDays = Math.floor(diffHours / 24);
                
                let badgeClass = 'reminder-badge';
                let displayText = '';
                
                if (diffMs < 0) {
                    badgeClass += ' overdue';
                    displayText = 'Overdue';
                } else if (diffDays === 0 && diffHours === 0 && diffMins < 60) {
                    badgeClass += ' today';
                    displayText = `${diffMins}m`;
                } else if (diffDays === 0) {
                    badgeClass += ' today';
                    displayText = `${diffHours}h`;
                } else if (diffDays === 1) {
                    displayText = 'Tomorrow';
                } else {
                    displayText = `${diffDays}d`;
                }
                
                return `<div class="${badgeClass}" title="Reminder: ${new Date(reminder.datetime).toLocaleString()}">
                    <i class="fas fa-bell"></i> ${displayText}
                </div>`;
            }

            function setTaskReminder(taskId) {
                const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
                const task = tasks.find(t => t.id === taskId);
                
                if (task) {
                    const currentDate = task.reminder ? task.reminder.date : '';
                    const currentTime = task.reminder ? task.reminder.time : '';
                    
                    const date = prompt('Enter reminder date (YYYY-MM-DD):', currentDate);
                    if (date === null) return; // User cancelled
                    
                    if (date === '') {
                        // Remove reminder
                        delete task.reminder;
                        localStorage.setItem('tasks', JSON.stringify(tasks));
                        loadTasks();
                        return;
                    }
                    
                    const time = prompt('Enter reminder time (HH:MM):', currentTime);
                    if (time === null) return; // User cancelled
                    
                    try {
                        const reminderDateTime = new Date(`${date}T${time}`);
                        if (reminderDateTime > new Date()) {
                            task.reminder = {
                                date: date,
                                time: time,
                                datetime: reminderDateTime.toISOString(),
                                notified: false
                            };
                            
                            localStorage.setItem('tasks', JSON.stringify(tasks));
                            loadTasks();
                            
                            if (!reminderCheckerInterval) {
                                startReminderChecker();
                            }
                            
                            alert(`Reminder set for ${reminderDateTime.toLocaleString()}`);
                        } else {
                            alert('Please select a future date and time');
                        }
                    } catch (error) {
                        alert('Invalid date/time format. Please use YYYY-MM-DD and HH:MM format.');
                    }
                }
            }

            function checkReminders() {
                const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
                const now = new Date();
                let hasUpdates = false;
                
                tasks.forEach(task => {
                    if (task.reminder && !task.reminder.notified && !task.completed) {
                        const reminderTime = new Date(task.reminder.datetime);
                        
                        if (now >= reminderTime) {
                            // Show notification
                            showNotification(task);
                            task.reminder.notified = true;
                            hasUpdates = true;
                        }
                    }
                });
                
                if (hasUpdates) {
                    localStorage.setItem('tasks', JSON.stringify(tasks));
                    loadTasks();
                }
            }

            // Alarm sounds and configurations
            const alarmSounds = {
                classic: {
                    name: 'Classic Bell',
                    freq1: 800,
                    freq2: 1000,
                    duration: 200,
                    repeat: 3
                },
                urgent: {
                    name: 'Urgent Alert',
                    freq1: 1200,
                    freq2: 800,
                    duration: 150,
                    repeat: 5
                },
                gentle: {
                    name: 'Gentle Chime',
                    freq1: 523,
                    freq2: 659,
                    duration: 300,
                    repeat: 2
                },
                digital: {
                    name: 'Digital Beep',
                    freq1: 1000,
                    freq2: 1000,
                    duration: 100,
                    repeat: 4
                }
            };

            let currentAlarmAudio = null;
            let alarmInterval = null;

            function playAlarmSound(soundType = 'classic') {
                try {
                    // Stop any existing alarm
                    stopAlarm();
                    
                    const sound = alarmSounds[soundType] || alarmSounds.classic;
                    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                    let repeatCount = 0;

                    function createBeep() {
                        if (repeatCount >= sound.repeat) {
                            return;
                        }

                        const oscillator = audioContext.createOscillator();
                        const gainNode = audioContext.createGain();
                        
                        oscillator.connect(gainNode);
                        gainNode.connect(audioContext.destination);
                        
                        oscillator.frequency.value = sound.freq1;
                        gainNode.gain.value = 0.3;
                        
                        // Create envelope
                        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
                        gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01);
                        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + sound.duration / 1000);
                        
                        oscillator.start(audioContext.currentTime);
                        oscillator.stop(audioContext.currentTime + sound.duration / 1000);
                        
                        // Second tone for some alarm types
                        if (sound.freq2 !== sound.freq1) {
                            setTimeout(() => {
                                const oscillator2 = audioContext.createOscillator();
                                const gainNode2 = audioContext.createGain();
                                
                                oscillator2.connect(gainNode2);
                                gainNode2.connect(audioContext.destination);
                                
                                oscillator2.frequency.value = sound.freq2;
                                gainNode2.gain.value = 0.3;
                                
                                gainNode2.gain.setValueAtTime(0, audioContext.currentTime);
                                gainNode2.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01);
                                gainNode2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + sound.duration / 1000);
                                
                                oscillator2.start(audioContext.currentTime);
                                oscillator2.stop(audioContext.currentTime + sound.duration / 1000);
                            }, sound.duration / 2);
                        }
                        
                        repeatCount++;
                        
                        // Schedule next beep
                        if (repeatCount < sound.repeat) {
                            setTimeout(createBeep, sound.duration * 2);
                        }
                    }
                    
                    createBeep();
                    
                } catch (error) {
                    console.log('ðŸ"‡ Audio not available, using visual alarm only');
                    showVisualAlarm();
                }
            }

            function stopAlarm() {
                if (currentAlarmAudio) {
                    currentAlarmAudio.pause();
                    currentAlarmAudio.currentTime = 0;
                    currentAlarmAudio = null;
                }
                if (alarmInterval) {
                    clearInterval(alarmInterval);
                    alarmInterval = null;
                }
                
                // Remove visual alarm effects
                document.body.classList.remove('alarm-active');
            }

            // دالة معطلة - لا تسبب تأثيرات بصرية مزعجة
            function showVisualAlarm() {
                console.log('📸 Visual alarm disabled for better UX');
            }

            function showNotification(task) {
                // تشغيل صوت ألارم لطيف فقط
                playAlarmSound('gentle');
                
                // إرسال إشعار إلى النظام الجديد
                showToast(`⏰ Task Reminder: ${task.text}`, 'info', {
                    actionButton: {
                        text: 'Complete',
                        icon: 'check',
                        onClick: `toggleTask('${task.id}')`,
                        title: 'Mark as completed'
                    }
                });
                
                // Browser notification إذا سُمح
                if ('Notification' in window && Notification.permission === 'granted') {
                    const notification = new Notification('🔔 ANJIZ Task Reminder', {
                        body: task.text,
                        icon: 'icons/icon48.png',
                        badge: 'icons/icon16.png',
                        tag: `task-${task.id}`,
                        requireInteraction: true
                    });
                    
                    notification.onclick = function() {
                        window.focus();
                        notification.close();
                        
                        // التمرير إلى المهمة
                        const taskElement = document.querySelector(`[data-id="${task.id}"]`);
                        if (taskElement) {
                            taskElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            taskElement.style.animation = 'pulse 3s ease-in-out';
                            setTimeout(() => {
                                taskElement.style.animation = '';
                            }, 3000);
                        }
                    };
                    
                    // إغلاق تلقائي بعد 15 ثانية
                    setTimeout(() => {
                        notification.close();
                    }, 15000);
                }
                
                console.log(`✅ Task reminder sent: ${task.text}`);
            }

            let notificationQueue = [];
            let notificationCount = 0;

            function showToast(message, type = 'info', options = {}) {
                // إضافة النوتيفيكيشن إلى القائمة فقط - لا تنظيف مفرط
                const timestamp = new Date().toLocaleTimeString('en-US', { 
                    hour12: false, 
                    hour: '2-digit', 
                    minute: '2-digit',
                    second: '2-digit'
                });

                const notification = {
                    id: `notification-${Date.now()}`,
                    message: message,
                    type: type,
                    timestamp: timestamp,
                    options: options,
                    read: false
                };

                notificationQueue.push(notification);
                updateNotificationBadge();

                // تشغيل تأثير بصري خفيف على منطقة المستخدم
                const navbarUser = document.getElementById('navbarUser');
                if (navbarUser) {
                    navbarUser.classList.add('notification-pulse');
                    setTimeout(() => {
                        navbarUser.classList.remove('notification-pulse');
                    }, 600);
                }

                console.log(`Notification added: ${message}`);
                return notification.id;
            }

            function updateNotificationBadge() {
                const badge = document.getElementById('notificationBadge');
                const countElement = document.getElementById('notificationCount');
                const unreadCount = notificationQueue.filter(n => !n.read).length;

                if (unreadCount > 0) {
                    badge.style.display = 'flex';
                    countElement.textContent = unreadCount > 99 ? '99+' : unreadCount;
                    
                    // إضافة تأثير النبض للعداد
                    badge.classList.add('pulse-animation');
                } else {
                    badge.style.display = 'none';
                    badge.classList.remove('pulse-animation');
                }
            }
            
            function showNotificationPanel() {
                
                // إزالة أي event listener سابق لتجنب التضارب
                document.removeEventListener('click', handlePanelOutsideClick);
                
                const existingPanel = document.getElementById('notificationPanel');
                if (existingPanel) {
                    console.log('🔄 Removing existing panel');
                    existingPanel.remove();
                    return;
                }

    
                const panel = document.createElement('div');
                panel.id = 'notificationPanel';
                panel.className = 'notification-panel';
                
                let panelHTML = `
                    <div class="notification-panel-header">
                        <div class="panel-header-content">
                            <h3><i class="fas fa-bell"></i> Notifications</h3>
                            <div class="panel-header-buttons">
                                <button class="clear-all-btn" onclick="clearAllNotifications()" title="Clear all notifications">
                                    <i class="fas fa-trash-alt"></i> Clear All
                                </button>
                                <button class="close-panel-btn" onclick="closePanelDirectly()" title="Close panel">
                                    <i class="fas fa-times"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                    <div class="notification-panel-content">
                `;

                if (notificationQueue.length === 0) {
                    panelHTML += `
                        <div class="no-notifications">
                            <i class="fas fa-bell-slash"></i>
                            <p>No notifications</p>
                            <small>Notifications will appear here when received</small>
                        </div>
                    `;
                } else {
                    notificationQueue.slice().reverse().forEach(notification => {
                        const typeIcon = {
                            'success': 'fas fa-check-circle',
                            'error': 'fas fa-exclamation-triangle', 
                            'info': 'fas fa-info-circle',
                            'warning': 'fas fa-exclamation-circle',
                            'reminder': 'fas fa-bell'
                        };

                        const typeClass = {
                            'success': 'notification-success',
                            'error': 'notification-error',
                            'info': 'notification-info',
                            'warning': 'notification-warning',
                            'reminder': 'notification-reminder'
                        };

                        const readStatus = notification.read ? 'Read' : 'Unread';

                        panelHTML += `
                            <div class="notification-item ${notification.read ? 'read' : 'unread'}" data-id="${notification.id}">
                                <div class="notification-icon ${typeClass[notification.type] || 'notification-info'}">
                                    <i class="${typeIcon[notification.type] || 'fas fa-info-circle'}"></i>
                                </div>
                                <div class="notification-content">
                                    <div class="notification-message">
                                        ${notification.message}
                                    </div>
                                    <div class="notification-time">
                                        <i class="fas fa-clock"></i> ${notification.timestamp}
                                        <span class="read-status">${readStatus}</span>
                                    </div>
                                </div>
                                <button class="notification-close" onclick="removeNotification('${notification.id}')" title="Remove notification">
                                    <i class="fas fa-times"></i>
                                </button>
                            </div>
                        `;
                    });
                }

                panelHTML += `</div>`;
                panel.innerHTML = panelHTML;

                document.body.appendChild(panel);

                // إظهار البانل مع تأثير انزلاق
                setTimeout(() => {
                    panel.classList.add('show');
                }, 10);

                // إضافة صوت تفاعلي خفيف (اختياري)
                playNotificationSound('open');

                // إغلاق البانل عند النقر خارجه - تأخير أطول لتجنب الإغلاق الفوري
                setTimeout(() => {
                    document.addEventListener('click', handlePanelOutsideClick);
                    
                    // إضافة إمكانية الإغلاق بزر Escape
                    const handleEscapeKey = function(e) {
                        if (e.key === 'Escape') {
                            console.log('Closing notification panel - Escape key');
                            const panel = document.getElementById('notificationPanel');
                            if (panel) {
                                panel.classList.remove('show');
                                setTimeout(() => {
                                    if (panel && panel.parentNode) {
                                        panel.parentNode.removeChild(panel);
                                    }
                                    document.removeEventListener('click', handlePanelOutsideClick);
                                    document.removeEventListener('keydown', handleEscapeKey);
                                }, 300);
                            }
                        }
                    };
                    
                    document.addEventListener('keydown', handleEscapeKey);
                }, 500);

                // تحديد جميع النوتيفيكيشن كمقروءة
                notificationQueue.forEach(n => n.read = true);
                updateNotificationBadge();
            }

            function handlePanelOutsideClick(event) {
                const panel = document.getElementById('notificationPanel');
                const notificationBtn = document.getElementById('notificationBtn');
                const notificationArea = document.getElementById('notificationArea');
                
                // التأكد من أن النقر ليس على الزر أو المنطقة المحيطة به أو النافذة نفسها
                if (panel && 
                    !panel.contains(event.target) && 
                    !notificationBtn.contains(event.target) && 
                    !notificationArea.contains(event.target) &&
                    event.target !== notificationBtn &&
                    event.target !== notificationArea) {
                    
                    console.log('Closing notification panel - clicked outside');
                    panel.classList.remove('show');
                    setTimeout(() => {
                        if (panel && panel.parentNode) {
                            panel.parentNode.removeChild(panel);
                        }
                        document.removeEventListener('click', handlePanelOutsideClick);
                    }, 300);
                }
            }

            function removeNotification(notificationId) {
                const notificationItem = document.querySelector(`[data-id="${notificationId}"]`);
                
                if (notificationItem) {
                    // تأثير بصري عند الإزالة
                    notificationItem.style.transform = 'translateX(100%)';
                    notificationItem.style.opacity = '0';
                    
                    setTimeout(() => {
                        notificationQueue = notificationQueue.filter(n => n.id !== notificationId);
                        updateNotificationBadge();
                        notificationItem.remove();
                        
                        // If no notifications remain, show empty state message
                        const panel = document.getElementById('notificationPanel');
                        const content = panel?.querySelector('.notification-panel-content');
                        if (content && notificationQueue.length === 0) {
                            content.innerHTML = `
                                <div class="no-notifications">
                                    <i class="fas fa-bell-slash"></i>
                                    <p>No notifications</p>
                                    <small>All notifications have been cleared</small>
                                </div>
                            `;
                        }
                        
                        // صوت تفاعلي للإزالة
                        playNotificationSound('remove');
                    }, 300);
                }
            }

            function clearAllNotifications() {
                const panel = document.getElementById('notificationPanel');
                if (panel) {
                    // تأثير بصري عند المسح
                    const items = panel.querySelectorAll('.notification-item');
                    items.forEach((item, index) => {
                        setTimeout(() => {
                            item.style.transform = 'translateX(-100%)';
                            item.style.opacity = '0';
                        }, index * 100);
                    });
                    
                    setTimeout(() => {
                        notificationQueue = [];
                        updateNotificationBadge();
                        
                        const content = panel.querySelector('.notification-panel-content');
                        if (content) {
                            content.innerHTML = `
                                <div class="no-notifications">
                                    <i class="fas fa-check-circle"></i>
                                    <p>All notifications cleared</p>
                                    <small>New notifications will appear here</small>
                                </div>
                            `;
                        }
                        
                        // صوت تفاعلي للمسح
                        playNotificationSound('clear');
                    }, items.length * 100 + 200);
                }
            }
            
            function undoTaskCompletion(taskId) {
                const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
                const task = tasks.find(t => t.id === taskId);
                
                if (task && task.completed) {
                    task.completed = false;
                    delete task.completedAt;
                    
                    localStorage.setItem('tasks', JSON.stringify(tasks));
                    loadTasks();
                    
                    showToast('تم التراجع عن إكمال المهمة', 'info');
                }
            }

            // دالة تشغيل الأصوات التفاعلية (اختيارية)
            function playNotificationSound(type) {
                if (!soundEnabled) return;
                
                try {
                    // إنشاء Audio Context إذا لم يكن موجوداً
                    if (!audioContext && typeof AudioContext !== 'undefined') {
                        audioContext = new AudioContext();
                    }
                    
                    if (audioContext) {
                        let frequency, duration;
                        
                        switch(type) {
                            case 'open':
                                frequency = 800;
                                duration = 0.1;
                                break;
                            case 'remove':
                                frequency = 600;
                                duration = 0.05;
                                break;
                            case 'clear':
                                frequency = 400;
                                duration = 0.2;
                                break;
                            case 'new':
                                frequency = 1000;
                                duration = 0.15;
                                break;
                            default:
                                return;
                        }
                        
                        const oscillator = audioContext.createOscillator();
                        const gainNode = audioContext.createGain();
                        
                        oscillator.connect(gainNode);
                        gainNode.connect(audioContext.destination);
                        
                        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
                        oscillator.type = 'sine';
                        
                        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
                        
                        oscillator.start(audioContext.currentTime);
                        oscillator.stop(audioContext.currentTime + duration);
                    }
                } catch (error) {
                    console.log('🔇 Audio not available:', error);
                }
            }

            function showToast(message, type = 'info', options = {}) {
                // إضافة النوتيفيكيشن إلى القائمة مع تحسينات
                const timestamp = new Date().toLocaleTimeString('ar-SA', { 
                    hour12: false, 
                    hour: '2-digit', 
                    minute: '2-digit',
                    second: '2-digit'
                });

                const notification = {
                    id: `notification-${Date.now()}`,
                    message: message,
                    type: type,
                    timestamp: timestamp,
                    options: options,
                    read: false,
                    createdAt: new Date()
                };

                notificationQueue.push(notification);
                updateNotificationBadge();

                // تشغيل تأثير بصري محسن على منطقة المستخدم
                const navbarUser = document.getElementById('navbarUser');
                const notificationBtn = document.getElementById('notificationBtn');
                
                if (navbarUser) {
                    navbarUser.classList.add('notification-pulse');
                    setTimeout(() => {
                        navbarUser.classList.remove('notification-pulse');
                    }, 600);
                }

                if (notificationBtn) {
                    notificationBtn.classList.add('notification-pulse');
                    setTimeout(() => {
                        notificationBtn.classList.remove('notification-pulse');
                    }, 800);
                }

                // تشغيل صوت للإشعار الجديد
                playNotificationSound('new');

                console.log(`✅ إشعار جديد: ${message}`);
                return notification.id;
            }
            
            // إعادة تعريف أي دوال قديمة للتوست
            window.createToast = function() { console.log('🚫 createToast blocked'); };
            window.displayToast = function() { console.log('🚫 displayToast blocked'); };
            window.addToast = function() { console.log('🚫 addToast blocked'); };
            window.appendToast = function() { console.log('🚫 appendToast blocked'); };
            
            // إضافة وظيفة الإغلاق المباشر
            function closePanelDirectly() {
                console.log('Direct notification panel close');
                const panel = document.getElementById('notificationPanel');
                if (panel) {
                    panel.classList.remove('show');
                    setTimeout(() => {
                        if (panel && panel.parentNode) {
                            panel.parentNode.removeChild(panel);
                        }
                        document.removeEventListener('click', handlePanelOutsideClick);
                    }, 300);
                }
            }

            // Make functions globally available - ضرورة قصوى لعمل النظام
            window.showNotificationPanel = showNotificationPanel;
            window.removeNotification = removeNotification;
            window.clearAllNotifications = clearAllNotifications;
            window.showToast = showToast;
            window.undoTaskCompletion = undoTaskCompletion;
            window.handlePanelOutsideClick = handlePanelOutsideClick;
            window.playNotificationSound = playNotificationSound;
            window.closePanelDirectly = closePanelDirectly;
            

            
            function startReminderChecker() {
                // Check every minute
                reminderCheckerInterval = setInterval(checkReminders, 60000);
                console.log('Reminder checker started');
            }

            function stopReminderChecker() {
                if (reminderCheckerInterval) {
                    clearInterval(reminderCheckerInterval);
                    reminderCheckerInterval = null;
                    console.log('Reminder checker stopped');
                }
            }

            // Event Listeners
            reminderToggle.addEventListener('click', toggleReminderFields);
            addButton.addEventListener('click', addTask);
            
            taskInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    addTask();
                }
            });

            filterButtons.forEach(btn => {
                btn.addEventListener('click', () => {
                    // Reset category filter when changing status filter
                    if (currentCategoryFilter) {
                        currentCategoryFilter = null;
                    }
                    applyFilter(btn.dataset.filter);
                });
            });

            categoryFilterButtons.forEach(btn => {
                btn.addEventListener('click', () => {
                    const category = btn.dataset.category;
                    // Toggle category filter
                    if (currentCategoryFilter === category) {
                        currentCategoryFilter = null;
                    } else {
                        currentCategoryFilter = category;
                    }
                    applyFilter(undefined, currentCategoryFilter);
                });
            });

            sortButton.addEventListener('click', toggleSort);
            
            // Authentication event listeners
            // Login form removed - now using separate login page
            if (logoutBtnNav) {
                logoutBtnNav.addEventListener('click', handleLogout);
            }

            // Notification button event listener
            const notificationBtn = document.getElementById('notificationBtn');
            if (notificationBtn) {
                notificationBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    try {
                        const existingPanel = document.getElementById('notificationPanel');
                        if (existingPanel) {
                            return;
                        }
                        
                        showNotificationPanel();
                    } catch (error) {
                        console.error('Error displaying notifications:', error);
                    }
                });
            }

            // Make functions globally available
            window.toggleTask = toggleTask;
            window.deleteTask = deleteTask;
            window.editTask = editTask;
            window.moveTask = moveTask;
            window.changeTaskCategory = changeTaskCategory;
            
            // Initialize app
            checkAuthStatus(); // Check if user is logged in
            startQuoteRotation();
            
            // تنظيف بسيط وآمن فقط عند الحاجة
            function cleanupOldToasts() {
                const oldToasts = document.querySelectorAll('.toast-modal, .old-toast');
                oldToasts.forEach(toast => {
                    if (toast.parentNode) {
                        toast.parentNode.removeChild(toast);
                    }
                });
            }
            
            cleanupOldToasts();
            
            // Request notification permission on page load
            setTimeout(requestNotificationPermission, 2000);
            
            // Start reminder checker if there are tasks with reminders
            const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
            if (tasks.some(task => task.reminder && !task.reminder.notified && !task.completed)) {
                startReminderChecker();
            }
        });

        // Animated Background Network
        class NetworkAnimation {
            constructor() {
                this.canvas = document.getElementById('backgroundCanvas');
                this.ctx = this.canvas.getContext('2d');
                this.particles = [];
                this.particleCount = 50;
                this.maxDistance = 150;
                this.animationId = null;
                
                this.init();
                this.animate();
                this.handleResize();
            }

            init() {
                this.resize();
                this.createParticles();
                window.addEventListener('resize', () => this.handleResize());
            }

            handleResize() {
                clearTimeout(this.resizeTimeout);
                this.resizeTimeout = setTimeout(() => this.resize(), 100);
            }

            resize() {
                const dpr = window.devicePixelRatio || 1;
                const rect = this.canvas.getBoundingClientRect();
                
                this.canvas.width = rect.width * dpr;
                this.canvas.height = rect.height * dpr;
                this.canvas.style.width = rect.width + 'px';
                this.canvas.style.height = rect.height + 'px';
                
                this.ctx.scale(dpr, dpr);
                
                // إعادة حساب عدد الجسيمات حسب حجم الشاشة
                this.particleCount = Math.min(80, Math.floor((rect.width * rect.height) / 15000));
                this.createParticles();
            }

            createParticles() {
                this.particles = [];
                
                for (let i = 0; i < this.particleCount; i++) {
                    this.particles.push({
                        x: Math.random() * this.canvas.clientWidth,
                        y: Math.random() * this.canvas.clientHeight,
                        vx: (Math.random() - 0.5) * 0.8,
                        vy: (Math.random() - 0.5) * 0.8,
                        size: Math.random() * 3 + 1,
                        opacity: Math.random() * 0.6 + 0.3,
                        pulse: Math.random() * Math.PI * 2,
                        color: this.getRandomColor()
                    });
                }
            }

            getRandomColor() {
                const colors = [
                    { r: 34, g: 197, b: 94 },    // أخضر زاهي
                    { r: 59, g: 130, b: 246 },   // أزرق
                    { r: 249, g: 115, b: 22 },   // برتقالي
                    { r: 239, g: 68, b: 68 },    // أحمر
                ];
                return colors[Math.floor(Math.random() * colors.length)];
            }

            updateParticles() {
                this.particles.forEach(particle => {
                    // تحديث الموقع
                    particle.x += particle.vx;
                    particle.y += particle.vy;
                    
                    // تحديث النبضة للتأثير المتحرك
                    particle.pulse += 0.02;
                    
                    // إعادة تدوير الجسيمات عند الحواف
                    if (particle.x < 0) particle.x = this.canvas.clientWidth;
                    if (particle.x > this.canvas.clientWidth) particle.x = 0;
                    if (particle.y < 0) particle.y = this.canvas.clientHeight;
                    if (particle.y > this.canvas.clientHeight) particle.y = 0;
                });
            }

            drawConnections() {
                for (let i = 0; i < this.particles.length; i++) {
                    for (let j = i + 1; j < this.particles.length; j++) {
                        const dx = this.particles[i].x - this.particles[j].x;
                        const dy = this.particles[i].y - this.particles[j].y;
                        const distance = Math.sqrt(dx * dx + dy * dy);
                        
                        if (distance < this.maxDistance) {
                            const opacity = Math.max(0, 1 - distance / this.maxDistance);
                            const gradient = this.ctx.createLinearGradient(
                                this.particles[i].x, this.particles[i].y,
                                this.particles[j].x, this.particles[j].y
                            );
                            
                            gradient.addColorStop(0, `rgba(${this.particles[i].color.r}, ${this.particles[i].color.g}, ${this.particles[i].color.b}, ${opacity * 0.4})`);
                            gradient.addColorStop(1, `rgba(${this.particles[j].color.r}, ${this.particles[j].color.g}, ${this.particles[j].color.b}, ${opacity * 0.4})`);
                            
                            this.ctx.beginPath();
                            this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
                            this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
                            this.ctx.strokeStyle = gradient;
                            this.ctx.lineWidth = opacity * 1.5;
                            this.ctx.stroke();
                        }
                    }
                }
            }

            drawParticles() {
                this.particles.forEach(particle => {
                    const pulseSize = particle.size + Math.sin(particle.pulse) * 0.5;
                    const alpha = particle.opacity + Math.sin(particle.pulse) * 0.2;
                    
                    // رسم الجسيم الرئيسي
                    this.ctx.beginPath();
                    this.ctx.arc(particle.x, particle.y, pulseSize * 2, 0, Math.PI * 2);
                    this.ctx.fillStyle = `rgba(${particle.color.r}, ${particle.color.g}, ${particle.color.b}, ${alpha * 0.1})`;
                    this.ctx.fill();
                    
                    // Ø±Ø³Ù… Ø§Ù„Ø¬Ø³ÙŠÙ… Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠ
                    this.ctx.beginPath();
                    this.ctx.arc(particle.x, particle.y, pulseSize, 0, Math.PI * 2);
                    this.ctx.fillStyle = `rgba(${particle.color.r}, ${particle.color.g}, ${particle.color.b}, ${alpha})`;
                    this.ctx.shadowColor = `rgb(${particle.color.r}, ${particle.color.g}, ${particle.color.b})`;
                    this.ctx.shadowBlur = 8;
                    this.ctx.fill();
                    this.ctx.shadowBlur = 0;
                    
                    // Ø±Ø³Ù… Ù†Ù‚Ø·Ø© Ù…Ø±ÙƒØ²ÙŠØ© Ù…Ø¶ÙŠØ¦Ø©
                    this.ctx.beginPath();
                    this.ctx.arc(particle.x, particle.y, pulseSize * 0.4, 0, Math.PI * 2);
                    this.ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.8})`;
                    this.ctx.fill();
                });
            }

            animate() {
                // مسح الشاشة مع تأثير تلاشي ناعم
                this.ctx.fillStyle = 'rgba(26, 29, 33, 0.08)';
                this.ctx.fillRect(0, 0, this.canvas.clientWidth, this.canvas.clientHeight);
                
                this.updateParticles();
                this.drawConnections();
                this.drawParticles();
                
                this.animationId = requestAnimationFrame(() => this.animate());
            }

            destroy() {
                if (this.animationId) {
                    cancelAnimationFrame(this.animationId);
                }
                window.removeEventListener('resize', this.handleResize);
            }
        }

        // تهيئة الأنيميشن عند تحميل الصفحة
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(() => {
                if (document.getElementById('backgroundCanvas')) {
                    window.networkAnimation = new NetworkAnimation();
                }
            }, 100);
        });

        // تحسين الأداء: إيقاف الأنيميشن عند إخفاء التبويب
        document.addEventListener('visibilitychange', function() {
            if (window.networkAnimation) {
                if (document.hidden) {
                    window.networkAnimation.destroy();
                } else {
                    window.networkAnimation = new NetworkAnimation();
                }
            }
        });

