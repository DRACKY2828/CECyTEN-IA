/**
 * ============================================================
 *  CECyTE IA — Asistente Virtual Académico
 *  CECyTE Nayarit · Vanilla JavaScript · Offline
 * ============================================================
 *
 *  Arquitectura modular:
 *    1. CONFIG        — Constantes y respuestas fijas
 *    2. KNOWLEDGE     — Base de conocimiento oficial
 *    3. KEYWORDS      — Mapa de palabras clave por categoría
 *    4. TextProcessor — Normalización y corrección de texto
 *    5. IntentEngine  — Detección de tema e intención
 *    6. ResponseEngine— Generación de respuestas
 *    7. ChatUI        — Interfaz del chat
 *    8. App           — Inicialización y flujo principal
 * ============================================================
 */

(function CECyTE_IA() {
    'use strict';

    /* ==========================================================
       1. CONFIG — Constantes del sistema
       ========================================================== */

    const CONFIG = {
        typingDelayMin: 1000,
        typingDelayMax: 2000,
        maxInputLength: 500,
        topics: {
            SERVICIO_SOCIAL: 'servicio_social',
            PRACTICAS: 'practicas',
            HORARIOS: 'horarios',
            SALUDO: 'saludo',
            DESPEDIDA: 'despedida'
        }
    };

    const FIXED = {
        welcome:
            'Hola, soy CECyTE IA. Estoy aquí para ayudarte con información sobre Servicio Social, Prácticas Profesionales y Horarios escolares.',
        outOfScope:
            'Lo siento, actualmente solo puedo proporcionar información sobre Servicio Social, Prácticas Profesionales y Horarios de CECyTE Nayarit.',
        practicas:
            'Actualmente no se cuenta con información disponible sobre las prácticas profesionales. Se recomienda consultar posteriormente con la institución para conocer los requisitos, procedimientos y oportunidades disponibles.'
    };

    /** Memoria temporal de la conversación actual */
    const memory = {
        lastTopic: null,
        lastIntent: null
    };

    /* ==========================================================
       2. KNOWLEDGE — Base de conocimiento oficial
       ========================================================== */

    const KNOWLEDGE = {
        servicio_social: {
            general: [
                'El Servicio Social es una actividad educativa que permite a los estudiantes aplicar los conocimientos adquiridos durante su formación académica en beneficio de la sociedad.\n\nAdemás, fortalece valores como la solidaridad, la responsabilidad y el compromiso social, contribuyendo al desarrollo integral de los alumnos.\n\nEl Servicio Social permite que los estudiantes adquieran experiencia práctica y desarrollen habilidades personales y comunitarias mientras apoyan diferentes instituciones y programas autorizados.',
                'El Servicio Social es una actividad formativa donde aplicas lo aprendido en beneficio de la comunidad. Fortalece valores como solidaridad, responsabilidad y compromiso social, y te permite adquirir experiencia práctica en instituciones y programas autorizados.'
            ],
            duracion: [
                'La duración del Servicio Social es la siguiente:\n\n• Mínimo: 6 meses\n• Máximo: 2 años\n• Total de horas requeridas: 480 horas\n• Jornada: 4 horas diarias de lunes a viernes',
                'Para completar el Servicio Social debes acumular 480 horas en total, con una jornada de 4 horas diarias de lunes a viernes. El periodo mínimo es de 6 meses y el máximo de 2 años.'
            ],
            objetivos: [
                'Los objetivos del Servicio Social son:\n\n• Vincular al colegio con la sociedad\n• Contribuir al desarrollo personal y comunitario\n• Fomentar la solidaridad y el compromiso social\n• Desarrollar una actitud crítica y constructiva ante las problemáticas de la comunidad',
                'Entre los objetivos principales están vincular al plantel con la sociedad, fomentar la solidaridad, contribuir al desarrollo comunitario y desarrollar una actitud crítica y constructiva ante las problemáticas de la comunidad.'
            ],
            lugares: [
                'Puedes realizar tu Servicio Social en los siguientes lugares:\n\n• Programas de gobierno federal\n• Programas de gobierno estatal\n• Programas de gobierno municipal\n• Instituciones educativas\n• Organismos con programas autorizados',
                'Los lugares autorizados incluyen programas de gobierno (federal, estatal y municipal), instituciones educativas y organismos con programas debidamente autorizados.'
            ],
            actividades: [
                'Entre las actividades que puedes realizar durante el Servicio Social se encuentran:\n\n• Tutor de asignatura\n• Promotor estudiantil\n• Apoyo en grupos de prevención\n• Elaboración de material didáctico\n• Auxiliar docente\n• Mantenimiento de instalaciones\n• Apoyo en talleres\n• Apoyo en laboratorios\n• Apoyo en bibliotecas\n• Apoyo en centros de cómputo\n• Participación en comités de higiene escolar',
                'Algunas actividades disponibles son: tutor de asignatura, promotor estudiantil, apoyo en grupos de prevención, auxiliar docente, mantenimiento de instalaciones, apoyo en talleres, laboratorios, bibliotecas, centros de cómputo, elaboración de material didáctico y participación en comités de higiene escolar.'
            ],
            conclusion: [
                'El Servicio Social brinda a los estudiantes la oportunidad de contribuir al bienestar de la comunidad mientras adquieren experiencia práctica, fortalecen sus conocimientos y desarrollan valores fundamentales para su formación personal y profesional.',
                'En conclusión, el Servicio Social te permite aportar a tu comunidad, ganar experiencia práctica y fortalecer valores esenciales para tu formación personal y profesional.'
            ]
        },
        horarios: {
            general: [
                'Información sobre horarios escolares en CECyTE Nayarit:\n\n• Los alumnos de primer semestre tienen un horario diferente al de los demás semestres, ya que la carrera técnica se asigna a partir del segundo semestre. Esto es completamente normal para estudiantes de nuevo ingreso.\n• Los espacios vacíos en el horario representan horas libres\n• Si en los últimos bloques no hay clases, los alumnos de primer semestre pueden retirarse del plantel al concluir sus actividades académicas',
                'En CECyTE Nayarit, el horario de primer semestre es distinto porque aún no tienes carrera asignada — eso ocurre a partir del segundo semestre y es normal para nuevo ingreso. Los espacios vacíos son horas libres y, si tus últimos bloques no tienen clase, puedes retirarte del plantel.'
            ],
            primer_semestre: [
                'Los alumnos de primer semestre tienen un horario diferente al resto de los semestres. Esto es completamente normal: la carrera técnica se asigna a partir del segundo semestre, por lo que durante el primer semestre todos siguen una estructura de horario general para estudiantes de nuevo ingreso.',
                'Si estás en primer semestre, es normal que tu horario se vea distinto al de compañeros de semestres superiores. La especialidad o carrera técnica se asigna hasta el segundo semestre.'
            ],
            carrera: [
                'La carrera técnica será asignada a partir del segundo semestre. Durante el primer semestre los estudiantes comparten un horario general mientras completan su periodo de nuevo ingreso.',
                'A partir del segundo semestre se asigna la carrera correspondiente, lo cual también modifica la estructura del horario escolar del alumno.'
            ],
            horas_libres: [
                'Los espacios vacíos — también conocidos como huecos — que aparecen en tu horario representan horas libres. Durante esos bloques no tienes clases asignadas.',
                'Cuando ves un hueco o espacio vacío en tu horario, significa que ese bloque es una hora libre en la que no tienes actividades académicas programadas.'
            ],
            retiro: [
                'Cuando en los últimos bloques de tu horario no aparezcan clases asignadas, los alumnos de primer semestre podrán retirarse del plantel una vez concluidas sus actividades académicas programadas.',
                'Si tus últimos bloques del día no tienen clases, puedes retirarte del plantel después de concluir tus actividades académicas. Esto aplica especialmente para alumnos de primer semestre.'
            ]
        }
    };

    /* ==========================================================
       3. KEYWORDS — Palabras clave por categoría e intención
       ========================================================== */

    const KEYWORDS = {
        servicio_social: {
            topic: [
                'servicio social', 'serv social', 'serviciosocial', 'servicio comunitario',
                'serv comunitario', 'ss escolar', 'el ss', 'del ss', 'para el ss',
                'dura el ss', 'dura el servicio social', 'sobre el ss'
            ],
            general: [
                'que es', 'q es', 'que es el', 'que significa', 'definicion', 'definición',
                'explicame', 'explicación', 'informacion sobre', 'información sobre',
                'hablame de', 'cuentame de', 'cuéntame de', 'para que sirve', 'para qué sirve',
                'en que consiste', 'en qué consiste', 'que trata', 'qué trata'
            ],
            duracion: [
                'cuantas horas', 'cuántas horas', 'horas son', 'horas del servicio',
                'horas requeridas', 'total de horas', '480', 'cuanto dura', 'cuánto dura',
                'duracion', 'duración', 'cuantos meses', 'cuántos meses', 'meses son',
                'jornada', 'horas diarias', 'horas al dia', 'horas al día',
                'cuanto tiempo', 'cuánto tiempo', 'tiempo dura', 'cuanto es el ss',
                'cuanto dura el', 'cuanto lleva'
            ],
            objetivos: [
                'objetivo', 'objetivos', 'meta', 'metas', 'para que es', 'para qué es',
                'finalidad', 'proposito', 'propósito', 'beneficios del servicio'
            ],
            lugares: [
                'donde', 'dónde', 'lugar', 'lugares', 'en que lugar', 'en qué lugar',
                'sitio', 'sitios', 'donde hago', 'dónde hago', 'donde realizo',
                'dónde realizo', 'donde puedo', 'dónde puedo', 'institucion',
                'institución', 'organismo', 'en donde'
            ],
            actividades: [
                'actividad', 'actividades', 'que hago', 'qué hago', 'que puedo hacer',
                'qué puedo hacer', 'que ocupó', 'qué ocupó', 'que ocupo', 'qué ocupo',
                'que trabajo', 'qué trabajo', 'que tareas', 'qué tareas', 'que labores',
                'qué labores', 'que actividades hay', 'qué actividades hay'
            ],
            conclusion: [
                'conclusion', 'conclusión', 'importancia', 'vale la pena', 'beneficio final',
                'para que me sirve', 'para qué me sirve', 'que gano', 'qué gano'
            ]
        },
        practicas: {
            topic: [
                'practica', 'práctica', 'practicas', 'prácticas', 'practica profesional',
                'práctica profesional', 'practicas profesionales', 'prácticas profesionales',
                'estadia', 'estadía', 'estadias', 'estadías', 'practicante', 'dual'
            ]
        },
        horarios: {
            topic: [
                'horario', 'horarios', 'hora de clase', 'horas de clase', 'clase', 'clases',
                'bloque', 'bloques', 'horario escolar', 'horarios escolares', 'mi horario'
            ],
            primer_semestre: [
                'primer semestre', '1er semestre', '1 semestre', 'semestre uno',
                'nuevo ingreso', 'primero semestre', 'horario primer', 'soy de primero',
                'recien ingreso', 'recién ingreso', 'primera vez'
            ],
            carrera: [
                'carrera', 'especialidad', 'asignacion de carrera', 'asignación de carrera',
                'segundo semestre', '2do semestre', '2 semestre', 'cuando me asignan',
                'cuándo me asignan', 'carrera tecnica', 'carrera técnica'
            ],
            horas_libres: [
                'hora libre', 'horas libres', 'espacio vacio', 'espacio vacío',
                'espacios vacios', 'espacios vacíos', 'bloque libre', 'sin clase',
                'vacio en horario', 'vacío en horario', 'hueco', 'huecos',
                'los huecos', 'que significan los huecos', 'qué significan los huecos',
                'que son los huecos', 'qué son los huecos', 'significan los huecos',
                'que significa el hueco', 'qué significa el hueco', 'espacios en blanco',
                'celdas vacias', 'celdas vacías'
            ],
            retiro: [
                'retirarme', 'retirarse', 'salir del plantel', 'irme', 'puedo irme',
                'puedo salir', 'salirme antes', 'salir antes', 'puedo salirme',
                'irme antes', 'me puedo ir', 'me puedo ir antes', 'salida anticipada',
                'salir temprano', 'ultimo bloque', 'último bloque', 'ultimos bloques',
                'últimos bloques', 'terminar clases', 'antes de tiempo', 'salirme'
            ]
        },
        saludo: {
            topic: [
                'hola', 'buenos dias', 'buenos días', 'buenas tardes', 'buenas noches',
                'hey', 'saludos', 'que tal', 'qué tal', 'buen dia', 'buen día'
            ]
        },
        despedida: {
            topic: [
                'adios', 'adiós', 'hasta luego', 'nos vemos', 'bye', 'chao',
                'muchas gracias', 'gracias por todo'
            ]
        }
    };

    /** Palabras que indican consulta fuera del alcance */
    const OUT_OF_SCOPE_HINTS = [
        'inscripcion', 'inscripción', 'beca', 'calificacion', 'calificación',
        'examen', 'titulo', 'título', 'certificado', 'uniforme', 'cuota',
        'matricula', 'matrícula', 'profesor', 'maestro', 'materia', 'asignatura',
        'convenio', 'empresa', 'documentacion', 'documentación', 'requisito practica'
    ];

    /* ==========================================================
       4. TextProcessor — Normalización de mensajes
       ========================================================== */

    const TextProcessor = {
        /**
         * Elimina acentos y diacríticos
         * @param {string} text
         * @returns {string}
         */
        removeAccents(text) {
            return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        },

        /**
         * Normaliza texto: minúsculas, sin acentos, sin símbolos
         * @param {string} rawText
         * @returns {string}
         */
        normalize(rawText) {
            return this.removeAccents(rawText)
                .toLowerCase()
                .replace(/[¿?¡!.,;:()[\]{}'"«»/\\|@#$%^&*+=~`<>]/g, ' ')
                .replace(/\s+/g, ' ')
                .trim();
        },

        /**
         * Corrige variaciones informales y errores comunes
         * @param {string} text
         * @returns {string}
         */
        applyCorrections(text) {
            const rules = [
                [/(\b)q\b/g, '$1que'],
                [/(\b)k\b/g, '$1que'],
                [/xq/g, 'porque'],
                [/tb\b/g, 'tambien'],
                [/tmb\b/g, 'tambien'],
                [/ocupó/g, 'ocupo'],
                [/serv\s*social/g, 'servicio social'],
                [/serv\s*comunitario/g, 'servicio social'],
                [/cuanto\s+dura\s+el\s+ss\b/g, 'cuanto dura servicio social'],
                [/dura\s+el\s+ss\b/g, 'dura servicio social'],
                [/horas\s+del\s+ss\b/g, 'horas del servicio social'],
                [/del\s+ss\b/g, 'del servicio social'],
                [/para\s+el\s+ss\b/g, 'para el servicio social'],
                [/el\s+ss\b/g, 'servicio social'],
                [/sobre\s+el\s+ss\b/g, 'sobre servicio social'],
                [/practica\s*prof/g, 'practica profesional'],
                [/1er\s*sem/g, 'primer semestre'],
                [/2do\s*sem/g, 'segundo semestre'],
                [/salirme\s+antes/g, 'salirme antes'],
                [/puedo\s+salirme/g, 'puedo salirme']
            ];

            return rules.reduce((result, [pattern, replacement]) =>
                result.replace(pattern, replacement), text);
        },

        /**
         * Pipeline completo de procesamiento
         * @param {string} rawText
         * @returns {string}
         */
        process(rawText) {
            return this.applyCorrections(this.normalize(rawText));
        }
    };

    /* ==========================================================
       5. IntentEngine — Detección de tema e intención
       ========================================================== */

    const IntentEngine = {
        /**
         * Calcula puntuación por coincidencia de palabras clave
         * @param {string} text
         * @param {string[]} keywordList
         * @returns {number}
         */
        score(text, keywordList) {
            let total = 0;
            keywordList.forEach(keyword => {
                if (text.includes(keyword)) {
                    total += keyword.split(' ').length;
                }
            });
            return total;
        },

        /**
         * Detecta la sub-intención dentro de un tema
         * @param {string} text
         * @param {string} topic
         * @returns {{ intent: string|null, score: number }}
         */
        detectSubIntent(text, topic) {
            if (topic === CONFIG.topics.PRACTICAS) {
                return { intent: 'topic', score: 1 };
            }

            const map = KEYWORDS[topic];
            if (!map) return { intent: null, score: 0 };

            let bestIntent = null;
            let bestScore = 0;

            Object.entries(map).forEach(([intent, list]) => {
                if (intent === 'topic') return;
                const score = this.score(text, list);
                if (score > bestScore) {
                    bestScore = score;
                    bestIntent = intent;
                }
            });

            return { intent: bestIntent, score: bestScore };
        },

        /**
         * Obtiene puntuaciones de todos los temas principales
         * @param {string} text
         * @returns {Record<string, number>}
         */
        scoreAllTopics(text) {
            return {
                [CONFIG.topics.SERVICIO_SOCIAL]: this.score(text, KEYWORDS.servicio_social.topic),
                [CONFIG.topics.PRACTICAS]: this.score(text, KEYWORDS.practicas.topic),
                [CONFIG.topics.HORARIOS]: this.score(text, KEYWORDS.horarios.topic),
                [CONFIG.topics.SALUDO]: this.score(text, KEYWORDS.saludo.topic),
                [CONFIG.topics.DESPEDIDA]: this.score(text, KEYWORDS.despedida.topic)
            };
        },

        /**
         * Resuelve tema e intención usando memoria contextual
         * @param {string} text - Texto procesado
         * @returns {{ topic: string|null, intent: string|null, score: number }}
         */
        analyze(text) {
            const scores = this.scoreAllTopics(text);

            let bestTopic = null;
            let bestScore = 0;

            Object.entries(scores).forEach(([topic, score]) => {
                if (score > bestScore) {
                    bestScore = score;
                    bestTopic = topic;
                }
            });

            /* Continuidad contextual: "¿Cuántas horas son?" tras hablar de SS */
            if (bestScore === 0 && memory.lastTopic && memory.lastTopic !== CONFIG.topics.PRACTICAS) {
                const contextual = this.detectSubIntent(text, memory.lastTopic);
                if (contextual.intent) {
                    return {
                        topic: memory.lastTopic,
                        intent: contextual.intent,
                        score: contextual.score
                    };
                }
            }

            /* Sub-intención sin tema explícito (ej. "horas del servicio", "puedo salirme antes") */
            if (bestScore === 0) {
                const ss = this.detectSubIntent(text, CONFIG.topics.SERVICIO_SOCIAL);
                const hor = this.detectSubIntent(text, CONFIG.topics.HORARIOS);

                if (ss.score > hor.score && ss.score > 0) {
                    return { topic: CONFIG.topics.SERVICIO_SOCIAL, intent: ss.intent, score: ss.score };
                }
                if (hor.score > 0) {
                    return { topic: CONFIG.topics.HORARIOS, intent: hor.intent, score: hor.score };
                }

                return { topic: null, intent: null, score: 0 };
            }

            /* Saludos y despedidas */
            if (bestTopic === CONFIG.topics.SALUDO || bestTopic === CONFIG.topics.DESPEDIDA) {
                return { topic: bestTopic, intent: 'topic', score: bestScore };
            }

            /* Tema académico con sub-intención */
            const sub = this.detectSubIntent(text, bestTopic);
            return {
                topic: bestTopic,
                intent: sub.intent || 'general',
                score: bestScore + sub.score
            };
        },

        /**
         * Determina si el mensaje está fuera del alcance
         * @param {string} text
         * @param {object} detection
         * @returns {boolean}
         */
        isOutOfScope(text, detection) {
            if (detection.topic && detection.score > 0) {
                return false;
            }

            if (KEYWORDS.practicas.topic.some(k => text.includes(k))) {
                return false;
            }

            if (OUT_OF_SCOPE_HINTS.some(h => text.includes(h))) {
                return true;
            }

            const words = text.split(' ').filter(w => w.length > 2);
            return words.length >= 2;
        }
    };

    /* ==========================================================
       6. ResponseEngine — Generación de respuestas
       ========================================================== */

    const ResponseEngine = {
        /**
         * Selecciona respuesta aleatoria para naturalidad
         * @param {string[]} pool
         * @returns {string}
         */
        pick(pool) {
            return pool[Math.floor(Math.random() * pool.length)];
        },

        /**
         * Actualiza memoria de conversación
         * @param {string} topic
         * @param {string} intent
         */
        remember(topic, intent) {
            memory.lastTopic = topic;
            memory.lastIntent = intent;
        },

        /**
         * Obtiene respuesta de la base de conocimiento
         * @param {string} topic
         * @param {string} intent
         * @returns {string}
         */
        fromKnowledge(topic, intent) {
            const base = KNOWLEDGE[topic];
            if (!base) return FIXED.outOfScope;

            const pool = base[intent] || base.general;
            return this.pick(pool);
        },

        /**
         * Genera respuesta completa para un mensaje del usuario
         * @param {string} rawMessage
         * @returns {string}
         */
        generate(rawMessage) {
            const text = TextProcessor.process(rawMessage);
            const detection = IntentEngine.analyze(text);

            /* Saludo */
            if (detection.topic === CONFIG.topics.SALUDO) {
                return this.pick([
                    '¡Hola! Es un gusto saludarte. ¿En qué puedo apoyarte hoy? Puedo orientarte sobre Servicio Social, Prácticas Profesionales u Horarios escolares.',
                    '¡Bienvenido! Estoy listo para ayudarte con información sobre Servicio Social, Prácticas Profesionales o Horarios de CECyTE Nayarit.'
                ]);
            }

            /* Despedida */
            if (detection.topic === CONFIG.topics.DESPEDIDA) {
                return this.pick([
                    '¡Hasta pronto! Si necesitas más información, aquí estaré para ayudarte.',
                    'Con gusto. Regresa cuando tengas más dudas sobre Servicio Social, Prácticas o Horarios.'
                ]);
            }

            /* Fuera de alcance */
            if (IntentEngine.isOutOfScope(text, detection)) {
                return FIXED.outOfScope;
            }

            /* Prácticas profesionales — respuesta exacta */
            if (detection.topic === CONFIG.topics.PRACTICAS) {
                this.remember(CONFIG.topics.PRACTICAS, 'topic');
                return FIXED.practicas;
            }

            /* Servicio Social */
            if (detection.topic === CONFIG.topics.SERVICIO_SOCIAL) {
                const intent = detection.intent && detection.intent !== 'topic'
                    ? detection.intent
                    : (IntentEngine.detectSubIntent(text, CONFIG.topics.SERVICIO_SOCIAL).intent || 'general');

                this.remember(CONFIG.topics.SERVICIO_SOCIAL, intent);
                return this.fromKnowledge(CONFIG.topics.SERVICIO_SOCIAL, intent);
            }

            /* Horarios escolares */
            if (detection.topic === CONFIG.topics.HORARIOS) {
                const intent = detection.intent && detection.intent !== 'topic'
                    ? detection.intent
                    : (IntentEngine.detectSubIntent(text, CONFIG.topics.HORARIOS).intent || 'general');

                this.remember(CONFIG.topics.HORARIOS, intent);
                return this.fromKnowledge(CONFIG.topics.HORARIOS, intent);
            }

            return FIXED.outOfScope;
        }
    };

    /* ==========================================================
       7. ChatUI — Interfaz visual del chat
       ========================================================== */

    const AI_ICON_SVG = `
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.5"/>
            <path d="M12 2V5M12 19V22M2 12H5M19 12H22" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.5" stroke-dasharray="2 3"/>
        </svg>`;

    const ChatUI = {
        container: null,
        input: null,
        form: null,
        sendBtn: null,

        /**
         * Vincula elementos del DOM
         */
        bind() {
            this.container = document.getElementById('chatContainer');
            this.input = document.getElementById('messageInput');
            this.form = document.getElementById('messageForm');
            this.sendBtn = document.getElementById('sendButton');
        },

        /**
         * Formato de hora legible
         * @returns {string}
         */
        timestamp() {
            return new Date().toLocaleTimeString('es-MX', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });
        },

        /**
         * Desplaza al final del chat
         */
        scrollToBottom() {
            requestAnimationFrame(() => {
                this.container.scrollTop = this.container.scrollHeight;
            });
        },

        /**
         * Inserta un mensaje en el chat
         * @param {string} text
         * @param {'user'|'assistant'} role
         */
        appendMessage(text, role) {
            const row = document.createElement('div');
            row.className = `message-row message-row--${role}`;

            const avatar = document.createElement('div');
            avatar.className = 'message-avatar';
            avatar.setAttribute('aria-hidden', 'true');

            if (role === 'assistant') {
                avatar.innerHTML = AI_ICON_SVG;
            } else {
                avatar.textContent = 'Tú';
            }

            const body = document.createElement('div');
            body.className = 'message-body';

            const bubble = document.createElement('div');
            bubble.className = 'message-bubble';
            bubble.textContent = text;

            const time = document.createElement('span');
            time.className = 'message-time';
            time.textContent = this.timestamp();

            body.appendChild(bubble);
            body.appendChild(time);
            row.appendChild(avatar);
            row.appendChild(body);
            this.container.appendChild(row);

            this.scrollToBottom();
        },

        /**
         * Muestra indicador "Escribiendo..."
         */
        showTyping() {
            const row = document.createElement('div');
            row.className = 'typing-row';
            row.id = 'typingIndicator';
            row.setAttribute('aria-label', 'CECyTE IA está escribiendo');

            row.innerHTML = `
                <div class="typing-avatar">${AI_ICON_SVG}</div>
                <div class="typing-content">
                    <span class="typing-label">Escribiendo...</span>
                    <div class="typing-bubble">
                        <span class="typing-dot"></span>
                        <span class="typing-dot"></span>
                        <span class="typing-dot"></span>
                    </div>
                </div>
            `;

            this.container.appendChild(row);
            this.scrollToBottom();
        },

        /**
         * Oculta indicador de escritura
         */
        hideTyping() {
            const el = document.getElementById('typingIndicator');
            if (el) el.remove();
        },

        /**
         * Simula tiempo de procesamiento (1–2 s)
         * @returns {Promise<void>}
         */
        simulateThinking() {
            const delay = CONFIG.typingDelayMin +
                Math.random() * (CONFIG.typingDelayMax - CONFIG.typingDelayMin);
            return new Promise(resolve => setTimeout(resolve, delay));
        },

        /**
         * Bloquea o desbloquea la entrada
         * @param {boolean} disabled
         */
        setInputDisabled(disabled) {
            this.sendBtn.disabled = disabled;
            this.input.disabled = disabled;
        }
    };

    /* ==========================================================
       8. App — Controlador principal
       ========================================================== */

    const App = {
        /**
         * Procesa un mensaje enviado por el usuario
         * @param {string} text
         */
        async handleMessage(text) {
            const trimmed = text.trim();
            if (!trimmed) return;

            ChatUI.appendMessage(trimmed, 'user');
            ChatUI.input.value = '';
            ChatUI.setInputDisabled(true);

            ChatUI.showTyping();
            await ChatUI.simulateThinking();
            ChatUI.hideTyping();

            const response = ResponseEngine.generate(trimmed);
            ChatUI.appendMessage(response, 'assistant');

            ChatUI.setInputDisabled(false);
            ChatUI.input.focus();
        },

        /**
         * Inicializa la aplicación
         */
        init() {
            ChatUI.bind();

            ChatUI.appendMessage(FIXED.welcome, 'assistant');

            ChatUI.form.addEventListener('submit', event => {
                event.preventDefault();
                App.handleMessage(ChatUI.input.value);
            });

            ChatUI.input.focus();
        }
    };

    /* --- Punto de entrada --- */
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => App.init());
    } else {
        App.init();
    }

})();
