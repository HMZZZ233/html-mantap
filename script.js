document.addEventListener('DOMContentLoaded', function () {
    const startScreen = document.getElementById('start-screen');
    const chatScreen = document.getElementById('chat-screen');
    const startBtn = document.getElementById('start-btn');
    const closeBtn = document.getElementById('close-btn');
    const stopBtn = document.getElementById('stop-btn');
    const waveBars = document.querySelectorAll('.wave-bar');
    const voiceOptions = document.querySelectorAll('.voice-option');
    const selectedVoiceText = document.getElementById('selected-voice-text');
    let selectedVoice = 'female';
    let recognition = null;
    let listening = false;
    voiceOptions.forEach(option => {
        option.addEventListener('click', function () {
            voiceOptions.forEach(o => o.classList.remove('active'));
            this.classList.add('active');
            selectedVoice = this.getAttribute('data-voice');
            selectedVoiceText.textContent = selectedVoice === 'female' ? 'Girl Voice' : 'Boy Voice';
        });
    });
    document.querySelector('.voice-option[data-voice="female"]').classList.add('active');
    function switchScreen(from, to) {
        from.classList.remove('active');
        to.classList.add('active');
    }
    function createRecognition() {
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SR) return null;
        const r = new SR();
        r.lang = 'id-ID';
        r.interimResults = false;
        r.maxAlternatives = 1;
        return r;
    }
    function startListening() {
        if (listening) return;
        if (!recognition) recognition = createRecognition();
        if (!recognition) {
            alert("Browser kamu gak support SpeechRecognition.");
            return;
        }
        recognition.onstart = () => {
            listening = true;
        };

        recognition.onresult = (event) => {
            const text = event.results[0][0].transcript.trim();
            listening = false;
            sendToGPT(text);
        };
        recognition.onend = () => {
            listening = false;
        };

        try {
            recognition.start();
        } catch (e) {}
    }

    function stopListening() {
        if (!recognition) return;
        try { recognition.stop(); } catch (e) {}
        listening = false;
    }

    // ---- GPT ----
    async function sendToGPT(userText) {
        const basePrompt = encodeURIComponent("kamu ai yg ceria dan ramah, serta sering menggunakan bahasa indonesia namun kamu bisa menggunakan bahasa lain");
        const contentParam = encodeURIComponent(userText);
        const url = `https://api.siputzx.my.id/api/ai/gpt3?prompt=${basePrompt}&content=${contentParam}`;

        try {
            const res = await fetch(url);
            const data = await res.json();
            if (!data.status) return;
            const aiText = data.data || "Maaf, saya tidak mengerti.";
            await speakTextWithTTS(aiText);
        } catch (err) {
            console.error("GPT fetch error", err);
        }
    }

    // ---- TTS Google ----
    async function speakTextWithTTS(text) {
        const ttsUrl = `https://api.siputzx.my.id/api/tools/ttsgoogle?text=${encodeURIComponent(text)}`;
        try {
            await playWithVisualizer(ttsUrl);
        } catch (err) {
            console.error("TTS error", err);
        }
    }

    // ---- Audio Play + Visualizer ----
    async function playWithVisualizer(url) {
        const audio = new Audio(url);
        audio.crossOrigin = "anonymous";

        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const source = audioCtx.createMediaElementSource(audio);
        const analyser = audioCtx.createAnalyser();
        source.connect(analyser);
        analyser.connect(audioCtx.destination);
        analyser.fftSize = 256;

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        function animate() {
            requestAnimationFrame(animate);
            analyser.getByteFrequencyData(dataArray);
            // ambil energi low-mid (kasih kesan goyang ke nada)
            const avg = dataArray.slice(0, 32).reduce((a, b) => a + b, 0) / 32;
            waveBars.forEach((bar, i) => {
                const scale = dataArray[i % bufferLength] / 255;
                bar.style.height = `${6 + scale * 40}px`;
            });
        }
        animate();

        return new Promise((resolve, reject) => {
            audio.onended = () => {
                resolve();
            };
            audio.onerror = () => reject(new Error("Gagal play audio"));
            audio.play().catch(reject);
        });
    }
    startBtn.addEventListener('click', function () {
        switchScreen(startScreen, chatScreen);
    });

    closeBtn.addEventListener('click', function () {
        switchScreen(chatScreen, startScreen);
        stopListening();
    });

    stopBtn.addEventListener('click', function () {
        const icon = stopBtn.querySelector('i');
        const isStopped = icon.classList.contains('fa-microphone-slash');
        if (isStopped) {
            startListening();
            icon.classList.remove('fa-microphone-slash');
            icon.classList.add('fa-microphone');
        } else {
            stopListening();
            icon.classList.remove('fa-microphone');
            icon.classList.add('fa-microphone-slash');
        }
    });

    window.addEventListener('beforeunload', () => stopListening());
});
