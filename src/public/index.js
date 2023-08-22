window.addEventListener('load', function () {
    document.getElementById('dsicord_code').onkeydown = e => {
        const code = e.key;
        if (code === 'Enter') {
            const code = document.getElementById('dsicord_code').value;
            axios.post('/auth', { code, redirect_uri: 'http://localhost:3000/callback' }).then(res => {
                console.log(res);
            });
        }
    };
});
