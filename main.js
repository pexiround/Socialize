const input = document.getElementById('input');
const output = document.getElementById('output');

const COMMANDS = {
    'HELP': 'AVAILABLE: HELP, ABOUT, ENCRYPT [TEXT], CLEAR, DESTROY',
    'ABOUT': 'VOID-OS: A PRIVATE WORKSPACE. NO LOGS. NO CLOUD. NO TRACKING.',
    'CLEAR': 'CLEAR',
    'DESTROY': 'SYSTEM WIPED. ALL LOCAL DATA PURGED.',
};

input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        const fullCmd = input.value.trim().toUpperCase();
        const [cmd, ...args] = fullCmd.split(' ');
        
        // Add user command to output
        addOutput(`> ${fullCmd}`, 'text-zinc-500');

        if (cmd === 'CLEAR') {
            output.innerHTML = '';
        } else if (cmd === 'ENCRYPT') {
            const secret = btoa(args.join(' ')); // Simple Base64 encryption
            addOutput(`ENCRYPTED: ${secret}`);
        } else if (cmd === 'DESTROY') {
            output.innerHTML = 'SYSTEM PURGED.';
            setTimeout(() => location.reload(), 1000);
        } else if (COMMANDS[cmd]) {
            addOutput(COMMANDS[cmd]);
        } else {
            addOutput(`ERROR: COMMAND '${cmd}' NOT RECOGNIZED.`);
        }

        input.value = '';
        window.scrollTo(0, document.body.scrollHeight);
    }
});

function addOutput(text, color = 'text-green-500') {
    const div = document.createElement('div');
    div.className = color;
    div.innerText = text;
    output.appendChild(div);
}
