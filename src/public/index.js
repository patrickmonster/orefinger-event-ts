const { log } = require('console');

window.addEventListener('load', function () {
    if (localStorage.getItem('jwt')) {
        document.querySelector('#discord_login').style.display = 'none';
        document.querySelector('#main').style.display = 'block';

        const user = JSON.parse(localStorage.getItem('user'));
        document.querySelector('#user_username').innerHTML = user.username;
        document.querySelector('#user_avatar').src = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`;
        this.window.api = axios.create({
            baseURL: 'http://localhost:3000/api',
            headers: { Authorization: `Bearer ${localStorage.getItem('jwt')}` },
        });
    } else {
        document.querySelector('#discord_login').style.display = 'block';
        document.querySelector('#main').style.display = 'none';
    }

    document.querySelectorAll('.logout').forEach(el => {
        el.addEventListener('click', () => {
            localStorage.removeItem('jwt');
            localStorage.removeItem('user');
            window.location.reload();
        });
    });

    document.getElementById('dsicord_code').onkeydown = e => {
        const code = e.key;
        if (code === 'Enter') {
            const code = document.getElementById('dsicord_code').value;
            axios.post('/auth', { code, redirect_uri: 'http://localhost:3000/callback' }).then(({ data }) => {
                const { jwt, user } = data;
                localStorage.setItem('jwt', jwt);
                localStorage.setItem('user', JSON.stringify(user));

                window.location.reload();
            });
        }
    };

    this.document.querySelectorAll('#admin_list td button').forEach(el => {
        el.addEventListener('click', async () => {
            const i = el.getAttribute('idx') || 0;
            const list = await this.window.api.get(`/api/admin/component?page=${i || 0}`);
            console.log(list);
        });
    });
});
